import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail, EmailType } from "@/lib/email";
import {
  renderWelcomeEmail,
  renderSubscriptionConfirmEmail,
  renderNewPostEmail,
  renderPasswordResetEmail,
} from "@/lib/email-render";

// Simple in-memory rate limiting
// In production, use Redis or similar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  maxRequests: 10,
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

interface EmailPayload {
  type: EmailType;
  to: string;
  data: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // For most email types, require authentication
    // Password reset can be sent without auth
    const body = (await request.json()) as EmailPayload;
    const { type, to, data } = body;

    if (!type || !to) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: type, to" },
        { status: 400 }
      );
    }

    // Rate limiting based on IP or user ID
    const identifier =
      session?.user?.id ||
      request.headers.get("x-forwarded-for") ||
      "anonymous";

    if (isRateLimited(identifier)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Validate email type and require auth for protected types
    if (type !== "password_reset" && !session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let html: string;
    let subject: string;

    switch (type) {
      case "welcome":
        subject = "Welcome to Lumos!";
        html = renderWelcomeEmail({
          userName: data.userName as string,
          loginUrl: data.loginUrl as string,
        });
        break;

      case "subscription_confirmation":
        subject = `Confirm your subscription to ${data.publicationName}`;
        html = renderSubscriptionConfirmEmail({
          subscriberName: data.subscriberName as string | undefined,
          publicationName: data.publicationName as string,
          publicationUrl: data.publicationUrl as string,
          confirmUrl: data.confirmUrl as string,
        });
        break;

      case "new_post":
        subject = `New post from ${data.publicationName}: ${data.postTitle}`;
        html = renderNewPostEmail({
          subscriberName: data.subscriberName as string | undefined,
          publicationName: data.publicationName as string,
          postTitle: data.postTitle as string,
          postExcerpt: data.postExcerpt as string | undefined,
          postUrl: data.postUrl as string,
          authorName: data.authorName as string,
          unsubscribeUrl: data.unsubscribeUrl as string,
        });
        break;

      case "password_reset":
        subject = "Reset your Lumos password";
        html = renderPasswordResetEmail({
          userName: data.userName as string | undefined,
          resetUrl: data.resetUrl as string,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Invalid email type: ${type}` },
          { status: 400 }
        );
    }

    const result = await sendEmail({
      to,
      subject,
      html,
      tags: [{ name: "email_type", value: type }],
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { messageId: result.messageId },
    });
  } catch (error) {
    console.error("Email send API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
