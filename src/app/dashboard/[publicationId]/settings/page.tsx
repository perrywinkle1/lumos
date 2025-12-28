"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container } from "@/components/layout/Container";
import { PublicationSettingsForm } from "@/components/publication/PublicationSettingsForm";
import { Spinner } from "@/components/ui/Spinner";

interface Publication {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  themeColor: string;
  ownerId: string;
}

interface PageProps {
  params: {
    publicationId: string;
  };
}

export default function PublicationSettingsPage({ params }: PageProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [publication, setPublication] = React.useState<Publication | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=/dashboard/${params.publicationId}/settings`);
    }
  }, [sessionStatus, router, params.publicationId]);

  React.useEffect(() => {
    async function fetchPublication() {
      if (!session?.user?.id) return;

      try {
        // First try to fetch by ID, then by slug
        const response = await fetch(`/api/publications/${params.publicationId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Publication not found");
          } else if (response.status === 403) {
            setError("You don't have permission to access this publication");
          } else {
            setError("Failed to load publication");
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        // Check if current user is the owner
        if (data.data.ownerId !== session.user.id) {
          setError("You don't have permission to access this publication");
          setIsLoading(false);
          return;
        }

        setPublication(data.data);
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    if (sessionStatus === "authenticated") {
      fetchPublication();
    }
  }, [params.publicationId, session?.user?.id, sessionStatus]);

  const handleUpdate = (updatedPublication: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    logoUrl?: string | null;
    coverUrl?: string | null;
    themeColor: string;
  }) => {
    setPublication({
      ...updatedPublication,
      ownerId: publication?.ownerId || session?.user?.id || "",
    });
  };

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container className="max-w-2xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 text-[#ff6719] hover:text-[#e55a15] font-medium"
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
              Go back home
            </button>
          </div>
        </Container>
      </div>
    );
  }

  if (!publication) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container className="max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/dashboard/${params.publicationId}`)}
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
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 rounded-lg flex items-center justify-center text-white font-bold text-xl overflow-hidden"
              style={{ backgroundColor: publication.themeColor }}
            >
              {publication.logoUrl ? (
                <img
                  src={publication.logoUrl}
                  alt={publication.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                publication.name[0].toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">{publication.name}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              className="pb-3 text-sm font-medium border-b-2 border-[#ff6719] text-[#ff6719]"
            >
              General
            </button>
            <button
              className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
              disabled
            >
              Team
            </button>
            <button
              className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
              disabled
            >
              Billing
            </button>
            <button
              className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
              disabled
            >
              Integrations
            </button>
          </nav>
        </div>

        {/* Form */}
        <PublicationSettingsForm
          publication={publication}
          onUpdate={handleUpdate}
        />
      </Container>
    </div>
  );
}
