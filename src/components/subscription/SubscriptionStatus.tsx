"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export interface SubscriptionStatusProps {
  subscription: {
    id: string;
    tier: string;
    status: string;
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd?: boolean;
    publication?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  showManageButton?: boolean;
  className?: string;
}

export function SubscriptionStatus({
  subscription,
  showManageButton = true,
  className,
}: SubscriptionStatusProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isPaid = subscription.tier === "paid";
  const isActive = subscription.status === "active";
  const isPastDue = subscription.status === "past_due";
  const isCanceled = subscription.status === "canceled";
  const willCancel = subscription.cancelAtPeriodEnd;

  const renewalDate = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;

  const formattedRenewalDate = renewalDate
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(renewalDate)
    : null;

  const handleManageSubscription = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const returnUrl = subscription.publication
        ? `/${subscription.publication.slug}`
        : "/profile";

      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl }),
      });

      const data = await response.json();

      if (response.ok && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        setError(data.error || "Failed to open billing portal");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (isCanceled) {
      return <Badge variant="error">Ended</Badge>;
    }
    if (isPastDue) {
      return <Badge variant="warning">Action Required</Badge>;
    }
    if (willCancel) {
      return <Badge variant="warning">Ending soon</Badge>;
    }
    if (isActive && isPaid) {
      return <Badge variant="success">Active</Badge>;
    }
    if (isActive) {
      return <Badge variant="default">Free Access</Badge>;
    }
    return <Badge variant="default">{subscription.status}</Badge>;
  };

  const getTierDisplay = () => {
    if (isPaid) {
      return "Full Access Member";
    }
    return "Free Member";
  };

  return (
    <Card className={cn("", className)}>
      <div className="flex items-start justify-between">
        <div>
          {subscription.publication && (
            <h3 className="text-lg font-semibold text-gray-900">
              {subscription.publication.name}
            </h3>
          )}
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-gray-600">{getTierDisplay()}</span>
            {getStatusBadge()}
          </div>
        </div>

        {showManageButton && isPaid && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleManageSubscription}
            isLoading={isLoading}
          >
            Manage
          </Button>
        )}
      </div>

      {isPaid && formattedRenewalDate && (
        <div className="mt-4 rounded-lg bg-gray-50 p-3">
          {willCancel ? (
            <p className="text-sm text-gray-600">
              <span className="font-medium text-yellow-700">
                Access ends:
              </span>{" "}
              {formattedRenewalDate}
            </p>
          ) : isPastDue ? (
            <p className="text-sm text-red-600">
              <span className="font-medium">Update payment.</span> Please update
              your payment method to keep your full access.
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Next payment:</span> {formattedRenewalDate}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
    </Card>
  );
}

// List of subscriptions for profile page
export interface SubscriptionListProps {
  subscriptions: Array<{
    id: string;
    tier: string;
    status: string;
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd?: boolean;
    publication: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  className?: string;
}

export function SubscriptionList({
  subscriptions,
  className,
}: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return (
      <Card className={cn("text-center py-8", className)}>
        <p className="text-gray-500">Not joined any communities yet</p>
        <p className="mt-1 text-sm text-gray-400">
          Join learning portals to see them here
        </p>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {subscriptions.map((subscription) => (
        <SubscriptionStatus
          key={subscription.id}
          subscription={subscription}
        />
      ))}
    </div>
  );
}

// Compact subscription status for post headers
export interface CompactSubscriptionStatusProps {
  tier: "free" | "paid";
  status: string;
  className?: string;
}

export function CompactSubscriptionStatus({
  tier,
  status,
  className,
}: CompactSubscriptionStatusProps) {
  const isActive = status === "active";
  const isPaid = tier === "paid";

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      {isPaid && isActive ? (
        <>
          <svg
            className="h-4 w-4 text-[#ff6719]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-medium text-[#ff6719]">
            Full Access Member
          </span>
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-medium text-gray-500">
            Free Member
          </span>
        </>
      )}
    </div>
  );
}
