"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const errorMessages: Record<string, { title: string; message: string }> = {
    missing_token: {
      title: "Invalid subscription link",
      message: "The subscription link is missing required information.",
    },
    invalid_token: {
      title: "Link expired",
      message:
        "This subscription link has expired or is no longer valid. Please request a new one.",
    },
    publication_not_found: {
      title: "Publication not found",
      message:
        "The publication you are trying to subscribe to no longer exists.",
    },
    error: {
      title: "Something went wrong",
      message:
        "We encountered an error processing your subscription. Please try again later.",
    },
  };

  const error = errorMessages[reason || "error"] || errorMessages.error;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <CardTitle className="text-2xl">{error.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-gray-600">{error.message}</p>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
          <Button
            onClick={() => (window.location.href = "/explore")}
            variant="primary"
            className="w-full sm:w-auto"
          >
            Explore publications
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Go to homepage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SubscribeErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="flex min-h-screen items-center justify-center py-12">
        <Suspense
          fallback={
            <Card className="w-full max-w-md">
              <CardContent className="py-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#ff6719]" />
              </CardContent>
            </Card>
          }
        >
          <ErrorContent />
        </Suspense>
      </Container>
    </div>
  );
}
