"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn, formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { Badge, PaidBadge, DifficultyBadge } from "@/components/ui/Badge";
import { SubscribeButton, SubscribeForm } from "@/components/publication/SubscribeButton";
import { GuideList } from "@/components/publication/GuideList";
import { PenLine, Lightbulb, BookOpen, ArrowLeft, CheckCircle2 } from "lucide-react";

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
    email: string;
    image: string | null;
    bio: string | null;
  };
  publication: {
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
      image: string | null;
    };
    _count: {
      subscriptions: number;
    };
  };
}

interface SerializedRelatedPost {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  coverImageUrl: string | null;
  isPaid: boolean;
  publishedAt: string | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface PostPageClientProps {
  post: SerializedPost;
  relatedPosts: SerializedRelatedPost[];
  canView: boolean;
  isSubscribed: boolean;
  subscriptionTier: "free" | "paid" | null;
  isOwner: boolean;
}

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, " ");
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function getDifficulty(content: string): "easy" | "intermediate" | "advanced" {
  const readTime = estimateReadTime(content);
  if (readTime <= 3) return "easy";
  if (readTime <= 8) return "intermediate";
  return "advanced";
}

function ShareButtons({ title, url }: { title: string; url: string }) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = [
    {
      name: "Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex items-center gap-2">
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full text-lumos-gray-400 hover:text-lumos-dark hover:bg-lumos-gray-50 transition-all flex items-center justify-center"
          title={`Share on ${link.name}`}
        >
          {link.icon}
        </a>
      ))}
      <button
        onClick={copyToClipboard}
        className="p-2 rounded-full text-lumos-gray-400 hover:text-lumos-dark hover:bg-lumos-gray-50 transition-all flex items-center justify-center"
        title="Copy link"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );
}

function PaywallOverlay({
  publicationId,
  publicationName,
  isSubscribed,
}: {
  publicationId: string;
  publicationName: string;
  isSubscribed: boolean;
  subscriptionTier: "free" | "paid" | null;
}) {
  return (
    <div className="relative mt-12">
      <div className="absolute inset-x-0 bottom-full h-48 bg-gradient-to-t from-white via-white/80 to-transparent" />
      <div className="relative bg-lumos-dark rounded-[2.5rem] p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
        <div className="absolute -top-24 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 bg-lumos-orange/10 blur-[100px]" />
        
        <div className="mx-auto max-w-md">
          <Badge variant="orange" size="lg" className="mb-6">
            Subscriber Exclusive
          </Badge>
          <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
            Keep reading this story
          </h3>
          <p className="text-white/60 mb-10 leading-relaxed">
            {isSubscribed
              ? "This post is for paid subscribers only. Upgrade your plan to unlock the full story."
              : `Join ${publicationName}'s inner circle to read the rest of this post and support independent writing.`}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row justify-center">
            {isSubscribed ? (
              <Button size="lg" className="w-full sm:w-auto">
                Upgrade Plan
              </Button>
            ) : (
              <SubscribeForm
                publicationId={publicationId}
                publicationName={publicationName}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostPageClient({
  post,
  relatedPosts,
  canView,
  isSubscribed,
  subscriptionTier,
  isOwner,
}: PostPageClientProps) {
  const readTime = estimateReadTime(post.content);
  const difficulty = getDifficulty(post.content);
  const postUrl = typeof window !== "undefined" ? window.location.href : "";
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [isSpotlightActive, setIsSpotlightActive] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);

      // Activate spotlight when user is deep in the content
      if (window.scrollY > 400 && !isSpotlightActive) {
        setIsSpotlightActive(true);
      } else if (window.scrollY <= 400 && isSpotlightActive) {
        setIsSpotlightActive(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSpotlightActive]);

  const previewContent = canView
    ? post.content
    : post.content.slice(0, 600) + "...";

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-1000 selection:bg-lumos-orange-medium",
      isSpotlightActive ? "bg-lumos-gray-50/50" : "bg-white"
    )}>
      {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-lumos-orange z-[60] transition-all duration-150 shadow-[0_0_10px_rgba(255,103,25,0.5)]"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Cover Image */}
      {post.coverImageUrl && (
        <div className={cn(
          "relative h-[40vh] sm:h-[50vh] md:h-[60vh] w-full bg-lumos-gray-50 transition-opacity duration-1000",
          isSpotlightActive ? "opacity-40" : "opacity-100"
        )}>
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10" />
        </div>
      )}

      <article className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8">
        <header className={cn(
          "relative transition-opacity duration-1000",
          post.coverImageUrl ? "pt-12 md:pt-16" : "pt-16 md:pt-24",
          isSpotlightActive ? "opacity-40" : "opacity-100"
        )}>
          {/* Publication Link */}
          <Link
            href={`/${post.publication.slug}`}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-lumos-orange mb-8 transition-colors"
          >
            {post.publication.logoUrl ? (
              <Image
                src={post.publication.logoUrl}
                alt={post.publication.name}
                width={28}
                height={28}
                className="rounded-full ring-2 ring-lumos-orange/10"
              />
            ) : (
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                style={{ backgroundColor: post.publication.themeColor }}
              >
                {post.publication.name.charAt(0)}
              </div>
            )}
            <span className="group-hover:underline decoration-2 underline-offset-4">{post.publication.name}</span>
          </Link>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-lumos-dark font-serif leading-[1.1] tracking-tight">
            {post.title}
          </h1>

          {/* Subtitle */}
          {post.subtitle && (
            <p className="mt-6 text-xl md:text-2xl text-lumos-gray-500 font-sans leading-relaxed">
              {post.subtitle}
            </p>
          )}

          {/* Author & Meta */}
          <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-y border-lumos-gray-100">
            <div className="flex items-center gap-4">
              <Avatar
                src={post.author.image}
                name={post.author.name || "Author"}
                size="lg"
                className="ring-2 ring-lumos-gray-50"
              />
              <div className="flex flex-col">
                <p className="font-bold text-lumos-dark">
                  {post.author.name || "Anonymous"}
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-lumos-gray-500">
                  {post.publishedAt && (
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  )}
                  <span className="text-lumos-gray-300">•</span>
                  <DifficultyBadge level={difficulty} size="sm" className="bg-transparent ring-0 px-0 text-lumos-gray-500 font-medium" />
                  <span className="text-lumos-gray-300">•</span>
                  <span>{readTime} minute guide</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ShareButtons title={post.title} url={postUrl} />
              {isOwner && (
                <Link
                  href={`/dashboard/${post.publication.slug}/posts/${post.id}/edit`}
                >
                  <Button variant="secondary" size="sm">Edit Guide</Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className={cn(
          "py-12 transition-all duration-700",
          isSpotlightActive && "scale-[1.02]"
        )}>
          <div
            className="prose prose-lg md:prose-xl max-w-none prose-headings:font-serif prose-headings:tracking-tight prose-a:text-lumos-orange prose-img:rounded-2xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />

          {/* Paywall */}
          {!canView && (
            <PaywallOverlay
              publicationId={post.publicationId}
              publicationName={post.publication.name}
              isSubscribed={isSubscribed}
              subscriptionTier={subscriptionTier}
            />
          )}
        </div>

        {/* Footer Actions */}
        {canView && (
          <div className="mt-12 pt-8 border-t border-lumos-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <ShareButtons title={post.title} url={postUrl} />
            </div>
            {!isOwner && (
              <SubscribeButton
                publicationId={post.publicationId}
                publicationName={post.publication.name}
                isSubscribed={isSubscribed}
                subscriptionTier={subscriptionTier}
                size="md"
              />
            )}
          </div>
        )}

        {/* Author Bio Section */}
        {post.author.bio && (
          <div className="mt-20 p-8 rounded-[2.5rem] bg-lumos-gray-50 border border-lumos-gray-100 relative overflow-hidden group lumos-glow transition-opacity duration-1000">
            <div className="absolute top-0 right-0 p-8 text-lumos-gray-200 group-hover:text-lumos-orange/10 transition-colors">
              <PenLine className="h-24 w-24" />
            </div>
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <Avatar
                src={post.author.image}
                name={post.author.name || "Author"}
                size="xl"
                className="h-24 w-24 ring-4 ring-white shadow-md"
              />
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-lumos-orange mb-2">About the guide creator</p>
                <h3 className="text-2xl font-bold text-lumos-dark mb-4">
                  {post.author.name || "Anonymous"}
                </h3>
                <p className="text-lg text-lumos-gray-600 leading-relaxed italic">
                  "{post.author.bio}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Continue Learning with Publication */}
        {relatedPosts.length > 0 && (
          <div className="mt-24 pb-24">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-lumos-dark tracking-tight">
                Continue learning with {post.publication.name}
              </h2>
              <Link href={`/${post.publication.slug}`} className="text-sm font-bold text-lumos-orange hover:underline underline-offset-4 decoration-2">
                View all guides
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((p) => (
                <Link key={p.id} href={`/${post.publication.slug}/${p.slug}`} className="group">
                  <div className="h-full p-6 rounded-3xl border border-lumos-gray-100 hover:border-lumos-orange/20 transition-all hover:shadow-xl hover:shadow-lumos-orange/5 bg-white lumos-glow">
                    <h4 className="font-bold text-lg text-lumos-dark group-hover:text-lumos-orange transition-colors mb-2 font-serif">
                      {p.title}
                    </h4>
                    {p.excerpt && (
                      <p className="text-sm text-lumos-gray-500 line-clamp-2 leading-relaxed">
                        {p.excerpt}
                      </p>
                    )}
                    <div className="mt-4 flex items-center text-xs font-bold text-lumos-orange opacity-0 group-hover:opacity-100 transition-opacity">
                      Start Guide →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
