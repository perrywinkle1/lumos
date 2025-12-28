import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyUnsubscribeToken, EMAIL_CONFIG } from "@/lib/email";

// POST - Unsubscribe from a publication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing unsubscribe token" },
        { status: 400 }
      );
    }

    // Verify token
    const tokenData = verifyUnsubscribeToken(token);

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired unsubscribe link" },
        { status: 400 }
      );
    }

    const { email, publicationId } = tokenData;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      // User doesn't exist - nothing to unsubscribe
      return NextResponse.json({
        success: true,
        data: { message: "Unsubscribed successfully" },
      });
    }

    // Find and delete subscription
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId_publicationId: {
          userId: user.id,
          publicationId,
        },
      },
    });

    if (subscription) {
      await prisma.subscription.delete({
        where: { id: subscription.id },
      });
    }

    return NextResponse.json({
      success: true,
      data: { message: "Unsubscribed successfully" },
    });
  } catch (error) {
    console.error("Unsubscribe API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}

// GET - Handle one-click unsubscribe from email links (RFC 8058)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/unsubscribe?error=missing_token", EMAIL_CONFIG.baseUrl)
      );
    }

    // Verify token
    const tokenData = verifyUnsubscribeToken(token);

    if (!tokenData) {
      return NextResponse.redirect(
        new URL("/unsubscribe?error=invalid_token", EMAIL_CONFIG.baseUrl)
      );
    }

    // Redirect to unsubscribe page with token
    return NextResponse.redirect(
      new URL(`/unsubscribe?token=${token}`, EMAIL_CONFIG.baseUrl)
    );
  } catch (error) {
    console.error("Unsubscribe GET error:", error);
    return NextResponse.redirect(
      new URL("/unsubscribe?error=server_error", EMAIL_CONFIG.baseUrl)
    );
  }
}
