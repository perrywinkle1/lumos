"use client";

import * as React from "react";
import { cn, slugify } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import {
  X,
  Settings,
  Link as LinkIcon,
  Image as ImageIcon,
  FileText,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";

export interface PostSettingsData {
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string | null;
  isPaidOnly: boolean;
}

interface PostSettingsProps {
  settings: PostSettingsData;
  onChange: (settings: PostSettingsData) => void;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PostSettings({
  settings,
  onChange,
  title,
  isOpen,
  onClose,
}: PostSettingsProps) {
  const [localSlug, setLocalSlug] = React.useState(settings.slug);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState(false);

  // Auto-generate slug from title if not manually edited
  React.useEffect(() => {
    if (!isSlugManuallyEdited && title) {
      const generatedSlug = slugify(title);
      setLocalSlug(generatedSlug);
      onChange({ ...settings, slug: generatedSlug });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, isSlugManuallyEdited]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    const newSlug = slugify(e.target.value);
    setLocalSlug(newSlug);
    onChange({ ...settings, slug: newSlug });
  };

  const handleExcerptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...settings, excerpt: e.target.value });
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...settings, coverImage: e.target.value });
  };

  const handlePaidToggle = () => {
    onChange({ ...settings, isPaidOnly: !settings.isPaidOnly });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-50",
          "transform transition-transform duration-300 ease-in-out",
          "lg:relative lg:translate-x-0 lg:shadow-none lg:z-auto",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Post Settings</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Slug */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <LinkIcon className="h-4 w-4" />
                URL Slug
              </label>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-1">/p/</span>
                <input
                  type="text"
                  value={localSlug}
                  onChange={handleSlugChange}
                  placeholder="my-post-title"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6719]/20 focus:border-[#ff6719]"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                This will be the URL for your post
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4" />
                Excerpt
              </label>
              <textarea
                value={settings.excerpt}
                onChange={handleExcerptChange}
                placeholder="Write a brief description of your post..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#ff6719]/20 focus:border-[#ff6719]"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                {settings.excerpt.length}/280 characters
              </p>
            </div>

            {/* Cover Image */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <ImageIcon className="h-4 w-4" />
                Cover Image
              </label>
              <input
                type="url"
                value={settings.coverImage}
                onChange={handleCoverImageChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6719]/20 focus:border-[#ff6719]"
              />
              {settings.coverImage && (
                <div className="mt-2 relative rounded-lg overflow-hidden aspect-video bg-gray-100">
                  <img
                    src={settings.coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <p className="mt-1.5 text-xs text-gray-500">
                Enter a URL for your cover image
              </p>
            </div>

            {/* Paid Only Toggle */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                {settings.isPaidOnly ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Access
              </label>
              <button
                type="button"
                onClick={handlePaidToggle}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors",
                  settings.isPaidOnly
                    ? "border-[#ff6719] bg-orange-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                )}
              >
                <div className="text-left">
                  <p className="font-medium text-gray-900">
                    {settings.isPaidOnly ? "Paid subscribers only" : "Free for everyone"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {settings.isPaidOnly
                      ? "Only paid subscribers can read this"
                      : "Anyone can read this post"}
                  </p>
                </div>
                <div
                  className={cn(
                    "w-10 h-6 rounded-full transition-colors relative",
                    settings.isPaidOnly ? "bg-[#ff6719]" : "bg-gray-200"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                      settings.isPaidOnly ? "right-1" : "left-1"
                    )}
                  />
                </div>
              </button>
            </div>

            {/* Schedule (placeholder for future) */}
            <div className="opacity-50 pointer-events-none">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4" />
                Schedule (Coming Soon)
              </label>
              <input
                type="datetime-local"
                disabled
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Schedule your post to publish later
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Changes are saved automatically
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

// Settings toggle button for mobile
interface PostSettingsToggleProps {
  onClick: () => void;
}

export function PostSettingsToggle({ onClick }: PostSettingsToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="lg:hidden fixed right-4 bottom-24 p-3 bg-white border border-gray-200 rounded-full shadow-lg hover:bg-gray-50 transition-colors z-30"
    >
      <Settings className="h-5 w-5 text-gray-700" />
    </button>
  );
}
