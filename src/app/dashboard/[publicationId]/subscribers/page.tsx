"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { usePublication } from "@/hooks/usePublication";
import { Container } from "@/components/layout/Container";
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
import { Avatar } from "@/components/ui/Avatar";
import { formatDate, getInitials } from "@/lib/utils";
import {
  ArrowLeft,
  Users,
  Mail,
  Crown,
  Search,
  Download,
  Filter,
} from "lucide-react";

interface Subscriber {
  id: string;
  userId: string;
  publicationId: string;
  tier: "free" | "paid";
  status: "active" | "cancelled" | "paused";
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export default function SubscribersPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const publicationId = params.publicationId as string;

  const { publication, isLoading: publicationLoading, error: publicationError } = usePublication({
    slug: publicationId,
    enabled: sessionStatus === "authenticated",
  });

  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterTier, setFilterTier] = React.useState<"all" | "free" | "paid">("all");

  React.useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=/dashboard/${publicationId}/subscribers`);
    }
  }, [sessionStatus, router, publicationId]);

  // Fetch subscribers
  React.useEffect(() => {
    async function fetchSubscribers() {
      if (!publication?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/subscriptions?publicationId=${publication.id}&listSubscribers=true`);
        const data = await response.json();

        if (response.ok && data.success) {
          setSubscribers(data.data || []);
        } else {
          setError(data.error || "Failed to fetch subscribers");
        }
      } catch (err) {
        setError("An error occurred while fetching subscribers");
      } finally {
        setIsLoading(false);
      }
    }

    if (publication?.id) {
      fetchSubscribers();
    }
  }, [publication?.id]);

  // Filter subscribers
  const filteredSubscribers = React.useMemo(() => {
    return subscribers.filter((sub) => {
      // Filter by tier
      if (filterTier !== "all" && sub.tier !== filterTier) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = sub.user.name?.toLowerCase().includes(query);
        const emailMatch = sub.user.email.toLowerCase().includes(query);
        if (!nameMatch && !emailMatch) {
          return false;
        }
      }

      return true;
    });
  }, [subscribers, filterTier, searchQuery]);

  // Stats
  const stats = React.useMemo(() => {
    const total = subscribers.length;
    const free = subscribers.filter((s) => s.tier === "free").length;
    const paid = subscribers.filter((s) => s.tier === "paid").length;
    return { total, free, paid };
  }, [subscribers]);

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Tier", "Status", "Joined Date"];
    const rows = filteredSubscribers.map((sub) => [
      sub.user.name || "Unknown",
      sub.user.email,
      sub.tier,
      sub.status,
      formatDate(sub.createdAt),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${publication?.slug || "portal"}-community.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (sessionStatus === "loading" || publicationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading community members...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (publicationError || !publication) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container className="max-w-4xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Learning Portal Not Found</h1>
            <p className="text-gray-600 mb-6">{publicationError || "The learning portal you are looking for does not exist."}</p>
            <Link href="/dashboard">
              <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container className="max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg overflow-hidden"
                style={{ backgroundColor: publication.themeColor || "#ff6719" }}
              >
                {publication.logoUrl ? (
                  <img
                    src={publication.logoUrl}
                    alt={publication.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  publication.name[0].toUpperCase()
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Community</h1>
                <p className="text-gray-600">{publication.name}</p>
              </div>
            </div>

            <Button
              variant="secondary"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleExportCSV}
              disabled={filteredSubscribers.length === 0}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-6">
            <Link
              href={`/dashboard/${publicationId}/posts`}
              className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
            >
              Guides
            </Link>
            <Link
              href={`/dashboard/${publicationId}/subscribers`}
              className="pb-3 text-sm font-medium border-b-2 border-[#ff6719] text-[#ff6719]"
            >
              Community
            </Link>
            <Link
              href={`/dashboard/${publicationId}/settings`}
              className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
            >
              Settings
            </Link>
          </nav>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Members</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Free Members</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.free}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Crown className="h-5 w-5 text-[#ff6719]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Access Members</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.paid}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6719] focus:border-transparent"
                />
              </div>

              {/* Tier Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value as "all" | "free" | "paid")}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6719] focus:border-transparent"
                >
                  <option value="all">All Tiers</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscribers List */}
        <Card>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {subscribers.length === 0 ? "No community members yet" : "No matching members"}
                </h3>
                <p className="text-gray-600">
                  {subscribers.length === 0
                    ? "Share your learning portal to start growing your community."
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredSubscribers.map((subscriber) => (
                  <div
                    key={subscriber.id}
                    className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {subscriber.user.image ? (
                        <img
                          src={subscriber.user.image}
                          alt={subscriber.user.name || "Member"}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">
                          {getInitials(subscriber.user.name || subscriber.user.email)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {subscriber.user.name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">{subscriber.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={subscriber.tier === "paid" ? "success" : "default"}
                        size="sm"
                      >
                        {subscriber.tier === "paid" ? "Full Access" : "Free"}
                      </Badge>
                      <span className="text-sm text-gray-500 hidden sm:inline">
                        Joined {formatDate(subscriber.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
