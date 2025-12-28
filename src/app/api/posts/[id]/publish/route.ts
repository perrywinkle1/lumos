import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(
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
      include: {
        publication: {
          select: {
            ownerId: true,
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

    // Check if user is author or publication owner
    if (post.authorId !== session.user.id && post.publication.ownerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { publish } = body;

    if (typeof publish !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid request: 'publish' boolean is required" },
        { status: 400 }
      );
    }

    // Update the post
    const updateData: Record<string, unknown> = {
      isPublished: publish,
    };

    // Set publishedAt only when publishing for the first time
    if (publish && !post.publishedAt) {
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

    return NextResponse.json({
      success: true,
      data: updatedPost,
      message: publish ? "Post published successfully" : "Post unpublished successfully",
    });
  } catch (error) {
    console.error("Error toggling post publish status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update post publish status" },
      { status: 500 }
    );
  }
}
