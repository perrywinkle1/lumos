import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { PostPageClient } from "./PostPageClient";

interface PostPageProps {
  params: {
    slug: string;
    postSlug: string;
  };
}

async function getPost(publicationSlug: string, postSlug: string) {
  const publication = await prisma.publication.findUnique({
    where: { slug: publicationSlug },
    select: { id: true },
  });

  if (!publication) {
    return null;
  }

  const post = await prisma.post.findUnique({
    where: {
      publicationId_slug: {
        publicationId: publication.id,
        slug: postSlug,
      },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
        },
      },
      publication: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      },
    },
  });

  return post;
}

async function getRelatedPosts(publicationId: string, excludePostId: string) {
  const posts = await prisma.post.findMany({
    where: {
      publicationId,
      isPublished: true,
      id: { not: excludePostId },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 3,
  });

  return posts;
}

async function getSubscription(userId: string, publicationId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: {
      userId_publicationId: {
        userId,
        publicationId,
      },
    },
  });

  return subscription;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = await getPost(params.slug, params.postSlug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const description = post.excerpt || post.subtitle || `Read ${post.title} on ${post.publication.name}`;

  return {
    title: `${post.title} | ${post.publication.name}`,
    description,
    openGraph: {
      title: post.title,
      description,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.author.name ? [post.author.name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.slug, params.postSlug);

  if (!post) {
    notFound();
  }

  // Check if post is published (unless owner)
  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.id === post.publication.ownerId;

  if (!post.isPublished && !isOwner) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.publicationId, post.id);

  let subscription = null;
  let canViewPaidContent = false;

  if (session?.user?.id) {
    subscription = await getSubscription(session.user.id, post.publicationId);
    canViewPaidContent = subscription?.tier === "paid" || isOwner;
  }

  // Check if user can view this post
  const canView = !post.isPaid || canViewPaidContent || isOwner;

  // Serialize dates for client component
  const serializedPost = {
    ...post,
    publishedAt: post.publishedAt?.toISOString() || null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    publication: {
      ...post.publication,
      createdAt: post.publication.createdAt.toISOString(),
      updatedAt: post.publication.updatedAt.toISOString(),
    },
  };

  const serializedRelatedPosts = relatedPosts.map((p) => ({
    ...p,
    publishedAt: p.publishedAt?.toISOString() || null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <PostPageClient
      post={serializedPost}
      relatedPosts={serializedRelatedPosts}
      canView={canView}
      isSubscribed={!!subscription}
      subscriptionTier={subscription?.tier as "free" | "paid" | null}
      isOwner={isOwner}
    />
  );
}
