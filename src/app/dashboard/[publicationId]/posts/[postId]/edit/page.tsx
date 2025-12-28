"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePost } from "@/hooks/usePosts";
import { usePublication } from "@/hooks/usePublication";
import { Editor, PostSettings, PostSettingsData } from "@/components/post";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { cn, slugify } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Send,
  Settings,
  Eye,
  MoreVertical,
  Trash2,
  EyeOff,
} from "lucide-react";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const publicationId = params.publicationId as string;
  const postId = params.postId as string;

  const { publication, isLoading: publicationLoading } = usePublication({
    slug: publicationId,
    enabled: sessionStatus === "authenticated",
  });

  const {
    post,
    isLoading: postLoading,
    error: postError,
    update,
    isUpdating,
    deletePost,
    isDeleting,
    publish,
    isPublishing,
  } = usePost({
    id: postId,
    enabled: sessionStatus === "authenticated",
  });

  // Post state
  const [title, setTitle] = React.useState("");
  const [subtitle, setSubtitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [settings, setSettings] = React.useState<PostSettingsData>({
    slug: "",
    excerpt: "",
    coverImage: "",
    publishedAt: null,
    isPaidOnly: false,
  });

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Initialize form with post data
  React.useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setSubtitle(post.subtitle || "");
      setContent(post.content || "");
      setSettings({
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        coverImage: post.coverImageUrl || "",
        publishedAt: post.publishedAt,
        isPaidOnly: post.isPaid || false,
      });
    }
  }, [post]);

  // Track changes
  React.useEffect(() => {
    if (post) {
      const hasChanged =
        title !== post.title ||
        subtitle !== (post.subtitle || "") ||
        content !== post.content ||
        settings.slug !== post.slug ||
        settings.excerpt !== (post.excerpt || "") ||
        settings.coverImage !== (post.coverImageUrl || "") ||
        settings.isPaidOnly !== post.isPaid;
      setHasChanges(hasChanged);
    }
  }, [title, subtitle, content, settings, post]);

  // Auto-save draft (debounced)
  const saveTimeoutRef = React.useRef<NodeJS.Timeout>();

  const handleSave = React.useCallback(async (isAutoSave = false) => {
    if (!title && !content) return;

    try {
      const result = await update({
        title,
        subtitle: subtitle || undefined,
        content,
        slug: settings.slug || slugify(title),
        excerpt: settings.excerpt || undefined,
        coverImageUrl: settings.coverImage || undefined,
        isPaid: settings.isPaidOnly,
      });

      if (result) {
        setLastSaved(new Date());
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Failed to save:", error);
      if (!isAutoSave) {
        alert("Failed to save post");
      }
    }
  }, [title, subtitle, content, settings, update]);

  React.useEffect(() => {
    if (hasChanges && !post?.isPublished) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        handleSave(true);
      }, 5000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasChanges, post?.isPublished, handleSave]);

  const handlePublish = async () => {
    if (!title) {
      alert("Please add a title before publishing");
      return;
    }

    // Save first if there are changes
    if (hasChanges) {
      await handleSave();
    }

    const result = await publish(true);
    if (result) {
      router.push(`/dashboard/${publicationId}/posts`);
    }
  };

  const handleUnpublish = async () => {
    const result = await publish(false);
    if (result) {
      setShowMoreMenu(false);
    }
  };

  const handlePreview = () => {
    if (post?.isPublished && publication) {
      window.open(`/${publication.slug}/${post.slug}`, "_blank");
    } else {
      window.open(`/preview/post?id=${postId}`, "_blank");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    const success = await deletePost();
    if (success) {
      router.push(`/dashboard/${publicationId}/posts`);
    } else {
      alert("Failed to delete post");
    }
  };

  React.useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=/dashboard/${publicationId}/posts/${postId}/edit`);
    }
  }, [sessionStatus, router, publicationId, postId]);

  if (sessionStatus === "loading" || publicationLoading || postLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (postError || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
        <p className="text-gray-600 mb-6">
          {postError || "The post you are looking for does not exist."}
        </p>
        <Link href={`/dashboard/${publicationId}/posts`}>
          <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Posts
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <Link
                href={`/dashboard/${publicationId}/posts`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">
                  {publication?.name || "Back"}
                </span>
              </Link>
              <Badge variant={post.isPublished ? "success" : "default"} size="sm">
                {post.isPublished ? "Published" : "Draft"}
              </Badge>
              {lastSaved && (
                <span className="hidden sm:inline text-xs text-gray-500">
                  Saved {formatTimeAgo(lastSaved)}
                </span>
              )}
              {hasChanges && (
                <span className="text-xs text-orange-600">Unsaved changes</span>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreview}
                className="hidden sm:flex"
                leftIcon={<Eye className="h-4 w-4" />}
              >
                Preview
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleSave(false)}
                isLoading={isUpdating}
                disabled={!hasChanges}
                leftIcon={<Save className="h-4 w-4" />}
              >
                <span className="hidden sm:inline">Save</span>
              </Button>

              {!post.isPublished && (
                <Button
                  size="sm"
                  onClick={handlePublish}
                  isLoading={isPublishing}
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  Publish
                </Button>
              )}

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>

              {/* More menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {showMoreMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMoreMenu(false)}
                    />
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          handlePreview();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:hidden"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </button>
                      {post.isPublished && (
                        <button
                          type="button"
                          onClick={handleUnpublish}
                          disabled={isPublishing}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {isPublishing ? (
                            <Spinner size="sm" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                          Unpublish
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          handleDelete();
                        }}
                        disabled={isDeleting}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Spinner size="sm" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Editor Area */}
        <div className="flex-1 lg:mr-80">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            {/* Cover Image Preview */}
            {settings.coverImage && (
              <div className="mb-8 -mx-4 sm:-mx-6 lg:-mx-8">
                <div className="relative aspect-[2/1] bg-gray-100 overflow-hidden">
                  <img
                    src={settings.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className={cn(
                "w-full text-4xl sm:text-5xl font-bold text-gray-900 placeholder:text-gray-300",
                "border-none outline-none focus:ring-0 bg-transparent",
                "font-spectral leading-tight"
              )}
            />

            {/* Subtitle */}
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Add a subtitle..."
              className={cn(
                "w-full mt-4 text-xl text-gray-600 placeholder:text-gray-300",
                "border-none outline-none focus:ring-0 bg-transparent",
                "leading-relaxed"
              )}
            />

            {/* Divider */}
            <div className="my-8 border-t border-gray-100" />

            {/* Editor */}
            <Editor
              content={content}
              onChange={setContent}
              placeholder="Tell your story..."
            />
          </div>
        </div>

        {/* Settings Sidebar (Desktop) */}
        <div className="hidden lg:block">
          <PostSettings
            settings={settings}
            onChange={setSettings}
            title={title}
            isOpen={true}
            onClose={() => {}}
          />
        </div>

        {/* Settings Sidebar (Mobile) */}
        <div className="lg:hidden">
          <PostSettings
            settings={settings}
            onChange={setSettings}
            title={title}
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}

// Helper function to format relative time
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
