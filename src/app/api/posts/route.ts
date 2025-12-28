import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { postSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const publicationId = searchParams.get("publicationId");
    const published = searchParams.get("published");

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (publicationId) {
      where.publicationId = publicationId;
    }

    if (published === "true") {
      where.isPublished = true;
    } else if (published === "false") {
      where.isPublished = false;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          publication: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: posts,
        total,
        page,
        pageSize: limit,
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { publicationId, ...postData } = body;

    if (!publicationId) {
      return NextResponse.json(
        { success: false, error: "Publication ID is required" },
        { status: 400 }
      );
    }

    // Verify publication ownership
    const publication = await prisma.publication.findUnique({
      where: { id: publicationId },
    });

    if (!publication) {
      return NextResponse.json(
        { success: false, error: "Publication not found" },
        { status: 404 }
      );
    }

    if (publication.ownerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const validatedData = postSchema.parse(postData);

    // Check slug uniqueness within publication
    const existingPost = await prisma.post.findUnique({
      where: {
        publicationId_slug: {
          publicationId,
          slug: validatedData.slug,
        },
      },
    });

    if (existingPost) {
      return NextResponse.json(
        { success: false, error: "A post with this slug already exists in this publication" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        ...validatedData,
        publicationId,
        authorId: session.user.id,
        publishedAt: validatedData.isPublished ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        publication: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error },
        { status: 400 }
      );
    }
    console.error("Error creating post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create post" },
      { status: 500 }
    );
  }
}
