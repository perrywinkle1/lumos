"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

export interface PublicationHeaderProps {
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  themeColor?: string;
  owner: {
    id: string;
    name?: string | null;
    image?: string | null;
    bio?: string | null;
  };
  subscriberCount?: number;
  postCount?: number;
  className?: string;
  children?: React.ReactNode;
}

export function PublicationHeader({
  name,
  description,
  logoUrl,
  coverUrl,
  themeColor = "#ff6719",
  owner,
  subscriberCount = 0,
  postCount = 0,
  className,
  children,
}: PublicationHeaderProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Cover Image */}
      {coverUrl && (
        <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden">
          <Image
            src={coverUrl}
            alt={`${name} cover`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}

      {/* Header Content */}
      <div
        className={cn(
          "max-w-3xl mx-auto px-4 sm:px-6",
          coverUrl ? "-mt-16 relative z-10" : "pt-12"
        )}
      >
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          {logoUrl ? (
            <div
              className={cn(
                "relative h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white",
                coverUrl && "ring-2 ring-white/50"
              )}
            >
              <Image
                src={logoUrl}
                alt={`${name} logo`}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className="h-24 w-24 sm:h-32 sm:w-32 rounded-full flex items-center justify-center border-4 border-white shadow-lg text-white font-bold text-3xl sm:text-4xl"
              style={{ backgroundColor: themeColor }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Publication Name */}
          <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 font-serif">
            {name}
          </h1>

          {/* Description */}
          {description && (
            <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-xl">
              {description}
            </p>
          )}

          {/* Author Info */}
          <div className="mt-4 flex items-center gap-3">
            <Avatar
              src={owner.image}
              name={owner.name || "Author"}
              size="md"
            />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                By {owner.name || "Anonymous"}
              </p>
              {owner.bio && (
                <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                  {owner.bio}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>
                {subscriberCount.toLocaleString()} community member
                {subscriberCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <span>
                {postCount.toLocaleString()} guide{postCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Subscribe Button / Actions */}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </div>
  );
}
