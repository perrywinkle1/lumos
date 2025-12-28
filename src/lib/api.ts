// API client utilities for frontend

const API_BASE = "/api";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "An error occurred");
  }

  return data;
}

// Publications API
export const publicationsAPI = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    fetchAPI<{
      success: boolean;
      data: {
        items: any[];
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
      };
    }>("/publications", { params }),

  get: (slug: string) =>
    fetchAPI<{ success: boolean; data: any }>(`/publications/${slug}`),

  create: (data: {
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    coverUrl?: string;
    themeColor?: string;
  }) =>
    fetchAPI<{ success: boolean; data: any }>("/publications", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    slug: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string;
      logoUrl: string;
      coverUrl: string;
      themeColor: string;
    }>
  ) =>
    fetchAPI<{ success: boolean; data: any }>(`/publications/${slug}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (slug: string) =>
    fetchAPI<{ success: boolean }>(`/publications/${slug}`, {
      method: "DELETE",
    }),
};

// Posts API
export const postsAPI = {
  list: (params?: {
    page?: number;
    limit?: number;
    publicationId?: string;
    published?: boolean;
  }) =>
    fetchAPI<{
      success: boolean;
      data: {
        items: any[];
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
      };
    }>("/posts", { params }),

  get: (id: string) =>
    fetchAPI<{ success: boolean; data: any }>(`/posts/${id}`),

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
  }) =>
    fetchAPI<{ success: boolean; data: any }>("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      content: string;
      subtitle: string;
      excerpt: string;
      coverImageUrl: string;
      isPublished: boolean;
      isPaid: boolean;
    }>
  ) =>
    fetchAPI<{ success: boolean; data: any }>(`/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/posts/${id}`, {
      method: "DELETE",
    }),

  publish: (id: string, publish: boolean) =>
    fetchAPI<{ success: boolean; data: any; message: string }>(`/posts/${id}/publish`, {
      method: "POST",
      body: JSON.stringify({ publish }),
    }),
};

// Subscriptions API
export const subscriptionsAPI = {
  list: (params?: { publicationId?: string }) =>
    fetchAPI<{ success: boolean; data: any[] }>("/subscriptions", { params }),

  subscribe: (publicationId: string, tier: "free" | "paid" = "free") =>
    fetchAPI<{ success: boolean; data: any }>("/subscriptions", {
      method: "POST",
      body: JSON.stringify({ publicationId, tier }),
    }),

  unsubscribe: (publicationId: string) =>
    fetchAPI<{ success: boolean }>(`/subscriptions?publicationId=${publicationId}`, {
      method: "DELETE",
    }),
};

// Users API
export const usersAPI = {
  getMe: () => fetchAPI<{ success: boolean; data: any }>("/users/me"),

  updateMe: (data: Partial<{ name: string; bio: string; image: string }>) =>
    fetchAPI<{ success: boolean; data: any }>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name?: string }) =>
    fetchAPI<{ success: boolean; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
