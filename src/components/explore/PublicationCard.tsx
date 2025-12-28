"use client";

import * as React from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";

export interface PublicationCardProps {
  publication: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    logoUrl?: string | null;
    owner: {
      id: string;
      name: string | null;
      image: string | null;
    };
    _count: {
      subscriptions: number;
      posts: number;
    };
  };
  onSubscribe?: (publicationId: string) => void;
  isSubscribed?: boolean;
  isSubscribing?: boolean;
  className?: string;
}

export function PublicationCard({
  publication,
  onSubscribe,
  isSubscribed = false,
  isSubscribing = false,
  className,
}: PublicationCardProps) {
  const handleSubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubscribe?.(publication.id);
  };

  const formatSubscriberCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Link
      href={`/${publication.slug}`}
      className={cn(
        "group block rounded-xl border border-gray-200 bg-white p-4 sm:p-6",
        "transition-all duration-200",
        "hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5",
        "active:bg-gray-50",
        className
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Publication Logo/Avatar */}
        <div className="flex-shrink-0">
          <Avatar
            src={publication.logoUrl}
            alt={publication.name}
            name={publication.name}
            size="xl"
            className="ring-2 ring-gray-100 group-hover:ring-gray-200 transition-all"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Publication Name */}
          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-[#ff6719] transition-colors">
            {publication.name}
          </h3>

          {/* Author Info */}
          <div className="mt-1 flex items-center gap-2">
            <Avatar
              src={publication.owner.image}
              alt={publication.owner.name || "Author"}
              name={publication.owner.name || "Unknown"}
              size="sm"
            />
            <span className="text-sm text-gray-600 truncate">
              {publication.owner.name || "Anonymous"}
            </span>
          </div>

          {/* Description */}
          {publication.description && (
            <p className="mt-3 text-sm text-gray-600 line-clamp-2">
              {publication.description}
            </p>
          )}

          {/* Footer: Subscriber count and Subscribe button */}
          <div className="mt-4 flex items-center justify-between">
            {/* Subscriber Count */}
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>
                {formatSubscriberCount(publication._count.subscriptions)}{" "}
                {publication._count.subscriptions === 1
                  ? "member"
                  : "members"}
              </span>
            </div>

            {/* Subscribe Button */}
            <Button
              variant={isSubscribed ? "secondary" : "primary"}
              size="sm"
              onClick={handleSubscribe}
              disabled={isSubscribing}
              className={cn(
                "transition-all min-h-[36px] min-w-[90px]",
                isSubscribed && "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {isSubscribing
                ? "..."
                : isSubscribed
                ? "Joined"
                : "Join"}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton loader for publication cards
export function PublicationCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Avatar skeleton */}
        <div className="h-16 w-16 rounded-full bg-gray-200 flex-shrink-0" />

        {/* Content skeleton */}
        <div className="flex-1 min-w-0">
          {/* Title skeleton */}
          <div className="h-6 w-3/4 rounded bg-gray-200" />

          {/* Author skeleton */}
          <div className="mt-2 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div className="h-4 w-24 rounded bg-gray-200" />
          </div>

          {/* Description skeleton */}
          <div className="mt-3 space-y-2">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-2/3 rounded bg-gray-200" />
          </div>

          {/* Footer skeleton */}
          <div className="mt-4 flex items-center justify-between">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-8 w-20 rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
