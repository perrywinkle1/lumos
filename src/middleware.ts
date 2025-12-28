import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes that don't require authentication
        const publicRoutes = [
          "/",
          "/explore",
          "/auth/signin",
          "/auth/signup",
          "/about",
          "/privacy",
          "/terms",
        ];

        // Check if it's a public route
        if (publicRoutes.some((route) => pathname === route)) {
          return true;
        }

        // Check if it's a publication page (dynamic route)
        // Allow public access to publication pages and posts
        if (pathname.match(/^\/[^/]+$/) || pathname.match(/^\/[^/]+\/[^/]+$/)) {
          // But not dashboard or settings routes
          if (!pathname.includes("/dashboard") && !pathname.includes("/settings")) {
            return true;
          }
        }

        // API routes have their own auth handling
        if (pathname.startsWith("/api")) {
          return true;
        }

        // Protected routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
  ],
};
