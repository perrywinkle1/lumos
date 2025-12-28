import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const publicationId = searchParams.get("publicationId");
    const listSubscribers = searchParams.get("listSubscribers") === "true";

    // If listSubscribers is true and publicationId is provided, list all subscribers for that publication
    // (only if the current user owns the publication)
    if (listSubscribers && publicationId) {
      // Check if the user owns this publication
      const publication = await prisma.publication.findUnique({
        where: { id: publicationId },
        select: { ownerId: true },
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

      const subscriptions = await prisma.subscription.findMany({
        where: { publicationId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ success: true, data: subscriptions });
    }

    // Default behavior: list the current user's subscriptions
    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (publicationId) {
      where.publicationId = publicationId;
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        publication: {
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
                posts: { where: { isPublished: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: subscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscriptions" },
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
    const { publicationId, tier = "free" } = body;

    if (!publicationId) {
      return NextResponse.json(
        { success: false, error: "Publication ID is required" },
        { status: 400 }
      );
    }

    // Check if publication exists
    const publication = await prisma.publication.findUnique({
      where: { id: publicationId },
    });

    if (!publication) {
      return NextResponse.json(
        { success: false, error: "Publication not found" },
        { status: 404 }
      );
    }

    // Check if already subscribed
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        userId_publicationId: {
          userId: session.user.id,
          publicationId,
        },
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { success: false, error: "Already subscribed to this publication" },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        publicationId,
        tier,
        status: "active",
      },
      include: {
        publication: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: subscription }, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const publicationId = searchParams.get("publicationId");

    if (!publicationId) {
      return NextResponse.json(
        { success: false, error: "Publication ID is required" },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId_publicationId: {
          userId: session.user.id,
          publicationId,
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 }
      );
    }

    await prisma.subscription.delete({
      where: { id: subscription.id },
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
