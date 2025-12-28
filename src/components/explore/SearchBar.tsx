"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search publications...",
  className,
  debounceMs = 300,
}: SearchBarProps) {
  const [localValue, setLocalValue] = React.useState(value);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync local value with external value
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Clear existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce timer
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("relative w-full max-w-xl", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "block w-full rounded-full border border-gray-300 bg-white py-3 pl-11 pr-10",
          "text-gray-900 placeholder:text-gray-400",
          "transition-all duration-200",
          "focus:border-[#ff6719] focus:outline-none focus:ring-2 focus:ring-[#ff6719]/20",
          "hover:border-gray-400"
        )}
        aria-label="Search publications"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            "absolute inset-y-0 right-0 flex items-center pr-4",
            "text-gray-400 hover:text-gray-600 transition-colors"
          )}
          aria-label="Clear search"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
