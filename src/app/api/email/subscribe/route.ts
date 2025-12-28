import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  sendEmail,
  generateConfirmationToken,
  verifyConfirmationToken,
  EMAIL_CONFIG,
} from "@/lib/email";
import { renderSubscriptionConfirmEmail } from "@/lib/email-render";

// Simple in-memory rate limiting for subscription requests
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
};

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return false;
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return true;
  }

  record.count++;
  return false;
}

// POST - Request subscription (sends confirmation email for double opt-in)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, publicationId, publicationSlug } = body;

    if (!email || (!publicationId && !publicationSlug)) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and publication identifier are required",
        },
        { status: 400 }
      );
    }

    // Rate limiting
    const identifier =
      request.headers.get("x-forwarded-for") || email || "anonymous";

    if (isRateLimited(identifier)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Find publication
    const publication = await prisma.publication.findUnique({
      where: publicationId
        ? { id: publicationId }
        : { slug: publicationSlug },
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true },
    });

    // Check for existing subscription
    if (user) {
      const existingSubscription = await prisma.subscription.findUnique({
        where: {
          userId_publicationId: {
            userId: user.id,
            publicationId: publication.id,
          },
        },
      });

      if (existingSubscription) {
        // Already subscribed - return success without revealing this fact
        // (for privacy/security)
        return NextResponse.json({
          success: true,
          data: { message: "Confirmation email sent" },
        });
      }
    }

    // Generate confirmation token
    const token = generateConfirmationToken(email, publication.id);
    const confirmUrl = `${EMAIL_CONFIG.baseUrl}/api/email/subscribe?token=${token}`;
    const publicationUrl = `${EMAIL_CONFIG.baseUrl}/${publication.slug}`;

    // Send confirmation email
    const html = renderSubscriptionConfirmEmail({
      subscriberName: user?.name || undefined,
      publicationName: publication.name,
      publicationUrl,
      confirmUrl,
    });

    const result = await sendEmail({
      to: email,
      subject: `Confirm your subscription to ${publication.name}`,
      html,
    });

    if (!result.success) {
      console.error("Failed to send confirmation email:", result.error);
      return NextResponse.json(
        { success: false, error: "Failed to send confirmation email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Confirmation email sent" },
    });
  } catch (error) {
    console.error("Subscribe API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Confirm subscription (user clicks link in email)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      // Redirect to error page
      return NextResponse.redirect(
        new URL(
          "/subscribe/error?reason=missing_token",
          EMAIL_CONFIG.baseUrl
        )
      );
    }

    // Verify token
    const tokenData = verifyConfirmationToken(token);

    if (!tokenData) {
      return NextResponse.redirect(
        new URL(
          "/subscribe/error?reason=invalid_token",
          EMAIL_CONFIG.baseUrl
        )
      );
    }

    const { email, publicationId } = tokenData;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      // Create a new user for email-only subscribers
      user = await prisma.user.create({
        data: {
          email,
          // No password - they'll need to set one if they want to log in
        },
        select: { id: true },
      });
    }

    // Find publication
    const publication = await prisma.publication.findUnique({
      where: { id: publicationId },
      select: { id: true, slug: true, name: true },
    });

    if (!publication) {
      return NextResponse.redirect(
        new URL(
          "/subscribe/error?reason=publication_not_found",
          EMAIL_CONFIG.baseUrl
        )
      );
    }

    // Create subscription if it doesn't exist
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        userId_publicationId: {
          userId: user.id,
          publicationId: publication.id,
        },
      },
    });

    if (!existingSubscription) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          publicationId: publication.id,
          tier: "free",
          status: "active",
        },
      });
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(
        `/subscribe/success?publication=${encodeURIComponent(publication.name)}`,
        EMAIL_CONFIG.baseUrl
      )
    );
  } catch (error) {
    console.error("Subscription confirmation error:", error);
    return NextResponse.redirect(
      new URL("/subscribe/error?reason=error", EMAIL_CONFIG.baseUrl)
    );
  }
}
