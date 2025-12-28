"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { X, Home, Compass, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Navigation({ isOpen, onClose }: NavigationProps) {
  const { data: session } = useSession();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSignOut = () => {
    onClose();
    signOut({ callbackUrl: "/" });
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Discover", icon: Compass },
  ];

  const userLinks = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-xl transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-lumos-gray-100 px-4 py-4">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight"
              style={{ color: "#ff6719" }}
              onClick={onClose}
            >
              Lumos
            </Link>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-lumos-gray-500 hover:bg-lumos-gray-100 hover:text-lumos-gray-700"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info (if logged in) */}
          {session && (
            <div className="border-b border-lumos-gray-100 px-4 py-4">
              <div className="flex items-center space-x-3">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User avatar"}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lumos-orange text-sm font-medium text-white">
                    {session.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-lumos-gray-900">
                    {session.user?.name}
                  </p>
                  <p className="truncate text-xs text-lumos-gray-500">
                    {session.user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-2 py-4">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center rounded-md px-3 py-2 text-base font-medium text-lumos-gray-700 transition-colors hover:bg-lumos-gray-50 hover:text-lumos-gray-900"
                  onClick={onClose}
                >
                  <link.icon className="mr-3 h-5 w-5 text-lumos-gray-400" />
                  {link.label}
                </Link>
              ))}
            </div>

            {session && (
              <>
                <div className="my-4 border-t border-lumos-gray-100" />
                <div className="space-y-1">
                  {userLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-lumos-gray-700 transition-colors hover:bg-lumos-gray-50 hover:text-lumos-gray-900"
                      onClick={onClose}
                    >
                      <link.icon className="mr-3 h-5 w-5 text-lumos-gray-400" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="border-t border-lumos-gray-100 p-4">
            {session ? (
              <button
                onClick={handleSignOut}
                className="flex w-full items-center justify-center rounded-md border border-lumos-gray-200 px-4 py-2 text-base font-medium text-lumos-gray-700 transition-colors hover:bg-lumos-gray-50"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sign out
              </button>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/auth/signin"
                  className="block w-full rounded-md border border-lumos-gray-200 px-4 py-2 text-center text-base font-medium text-lumos-gray-700 transition-colors hover:bg-lumos-gray-50"
                  onClick={onClose}
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="block w-full rounded-full bg-lumos-orange px-4 py-2 text-center text-base font-medium text-white transition-colors hover:bg-lumos-orange/90"
                  onClick={onClose}
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
