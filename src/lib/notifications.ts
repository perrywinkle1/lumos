import type { User, Publication, Post, Subscription } from "@prisma/client";
import prisma from "@/lib/db";
import {
  sendEmail,
  sendBatchEmails,
  generateUnsubscribeToken,
  EMAIL_CONFIG,
} from "@/lib/email";
import {
  renderWelcomeEmail,
  renderSubscriptionConfirmEmail,
  renderNewPostEmail,
} from "@/lib/email-render";

// Types for notification functions
type UserWithEmail = Pick<User, "id" | "name" | "email">;
type PublicationInfo = Pick<Publication, "id" | "name" | "slug">;
type PostInfo = Pick<Post, "id" | "title" | "slug" | "excerpt"> & {
  publication: PublicationInfo;
  author: Pick<User, "name">;
};
type SubscriptionWithUser = Subscription & {
  user: UserWithEmail;
};

export interface NotificationResult {
  success: boolean;
  sent?: number;
  failed?: number;
  error?: string;
}

/**
 * Send welcome email to a new user
 */
export async function sendWelcomeEmail(
  user: UserWithEmail
): Promise<NotificationResult> {
  if (!user.email) {
    return { success: false, error: "User has no email address" };
  }

  const loginUrl = `${EMAIL_CONFIG.baseUrl}/auth/signin`;

  const html = renderWelcomeEmail({
    userName: user.name || "",
    loginUrl,
  });

  const result = await sendEmail({
    to: user.email,
    subject: "Welcome to Lumos!",
    html,
    tags: [{ name: "email_type", value: "welcome" }],
  });

  return {
    success: result.success,
    sent: result.success ? 1 : 0,
    failed: result.success ? 0 : 1,
    error: result.error,
  };
}

/**
 * Send subscription confirmation email for double opt-in
 */
export async function sendSubscriptionConfirmation(
  subscription: {
    email: string;
    userName?: string | null;
    publicationId: string;
    publicationName: string;
    publicationSlug: string;
  }
): Promise<NotificationResult> {
  const confirmToken = Buffer.from(
    JSON.stringify({
      email: subscription.email,
      publicationId: subscription.publicationId,
      timestamp: Date.now(),
      type: "email_confirmation",
    })
  ).toString("base64url");

  const confirmUrl = `${EMAIL_CONFIG.baseUrl}/api/email/subscribe?token=${confirmToken}`;
  const publicationUrl = `${EMAIL_CONFIG.baseUrl}/${subscription.publicationSlug}`;

  const html = renderSubscriptionConfirmEmail({
    subscriberName: subscription.userName || undefined,
    publicationName: subscription.publicationName,
    publicationUrl,
    confirmUrl,
  });

  const result = await sendEmail({
    to: subscription.email,
    subject: `Confirm your subscription to ${subscription.publicationName}`,
    html,
    tags: [
      { name: "email_type", value: "subscription_confirmation" },
      { name: "publication_id", value: subscription.publicationId },
    ],
  });

  return {
    success: result.success,
    sent: result.success ? 1 : 0,
    failed: result.success ? 0 : 1,
    error: result.error,
  };
}

/**
 * Notify all subscribers of a new post
 */
export async function sendNewPostNotification(
  post: PostInfo,
  subscribers?: SubscriptionWithUser[]
): Promise<NotificationResult> {
  // If subscribers not provided, fetch them
  const subscriberList =
    subscribers ||
    (await prisma.subscription.findMany({
      where: {
        publicationId: post.publication.id,
        status: "active",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }));

  if (subscriberList.length === 0) {
    return { success: true, sent: 0, failed: 0 };
  }

  const postUrl = `${EMAIL_CONFIG.baseUrl}/${post.publication.slug}/${post.slug}`;

  // Build email list with individual unsubscribe links
  const emails = subscriberList
    .filter((sub) => sub.user.email)
    .map((sub) => {
      const unsubscribeToken = generateUnsubscribeToken(
        sub.user.email,
        post.publication.id
      );
      const unsubscribeUrl = `${EMAIL_CONFIG.baseUrl}/unsubscribe?token=${unsubscribeToken}`;

      return {
        to: sub.user.email,
        subject: `New post from ${post.publication.name}: ${post.title}`,
        html: renderNewPostEmail({
          subscriberName: sub.user.name || undefined,
          publicationName: post.publication.name,
          postTitle: post.title,
          postExcerpt: post.excerpt || undefined,
          postUrl,
          authorName: post.author.name || "Unknown author",
          unsubscribeUrl,
        }),
      };
    });

  if (emails.length === 0) {
    return { success: true, sent: 0, failed: 0 };
  }

  const result = await sendBatchEmails(emails);

  const sent = result.results.filter((r) => r.success).length;
  const failed = result.results.filter((r) => !r.success).length;

  return {
    success: sent > 0,
    sent,
    failed,
    error: failed > 0 ? `Failed to send ${failed} emails` : undefined,
  };
}

/**
 * Get subscriber count for a publication
 */
export async function getSubscriberCount(
  publicationId: string
): Promise<number> {
  return prisma.subscription.count({
    where: {
      publicationId,
      status: "active",
    },
  });
}

/**
 * Get active subscribers for a publication
 */
export async function getActiveSubscribers(
  publicationId: string,
  options?: { limit?: number; offset?: number }
): Promise<SubscriptionWithUser[]> {
  return prisma.subscription.findMany({
    where: {
      publicationId,
      status: "active",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    take: options?.limit,
    skip: options?.offset,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Queue post notification for background processing
 * In a production app, this would use a job queue like Bull or Inngest
 */
export async function queueNewPostNotification(
  postId: string
): Promise<{ queued: boolean; jobId?: string }> {
  // For now, we'll just send immediately
  // In production, you'd queue this for background processing

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      publication: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!post) {
    return { queued: false };
  }

  // Send notification asynchronously (fire and forget)
  sendNewPostNotification({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    publication: post.publication,
    author: post.author,
  }).catch((error) => {
    console.error("Failed to send new post notification:", error);
  });

  return { queued: true, jobId: `post-${postId}` };
}

// Export types
export type {
  UserWithEmail,
  PublicationInfo,
  PostInfo,
  SubscriptionWithUser,
};
