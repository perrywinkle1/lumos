import { Resend } from "resend";

// Lazy-initialize Resend client to avoid build errors when API key is not set
let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY || "");
  }
  return resendInstance;
}

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || "Lumos <noreply@lumos.com>",
  replyTo: process.env.EMAIL_REPLY_TO || "support@lumos.com",
  baseUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
};

// Email template types
export type EmailType =
  | "welcome"
  | "subscription_confirmation"
  | "new_post"
  | "password_reset";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<SendEmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email send");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { data, error } = await getResendClient().emails.send({
      from: EMAIL_CONFIG.from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo || EMAIL_CONFIG.replyTo,
      tags: options.tags,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error("Email send error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}

/**
 * Send batch emails (for newsletter distribution)
 * Resend supports up to 100 emails per batch
 */
export async function sendBatchEmails(
  emails: Array<{
    to: string;
    subject: string;
    html: string;
    text?: string;
  }>
): Promise<{ success: boolean; results: SendEmailResult[] }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping batch email send");
    return { success: false, results: [] };
  }

  const results: SendEmailResult[] = [];
  const batchSize = 100;

  // Process in batches of 100
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    try {
      const { data, error } = await getResendClient().batch.send(
        batch.map((email) => ({
          from: EMAIL_CONFIG.from,
          to: email.to,
          subject: email.subject,
          html: email.html,
          text: email.text,
        }))
      );

      if (error) {
        console.error("Batch send error:", error);
        batch.forEach(() =>
          results.push({ success: false, error: error.message })
        );
      } else {
        data?.data?.forEach((result: { id: string }) =>
          results.push({ success: true, messageId: result.id })
        );
      }
    } catch (err) {
      console.error("Batch email error:", err);
      batch.forEach(() =>
        results.push({
          success: false,
          error: err instanceof Error ? err.message : "Batch send failed",
        })
      );
    }
  }

  return {
    success: results.every((r) => r.success),
    results,
  };
}

/**
 * Generate an unsubscribe token
 * In production, use a proper JWT or signed token
 */
export function generateUnsubscribeToken(
  email: string,
  publicationId: string
): string {
  const payload = JSON.stringify({ email, publicationId, timestamp: Date.now() });
  return Buffer.from(payload).toString("base64url");
}

/**
 * Verify and decode an unsubscribe token
 */
export function verifyUnsubscribeToken(
  token: string
): { email: string; publicationId: string; timestamp: number } | null {
  try {
    const payload = Buffer.from(token, "base64url").toString("utf-8");
    const data = JSON.parse(payload);

    // Token expires after 30 days
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > thirtyDays) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Generate a password reset token
 */
export function generatePasswordResetToken(email: string): string {
  const payload = JSON.stringify({ email, timestamp: Date.now(), type: "password_reset" });
  return Buffer.from(payload).toString("base64url");
}

/**
 * Verify password reset token (valid for 1 hour)
 */
export function verifyPasswordResetToken(
  token: string
): { email: string; timestamp: number } | null {
  try {
    const payload = Buffer.from(token, "base64url").toString("utf-8");
    const data = JSON.parse(payload);

    if (data.type !== "password_reset") {
      return null;
    }

    // Token expires after 1 hour
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - data.timestamp > oneHour) {
      return null;
    }

    return { email: data.email, timestamp: data.timestamp };
  } catch {
    return null;
  }
}

/**
 * Generate email confirmation token for double opt-in
 */
export function generateConfirmationToken(
  email: string,
  publicationId: string
): string {
  const payload = JSON.stringify({
    email,
    publicationId,
    timestamp: Date.now(),
    type: "email_confirmation",
  });
  return Buffer.from(payload).toString("base64url");
}

/**
 * Verify email confirmation token (valid for 24 hours)
 */
export function verifyConfirmationToken(
  token: string
): { email: string; publicationId: string; timestamp: number } | null {
  try {
    const payload = Buffer.from(token, "base64url").toString("utf-8");
    const data = JSON.parse(payload);

    if (data.type !== "email_confirmation") {
      return null;
    }

    // Token expires after 24 hours
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > twentyFourHours) {
      return null;
    }

    return {
      email: data.email,
      publicationId: data.publicationId,
      timestamp: data.timestamp,
    };
  } catch {
    return null;
  }
}

export { getResendClient as resend };
