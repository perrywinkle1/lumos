import { Spinner } from "@/components/ui";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-lumos-gray-500">Loading...</p>
      </div>
    </div>
  );
}
