"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Compass, TrendingUp, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchBar, PublicationCard, PublicationCardSkeleton } from "@/components/explore";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";

// Types matching API response
interface Publication {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  owner: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    subscriptions: number;
    posts: number;
  };
}

interface PublicationsResponse {
  success: boolean;
  data: {
    items: Publication[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
  error?: string;
}

// Category filter options
const categories = [
  { id: "all", label: "All", icon: Compass },
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "new", label: "New", icon: Clock },
  { id: "featured", label: "Featured", icon: Sparkles },
] as const;

type CategoryId = (typeof categories)[number]["id"];

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [publications, setPublications] = React.useState<Publication[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [subscribingIds, setSubscribingIds] = React.useState<Set<string>>(new Set());
  const [subscribedIds, setSubscribedIds] = React.useState<Set<string>>(new Set());

  // Get search from URL params
  const searchQuery = searchParams.get("search") || "";
  const [activeCategory, setActiveCategory] = React.useState<CategoryId>("all");

  // Fetch publications
  const fetchPublications = React.useCallback(
    async (pageNum: number, search: string, append: boolean = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "12",
        });

        if (search) {
          params.set("search", search);
        }

        const response = await fetch(`/api/publications?${params.toString()}`);
        const data: PublicationsResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch publications");
        }

        if (append) {
          setPublications((prev) => [...prev, ...data.data.items]);
        } else {
          setPublications(data.data.items);
        }

        setHasMore(data.data.hasMore);
        setTotal(data.data.total);
        setPage(pageNum);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Initial fetch
  React.useEffect(() => {
    fetchPublications(1, searchQuery, false);
  }, [fetchPublications, searchQuery]);

  // Handle search
  const handleSearch = React.useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      router.push(`/explore?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Handle load more
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchPublications(page + 1, searchQuery, true);
    }
  };

  // Handle subscribe
  const handleSubscribe = async (publicationId: string) => {
    // Already subscribed - unsubscribe
    if (subscribedIds.has(publicationId)) {
      setSubscribedIds((prev) => {
        const next = new Set(prev);
        next.delete(publicationId);
        return next;
      });
      return;
    }

    // Subscribe
    setSubscribingIds((prev) => new Set(prev).add(publicationId));

    try {
      // Simulate API call - in real app, call /api/subscriptions
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSubscribedIds((prev) => new Set(prev).add(publicationId));
    } catch {
      // Handle error
    } finally {
      setSubscribingIds((prev) => {
        const next = new Set(prev);
        next.delete(publicationId);
        return next;
      });
    }
  };

  // Handle category change
  const handleCategoryChange = (categoryId: CategoryId) => {
    setActiveCategory(categoryId);
    // In a real app, this would filter by category from the API
    // For now, it's just UI state
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
              Discover what&apos;s possible
            </h1>
            <p className="mt-3 text-base text-gray-600 sm:mt-4 sm:text-lg">
              Explore technology guides and learning portals on topics that matter to you
            </p>

            {/* Search Bar */}
            <div className="mt-8 flex justify-center">
              <SearchBar
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search for guides, topics, or learning portals..."
                className="w-full max-w-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Category Filters */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto sm:mx-0 sm:px-0 sm:overflow-visible sm:mb-8">
          <div className="flex items-center gap-2 min-w-max pb-2 sm:pb-0 sm:flex-wrap">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all min-h-[44px]",
                    isActive
                      ? "bg-[#ff6719] text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Info */}
        {!isLoading && (
          <div className="mb-6 text-sm text-gray-600">
            {searchQuery ? (
              <>
                Showing {publications.length} of {total} results for{" "}
                <span className="font-medium text-gray-900">&ldquo;{searchQuery}&rdquo;</span>
              </>
            ) : (
              <>
                Showing {publications.length} of {total} learning portals
              </>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchPublications(1, searchQuery, false)}
              className="mt-4"
            >
              Try again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PublicationCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && publications.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <Compass className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No learning portals found
            </h3>
            <p className="mt-2 text-gray-600">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Check back later for new technology guides"}
            </p>
            {searchQuery && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleSearch("")}
                className="mt-4"
              >
                Clear search
              </Button>
            )}
          </div>
        )}

        {/* Publications Grid */}
        {!isLoading && !error && publications.length > 0 && (
          <>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publications.map((publication) => (
                <PublicationCard
                  key={publication.id}
                  publication={publication}
                  onSubscribe={handleSubscribe}
                  isSubscribed={subscribedIds.has(publication.id)}
                  isSubscribing={subscribingIds.has(publication.id)}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="min-w-[160px]"
                >
                  {isLoadingMore ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Loading...
                    </>
                  ) : (
                    "Load more"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
