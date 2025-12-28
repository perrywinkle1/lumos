"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b border-transparent",
        isScrolled ? "bg-lumos-dark-900/95 backdrop-blur-md border-lumos-accent-primary/10 shadow-lg shadow-lumos-dark-950/50 py-0" : "bg-transparent py-1"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo with glow */}
          <div className="flex items-center">
            <Link
              href="/"
              className="group relative text-2xl font-bold tracking-tighter"
            >
              <span className="relative z-10 bg-gradient-to-r from-lumos-accent-primary to-lumos-accent-secondary bg-clip-text text-transparent">Lumos</span>
              <span className="absolute -inset-2 -z-10 rounded-lg bg-gradient-to-r from-lumos-accent-primary/20 to-lumos-accent-secondary/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/"
              className="text-sm font-medium text-lumos-text-muted transition-colors hover:text-lumos-text-primary"
            >
              Home
            </Link>
            <Link
              href="/explore"
              className="text-sm font-medium text-lumos-text-muted transition-colors hover:text-lumos-text-primary"
            >
              Discover
            </Link>
            {session && (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-lumos-text-muted transition-colors hover:text-lumos-text-primary"
              >
                Learning Center
              </Link>
            )}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {status === "loading" ? (
              <div className="h-8 w-20 animate-pulse rounded bg-lumos-dark-700" />
            ) : session ? (
              <div className="relative" data-user-menu>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 rounded-full p-1 transition-colors hover:bg-lumos-dark-800"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User avatar"}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-lumos-dark-700"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-lumos-accent-primary to-lumos-accent-secondary text-sm font-medium text-lumos-dark-950">
                      {session.user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-lumos-text-muted transition-transform duration-200",
                      isUserMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-lumos-dark-800 p-1 shadow-xl ring-1 ring-lumos-dark-700 focus:outline-none">
                    <div className="border-b border-lumos-dark-700 px-3 py-2.5">
                      <p className="text-sm font-semibold text-lumos-text-primary">
                        {session.user?.name}
                      </p>
                      <p className="truncate text-xs text-lumos-text-muted">
                        {session.user?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center rounded-lg px-3 py-2 text-sm text-lumos-text-secondary hover:bg-lumos-dark-700 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="mr-3 h-4 w-4 text-lumos-text-muted" />
                        Learning Center
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center rounded-lg px-3 py-2 text-sm text-lumos-text-secondary hover:bg-lumos-dark-700 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="mr-3 h-4 w-4 text-lumos-text-muted" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center rounded-lg px-3 py-2 text-sm text-lumos-text-secondary hover:bg-lumos-dark-700 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="mr-3 h-4 w-4 text-lumos-text-muted" />
                        Settings
                      </Link>
                    </div>
                    <div className="border-t border-lumos-dark-700 py-1">
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-lumos-accent-error hover:bg-lumos-accent-error/10 transition-colors"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium text-lumos-text-muted transition-colors hover:text-lumos-text-primary"
                >
                  Log in
                </Link>
                <Link href="/auth/signup">
                  <button className="btn-glow text-sm px-5 py-2">Get started</button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-2.5 text-lumos-text-secondary hover:bg-lumos-dark-800 active:bg-lumos-dark-700 md:hidden min-w-[44px] min-h-[44px]"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-lumos-dark-700 bg-lumos-dark-900 md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            <Link
              href="/"
              className="block rounded-md px-3 py-3 text-base font-medium text-lumos-text-secondary hover:bg-lumos-dark-800 active:bg-lumos-dark-700 min-h-[44px]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/explore"
              className="block rounded-md px-3 py-3 text-base font-medium text-lumos-text-secondary hover:bg-lumos-dark-800 active:bg-lumos-dark-700 min-h-[44px]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Discover
            </Link>
            {session && (
              <Link
                href="/dashboard"
                className="block rounded-md px-3 py-3 text-base font-medium text-lumos-text-secondary hover:bg-lumos-dark-800 active:bg-lumos-dark-700 min-h-[44px]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Learning Center
              </Link>
            )}
          </div>

          {/* Mobile Auth Section */}
          <div className="border-t border-lumos-dark-700 px-4 py-4">
            {session ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User avatar"}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-lumos-dark-700"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-lumos-accent-primary to-lumos-accent-secondary text-sm font-medium text-lumos-dark-950">
                      {session.user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-lumos-text-primary">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-lumos-text-muted">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className="flex items-center rounded-md px-3 py-3 text-base font-medium text-lumos-text-secondary hover:bg-lumos-dark-800 active:bg-lumos-dark-700 min-h-[44px]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="mr-3 h-5 w-5" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center rounded-md px-3 py-3 text-base font-medium text-lumos-text-secondary hover:bg-lumos-dark-800 active:bg-lumos-dark-700 min-h-[44px]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex w-full items-center rounded-md px-3 py-3 text-base font-medium text-lumos-text-secondary hover:bg-lumos-dark-800 active:bg-lumos-dark-700 min-h-[44px]"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link
                  href="/auth/signin"
                  className="rounded-md px-3 py-3 text-center text-base font-medium text-lumos-text-secondary hover:bg-lumos-dark-800 active:bg-lumos-dark-700 min-h-[44px]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-glow text-center min-h-[44px]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
