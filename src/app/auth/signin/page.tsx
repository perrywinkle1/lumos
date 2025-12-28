import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Continue Your Journey | Lumos",
  description: "Sign in to continue your digital learning journey",
};

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string; registered?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/";
  const error = params.error;
  const registered = params.registered;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/" className="text-2xl font-bold text-lumos-orange tracking-tighter">
          Lumos
        </Link>
        <Link
          href="/auth/signup"
          className="text-sm font-bold uppercase tracking-widest text-lumos-gray-400 hover:text-lumos-dark transition-colors"
        >
          Start Journey
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {registered && (
            <div className="mb-6 rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-700 font-medium" role="alert">
              Your journey has begun! Please sign in to continue.
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 font-medium" role="alert">
              {error === "CredentialsSignin"
                ? "Invalid email or password."
                : error === "OAuthAccountNotLinked"
                ? "This email is already associated with another sign-in method."
                : "An error occurred. Please try again."}
            </div>
          )}

          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 text-center">
        <p className="text-xs font-medium text-lumos-gray-400 max-w-sm mx-auto leading-relaxed">
          By signing in, you agree to our{" "}
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
