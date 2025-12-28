"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn, formatDate, truncate } from "@/lib/utils";
import { Badge, PaidBadge, FreeBadge, DifficultyBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { BookOpen } from "lucide-react";

export interface GuideListItem {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  excerpt?: string | null;
  content?: string | null;
  coverImageUrl?: string | null;
  isPaid: boolean;
  publishedAt?: string | Date | null;
  author: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
}

export interface GuideListProps {
  posts: GuideListItem[];
  publicationSlug: string;
  showAuthor?: boolean;
  emptyMessage?: string;
  className?: string;
}

function estimateReadTime(content?: string | null): number {
  if (!content) return 1;
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function getDifficulty(content?: string | null): "easy" | "intermediate" | "advanced" {
  const readTime = estimateReadTime(content);
  if (readTime <= 3) return "easy";
  if (readTime <= 8) return "intermediate";
  return "advanced";
}

export function GuideList({
  posts,
  publicationSlug,
  showAuthor = false,
  emptyMessage = "No learning guides added yet",
  className,
}: GuideListProps) {
  if (posts.length === 0) {
    return (
      <div className={cn("py-16 text-center bg-lumos-gray-50 rounded-3xl border border-dashed border-lumos-gray-200", className)}>
        <div className="mx-auto max-w-md px-4">
          <BookOpen className="mx-auto h-16 w-16 text-lumos-gray-300" />
          <p className="mt-6 text-lg font-medium text-lumos-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-8", className)}>
      {posts.map((post, index) => (
        <GuideListItemCard
          key={post.id}
          post={post}
          publicationSlug={publicationSlug}
          showAuthor={showAuthor}
          featured={index === 0}
        />
      ))}
    </div>
  );
}

interface GuideListItemCardProps {
  post: GuideListItem;
  publicationSlug: string;
  showAuthor?: boolean;
  featured?: boolean;
}

function GuideListItemCard({
  post,
  publicationSlug,
  showAuthor = false,
  featured = false,
}: GuideListItemCardProps) {
  const readTime = estimateReadTime(post.content || post.excerpt);
  const difficulty = getDifficulty(post.content || post.excerpt);
  const postUrl = `/${publicationSlug}/${post.slug}`;

  if (featured && post.coverImageUrl) {
    return (
      <article className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-lumos-gray-100 transition-all duration-500 hover:shadow-2xl hover:shadow-lumos-orange/5 lumos-glow">
        <Link href={postUrl} className="block">
          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-3xl bg-lumos-gray-50">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
        <div className="mt-8">
          <div className="flex items-center gap-3">
            {post.isPaid ? <PaidBadge size="sm" /> : <FreeBadge size="sm" />}
            <DifficultyBadge level={difficulty} size="sm" />
            <span className="text-xs font-bold uppercase tracking-widest text-lumos-gray-400">
              {readTime} minute guide
            </span>
          </div>
          <Link href={postUrl} className="group/title">
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-lumos-dark group-hover/title:text-lumos-orange transition-colors font-serif leading-tight">
              {post.title}
            </h2>
            {post.subtitle && (
              <p className="mt-3 text-xl text-lumos-gray-500 font-sans leading-relaxed">{post.subtitle}</p>
            )}
          </Link>
          {post.excerpt && (
            <p className="mt-4 text-lg text-lumos-gray-600 line-clamp-3 leading-relaxed">
              {truncate(post.excerpt, 250)}
            </p>
          )}
          <div className="mt-8 flex items-center justify-between">
            {showAuthor ? (
              <div className="flex items-center gap-3">
                <Avatar
                  src={post.author.image}
                  name={post.author.name || "Author"}
                  size="md"
                  className="ring-2 ring-lumos-gray-50"
                />
                <span className="text-sm font-bold text-lumos-dark">
                  {post.author.name || "Anonymous"}
                </span>
              </div>
            ) : <div />}
            <span className="text-sm font-bold text-lumos-orange group-hover:translate-x-1 transition-transform flex items-center gap-2">
              Start Learning
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative rounded-3xl bg-white p-6 shadow-sm ring-1 ring-lumos-gray-100 transition-all duration-500 hover:shadow-xl hover:shadow-lumos-orange/5 lumos-glow">
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {post.isPaid ? <PaidBadge size="sm" /> : <FreeBadge size="sm" />}
            <DifficultyBadge level={difficulty} size="sm" />
            <span className="text-xs font-bold uppercase tracking-widest text-lumos-gray-400">
              {readTime} minute guide
            </span>
          </div>
          <Link href={postUrl} className="group/title block mt-4">
            <h3 className="text-2xl font-bold text-lumos-dark group-hover/title:text-lumos-orange transition-colors font-serif leading-tight line-clamp-2">
              {post.title}
            </h3>
            {post.subtitle && (
              <p className="mt-2 text-base text-lumos-gray-500 font-sans line-clamp-1">
                {post.subtitle}
              </p>
            )}
          </Link>
          {post.excerpt && (
            <p className="mt-4 text-base text-lumos-gray-600 line-clamp-2 leading-relaxed">
              {truncate(post.excerpt, 180)}
            </p>
          )}
          <div className="mt-6 flex items-center gap-4">
            {showAuthor && (
              <div className="flex items-center gap-2">
                <Avatar
                  src={post.author.image}
                  name={post.author.name || "Author"}
                  size="sm"
                />
                <span className="text-sm font-bold text-lumos-dark">
                  {post.author.name || "Anonymous"}
                </span>
              </div>
            )}
            <span className="text-xs font-bold text-lumos-orange opacity-0 group-hover:opacity-100 transition-opacity">
              Start Learning →
            </span>
          </div>
        </div>
        {post.coverImageUrl && (
          <Link
            href={postUrl}
            className="flex-shrink-0 order-first sm:order-last"
          >
            <div className="relative h-48 w-full sm:h-40 sm:w-60 overflow-hidden rounded-2xl bg-lumos-gray-50">
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}

export { GuideListItemCard };
