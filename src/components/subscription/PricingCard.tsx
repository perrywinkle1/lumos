"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export interface PricingCardProps {
  publicationId: string;
  publicationSlug: string;
  tier: "free" | "monthly" | "yearly";
  name: string;
  price: number; // in cents
  interval?: "month" | "year" | null;
  features: readonly string[];
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  className?: string;
  onSubscribe?: () => void;
}

export function PricingCard({
  publicationId,
  publicationSlug,
  tier,
  name,
  price,
  interval,
  features,
  isCurrentPlan = false,
  isPopular = false,
  className,
  onSubscribe,
}: PricingCardProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price / 100);

  const handleSubscribe = async () => {
    setError(null);

    // For free tier, just subscribe directly
    if (tier === "free") {
      if (status !== "authenticated") {
        const callbackUrl = encodeURIComponent(`/subscribe/${publicationSlug}`);
        router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicationId,
            tier: "free",
          }),
        });

        const data = await response.json();

        if (response.ok) {
          onSubscribe?.();
          router.push(`/${publicationSlug}?subscribed=true`);
        } else {
          setError(data.error || "Failed to subscribe");
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // For paid tiers, redirect to checkout
    if (status !== "authenticated") {
      const callbackUrl = encodeURIComponent(`/subscribe/${publicationSlug}`);
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicationId,
          interval: tier === "yearly" ? "year" : "month",
        }),
      });

      const data = await response.json();

      if (response.ok && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        setError(data.error || "Failed to start checkout");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={cn(
        "relative flex flex-col p-5 sm:p-6",
        isPopular && "border-2 border-[#ff6719] shadow-lg",
        isCurrentPlan && "bg-gray-50",
        className
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="orange" size="sm">
            Most Popular
          </Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="success" size="sm">
            Current Plan
          </Badge>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {formattedPrice}
          </span>
          {interval && (
            <span className="ml-1 text-gray-500">/{interval}</span>
          )}
        </div>
        {tier === "yearly" && (
          <p className="mt-1 text-sm text-green-600 font-medium">
            Save 17% compared to monthly
          </p>
        )}
      </div>

      <ul className="mb-6 flex-1 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <svg
              className="h-5 w-5 flex-shrink-0 text-[#ff6719]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      <Button
        variant={isCurrentPlan ? "secondary" : tier === "free" ? "secondary" : "primary"}
        size="lg"
        className="w-full min-h-[44px]"
        onClick={handleSubscribe}
        isLoading={isLoading}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan
          ? "Current Plan"
          : tier === "free"
          ? "Get Free Access"
          : "Get Full Access"}
      </Button>
    </Card>
  );
}

// Compact inline pricing display
export interface InlinePricingProps {
  monthlyPrice: number;
  yearlyPrice: number;
  selectedInterval: "month" | "year";
  onIntervalChange: (interval: "month" | "year") => void;
  className?: string;
}

export function InlinePricing({
  monthlyPrice,
  yearlyPrice,
  selectedInterval,
  onIntervalChange,
  className,
}: InlinePricingProps) {
  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <button
        type="button"
        onClick={() => onIntervalChange("month")}
        className={cn(
          "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
          selectedInterval === "month"
            ? "bg-[#ff6719] text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
      >
        {formatPrice(monthlyPrice)}/month
      </button>
      <button
        type="button"
        onClick={() => onIntervalChange("year")}
        className={cn(
          "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
          selectedInterval === "year"
            ? "bg-[#ff6719] text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
      >
        {formatPrice(yearlyPrice)}/year
        <span className="ml-1 text-xs opacity-75">(Save 17%)</span>
      </button>
    </div>
  );
}
