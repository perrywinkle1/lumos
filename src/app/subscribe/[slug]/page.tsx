import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { STRIPE_PLANS } from "@/lib/stripe";
import { SubscribePage } from "./SubscribePage";

interface SubscribePageProps {
  params: {
    slug: string;
  };
  searchParams: {
    checkout?: string;
  };
}

async function getPublication(slug: string) {
  const publication = await prisma.publication.findUnique({
    where: { slug },
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
          subscriptions: true,
        },
      },
    },
  });

  return publication;
}

async function getUserSubscription(userId: string, publicationId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: {
      userId_publicationId: {
        userId,
        publicationId,
      },
    },
  });

  return subscription;
}

export async function generateMetadata({
  params,
}: SubscribePageProps): Promise<Metadata> {
  const publication = await getPublication(params.slug);

  if (!publication) {
    return {
      title: "Publication Not Found",
    };
  }

  return {
    title: `Subscribe to ${publication.name} | Lumos`,
    description: `Support ${publication.name} by becoming a subscriber. Get access to premium content and support the writer.`,
  };
}

export default async function SubscribeRoute({
  params,
  searchParams,
}: SubscribePageProps) {
  const publication = await getPublication(params.slug);

  if (!publication) {
    notFound();
  }

  const session = await getServerSession(authOptions);

  let subscription = null;
  if (session?.user?.id) {
    subscription = await getUserSubscription(session.user.id, publication.id);
  }

  // Serialize for client
  const serializedPublication = {
    id: publication.id,
    name: publication.name,
    slug: publication.slug,
    description: publication.description,
    logoUrl: publication.logoUrl,
    coverUrl: publication.coverUrl,
    themeColor: publication.themeColor,
    ownerId: publication.ownerId,
    owner: publication.owner,
    _count: publication._count,
  };

  const serializedSubscription = subscription
    ? {
        id: subscription.id,
        tier: subscription.tier as "free" | "paid",
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      }
    : null;

  // Plans data for client
  const plans = {
    free: STRIPE_PLANS.FREE,
    monthly: STRIPE_PLANS.MONTHLY,
    yearly: STRIPE_PLANS.YEARLY,
  };

  return (
    <SubscribePage
      publication={serializedPublication}
      subscription={serializedSubscription}
      plans={plans}
      isOwner={session?.user?.id === publication.ownerId}
      checkoutCanceled={searchParams.checkout === "canceled"}
    />
  );
}
