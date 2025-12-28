"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface SubscribeButtonProps {
  publicationId: string;
  publicationName: string;
  publicationSlug?: string;
  isSubscribed?: boolean;
  subscriptionTier?: "free" | "paid" | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  onSubscriptionChange?: (subscribed: boolean) => void;
}

export function SubscribeButton({
  publicationId,
  publicationName,
  publicationSlug,
  isSubscribed = false,
  subscriptionTier = null,
  className,
  size = "md",
  onSubscriptionChange,
}: SubscribeButtonProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);
  const [subscribed, setSubscribed] = React.useState(isSubscribed);
  const [tier, setTier] = React.useState(subscriptionTier);

  React.useEffect(() => {
    setSubscribed(isSubscribed);
    setTier(subscriptionTier);
  }, [isSubscribed, subscriptionTier]);

  const handleSubscribe = async () => {
    // Redirect to sign in if not authenticated
    if (status !== "authenticated") {
      const callbackUrl = encodeURIComponent(window.location.pathname);
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
      return;
    }

    setIsLoading(true);

    try {
      if (subscribed) {
        // Unsubscribe
        const response = await fetch(
          `/api/subscriptions?publicationId=${publicationId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setSubscribed(false);
          setTier(null);
          onSubscriptionChange?.(false);
        } else {
          const data = await response.json();
          console.error("Failed to unsubscribe:", data.error);
        }
      } else {
        // Subscribe
        const response = await fetch("/api/subscriptions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicationId,
            tier: "free",
          }),
        });

        if (response.ok) {
          setSubscribed(true);
          setTier("free");
          onSubscriptionChange?.(true);
        } else {
          const data = await response.json();
          console.error("Failed to subscribe:", data.error);
        }
      }
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="secondary"
          size={size}
          onClick={handleSubscribe}
          isLoading={isLoading}
          className="group"
        >
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="group-hover:hidden">Joined</span>
            <span className="hidden group-hover:inline text-red-600">
              Leave community
            </span>
          </span>
        </Button>
        {tier === "free" && (
          <Button
            variant="primary"
            size={size}
            onClick={() => {
              // Redirect to subscribe page for upgrade
              const slug = publicationSlug || window.location.pathname.split('/')[1];
              router.push(`/subscribe/${slug}`);
            }}
          >
            Get Full Access
          </Button>
        )}
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size={size}
      onClick={handleSubscribe}
      isLoading={isLoading}
      className={className}
    >
      <svg
        className="mr-2 h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
      Join community
    </Button>
  );
}

// Compact subscribe form with email input for non-authenticated users
export interface SubscribeFormProps {
  publicationId: string;
  publicationName: string;
  className?: string;
  onSubscriptionChange?: (subscribed: boolean) => void;
}

export function SubscribeForm({
  publicationId,
  publicationName,
  className,
  onSubscriptionChange,
}: SubscribeFormProps) {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === "authenticated") {
      // If authenticated, just subscribe directly
      setIsLoading(true);
      try {
        const response = await fetch("/api/subscriptions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicationId,
            tier: "free",
          }),
        });

        if (response.ok) {
          setMessage({
            type: "success",
            text: `You've joined the ${publicationName} community!`,
          });
          onSubscriptionChange?.(true);
        } else {
          const data = await response.json();
          setMessage({
            type: "error",
            text: data.error || "Failed to join community",
          });
        }
      } catch (error) {
        setMessage({ type: "error", text: "Something went wrong" });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // If not authenticated, redirect to sign up with email pre-filled
    const callbackUrl = encodeURIComponent(window.location.pathname);
    router.push(
      `/auth/signup?email=${encodeURIComponent(email)}&callbackUrl=${callbackUrl}&subscribe=${publicationId}`
    );
  };

  if (status === "authenticated") {
    return (
      <SubscribeButton
        publicationId={publicationId}
        publicationName={publicationName}
        className={className}
        onSubscriptionChange={onSubscriptionChange}
      />
    );
  }

  return (
    <div className={cn("w-full max-w-md", className)}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-lumos-orange focus:outline-none focus:ring-2 focus:ring-lumos-orange/20"
        />
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Join
        </Button>
      </form>
      {message && (
        <p
          className={cn(
            "mt-2 text-sm",
            message.type === "success" ? "text-green-600" : "text-red-600"
          )}
        >
          {message.text}
        </p>
      )}
      <p className="mt-2 text-xs text-gray-500 text-center">
        No spam. Leave community anytime.
      </p>
    </div>
  );
}
