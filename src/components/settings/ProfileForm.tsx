"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/Avatar";
import { Camera } from "lucide-react";

interface ProfileFormProps {
  initialData: {
    name: string | null;
    bio: string | null;
    image: string | null;
  };
  onSubmit: (data: { name?: string; bio?: string; image?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileForm({ initialData, onSubmit, isLoading = false }: ProfileFormProps) {
  const [name, setName] = React.useState(initialData.name || "");
  const [bio, setBio] = React.useState(initialData.bio || "");
  const [image, setImage] = React.useState(initialData.image || "");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = React.useState(false);

  // Track if form has been modified
  React.useEffect(() => {
    const hasChanges =
      name !== (initialData.name || "") ||
      bio !== (initialData.bio || "") ||
      image !== (initialData.image || "");
    setIsDirty(hasChanges);
  }, [name, bio, image, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (name && name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (name && name.length > 100) {
      newErrors.name = "Name must be at most 100 characters";
    }
    if (bio && bio.length > 500) {
      newErrors.bio = "Bio must be at most 500 characters";
    }
    if (image && image.length > 0) {
      try {
        new URL(image);
      } catch {
        newErrors.image = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const updateData: { name?: string; bio?: string; image?: string } = {};

    if (name !== (initialData.name || "")) {
      updateData.name = name;
    }
    if (bio !== (initialData.bio || "")) {
      updateData.bio = bio;
    }
    if (image !== (initialData.image || "")) {
      updateData.image = image;
    }

    await onSubmit(updateData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-start gap-6">
        <div className="relative group">
          <Avatar
            src={image || null}
            name={name || "User"}
            size="xl"
            className="h-24 w-24"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <Input
            label="Avatar URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            error={errors.image}
            helperText="Enter a URL for your profile picture"
          />
        </div>
      </div>

      {/* Name Field */}
      <Input
        label="Display Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        error={errors.name}
        required
      />

      {/* Bio Field */}
      <div className="w-full">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          rows={4}
          maxLength={500}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-[#ff6719] focus:ring-[#ff6719]/20 resize-none"
        />
        <div className="mt-1.5 flex justify-between text-sm">
          {errors.bio ? (
            <p className="text-red-600">{errors.bio}</p>
          ) : (
            <p className="text-gray-500">A short description about yourself</p>
          )}
          <span className="text-gray-400">{bio.length}/500</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!isDirty || isLoading}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
