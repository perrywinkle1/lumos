import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { PublicationPageClient } from "./PublicationPageClient";

interface PublicationPageProps {
  params: {
    slug: string;
  };
}

async function getPublication(slug: string) {
  const publication = await prisma.publication.findUnique({
    where: { slug },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
        },
      },
      _count: {
        select: {
          posts: { where: { isPublished: true } },
          subscriptions: true,
        },
      },
    },
  });

  return publication;
}

async function getPosts(publicationId: string) {
  const posts = await prisma.post.findMany({
    where: {
      publicationId,
      isPublished: true,
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
    take: 20,
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
}: PublicationPageProps): Promise<Metadata> {
  const publication = await getPublication(params.slug);

  if (!publication) {
    return {
      title: "Publication Not Found",
    };
  }

  return {
    title: `${publication.name} | Lumos`,
    description: publication.description || `${publication.name} on Lumos`,
    openGraph: {
      title: publication.name,
      description: publication.description || undefined,
      images: publication.coverUrl ? [publication.coverUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: publication.name,
      description: publication.description || undefined,
      images: publication.coverUrl ? [publication.coverUrl] : undefined,
    },
  };
}

export default async function PublicationPage({ params }: PublicationPageProps) {
  const publication = await getPublication(params.slug);

  if (!publication) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const posts = await getPosts(publication.id);

  let subscription = null;
  if (session?.user?.id) {
    subscription = await getSubscription(session.user.id, publication.id);
  }

  // Serialize dates for client component
  const serializedPosts = posts.map((post) => ({
    ...post,
    publishedAt: post.publishedAt?.toISOString() || null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }));

  const serializedPublication = {
    ...publication,
    createdAt: publication.createdAt.toISOString(),
    updatedAt: publication.updatedAt.toISOString(),
  };

  return (
    <PublicationPageClient
      publication={serializedPublication}
      posts={serializedPosts}
      isSubscribed={!!subscription}
      subscriptionTier={subscription?.tier as "free" | "paid" | null}
      isOwner={session?.user?.id === publication.ownerId}
    />
  );
}
