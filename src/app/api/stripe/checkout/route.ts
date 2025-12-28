import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { createCheckoutSession, STRIPE_PLANS } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { publicationId, interval = "month" } = body;

    // Validate interval
    if (!["month", "year"].includes(interval)) {
      return NextResponse.json(
        { success: false, error: "Invalid subscription interval" },
        { status: 400 }
      );
    }

    if (!publicationId) {
      return NextResponse.json(
        { success: false, error: "Publication ID is required" },
        { status: 400 }
      );
    }

    // Get publication
    const publication = await prisma.publication.findUnique({
      where: { id: publicationId },
      select: {
        id: true,
        name: true,
        slug: true,
        ownerId: true,
      },
    });

    if (!publication) {
      return NextResponse.json(
        { success: false, error: "Publication not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (publication.ownerId === session.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot subscribe to your own publication" },
        { status: 400 }
      );
    }

    // Check for existing paid subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        userId_publicationId: {
          userId: session.user.id,
          publicationId,
        },
      },
    });

    if (
      existingSubscription?.tier === "paid" &&
      existingSubscription?.status === "active"
    ) {
      return NextResponse.json(
        { success: false, error: "You already have an active paid subscription" },
        { status: 400 }
      );
    }

    // Get the app URL for redirect
    const origin = request.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      publicationId: publication.id,
      publicationSlug: publication.slug,
      publicationName: publication.name,
      interval: interval as "month" | "year",
      successUrl: `${origin}/${publication.slug}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/subscribe/${publication.slug}?checkout=canceled`,
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
      },
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to create checkout session";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint to get pricing info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const publicationId = searchParams.get("publicationId");

  if (!publicationId) {
    return NextResponse.json(
      { success: false, error: "Publication ID is required" },
      { status: 400 }
    );
  }

  const publication = await prisma.publication.findUnique({
    where: { id: publicationId },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!publication) {
    return NextResponse.json(
      { success: false, error: "Publication not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      publication: {
        id: publication.id,
        name: publication.name,
        slug: publication.slug,
      },
      plans: {
        free: STRIPE_PLANS.FREE,
        monthly: STRIPE_PLANS.MONTHLY,
        yearly: STRIPE_PLANS.YEARLY,
      },
    },
  });
}
