"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { UnsubscribeConfirm, OneClickUnsubscribe } from "@/components/newsletter";
import { AlertCircle, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const oneClick = searchParams.get("one_click");

  // Handle error states
  if (error) {
    const errorMessages: Record<string, string> = {
      missing_token: "The unsubscribe link is missing required information.",
      invalid_token: "The unsubscribe link has expired or is invalid.",
      server_error: "Something went wrong. Please try again later.",
    };

    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Unable to unsubscribe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            {errorMessages[error] || "An unexpected error occurred."}
          </p>
          <div className="text-center">
            <Button
              onClick={() => (window.location.href = "/")}
              variant="secondary"
            >
              Return to homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle missing token
  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Mail className="h-6 w-6 text-gray-600" />
          </div>
          <CardTitle>Unsubscribe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            To unsubscribe from a newsletter, please use the unsubscribe link
            from the email you received.
          </p>
          <p className="text-center text-sm text-gray-500">
            Each email contains a unique link at the bottom that will allow you
            to unsubscribe from that specific publication.
          </p>
          <div className="text-center">
            <Button
              onClick={() => (window.location.href = "/")}
              variant="secondary"
            >
              Return to homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // One-click unsubscribe
  if (oneClick === "true") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Processing unsubscribe request...</CardTitle>
        </CardHeader>
        <CardContent>
          <OneClickUnsubscribe token={token} />
        </CardContent>
      </Card>
    );
  }

  // Standard unsubscribe confirmation
  return <UnsubscribeConfirm token={token} />;
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="flex min-h-screen items-center justify-center py-12">
        <Suspense
          fallback={
            <Card className="w-full max-w-md">
              <CardContent className="py-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#ff6719]" />
                <p className="mt-4 text-gray-600">Loading...</p>
              </CardContent>
            </Card>
          }
        >
          <UnsubscribeContent />
        </Suspense>
      </Container>
    </div>
  );
}
