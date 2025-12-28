import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { createPortalSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - please sign in" },
        { status: 401 }
      );
    }

    // Get user's Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { success: false, error: "No billing account found. Please subscribe to a publication first." },
        { status: 400 }
      );
    }

    // Get the return URL from request body or use default
    const body = await request.json().catch(() => ({}));
    const origin = request.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const returnUrl = body.returnUrl || `${origin}/profile`;

    // Create portal session
    const portalSession = await createPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: portalSession.url,
      },
    });
  } catch (error) {
    console.error("Error creating portal session:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to create portal session";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
