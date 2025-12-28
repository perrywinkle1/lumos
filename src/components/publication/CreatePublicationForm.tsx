"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { slugify } from "@/lib/utils";
import { Plus } from "lucide-react";

const createPublicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
});

type CreatePublicationInput = z.infer<typeof createPublicationSchema>;

interface FormErrors {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  themeColor?: string;
  general?: string;
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

export function CreatePublicationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [formData, setFormData] = React.useState<CreatePublicationInput>({
    name: "",
    slug: "",
    description: "",
    logoUrl: "",
    themeColor: "#ff6719",
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: slugManuallyEdited ? prev.slug : slugify(name),
    }));
    setErrors((prev) => ({ ...prev, name: undefined, slug: undefined }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData((prev) => ({ ...prev, slug: value }));
    setSlugManuallyEdited(true);
    setErrors((prev) => ({ ...prev, slug: undefined }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
    setErrors((prev) => ({ ...prev, description: undefined }));
  };

  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, logoUrl: e.target.value }));
    setErrors((prev) => ({ ...prev, logoUrl: undefined }));
  };

  const handleThemeColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, themeColor: color }));
    setErrors((prev) => ({ ...prev, themeColor: undefined }));
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, themeColor: e.target.value }));
    setErrors((prev) => ({ ...prev, themeColor: undefined }));
  };

  const validateForm = (): boolean => {
    try {
      createPublicationSchema.parse(formData);
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

    try {
      const response = await fetch("/api/publications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
          logoUrl: formData.logoUrl || undefined,
          themeColor: formData.themeColor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || "Failed to create publication" });
        return;
      }

      // Redirect to the new publication's dashboard
      router.push(`/dashboard/${data.data.id}`);
    } catch (error) {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      {/* Step 1: Basic Info */}
      <Card className="border-none shadow-sm lumos-glow">
        <CardHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-lumos-orange-light text-lumos-orange flex items-center justify-center font-bold text-sm">1</div>
            <CardTitle className="text-2xl tracking-tight">Name Your Knowledge Space</CardTitle>
          </div>
          <CardDescription className="ml-11 mt-1">
            What would you like to call your personal technology notebook? This is where your journey begins.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-11">
          <Input
            label="Knowledge Space Name"
            placeholder="e.g., My Smart Home Notebook"
            value={formData.name}
            onChange={handleNameChange}
            error={errors.name}
            disabled={isLoading}
            required
            helperText="Think of this as the title of your learning journal."
          />

          <div className="space-y-2">
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-lumos-dark/50">
              Your Personal Web Address
            </label>
            <div className="flex items-center group">
              <span className="inline-flex items-center rounded-l-xl border border-r-0 border-lumos-gray-200 bg-lumos-gray-50 px-4 py-3 text-base text-lumos-gray-500 font-medium">
                lumos.com/
              </span>
              <input
                type="text"
                value={formData.slug}
                onChange={handleSlugChange}
                placeholder="my-notebook"
                disabled={isLoading}
                className="w-full rounded-r-xl border border-lumos-gray-200 bg-white px-4 py-3 text-lumos-dark placeholder:text-lumos-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-lumos-orange/10 focus:border-lumos-orange disabled:bg-lumos-gray-50 disabled:cursor-not-allowed"
              />
            </div>
            {errors.slug && (
              <p className="text-sm text-red-600 font-medium">{errors.slug}</p>
            )}
            <p className="text-sm text-lumos-gray-500 italic">
              This is where fellow learners can find your guides.
            </p>
          </div>

          <div className="space-y-2">
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-lumos-dark/50">
              What will you learn here?
            </label>
            <textarea
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="e.g., Exploring how to stay safe online and connect with family using modern tools..."
              rows={3}
              disabled={isLoading}
              className="w-full rounded-xl border border-lumos-gray-200 bg-white px-4 py-3 text-lumos-dark placeholder:text-lumos-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-lumos-orange/10 focus:border-lumos-orange disabled:bg-lumos-gray-50 disabled:cursor-not-allowed resize-none"
              maxLength={500}
            />
            {errors.description && (
              <p className="text-sm text-red-600 font-medium">{errors.description}</p>
            )}
            <div className="flex justify-between items-center">
              <p className="text-sm text-lumos-gray-500">
                A brief description helps others understand your focus.
              </p>
              <p className="text-xs font-bold text-lumos-gray-400 uppercase tracking-wider">
                {formData.description?.length || 0}/500
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Branding */}
      <Card className="border-none shadow-sm lumos-glow">
        <CardHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-lumos-orange-light text-lumos-orange flex items-center justify-center font-bold text-sm">2</div>
            <CardTitle className="text-2xl tracking-tight">Personalize Your Portal</CardTitle>
          </div>
          <CardDescription className="ml-11 mt-1">
            Add a personal touch to your learning space with a color and a logo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10 px-11">
          {/* Logo Upload Placeholder */}
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-widest text-lumos-dark/50">
              Your Space Logo
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div
                className="h-24 w-24 rounded-2xl border-2 border-dashed border-lumos-gray-200 flex items-center justify-center bg-lumos-gray-50 transition-all duration-500 lumos-halo"
                style={{ borderColor: formData.themeColor }}
              >
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Logo preview"
                    className="h-full w-full object-cover rounded-2xl"
                  />
                ) : (
                  <svg
                    className="h-10 w-10 text-lumos-gray-300"
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
              <div className="flex-1 w-full">
                <Input
                  placeholder="https://example.com/logo.png"
                  value={formData.logoUrl}
                  onChange={handleLogoUrlChange}
                  error={errors.logoUrl}
                  disabled={isLoading}
                  helperText="Paste a web link to an image you want to use as your logo."
                />
              </div>
            </div>
          </div>

          {/* Theme Color Picker */}
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-widest text-lumos-dark/50">
              Pick Your Signature Color
            </label>
            <div className="flex flex-wrap gap-4">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleThemeColorChange(color.value)}
                  className={`h-12 w-12 rounded-full border-4 transition-all duration-300 ${
                    formData.themeColor === color.value
                      ? "border-lumos-dark scale-110 shadow-lg shadow-black/10"
                      : "border-white hover:scale-105 hover:shadow-md"
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
                  className="absolute inset-0 h-12 w-12 cursor-pointer opacity-0"
                />
                <div
                  className="h-12 w-12 rounded-full border-2 border-dashed border-lumos-gray-300 flex items-center justify-center bg-white hover:bg-lumos-gray-50 transition-colors"
                  style={{
                    backgroundColor: !THEME_COLORS.find(
                      (c) => c.value === formData.themeColor
                    )
                      ? formData.themeColor
                      : undefined,
                  }}
                >
                  <Plus className="h-6 w-6 text-lumos-gray-400" />
                </div>
              </div>
            </div>
            {errors.themeColor && (
              <p className="text-sm text-red-600 font-medium">{errors.themeColor}</p>
            )}
          </div>

          {/* Preview */}
          <div className="border-t border-lumos-gray-100 pt-8">
            <label className="block text-xs font-bold uppercase tracking-widest text-lumos-dark/50 mb-6">
              How your space will look
            </label>
            <div className="rounded-[2rem] border border-lumos-gray-100 p-6 bg-white shadow-xl shadow-black/5 max-w-sm mx-auto">
              <div className="flex items-center gap-5">
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-inner"
                  style={{ backgroundColor: formData.themeColor }}
                >
                  {formData.name ? formData.name[0].toUpperCase() : "L"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lumos-dark text-lg truncate">
                    {formData.name || "Your Knowledge Notebook"}
                  </h3>
                  <p className="text-sm text-lumos-gray-500 line-clamp-1">
                    {formData.description || "Describe what you'll learn here..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-lumos-gray-500 max-w-xs leading-tight">
          You can always change these settings later. Your learning space is yours to shape.
        </p>
        <div className="flex gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Go Back
          </Button>
          <Button type="submit" size="lg" isLoading={isLoading}>
            Launch My Portal
          </Button>
        </div>
      </div>
    </form>
  );
}
