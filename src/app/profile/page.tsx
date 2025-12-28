"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import {
  Settings,
  BookOpen,
  Users,
  Calendar,
  FileText,
  ExternalLink,
  Edit,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  createdAt: string;
  publications: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    createdAt: string;
    _count: {
      posts: number;
      subscriptions: number;
    };
  }>;
  subscriptions: Array<{
    id: string;
    tier: string;
    status: string;
    createdAt: string;
    publication: {
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
    };
  }>;
  _count: {
    publications: number;
    subscriptions: number;
    posts: number;
  };
}

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/users/me");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch profile");
      }

      setProfile(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchProfile}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <Avatar
                src={profile.image}
                name={profile.name || "User"}
                size="xl"
                className="h-28 w-28 text-2xl"
              />
              <Link
                href="/settings"
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit className="h-6 w-6 text-white" />
              </Link>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.name || "Anonymous User"}
                </h1>
                <Badge variant="default">Member since {formatDate(profile.createdAt)}</Badge>
              </div>
              <p className="text-gray-500 mb-4">{profile.email}</p>
              {profile.bio && (
                <p className="text-gray-700 max-w-2xl">{profile.bio}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link href="/settings">
                <Button variant="secondary" leftIcon={<Settings className="h-4 w-4" />}>
                  Settings
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-8 max-w-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {profile._count.publications}
              </div>
              <div className="text-sm text-gray-500">Publications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {profile._count.posts}
              </div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {profile._count.subscriptions}
              </div>
              <div className="text-sm text-gray-500">Subscriptions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Publications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#ff6719]" />
                Your Publications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.publications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>You haven&apos;t created any publications yet.</p>
                  <Link href="/publications/new" className="text-[#ff6719] hover:underline mt-2 inline-block">
                    Create your first publication
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.publications.map((pub) => (
                    <Link
                      key={pub.id}
                      href={`/publications/${pub.slug}`}
                      className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar
                          src={pub.logoUrl}
                          name={pub.name}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {pub.name}
                            </h3>
                            <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          </div>
                          {pub.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {pub.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {pub._count.posts} posts
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {pub._count.subscriptions} subscribers
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#ff6719]" />
                Your Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.subscriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>You&apos;re not subscribed to any publications yet.</p>
                  <Link href="/explore" className="text-[#ff6719] hover:underline mt-2 inline-block">
                    Discover publications
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.subscriptions.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/publications/${sub.publication.slug}`}
                      className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar
                          src={sub.publication.logoUrl}
                          name={sub.publication.name}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {sub.publication.name}
                            </h3>
                            <Badge
                              variant={sub.tier === "paid" ? "success" : "default"}
                              className="text-xs"
                            >
                              {sub.tier}
                            </Badge>
                          </div>
                          {sub.publication.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {sub.publication.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                            <span>by</span>
                            <Avatar
                              src={sub.publication.owner.image}
                              name={sub.publication.owner.name || "Owner"}
                              size="sm"
                              className="h-5 w-5"
                            />
                            <span>{sub.publication.owner.name || "Anonymous"}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            Subscribed {formatDate(sub.createdAt)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
