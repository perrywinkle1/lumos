"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container } from "@/components/layout/Container";
import { CreatePublicationForm } from "@/components/publication/CreatePublicationForm";
import { Spinner } from "@/components/ui/Spinner";

export default function NewPublicationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/new");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container className="max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Create a New Publication
          </h1>
          <p className="mt-2 text-gray-600">
            Set up your newsletter in just a few steps. You can always update
            these settings later.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ff6719] text-white font-semibold text-sm">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">
                Basic Info
              </span>
            </div>
            <div className="flex-1 mx-4 h-0.5 bg-gray-200" />
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 font-semibold text-sm">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">
                Branding
              </span>
            </div>
            <div className="flex-1 mx-4 h-0.5 bg-gray-200" />
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 font-semibold text-sm">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">
                Launch
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <CreatePublicationForm />
      </Container>
    </div>
  );
}
