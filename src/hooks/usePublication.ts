"use client";

import { useState, useEffect, useCallback } from "react";
import { publicationsAPI } from "@/lib/api";

interface Publication {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  themeColor: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count?: {
    posts: number;
    subscriptions: number;
  };
}

interface UsePublicationOptions {
  slug?: string;
  enabled?: boolean;
}

type PublicationUpdateData = Partial<{
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  themeColor: string;
}>;

interface UsePublicationResult {
  publication: Publication | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  update: (data: PublicationUpdateData) => Promise<Publication | null>;
  isUpdating: boolean;
}

export function usePublication({ slug, enabled = true }: UsePublicationOptions = {}): UsePublicationResult {
  const [publication, setPublication] = useState<Publication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPublication = useCallback(async () => {
    if (!slug || !enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await publicationsAPI.get(slug);
      if (response.success && response.data) {
        setPublication(response.data);
      } else {
        setError("Failed to fetch publication");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPublication(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug, enabled]);

  useEffect(() => {
    fetchPublication();
  }, [fetchPublication]);

  const update = useCallback(async (data: PublicationUpdateData): Promise<Publication | null> => {
    if (!slug) return null;

    setIsUpdating(true);
    setError(null);

    try {
      const response = await publicationsAPI.update(slug, data);
      if (response.success && response.data) {
        setPublication(response.data);
        return response.data;
      } else {
        setError("Failed to update publication");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [slug]);

  return {
    publication,
    isLoading,
    error,
    refetch: fetchPublication,
    update,
    isUpdating,
  };
}

// Hook for listing user's publications
interface UsePublicationsOptions {
  page?: number;
  limit?: number;
  search?: string;
  enabled?: boolean;
}

interface UsePublicationsResult {
  publications: Publication[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePublications({
  page = 1,
  limit = 10,
  search,
  enabled = true,
}: UsePublicationsOptions = {}): UsePublicationsResult {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublications = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await publicationsAPI.list({ page, limit, search });
      if (response.success && response.data) {
        setPublications(response.data.items);
        setTotal(response.data.total);
        setCurrentPage(response.data.page);
        setPageSize(response.data.pageSize);
        setHasMore(response.data.hasMore);
      } else {
        setError("Failed to fetch publications");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPublications([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, enabled]);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  return {
    publications,
    total,
    page: currentPage,
    pageSize,
    hasMore,
    isLoading,
    error,
    refetch: fetchPublications,
  };
}

// Hook for creating a publication
interface UseCreatePublicationResult {
  create: (data: {
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    coverUrl?: string;
    themeColor?: string;
  }) => Promise<Publication | null>;
  isCreating: boolean;
  error: string | null;
}

export function useCreatePublication(): UseCreatePublicationResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: {
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    coverUrl?: string;
    themeColor?: string;
  }): Promise<Publication | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await publicationsAPI.create(data);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError("Failed to create publication");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return {
    create,
    isCreating,
    error,
  };
}
