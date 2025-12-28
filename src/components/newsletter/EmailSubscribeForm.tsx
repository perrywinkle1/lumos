"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { Mail, Check, AlertCircle } from "lucide-react";

export interface EmailSubscribeFormProps {
  publicationId?: string;
  publicationSlug?: string;
  publicationName?: string;
  className?: string;
  variant?: "inline" | "stacked";
  placeholder?: string;
  buttonText?: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

export function EmailSubscribeForm({
  publicationId,
  publicationSlug,
  publicationName,
  className,
  variant = "inline",
  placeholder = "Enter your email",
  buttonText = "Subscribe",
}: EmailSubscribeFormProps) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setErrorMessage("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          publicationId,
          publicationSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  // Reset status after showing success/error
  React.useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        setStatus("idle");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === "success") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg bg-green-50 p-4 text-green-700",
          className
        )}
      >
        <Check className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-medium">You&apos;re almost there!</p>
          <p className="text-sm text-green-600">
            Check your inbox to confirm your subscription
            {publicationName ? ` to ${publicationName}` : ""}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        variant === "inline"
          ? "flex flex-col gap-3 sm:flex-row sm:items-start"
          : "flex flex-col gap-3",
        className
      )}
    >
      <div className={cn(variant === "inline" ? "flex-1" : "w-full")}>
        <Input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setErrorMessage("");
            }
          }}
          placeholder={placeholder}
          leftIcon={<Mail className="h-5 w-5" />}
          disabled={status === "loading"}
          error={status === "error" ? errorMessage : undefined}
          aria-label="Email address"
          autoComplete="email"
        />
      </div>

      <Button
        type="submit"
        isLoading={status === "loading"}
        className={cn(
          variant === "stacked" && "w-full",
          variant === "inline" && "sm:w-auto"
        )}
      >
        {buttonText}
      </Button>

      {status === "error" && variant === "inline" && (
        <div className="flex items-center gap-2 text-sm text-red-600 sm:hidden">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}
    </form>
  );
}

// Compact version for embedding in cards
export function EmailSubscribeFormCompact({
  publicationId,
  publicationSlug,
  className,
}: Pick<EmailSubscribeFormProps, "publicationId" | "publicationSlug" | "className">) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<FormStatus>("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) return;

    setStatus("loading");

    try {
      const response = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          publicationId,
          publicationSlug,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm text-green-600",
          className
        )}
      >
        <Check className="h-4 w-4" />
        Check your email for confirmation
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        disabled={status === "loading"}
        className={cn(
          "flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm",
          "focus:border-[#ff6719] focus:outline-none focus:ring-2 focus:ring-[#ff6719]/20",
          "disabled:bg-gray-100",
          status === "error" && "border-red-500"
        )}
      />
      <Button
        type="submit"
        size="sm"
        isLoading={status === "loading"}
      >
        Subscribe
      </Button>
    </form>
  );
}

export default EmailSubscribeForm;
