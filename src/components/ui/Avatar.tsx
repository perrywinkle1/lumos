"use client";

import * as React from "react";
import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallbackClassName?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt = "Avatar",
      name,
      size = "md",
      fallbackClassName,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    const sizes = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
      xl: "h-16 w-16 text-lg",
    };

    const imageSizes = {
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
    };

    const showFallback = !src || imageError;
    const initials = name ? getInitials(name) : "?";

    // Generate a consistent background color based on the name
    const getBackgroundColor = (name?: string): string => {
      if (!name) return "bg-gray-400";
      const colors = [
        "bg-red-500",
        "bg-orange-500",
        "bg-amber-500",
        "bg-yellow-500",
        "bg-lime-500",
        "bg-green-500",
        "bg-emerald-500",
        "bg-teal-500",
        "bg-cyan-500",
        "bg-sky-500",
        "bg-blue-500",
        "bg-indigo-500",
        "bg-violet-500",
        "bg-purple-500",
        "bg-fuchsia-500",
        "bg-pink-500",
        "bg-rose-500",
      ];
      const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full",
          sizes[size],
          showFallback && getBackgroundColor(name),
          className
        )}
        {...props}
      >
        {!showFallback && (
          <>
            {isLoading && (
              <div className="absolute inset-0 animate-pulse bg-gray-200" />
            )}
            <Image
              src={src}
              alt={alt}
              width={imageSizes[size]}
              height={imageSizes[size]}
              className={cn(
                "h-full w-full object-cover transition-opacity duration-200",
                isLoading ? "opacity-0" : "opacity-100"
              )}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setImageError(true);
                setIsLoading(false);
              }}
            />
          </>
        )}
        {showFallback && (
          <span
            className={cn(
              "font-medium text-white select-none",
              fallbackClassName
            )}
          >
            {initials}
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
