"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-lumos-gray-900">
        Something went wrong
      </h1>
      <p className="mt-4 text-center text-lumos-gray-500">
        We encountered an error while loading this page.
      </p>
      <div className="mt-8">
        <Button onClick={reset} variant="primary">
          Try again
        </Button>
      </div>
    </div>
  );
}
