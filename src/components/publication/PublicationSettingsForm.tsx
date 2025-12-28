"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { slugify } from "@/lib/utils";

const updatePublicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  coverUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
});

type UpdatePublicationInput = z.infer<typeof updatePublicationSchema>;

interface Publication {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  themeColor: string;
}

interface FormErrors {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  themeColor?: string;
  general?: string;
}

interface PublicationSettingsFormProps {
  publication: Publication;
  onUpdate?: (publication: Publication) => void;
}

const THEME_COLORS = [
  { name: "Orange", value: "#ff6719" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Red", value: "#ef4444" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Indigo", value: "#6366f1" },
];

export function PublicationSettingsForm({ publication, onUpdate }: PublicationSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("");
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = React.useState("");
  const [formData, setFormData] = React.useState<UpdatePublicationInput>({
    name: publication.name,
    slug: publication.slug,
    description: publication.description || "",
    logoUrl: publication.logoUrl || "",
    coverUrl: publication.coverUrl || "",
    themeColor: publication.themeColor || "#ff6719",
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(true);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: slugManuallyEdited ? prev.slug : slugify(name),
    }));
    setErrors((prev) => ({ ...prev, name: undefined, general: undefined }));
    setSuccessMessage("");
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData((prev) => ({ ...prev, slug: value }));
    setSlugManuallyEdited(true);
    setErrors((prev) => ({ ...prev, slug: undefined, general: undefined }));
    setSuccessMessage("");
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
    setErrors((prev) => ({ ...prev, description: undefined, general: undefined }));
    setSuccessMessage("");
  };

  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, logoUrl: e.target.value }));
    setErrors((prev) => ({ ...prev, logoUrl: undefined, general: undefined }));
    setSuccessMessage("");
  };

  const handleCoverUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, coverUrl: e.target.value }));
    setErrors((prev) => ({ ...prev, coverUrl: undefined, general: undefined }));
    setSuccessMessage("");
  };

  const handleThemeColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, themeColor: color }));
    setErrors((prev) => ({ ...prev, themeColor: undefined, general: undefined }));
    setSuccessMessage("");
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, themeColor: e.target.value }));
    setErrors((prev) => ({ ...prev, themeColor: undefined, general: undefined }));
    setSuccessMessage("");
  };

  const validateForm = (): boolean => {
    try {
      updatePublicationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof FormErrors;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/publications/${publication.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
          logoUrl: formData.logoUrl || undefined,
          coverUrl: formData.coverUrl || undefined,
          themeColor: formData.themeColor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || "Failed to update publication" });
        return;
      }

      setSuccessMessage("Publication updated successfully!");

      if (onUpdate) {
        onUpdate(data.data);
      }

      // If slug changed, redirect to new URL
      if (formData.slug !== publication.slug) {
        router.push(`/dashboard/${data.data.id}/settings`);
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== publication.name) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/publications/${publication.slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setErrors({ general: data.error || "Failed to delete publication" });
        return;
      }

      // Redirect to home or dashboard after deletion
      router.push("/");
    } catch (error) {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Portal Information</CardTitle>
            <CardDescription>
              Update your learning portal&apos;s name and address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Portal Name"
              placeholder="My Technology Notebook"
              value={formData.name}
              onChange={handleNameChange}
              error={errors.name}
              disabled={isLoading}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Web Address
              </label>
              <div className="flex items-center">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                  lumos.com/
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="my-notebook"
                  disabled={isLoading}
                  className="w-full rounded-r-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-[#ff6719] focus:ring-[#ff6719]/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              {errors.slug && (
                <p className="text-sm text-red-600">{errors.slug}</p>
              )}
              <p className="text-xs text-gray-500">
                Changing your address will break existing links to your portal
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                What are you teaching?
              </label>
              <textarea
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Tell others what technology topics you're exploring..."
                rows={3}
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-[#ff6719] focus:ring-[#ff6719]/20 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                maxLength={500}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
              <p className="text-xs text-gray-500">
                {formData.description?.length || 0}/500 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Personalization</CardTitle>
            <CardDescription>
              Customize how your learning portal looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Portal Logo
              </label>
              <div className="flex items-center gap-4">
                <div
                  className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden"
                  style={{ borderColor: formData.themeColor }}
                >
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="https://example.com/logo.png"
                    value={formData.logoUrl}
                    onChange={handleLogoUrlChange}
                    error={errors.logoUrl}
                    disabled={isLoading}
                    helperText="Enter a URL for your logo image"
                  />
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Cover Image
              </label>
              <div className="space-y-3">
                <div
                  className="h-32 w-full rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden"
                  style={{ borderColor: formData.themeColor }}
                >
                  {formData.coverUrl ? (
                    <img
                      src={formData.coverUrl}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <svg
                        className="mx-auto h-10 w-10 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="mt-1 text-sm text-gray-500">Cover image</p>
                    </div>
                  )}
                </div>
                <Input
                  placeholder="https://example.com/cover.jpg"
                  value={formData.coverUrl}
                  onChange={handleCoverUrlChange}
                  error={errors.coverUrl}
                  disabled={isLoading}
                  helperText="Enter a URL for your cover image (recommended: 1200x400)"
                />
              </div>
            </div>

            {/* Theme Color */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Theme Color
              </label>
              <div className="flex flex-wrap gap-3">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleThemeColorChange(color.value)}
                    className={`h-10 w-10 rounded-full border-2 transition-all duration-200 ${
                      formData.themeColor === color.value
                        ? "border-gray-900 scale-110 ring-2 ring-offset-2 ring-gray-400"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    disabled={isLoading}
                  />
                ))}
                {/* Custom color input */}
                <div className="relative">
                  <input
                    type="color"
                    value={formData.themeColor}
                    onChange={handleCustomColorChange}
                    disabled={isLoading}
                    className="absolute inset-0 h-10 w-10 cursor-pointer opacity-0"
                  />
                  <div
                    className="h-10 w-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center"
                    style={{
                      backgroundColor: !THEME_COLORS.find(
                        (c) => c.value === formData.themeColor
                      )
                        ? formData.themeColor
                        : undefined,
                    }}
                  >
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              {errors.themeColor && (
                <p className="text-sm text-red-600">{errors.themeColor}</p>
              )}
              <p className="text-xs text-gray-500">
                Selected color: {formData.themeColor}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" isLoading={isLoading}>
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
            <div>
              <h4 className="font-medium text-gray-900">Delete Learning Portal</h4>
              <p className="text-sm text-gray-600 mt-1">
                Permanently delete this learning portal and all its guides, community members, and data.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                <svg
                  className="h-5 w-5 text-red-600"
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
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Learning Portal
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete the{" "}
              <strong>{publication.name}</strong> learning portal and all associated
              data including guides and community members.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <strong>{publication.name}</strong> to confirm
              </label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={publication.name}
                disabled={isDeleting}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                onClick={handleDelete}
                disabled={deleteConfirmText !== publication.name || isDeleting}
                isLoading={isDeleting}
              >
                Delete Publication
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
