import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const publicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  coverUrl: z.string().url().optional().or(z.literal("")),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  subtitle: z.string().max(300).optional(),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500).optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  isPublished: z.boolean().optional(),
  isPaid: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PublicationInput = z.infer<typeof publicationSchema>;
export type PostInput = z.infer<typeof postSchema>;
