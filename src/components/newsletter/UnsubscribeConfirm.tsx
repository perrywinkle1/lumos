"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { Mail, Check, AlertCircle, Loader2 } from "lucide-react";

export interface UnsubscribeConfirmProps {
  token: string;
  publicationName?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

type UnsubscribeStatus = "idle" | "loading" | "success" | "error";

export function UnsubscribeConfirm({
  token,
  publicationName,
  className,
  onSuccess,
  onError,
}: UnsubscribeConfirmProps) {
  const [status, setStatus] = React.useState<UnsubscribeStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleUnsubscribe = React.useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/email/unsubscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to unsubscribe");
      }

      setStatus("success");
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setStatus("error");
      setErrorMessage(message);
      onError?.(message);
    }
  }, [token, onSuccess, onError]);

  // One-click unsubscribe - auto-trigger on mount if configured
  const autoUnsubscribeRef = React.useRef(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oneClick = params.get("one_click");

    if (oneClick === "true" && !autoUnsubscribeRef.current) {
      autoUnsubscribeRef.current = true;
      handleUnsubscribe();
    }
  }, [handleUnsubscribe]);

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Mail className="h-6 w-6 text-gray-600" />
        </div>
        <CardTitle>
          {status === "success"
            ? "You have been unsubscribed"
            : "Unsubscribe from newsletter"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {status === "idle" && (
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              {publicationName
                ? `Are you sure you want to unsubscribe from ${publicationName}?`
                : "Are you sure you want to unsubscribe?"}
            </p>
            <p className="text-center text-sm text-gray-500">
              You will no longer receive email notifications for new posts.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={handleUnsubscribe}
                variant="primary"
                className="w-full sm:w-auto"
              >
                Yes, unsubscribe me
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#ff6719]" />
            <p className="text-gray-600">Processing your request...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <span>Successfully unsubscribed</span>
            </div>
            <p className="text-center text-sm text-gray-500">
              You will no longer receive emails
              {publicationName ? ` from ${publicationName}` : ""}.
            </p>
            <div className="text-center">
              <Button
                onClick={() => (window.location.href = "/")}
                variant="secondary"
              >
                Return to homepage
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{errorMessage}</span>
            </div>
            <p className="text-center text-sm text-gray-500">
              The unsubscribe link may have expired or is invalid. Please try
              again or contact support.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={handleUnsubscribe}
                variant="primary"
                className="w-full sm:w-auto"
              >
                Try again
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Return to homepage
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simplified one-click unsubscribe component
export function OneClickUnsubscribe({
  token,
  className,
}: {
  token: string;
  className?: string;
}) {
  const [status, setStatus] = React.useState<UnsubscribeStatus>("loading");
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    const unsubscribe = async () => {
      try {
        const response = await fetch(`/api/email/unsubscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to unsubscribe");
        }

        setStatus("success");
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Something went wrong"
        );
      }
    };

    unsubscribe();
  }, [token]);

  return (
    <div className={cn("text-center", className)}>
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff6719]" />
          <p className="text-gray-600">Unsubscribing...</p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Check className="h-6 w-6" />
            <span className="text-lg font-medium">Successfully unsubscribed</span>
          </div>
          <p className="text-gray-500">
            You will no longer receive these emails.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <span className="text-lg font-medium">Failed to unsubscribe</span>
          </div>
          <p className="text-gray-500">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

export default UnsubscribeConfirm;
