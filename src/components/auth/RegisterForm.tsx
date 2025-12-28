"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { registerSchema, type RegisterInput } from "@/lib/validations";

interface RegisterFormProps {
  callbackUrl?: string;
}

export function RegisterForm({ callbackUrl = "/" }: RegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});

  const [formData, setFormData] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof RegisterInput]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof RegisterInput, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegisterInput;
        if (!errors[field]) {
          errors[field] = err.message;
        }
      });
      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Register the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError("An account with this email already exists.");
        } else if (data.details) {
          // Handle validation errors from the server
          const serverErrors: Partial<Record<keyof RegisterInput, string>> = {};
          Object.entries(data.details).forEach(([key, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              serverErrors[key as keyof RegisterInput] = messages[0];
            }
          });
          setFieldErrors(serverErrors);
        } else {
          setError(data.error || "Registration failed. Please try again.");
        }
        return;
      }

      // Auto-login after successful registration
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed
        // Redirect to login page
        router.push("/auth/signin?registered=true");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-sm">
      {/* Subtle background glow */}
      <div className="absolute -top-32 left-1/2 -z-10 h-[500px] w-[600px] -translate-x-1/2 bg-lumos-orange/5 blur-[120px]" />

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-lumos-dark text-balance">
          Start your journey
        </h1>
        <p className="mt-3 text-lg text-lumos-gray-500">
          Join thousands who are mastering technology, one step at a time.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 font-medium" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="What should we call you?"
          name="name"
          type="text"
          placeholder="Jane Doe"
          value={formData.name}
          onChange={handleChange}
          error={fieldErrors.name}
          disabled={isLoading}
          autoComplete="name"
          autoFocus
        />

        <Input
          label="Email address"
          name="email"
          type="email"
          variant="email"
          placeholder="name@work.com"
          value={formData.email}
          onChange={handleChange}
          error={fieldErrors.email}
          disabled={isLoading}
          autoComplete="email"
        />

        <Input
          label="Create a password"
          name="password"
          variant="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={fieldErrors.password}
          helperText="At least 8 characters. We recommend a mix of letters and numbers."
          disabled={isLoading}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          Begin Learning
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-500">
        Your data is secure and we never share your email.
      </p>

      <div className="my-8 flex items-center">
        <div className="flex-1 border-t border-lumos-gray-100" />
        <span className="px-4 text-xs font-bold uppercase tracking-widest text-lumos-gray-300">or</span>
        <div className="flex-1 border-t border-lumos-gray-100" />
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full bg-white border border-lumos-gray-200 hover:bg-lumos-gray-50 text-lumos-dark"
        size="lg"
        onClick={handleGoogleSignIn}
        isLoading={isGoogleLoading}
        leftIcon={
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        }
      >
        Continue with Google
      </Button>

      <p className="mt-10 text-center text-sm text-lumos-gray-500">
        Already have an account?{" "}
        <Link
          href="/auth/signin"
          className="font-bold text-lumos-orange hover:underline underline-offset-4 decoration-2"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
