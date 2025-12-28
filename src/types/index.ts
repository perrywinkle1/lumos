import type { User, Publication, Post, Subscription } from "@prisma/client";

export type SafeUser = Omit<User, "password" | "emailVerified"> & {
  emailVerified: string | null;
};

export type PublicationWithOwner = Publication & {
  owner: SafeUser;
  _count?: {
    posts: number;
    subscriptions: number;
  };
};

export type PostWithAuthor = Post & {
  author: SafeUser;
  publication: Publication;
};

export type SubscriptionWithDetails = Subscription & {
  publication: Publication;
  user: SafeUser;
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
