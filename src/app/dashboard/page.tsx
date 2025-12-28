"use client";

import * as React from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { usePublications } from "@/hooks/usePublication";
import { usePosts } from "@/hooks/usePosts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate, truncate } from "@/lib/utils";
import {
  PenSquare,
  FileText,
  Users,
  TrendingUp,
  Plus,
  ChevronRight,
  BookOpen,
  Clock,
  Settings,
  Sun,
  Lightbulb,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  isLoading,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  isLoading?: boolean;
  description?: string;
}) {
  return (
    <Card className="relative overflow-hidden group lumos-glow border-none bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-lumos-gray-400 uppercase tracking-widest truncate">
              {title}
            </p>
            {isLoading ? (
              <div className="mt-2 h-9 w-16 bg-lumos-gray-100 animate-pulse rounded-lg" />
            ) : (
              <p className="mt-2 text-3xl font-bold text-lumos-dark tracking-tight">
                {value}
              </p>
            )}
            {description && !isLoading && (
              <p className="mt-1 text-xs font-medium text-lumos-gray-500">
                {description}
              </p>
            )}
            {trend && !description && (
              <p className="mt-2 text-xs font-bold text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                {trend}
              </p>
            )}
          </div>
          <div className="p-3 bg-lumos-orange-light rounded-2xl text-lumos-orange transition-all duration-500 group-hover:scale-110 group-hover:bg-lumos-orange group-hover:text-white lumos-halo">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, isLoading: userLoading, isAuthenticated } = useUser();

  const { publications, isLoading: publicationsLoading, error: publicationsError } = usePublications({
    enabled: isAuthenticated,
  });

  // Get all drafts (unpublished posts) across all publications
  const { posts: allPosts, isLoading: postsLoading } = usePosts({
    published: false,
    enabled: isAuthenticated && publications.length > 0,
  });

  // Calculate stats from real data
  const stats = React.useMemo(() => {
    const totalSubscribers = publications.reduce(
      (acc, pub) => acc + (pub._count?.subscriptions || 0),
      0
    );
    const totalPosts = publications.reduce(
      (acc, pub) => acc + (pub._count?.posts || 0),
      0
    );

    const masteryLevel = totalPosts > 0 ? Math.min(100, Math.round((totalPosts / (totalPosts + allPosts.length)) * 100)) : 0;

    return {
      totalSubscribers,
      totalPosts,
      publicationCount: publications.length,
      draftCount: allPosts.length,
      masteryLevel,
    };
  }, [publications, allPosts]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-lumos-dark tracking-tight mb-4">
          Welcome back
        </h1>
        <p className="text-lg text-lumos-gray-600 mb-10">
          Ready to continue your digital learning journey?
        </p>
        <Link href="/auth/signin">
          <Button size="lg">Sign in to Lumos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-lumos-dark tracking-tight">
            My Learning Center
          </h1>
          <p className="text-lg text-lumos-gray-600 mt-2">
            Welcome back, {user?.name?.split(" ")[0] || "Learner"}. Here is your progress so far.
          </p>
        </div>
        {publications.length > 0 && (
          <Link href={`/dashboard/${publications[0].slug}/posts/new`} className="w-full sm:w-auto">
            <Button size="lg" leftIcon={<PenSquare className="h-5 w-5" />} className="w-full">
              Create New Guide
            </Button>
          </Link>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 mb-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <StatCard
          title="Knowledge Shine"
          value={`${stats.masteryLevel}%`}
          icon={Sun}
          description="Your overall learning progress"
          isLoading={publicationsLoading || postsLoading}
        />
        <StatCard
          title="Fellow Learners"
          value={stats.totalSubscribers.toLocaleString()}
          icon={Users}
          isLoading={publicationsLoading}
        />
        <StatCard
          title="Guides Completed"
          value={stats.totalPosts}
          icon={Lightbulb}
          isLoading={publicationsLoading}
        />
        <StatCard
          title="In Progress"
          value={stats.draftCount}
          icon={Clock}
          isLoading={postsLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Publications */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="mb-8">
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="text-2xl tracking-tight">Your Learning Portals</CardTitle>
                  <CardDescription className="mt-1">
                    Manage your spaces and see how your community is growing.
                  </CardDescription>
                </div>
                <Link href="/new">
                  <Button variant="secondary" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                    New Portal
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {publicationsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 bg-lumos-gray-50 animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : publicationsError ? (
                <div className="text-center py-12 bg-red-50 rounded-2xl">
                  <p className="text-red-600 font-medium">{publicationsError}</p>
                </div>
              ) : publications.length === 0 ? (
                <div className="text-center py-16 bg-lumos-gray-50 rounded-2xl border-2 border-dashed border-lumos-gray-200">
                  <BookOpen className="h-16 w-16 text-lumos-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-lumos-dark">No learning portals yet</h3>
                  <p className="text-lumos-gray-600 mt-2 mb-8 max-w-xs mx-auto">
                    Start your journey by creating your first learning portal today.
                  </p>
                  <Link href="/new">
                    <Button>Create My First Portal</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {publications.map((pub) => (
                    <Link
                      key={pub.id}
                      href={`/dashboard/${pub.slug}/posts`}
                      className="group"
                    >
                      <div className="p-5 rounded-2xl border border-lumos-gray-100 bg-white transition-all hover:border-lumos-orange/20 hover:shadow-lg hover:shadow-lumos-orange/5 lumos-glow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-5 min-w-0">
                            <div
                              className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-inner"
                              style={{ backgroundColor: pub.themeColor || "#ff6719" }}
                            >
                              {pub.logoUrl ? (
                                <img
                                  src={pub.logoUrl}
                                  alt={pub.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                pub.name[0].toUpperCase()
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-lumos-dark group-hover:text-lumos-orange transition-colors truncate">
                                {pub.name}
                              </h3>
                              <div className="flex items-center gap-6 mt-2">
                                <span className="text-sm font-medium text-lumos-gray-500 flex items-center gap-1.5">
                                  <Users className="h-4 w-4 text-lumos-orange" />
                                  {pub._count?.subscriptions?.toLocaleString() || 0} fellow learners
                                </span>
                                <span className="text-sm font-medium text-lumos-gray-500 flex items-center gap-1.5">
                                  <Lightbulb className="h-4 w-4 text-lumos-orange" />
                                  {pub._count?.posts || 0} guides
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-6 w-6 text-lumos-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-lumos-orange" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Drafts */}
          <Card className="border-none shadow-sm">
            <CardHeader className="mb-6">
              <CardTitle className="text-xl tracking-tight flex items-center gap-2">
                <Clock className="h-5 w-5 text-lumos-orange" />
                Latest Lessons
              </CardTitle>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-lumos-gray-50 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : allPosts.length === 0 ? (
                <div className="text-center py-12 bg-lumos-gray-50 rounded-2xl">
                  <FileText className="h-10 w-10 text-lumos-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-medium text-lumos-gray-500">No lessons in progress</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allPosts.slice(0, 5).map((draft) => (
                    <Link
                      key={draft.id}
                      href={`/dashboard/${draft.publication.slug}/posts/${draft.id}/edit`}
                      className="block group"
                    >
                      <div className="p-4 rounded-xl transition-all hover:bg-lumos-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lumos-dark text-sm truncate group-hover:text-lumos-orange transition-colors">
                              {draft.title || "Untitled lesson"}
                            </h4>
                            <p className="text-xs font-medium text-lumos-gray-500 mt-1">
                              {draft.publication.name}
                            </p>
                          </div>
                          <Badge variant="orange" size="sm">
                            Lesson
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-none shadow-sm">
            <CardHeader className="mb-6">
              <CardTitle className="text-xl tracking-tight">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid gap-1">
                <Link
                  href={publications.length > 0 ? `/dashboard/${publications[0].slug}/posts/new` : "/new"}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-lumos-gray-50 transition-all group"
                >
                  <div className="p-2.5 bg-lumos-orange/5 text-lumos-orange rounded-xl group-hover:bg-lumos-orange group-hover:text-white transition-colors">
                    <PenSquare className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-lumos-gray-700">
                    Create new guide
                  </span>
                </Link>
                <Link
                  href="/new"
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-lumos-gray-50 transition-all group"
                >
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Plus className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-lumos-gray-700">
                    Set up learning portal
                  </span>
                </Link>
                {publications.length > 0 && (
                  <Link
                    href={`/dashboard/${publications[0].slug}/subscribers`}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-lumos-gray-50 transition-all group"
                  >
                    <div className="p-2.5 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                      <Users className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-lumos-gray-700">
                      View fellow learners
                    </span>
                  </Link>
                )}
                <Link
                  href="/settings"
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-lumos-gray-50 transition-all group"
                >
                  <div className="p-2.5 bg-lumos-gray-100 text-lumos-gray-600 rounded-xl group-hover:bg-lumos-dark group-hover:text-white transition-colors">
                    <Settings className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-lumos-gray-700">
                    My Account settings
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
