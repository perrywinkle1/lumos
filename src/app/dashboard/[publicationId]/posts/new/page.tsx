"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { Editor, PostSettings, PostSettingsToggle, PostSettingsData } from "@/components/post";
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
} from "lucide-react";

// Mock publication data - in production, fetch from API
const getPublication = (id: string) => ({
  id,
  name: id === "pub-1" ? "Tech Insights" : "The Creative Corner",
  slug: id === "pub-1" ? "tech-insights" : "creative-corner",
});

export default function NewPostPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoading: isUserLoading, isAuthenticated } = useUser();

  const publicationId = params.publicationId as string;
  const publication = getPublication(publicationId);

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
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  // Auto-save draft (debounced)
  const saveTimeoutRef = React.useRef<NodeJS.Timeout>();

  const handleSaveDraft = React.useCallback(async (isAutoSave = false) => {
    if (!title && !content) return;

    if (!isAutoSave) {
      setIsSaving(true);
    }

    try {
      // In production, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setLastSaved(new Date());

      if (!isAutoSave) {
        // Show success feedback
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSaving(false);
    }
  }, [title, content]);

  React.useEffect(() => {
    if (title || subtitle || content) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        handleSaveDraft(true);
      }, 3000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, subtitle, content, handleSaveDraft]);

  const handlePublish = async () => {
    if (!title) {
      alert("Please add a title before publishing");
      return;
    }

    setIsPublishing(true);

    try {
      // In production, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to published post
      router.push(`/dashboard/${publicationId}/posts`);
    } catch (error) {
      console.error("Failed to publish:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePreview = () => {
    // In production, open preview in new tab
    window.open(`/preview/post?title=${encodeURIComponent(title)}`, "_blank");
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this draft?")) return;

    try {
      // In production, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push(`/dashboard/${publicationId}/posts`);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Sign in to create posts
        </h1>
        <p className="text-gray-600 mb-6">
          You need to be signed in to create and publish posts.
        </p>
        <Link href="/auth/signin">
          <Button>Sign In</Button>
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
                href={`/dashboard/${publicationId}`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">
                  {publication.name}
                </span>
              </Link>
              <Badge variant="default" size="sm">
                Draft
              </Badge>
              {lastSaved && (
                <span className="hidden sm:inline text-xs text-gray-500">
                  Saved {formatTimeAgo(lastSaved)}
                </span>
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
                onClick={() => handleSaveDraft(false)}
                isLoading={isSaving}
                leftIcon={<Save className="h-4 w-4" />}
              >
                <span className="hidden sm:inline">Save Draft</span>
                <span className="sm:hidden">Save</span>
              </Button>

              <Button
                size="sm"
                onClick={handlePublish}
                isLoading={isPublishing}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Publish
              </Button>

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
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          handleDelete();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Draft
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
