"use client";

import { useState, useEffect, useCallback } from "react";
import { postsAPI } from "@/lib/api";

interface Post {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  content: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
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
  publication: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
}

interface UsePostsOptions {
  publicationId?: string;
  published?: boolean;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

interface UsePostsResult {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePosts({
  publicationId,
  published,
  page = 1,
  limit = 10,
  enabled = true,
}: UsePostsOptions = {}): UsePostsResult {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await postsAPI.list({ page, limit, publicationId, published });
      if (response.success && response.data) {
        setPosts(response.data.items);
        setTotal(response.data.total);
        setCurrentPage(response.data.page);
        setPageSize(response.data.pageSize);
        setHasMore(response.data.hasMore);
      } else {
        setError("Failed to fetch posts");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, publicationId, published, enabled]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    total,
    page: currentPage,
    pageSize,
    hasMore,
    isLoading,
    error,
    refetch: fetchPosts,
  };
}

// Hook for a single post
interface UsePostOptions {
  id?: string;
  enabled?: boolean;
}

type PostUpdateData = Partial<{
  title: string;
  slug: string;
  content: string;
  subtitle: string;
  excerpt: string;
  coverImageUrl: string;
  isPublished: boolean;
  isPaid: boolean;
}>;

interface UsePostResult {
  post: Post | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  update: (data: PostUpdateData) => Promise<Post | null>;
  isUpdating: boolean;
  deletePost: () => Promise<boolean>;
  isDeleting: boolean;
  publish: (shouldPublish: boolean) => Promise<Post | null>;
  isPublishing: boolean;
}

export function usePost({ id, enabled = true }: UsePostOptions = {}): UsePostResult {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!id || !enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await postsAPI.get(id);
      if (response.success && response.data) {
        setPost(response.data);
      } else {
        setError("Failed to fetch post");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPost(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, enabled]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const update = useCallback(async (data: PostUpdateData): Promise<Post | null> => {
    if (!id) return null;

    setIsUpdating(true);
    setError(null);

    try {
      const response = await postsAPI.update(id, data);
      if (response.success && response.data) {
        setPost(response.data);
        return response.data;
      } else {
        setError("Failed to update post");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [id]);

  const deletePost = useCallback(async (): Promise<boolean> => {
    if (!id) return false;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await postsAPI.delete(id);
      if (response.success) {
        setPost(null);
        return true;
      } else {
        setError("Failed to delete post");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [id]);

  const publish = useCallback(async (shouldPublish: boolean): Promise<Post | null> => {
    if (!id) return null;

    setIsPublishing(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publish: shouldPublish }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPost(data.data);
        return data.data;
      } else {
        setError(data.error || "Failed to update publish status");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setIsPublishing(false);
    }
  }, [id]);

  return {
    post,
    isLoading,
    error,
    refetch: fetchPost,
    update,
    isUpdating,
    deletePost,
    isDeleting,
    publish,
    isPublishing,
  };
}

// Hook for creating a post
interface UseCreatePostResult {
  create: (data: {
    publicationId: string;
    title: string;
    slug: string;
    content: string;
    subtitle?: string;
    excerpt?: string;
    coverImageUrl?: string;
    isPublished?: boolean;
    isPaid?: boolean;
  }) => Promise<Post | null>;
  isCreating: boolean;
  error: string | null;
}

export function useCreatePost(): UseCreatePostResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: {
    publicationId: string;
    title: string;
    slug: string;
    content: string;
    subtitle?: string;
    excerpt?: string;
    coverImageUrl?: string;
    isPublished?: boolean;
    isPaid?: boolean;
  }): Promise<Post | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await postsAPI.create(data);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError("Failed to create post");
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
