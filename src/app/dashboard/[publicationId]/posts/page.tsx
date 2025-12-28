"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { usePosts } from "@/hooks/usePosts";
import { usePublication } from "@/hooks/usePublication";
import { Container } from "@/components/layout/Container";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  MoreVertical,
  ExternalLink,
  Clock,
} from "lucide-react";

export default function PublicationPostsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const publicationId = params.publicationId as string;

  const { publication, isLoading: publicationLoading, error: publicationError } = usePublication({
    slug: publicationId,
    enabled: sessionStatus === "authenticated",
  });

  const { posts, isLoading: postsLoading, error: postsError, refetch } = usePosts({
    publicationId: publication?.id,
    enabled: !!publication?.id,
  });

  const [deletingPostId, setDeletingPostId] = React.useState<string | null>(null);
  const [publishingPostId, setPublishingPostId] = React.useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=/dashboard/${publicationId}/posts`);
    }
  }, [sessionStatus, router, publicationId]);

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this guide forever? This action cannot be undone.")) {
      return;
    }

    setDeletingPostId(postId);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        refetch();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete guide");
      }
    } catch (error) {
      console.error("Error deleting guide:", error);
      alert("Failed to delete guide");
    } finally {
      setDeletingPostId(null);
      setOpenMenuId(null);
    }
  };

  const handleTogglePublish = async (postId: string, currentlyPublished: boolean) => {
    setPublishingPostId(postId);
    try {
      const response = await fetch(`/api/posts/${postId}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publish: !currentlyPublished }),
      });

      if (response.ok) {
        refetch();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update guide status");
      }
    } catch (error) {
      console.error("Error updating guide:", error);
      alert("Failed to update guide status");
    } finally {
      setPublishingPostId(null);
      setOpenMenuId(null);
    }
  };

  if (sessionStatus === "loading" || publicationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-lumos-gray-600 font-medium">Preparing your guides...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (publicationError || !publication) {
    return (
      <div className="min-h-screen bg-lumos-gray-50 py-12">
        <Container className="max-w-4xl">
          <div className="text-center bg-white p-12 rounded-[2.5rem] shadow-sm lumos-glow">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
              <FileText className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-lumos-dark mb-4 tracking-tight">Portal Not Found</h1>
            <p className="text-lg text-lumos-gray-600 mb-10 leading-relaxed">{publicationError || "The learning portal you are looking for does not exist."}</p>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" leftIcon={<ArrowLeft className="h-5 w-5" />}>
                Back to Learning Center
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lumos-gray-50/50 py-12">
      <Container className="max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-lumos-gray-500 hover:text-lumos-dark font-bold text-xs uppercase tracking-widest transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learning Center
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl overflow-hidden shadow-inner lumos-halo"
                style={{ backgroundColor: publication.themeColor || "#ff6719" }}
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
                <h1 className="text-3xl font-bold text-lumos-dark tracking-tight">Knowledge Guides</h1>
                <p className="text-lg text-lumos-gray-500 font-medium">{publication.name}</p>
              </div>
            </div>

            <Link href={`/dashboard/${publicationId}/posts/new`}>
              <Button size="lg" leftIcon={<Plus className="h-5 w-5" />}>
                New Guide
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-10 border-b border-lumos-gray-100">
          <nav className="flex gap-10">
            <Link
              href={`/dashboard/${publicationId}/posts`}
              className="pb-4 text-sm font-bold uppercase tracking-widest border-b-2 border-lumos-orange text-lumos-orange"
            >
              Guides
            </Link>
            <Link
              href={`/dashboard/${publicationId}/subscribers`}
              className="pb-4 text-sm font-bold uppercase tracking-widest text-lumos-gray-400 hover:text-lumos-dark border-b-2 border-transparent transition-colors"
            >
              Community
            </Link>
            <Link
              href={`/dashboard/${publicationId}/settings`}
              className="pb-4 text-sm font-bold uppercase tracking-widest text-lumos-gray-400 hover:text-lumos-dark border-b-2 border-transparent transition-colors"
            >
              Portal Settings
            </Link>
          </nav>
        </div>

        {/* Guides List */}
        <Card className="border-none shadow-sm lumos-glow">
          <CardContent className="p-0">
            {postsLoading ? (
              <div className="flex items-center justify-center py-24">
                <Spinner size="lg" />
              </div>
            ) : postsError ? (
              <div className="text-center py-20 px-6">
                <p className="text-red-600 font-medium text-lg">{postsError}</p>
                <Button variant="secondary" onClick={() => refetch()} className="mt-6">
                  Try Again
                </Button>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-24 px-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-lumos-gray-50 mb-6">
                  <FileText className="h-10 w-10 text-lumos-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-lumos-dark mb-3 tracking-tight">No guides yet</h3>
                <p className="text-lg text-lumos-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
                  Create your first guide to start sharing knowledge with your community.
                </p>
                <Link href={`/dashboard/${publicationId}/posts/new`}>
                  <Button size="lg" leftIcon={<Plus className="h-5 w-5" />}>
                    Create My First Guide
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-lumos-gray-50">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-6 hover:bg-lumos-gray-50/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            href={`/dashboard/${publicationId}/posts/${post.id}/edit`}
                            className="text-xl font-bold text-lumos-dark hover:text-lumos-orange transition-colors truncate font-serif"
                          >
                            {post.title || "Untitled Guide"}
                          </Link>
                          <Badge
                            variant={post.isPublished ? "success" : "default"}
                            size="sm"
                          >
                            {post.isPublished ? "Visible" : "In Progress"}
                          </Badge>
                          {post.isPaid && (
                            <Badge variant="orange" size="sm">
                              Community Exclusive
                            </Badge>
                          )}
                        </div>

                        {post.subtitle && (
                          <p className="text-base text-lumos-gray-600 mb-3 line-clamp-1 leading-relaxed">
                            {post.subtitle}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm font-medium text-lumos-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {post.isPublished && post.publishedAt
                              ? `Published ${formatDate(post.publishedAt)}`
                              : `Last updated ${formatDate(post.updatedAt)}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Quick Actions */}
                        <Link href={`/dashboard/${publicationId}/posts/${post.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit Guide">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>

                        {post.isPublished && (
                          <Link
                            href={`/${publication.slug}/${post.slug}`}
                            target="_blank"
                          >
                            <Button variant="ghost" size="sm" title="View Guide">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}

                        {/* More Menu */}
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>

                          {openMenuId === post.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 mt-2 w-56 bg-white border border-lumos-gray-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePublish(post.id, post.isPublished)}
                                  disabled={publishingPostId === post.id}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-lumos-gray-700 hover:bg-lumos-gray-50 disabled:opacity-50 transition-colors"
                                >
                                  {publishingPostId === post.id ? (
                                    <Spinner size="sm" />
                                  ) : post.isPublished ? (
                                    <EyeOff className="h-4 w-4 text-lumos-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-lumos-orange" />
                                  )}
                                  {post.isPublished ? "Hide from community" : "Make visible to community"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(post.id)}
                                  disabled={deletingPostId === post.id}
                                  className="w-full border-t border-lumos-gray-50 flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                                >
                                  {deletingPostId === post.id ? (
                                    <Spinner size="sm" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                  Delete guide forever
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
