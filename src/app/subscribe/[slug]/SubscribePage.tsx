"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PricingCard } from "@/components/subscription/PricingCard";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/Avatar";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval?: "month" | "year" | null;
  features: readonly string[];
}

interface Publication {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  themeColor: string;
  ownerId: string;
  owner: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    posts: number;
    subscriptions: number;
  };
}

interface Subscription {
  id: string;
  tier: "free" | "paid";
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface SubscribePageProps {
  publication: Publication;
  subscription: Subscription | null;
  plans: {
    free: Plan;
    monthly: Plan;
    yearly: Plan;
  };
  isOwner: boolean;
  checkoutCanceled?: boolean;
}

export function SubscribePage({
  publication,
  subscription,
  plans,
  isOwner,
  checkoutCanceled,
}: SubscribePageProps) {
  const router = useRouter();
  const [showCanceledMessage, setShowCanceledMessage] = React.useState(
    checkoutCanceled
  );

  // Dismiss the canceled message after 5 seconds
  React.useEffect(() => {
    if (showCanceledMessage) {
      const timer = setTimeout(() => {
        setShowCanceledMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showCanceledMessage]);

  const isPaidSubscriber =
    subscription?.tier === "paid" && subscription?.status === "active";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover/Header */}
      <div className="relative h-48 bg-gradient-to-br from-[#ff6719] to-orange-600">
        {publication.coverUrl && (
          <Image
            src={publication.coverUrl}
            alt=""
            fill
            className="object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <Container className="relative -mt-24">
        {/* Publication Info */}
        <div className="mb-8 text-center sm:mb-12">
          {publication.logoUrl ? (
            <Image
              src={publication.logoUrl}
              alt={publication.name}
              width={96}
              height={96}
              className="mx-auto mb-4 h-20 w-20 rounded-xl border-4 border-white bg-white shadow-lg sm:h-24 sm:w-24"
            />
          ) : (
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-xl border-4 border-white bg-white text-2xl font-bold text-[#ff6719] shadow-lg sm:h-24 sm:w-24 sm:text-3xl">
              {publication.name.charAt(0)}
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Unlock full access to technology guides
          </h1>
          {publication.description && (
            <p className="mt-2 mx-auto max-w-xl text-gray-600">
              Join 5,000+ others who are building their digital confidence with {publication.name}.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 sm:gap-6">
            <div className="flex items-center gap-2">
              <Avatar
                src={publication.owner.image}
                alt={publication.owner.name || "Author"}
                size="sm"
              />
              <span>By {publication.owner.name || "Anonymous"}</span>
            </div>
            <span>{publication._count.posts} posts</span>
            <span>{publication._count.subscriptions} subscribers</span>
          </div>
        </div>

        {/* Canceled checkout message */}
        {showCanceledMessage && (
          <div className="mb-8 rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-center">
            <p className="text-yellow-800">
              Checkout was canceled. You can try again when you&apos;re ready.
            </p>
          </div>
        )}

        {/* Owner message */}
        {isOwner && (
          <div className="mb-8 rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
            <p className="text-blue-800">
              This is your publication. You can&apos;t subscribe to yourself, but you
              have full access to all content.
            </p>
            <Link href={`/${publication.slug}`}>
              <Button variant="secondary" size="sm" className="mt-2">
                Go to Publication
              </Button>
            </Link>
          </div>
        )}

        {/* Current subscription status */}
        {subscription && !isOwner && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Your Subscription
            </h2>
            <SubscriptionStatus
              subscription={{
                ...subscription,
                publication: {
                  id: publication.id,
                  name: publication.name,
                  slug: publication.slug,
                },
              }}
            />
          </div>
        )}

        {/* Pricing Cards */}
        {!isOwner && (
          <div className="pb-12 sm:pb-16">
            <h2 className="mb-6 text-center text-xl font-bold text-gray-900 sm:mb-8 sm:text-2xl">
              Choose Your Plan
            </h2>

            <div className="mx-auto grid max-w-4xl gap-4 sm:gap-6 md:grid-cols-3">
              {/* Free Tier */}
              <PricingCard
                publicationId={publication.id}
                publicationSlug={publication.slug}
                tier="free"
                name={plans.free.name}
                price={plans.free.price}
                interval={null}
                features={plans.free.features}
                isCurrentPlan={
                  subscription?.tier === "free" && subscription?.status === "active"
                }
              />

              {/* Monthly */}
              <PricingCard
                publicationId={publication.id}
                publicationSlug={publication.slug}
                tier="monthly"
                name={plans.monthly.name}
                price={plans.monthly.price}
                interval="month"
                features={plans.monthly.features}
                isPopular
                isCurrentPlan={
                  isPaidSubscriber &&
                  !subscription?.currentPeriodEnd?.includes("year")
                }
              />

              {/* Yearly */}
              <PricingCard
                publicationId={publication.id}
                publicationSlug={publication.slug}
                tier="yearly"
                name={plans.yearly.name}
                price={plans.yearly.price}
                interval="year"
                features={plans.yearly.features}
                isCurrentPlan={
                  isPaidSubscriber &&
                  subscription?.currentPeriodEnd?.includes("year")
                }
              />
            </div>

            {/* FAQ or additional info */}
            <div className="mt-12 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Questions?
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                You can cancel or manage your subscription at any time.
                <br />
                Paid subscriptions include access to all premium content.
              </p>
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="pb-8 text-center">
          <Link
            href={`/${publication.slug}`}
            className="text-sm text-gray-500 hover:text-[#ff6719]"
          >
            Back to {publication.name}
          </Link>
        </div>
      </Container>
    </div>
  );
}
