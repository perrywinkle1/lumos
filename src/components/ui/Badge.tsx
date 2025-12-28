"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "orange";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, variant = "default", size = "md", dot = false, children, ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center font-medium rounded-full transition-colors";

    const variants = {
      default: "bg-lumos-gray-100 text-lumos-gray-700",
      success: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/10",
      warning: "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/10",
      error: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10",
      info: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10",
      orange: "bg-lumos-orange-light text-lumos-orange ring-1 ring-inset ring-lumos-orange/20",
    };

    const dotVariants = {
      default: "bg-lumos-gray-400",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      error: "bg-red-500",
      info: "bg-blue-500",
      orange: "bg-lumos-orange",
    };

    const sizes = {
      sm: "text-xs px-2 py-0.5 gap-1",
      md: "text-sm px-2.5 py-0.5 gap-1.5",
      lg: "text-base px-3 py-1 gap-2",
    };

    const dotSizes = {
      sm: "h-1.5 w-1.5",
      md: "h-2 w-2",
      lg: "h-2.5 w-2.5",
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {dot && (
          <span
            className={cn("rounded-full", dotVariants[variant], dotSizes[size])}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

// Preset badges for common use cases
export interface PresetBadgeProps extends Omit<BadgeProps, "variant" | "children"> {
  children?: React.ReactNode;
}

const PaidBadge = React.forwardRef<HTMLSpanElement, PresetBadgeProps>(
  ({ children = "Paid", ...props }, ref) => (
    <Badge ref={ref} variant="success" {...props}>
      {children}
    </Badge>
  )
);
PaidBadge.displayName = "PaidBadge";

const FreeBadge = React.forwardRef<HTMLSpanElement, PresetBadgeProps>(
  ({ children = "Free", ...props }, ref) => (
    <Badge ref={ref} variant="default" {...props}>
      {children}
    </Badge>
  )
);
FreeBadge.displayName = "FreeBadge";

const NewBadge = React.forwardRef<HTMLSpanElement, PresetBadgeProps>(
  ({ children = "New", ...props }, ref) => (
    <Badge ref={ref} variant="orange" {...props}>
      {children}
    </Badge>
  )
);
NewBadge.displayName = "NewBadge";

export interface DifficultyBadgeProps extends PresetBadgeProps {
  level: "easy" | "intermediate" | "advanced";
}

const DifficultyBadge = React.forwardRef<HTMLSpanElement, DifficultyBadgeProps>(
  ({ level, children, ...props }, ref) => {
    const config = {
      easy: { variant: "success" as const, label: "Easy Step" },
      intermediate: { variant: "info" as const, label: "Guided Path" },
      advanced: { variant: "orange" as const, label: "Deep Dive" },
    };

    const { variant, label } = config[level];

    return (
      <Badge ref={ref} variant={variant} {...props}>
        {children || label}
      </Badge>
    );
  }
);
DifficultyBadge.displayName = "DifficultyBadge";

export { Badge, PaidBadge, FreeBadge, NewBadge, DifficultyBadge };
