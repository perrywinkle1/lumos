import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { publicationSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const publication = await prisma.publication.findUnique({
      where: { slug: params.slug },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
          },
        },
        _count: {
          select: {
            posts: { where: { isPublished: true } },
            subscriptions: true,
          },
        },
      },
    });

    if (!publication) {
      return NextResponse.json(
        { success: false, error: "Publication not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: publication });
  } catch (error) {
    console.error("Error fetching publication:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch publication" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const publication = await prisma.publication.findUnique({
      where: { slug: params.slug },
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

    const body = await request.json();
    const validatedData = publicationSchema.partial().parse(body);

    // Check slug uniqueness if changing
    if (validatedData.slug && validatedData.slug !== publication.slug) {
      const existingPublication = await prisma.publication.findUnique({
        where: { slug: validatedData.slug },
      });

      if (existingPublication) {
        return NextResponse.json(
          { success: false, error: "A publication with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const updatedPublication = await prisma.publication.update({
      where: { id: publication.id },
      data: validatedData,
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

    return NextResponse.json({ success: true, data: updatedPublication });
  } catch (error) {
    console.error("Error updating publication:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update publication" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const publication = await prisma.publication.findUnique({
      where: { slug: params.slug },
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

    await prisma.publication.delete({
      where: { id: publication.id },
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("Error deleting publication:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete publication" },
      { status: 500 }
    );
  }
}
