"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "glow";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lumos-accent-primary focus:ring-offset-2 focus:ring-offset-lumos-dark-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-full active:scale-[0.98]";

    const variants = {
      primary:
        "bg-gradient-to-r from-lumos-accent-primary to-lumos-accent-secondary text-lumos-dark-950 hover:from-lumos-accent-glow hover:to-lumos-accent-primary shadow-lg shadow-lumos-accent-primary/30 hover:shadow-xl hover:shadow-lumos-accent-primary/40 hover:-translate-y-0.5",
      secondary:
        "bg-lumos-dark-800 text-lumos-text-secondary hover:bg-lumos-dark-700 border border-lumos-dark-600 hover:border-lumos-accent-primary/30 hover:text-lumos-text-primary hover:shadow-md",
      ghost:
        "bg-transparent text-lumos-text-muted hover:bg-lumos-dark-800 hover:text-lumos-text-primary",
      glow:
        "bg-gradient-to-r from-lumos-accent-primary to-lumos-accent-secondary text-lumos-dark-950 font-semibold shadow-btn-glow hover:shadow-btn-glow-hover hover:-translate-y-0.5 hover:scale-[1.02]",
    };

    const sizes = {
      sm: "text-sm px-4 py-2 gap-1.5 min-h-[36px]",
      md: "text-base px-5 py-2.5 gap-2 min-h-[44px]",
      lg: "text-lg px-8 py-3.5 gap-2.5 min-h-[52px]",
    };

    const iconSizes = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size={size} className={iconSizes[size]} />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className={cn("flex-shrink-0", iconSizes[size])}>
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className={cn("flex-shrink-0", iconSizes[size])}>
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
