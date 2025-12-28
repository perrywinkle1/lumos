"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { AccountForm } from "@/components/settings/AccountForm";
import {
  User,
  Shield,
  Bell,
  CreditCard,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

type Tab = "profile" | "account" | "notifications" | "billing";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
}

export default function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<Tab>("profile");
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [hasPassword, setHasPassword] = React.useState(true);

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
      // Check if user has a password (not OAuth-only)
      // This would typically come from the API, but for now we assume they do
      setHasPassword(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (data: { name?: string; bio?: string; image?: string }) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: data }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update profile");
      }

      setProfile(result.data);
      setSuccessMessage("Profile updated successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string }) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordChange: data }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update password");
      }
    } catch (err) {
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile" as Tab, label: "Profile", icon: User },
    { id: "account" as Tab, label: "Account", icon: Shield },
    { id: "notifications" as Tab, label: "Notifications", icon: Bell },
    { id: "billing" as Tab, label: "Billing", icon: CreditCard },
  ];

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Failed to load profile"}</p>
          <Button onClick={fetchProfile}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-4">
              <Avatar
                src={profile.image}
                name={profile.name || "User"}
                size="lg"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200 text-green-700">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="lg:w-64 flex-shrink-0">
            <Card noPadding>
              <ul className="divide-y divide-gray-100">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          activeTab === tab.id
                            ? "bg-[#ff6719]/5 text-[#ff6719] border-l-2 border-[#ff6719]"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </nav>

          {/* Main Content */}
          <div className="flex-1">
            <Card>
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Profile Settings
                  </h2>
                  <ProfileForm
                    initialData={{
                      name: profile.name,
                      bio: profile.bio,
                      image: profile.image,
                    }}
                    onSubmit={handleProfileUpdate}
                    isLoading={isSaving}
                  />
                </div>
              )}

              {activeTab === "account" && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Account Settings
                  </h2>
                  <AccountForm
                    email={profile.email}
                    hasPassword={hasPassword}
                    onPasswordChange={handlePasswordChange}
                    isLoading={isSaving}
                  />
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Notification Preferences
                  </h2>
                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Email Notifications</h3>

                      <div className="space-y-3">
                        {[
                          { id: "new_posts", label: "New posts from subscriptions", description: "Get notified when publications you follow post new content" },
                          { id: "comments", label: "Comments and replies", description: "Get notified when someone replies to your comments" },
                          { id: "newsletter", label: "Weekly digest", description: "Receive a weekly summary of top posts" },
                          { id: "marketing", label: "Product updates", description: "Learn about new features and improvements" },
                        ].map((item) => (
                          <div key={item.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{item.label}</p>
                              <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#ff6719]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff6719]"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                      <Button disabled>Save Preferences</Button>
                    </div>

                    <p className="text-sm text-gray-500 text-center">
                      Notification preferences are coming soon.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Billing & Subscription
                  </h2>
                  <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="p-6 bg-gradient-to-r from-[#ff6719]/10 to-[#ff6719]/5 rounded-xl border border-[#ff6719]/20">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl font-bold text-gray-900">Free Plan</span>
                            <span className="px-2 py-1 text-xs font-medium bg-[#ff6719]/20 text-[#ff6719] rounded-full">
                              Current
                            </span>
                          </div>
                          <p className="text-gray-600">
                            You&apos;re on the free plan with basic features.
                          </p>
                        </div>
                        <Button variant="primary">Upgrade</Button>
                      </div>
                    </div>

                    {/* Plan Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Free Plan Includes</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            1 publication
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Unlimited free posts
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Basic analytics
                          </li>
                        </ul>
                      </div>

                      <div className="p-4 border border-[#ff6719]/30 rounded-lg bg-[#ff6719]/5">
                        <h4 className="font-medium text-gray-900 mb-3">Pro Plan Includes</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[#ff6719]" />
                            Unlimited publications
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[#ff6719]" />
                            Paid subscriptions
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[#ff6719]" />
                            Advanced analytics
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[#ff6719]" />
                            Custom domain
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Payment History */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-medium text-gray-900 mb-4">Payment History</h3>
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                        <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No payment history available.</p>
                        <p className="text-sm mt-1">Upgrade to Pro to start your subscription.</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 text-center">
                      Billing management is coming soon.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
