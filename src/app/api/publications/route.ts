import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { publicationSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [publications, total] = await Promise.all([
      prisma.publication.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              posts: true,
              subscriptions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.publication.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: publications,
        total,
        page,
        pageSize: limit,
        hasMore: skip + publications.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching publications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch publications" },
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
    const validatedData = publicationSchema.parse(body);

    // Check if slug already exists
    const existingPublication = await prisma.publication.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingPublication) {
      return NextResponse.json(
        { success: false, error: "A publication with this slug already exists" },
        { status: 400 }
      );
    }

    const publication = await prisma.publication.create({
      data: {
        ...validatedData,
        ownerId: session.user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: publication }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error },
        { status: 400 }
      );
    }
    console.error("Error creating publication:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create publication" },
      { status: 500 }
    );
  }
}
