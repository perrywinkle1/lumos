"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Check, Mail } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const publicationName = searchParams.get("publication");

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">You are subscribed!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-gray-600">
          {publicationName
            ? `You are now subscribed to ${publicationName}.`
            : "Your subscription has been confirmed."}
        </p>
        <p className="text-center text-sm text-gray-500">
          You will receive email notifications when new posts are published.
        </p>
        <div className="flex items-center justify-center gap-2 rounded-lg bg-[#ff6719]/10 px-4 py-3 text-sm text-[#ff6719]">
          <Mail className="h-4 w-4" />
          <span>Check your inbox for updates</span>
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
          {publicationName && (
            <Button
              onClick={() => window.history.back()}
              variant="primary"
              className="w-full sm:w-auto"
            >
              Back to publication
            </Button>
          )}
          <Button
            onClick={() => (window.location.href = "/explore")}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Explore more
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SubscribeSuccessPage() {
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
          <SuccessContent />
        </Suspense>
      </Container>
    </div>
  );
}
