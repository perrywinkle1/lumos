"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "white" | "gray";
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", color = "primary", ...props }, ref) => {
    const sizes = {
      sm: "h-4 w-4 border-2",
      md: "h-6 w-6 border-2",
      lg: "h-8 w-8 border-3",
    };

    const colors = {
      primary: "border-[#ff6719]/30 border-t-[#ff6719]",
      white: "border-white/30 border-t-white",
      gray: "border-gray-300 border-t-gray-600",
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn(
          "inline-block animate-spin rounded-full",
          sizes[size],
          colors[color],
          className
        )}
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = "Spinner";

// Full page loading spinner
export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ className, text = "Loading...", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <Spinner size="lg" />
        {text && <p className="mt-4 text-sm text-gray-600">{text}</p>}
      </div>
    );
  }
);

LoadingOverlay.displayName = "LoadingOverlay";

// Inline loading state for content areas
export interface LoadingPlaceholderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

const LoadingPlaceholder = React.forwardRef<
  HTMLDivElement,
  LoadingPlaceholderProps
>(({ className, lines = 3, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("animate-pulse space-y-3", className)}
      role="status"
      aria-label="Loading content"
      {...props}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 rounded bg-gray-200",
            i === lines - 1 && "w-3/4"
          )}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
});

LoadingPlaceholder.displayName = "LoadingPlaceholder";

export { Spinner, LoadingOverlay, LoadingPlaceholder };
