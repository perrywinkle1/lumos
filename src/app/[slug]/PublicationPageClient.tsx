"use client";

import * as React from "react";
import Link from "next/link";
import { PublicationHeader } from "@/components/publication/PublicationHeader";
import { GuideList } from "@/components/publication/GuideList";
import { SubscribeButton, SubscribeForm } from "@/components/publication/SubscribeButton";
import { Button } from "@/components/ui/button";

interface SerializedPost {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  content: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  isPublished: boolean;
  isPaid: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  publicationId: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface SerializedPublication {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  themeColor: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    bio: string | null;
  };
  _count: {
    posts: number;
    subscriptions: number;
  };
}

interface PublicationPageClientProps {
  publication: SerializedPublication;
  posts: SerializedPost[];
  isSubscribed: boolean;
  subscriptionTier: "free" | "paid" | null;
  isOwner: boolean;
}

export function PublicationPageClient({
  publication,
  posts,
  isSubscribed,
  subscriptionTier,
  isOwner,
}: PublicationPageClientProps) {
  const [subscribed, setSubscribed] = React.useState(isSubscribed);
  const [tier, setTier] = React.useState(subscriptionTier);

  const handleSubscriptionChange = (newSubscribed: boolean) => {
    setSubscribed(newSubscribed);
    if (!newSubscribed) {
      setTier(null);
    } else {
      setTier("free");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Publication Header */}
      <PublicationHeader
        name={publication.name}
        description={publication.description}
        logoUrl={publication.logoUrl}
        coverUrl={publication.coverUrl}
        themeColor={publication.themeColor}
        owner={publication.owner}
        subscriberCount={publication._count.subscriptions}
        postCount={publication._count.posts}
      >
        {isOwner ? (
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
            <Link href={`/dashboard/publications/${publication.slug}`} className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full min-h-[44px] sm:w-auto">
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Manage
              </Button>
            </Link>
            <Link href={`/dashboard/publications/${publication.slug}/new-post`} className="w-full sm:w-auto">
              <Button variant="primary" className="w-full min-h-[44px] sm:w-auto">
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Guide
              </Button>
            </Link>
          </div>
        ) : (
          <SubscribeButton
            publicationId={publication.id}
            publicationName={publication.name}
            isSubscribed={subscribed}
            subscriptionTier={tier}
            size="lg"
            onSubscriptionChange={handleSubscriptionChange}
          />
        )}
      </PublicationHeader>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6 sm:mb-8">
          <nav className="-mb-px flex gap-6 sm:gap-8">
            <button className="border-b-2 border-lumos-orange py-3 px-1 text-sm font-medium text-lumos-orange sm:py-4">
              Guides
            </button>
            <button className="border-b-2 border-transparent py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 sm:py-4">
              About
            </button>
          </nav>
        </div>

        {/* Guides List */}
        <GuideList
          posts={posts.map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            subtitle: post.subtitle,
            excerpt: post.excerpt,
            coverImageUrl: post.coverImageUrl,
            isPaid: post.isPaid,
            publishedAt: post.publishedAt,
            author: post.author,
          }))}
          publicationSlug={publication.slug}
          emptyMessage="No learning guides published yet. Check back soon!"
        />

        {/* Community CTA at bottom */}
        {!isOwner && !subscribed && posts.length > 0 && (
          <div className="mt-12 py-8 px-4 bg-lumos-gray-50 rounded-[2rem] text-center sm:mt-16 sm:py-12 sm:px-6 lumos-glow">
            <h3 className="text-xl font-bold text-lumos-dark mb-2 sm:text-2xl tracking-tight">
              Join {publication.name}&apos;s community
            </h3>
            <p className="text-lg text-lumos-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Get new technology guides delivered straight to your inbox.
            </p>
            <div className="flex justify-center">
              <SubscribeForm
                publicationId={publication.id}
                publicationName={publication.name}
                onSubscriptionChange={handleSubscriptionChange}
              />
            </div>
          </div>
        )}

        {/* About Section */}
        {publication.owner.bio && (
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              About the author
            </h2>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div
                  className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600 overflow-hidden"
                  style={{
                    backgroundImage: publication.owner.image
                      ? `url(${publication.owner.image})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {!publication.owner.image &&
                    (publication.owner.name?.charAt(0).toUpperCase() || "?")}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {publication.owner.name || "Anonymous"}
                </h3>
                <p className="mt-1 text-gray-600">{publication.owner.bio}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
