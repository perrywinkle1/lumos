import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Start Your Journey | Lumos",
  description: "Begin your digital learning journey with Lumos",
};

interface SignUpPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/" className="text-2xl font-bold text-lumos-orange tracking-tighter">
          Lumos
        </Link>
        <Link
          href="/auth/signin"
          className="text-sm font-bold uppercase tracking-widest text-lumos-gray-400 hover:text-lumos-dark transition-colors"
        >
          Sign in
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <RegisterForm callbackUrl={callbackUrl} />
      </main>

      {/* Footer */}
      <footer className="py-10 text-center">
        <p className="text-xs font-medium text-lumos-gray-400 max-w-sm mx-auto leading-relaxed">
          By starting your journey, you agree to our{" "}
          <Link href="/terms" className="text-lumos-orange hover:underline decoration-2 underline-offset-4">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-lumos-orange hover:underline decoration-2 underline-offset-4">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  );
}
