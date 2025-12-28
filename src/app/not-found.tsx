import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-lumos-gray-900">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-lumos-gray-700">
        Page not found
      </h2>
      <p className="mt-2 text-center text-lumos-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/">
          <Button variant="primary">Go home</Button>
        </Link>
        <Link href="/explore">
          <Button variant="secondary">Explore publications</Button>
        </Link>
      </div>
    </div>
  );
}
