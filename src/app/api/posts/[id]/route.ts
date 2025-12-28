import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { postSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
          },
        },
        publication: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            description: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // If post is not published, only allow author to view
    if (!post.isPublished) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id !== post.authorId) {
        return NextResponse.json(
          { success: false, error: "Post not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = postSchema.partial().parse(body);

    // Check slug uniqueness if changing
    if (validatedData.slug && validatedData.slug !== post.slug) {
      const existingPost = await prisma.post.findUnique({
        where: {
          publicationId_slug: {
            publicationId: post.publicationId,
            slug: validatedData.slug,
          },
        },
      });

      if (existingPost) {
        return NextResponse.json(
          { success: false, error: "A post with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Set publishedAt if publishing for the first time
    const updateData: Record<string, unknown> = { ...validatedData };
    if (validatedData.isPublished && !post.isPublished && !post.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: updateData,
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

    return NextResponse.json({ success: true, data: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.post.delete({
      where: { id: post.id },
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
