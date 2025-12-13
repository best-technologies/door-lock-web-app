"use client";

import { useState } from "react";
import { useForgotPassword } from "@/hooks/use-password-reset";
import { getErrorMessage } from "@/lib/errors";
import ErrorAlert from "@/components/ErrorAlert";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const forgotPassword = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    forgotPassword.mutate(
      { email },
      {
        onSuccess: () => {
          setSuccess(true);
        },
        onError: (err: unknown) => {
          const userFriendlyMessage = getErrorMessage(err);
          setError(userFriendlyMessage);
        },
      }
    );
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100">
              <svg
                className="h-6 w-6 text-success-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
              Check Your Email
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              If an account with that email exists, a 6-digit verification code
              has been sent to your email address. Please check your inbox and
              use the code to reset your password.
            </p>
            <p className="mt-4 text-xs text-text-secondary">
              The verification code expires in 15 minutes.
            </p>
          </div>
          <div className="space-y-4">
            <Link
              href={`/auth/reset-password?email=${encodeURIComponent(email)}`}
              className="inline-block w-full rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
            >
              Enter Verification Code
            </Link>
            <Link
              href="/auth/login"
              className="inline-block w-full text-sm font-medium text-primary-500 hover:text-primary-600"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Enter your email address and we'll send you a verification code to
            reset your password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <ErrorAlert
              message={error}
              onDismiss={() => setError(null)}
              variant="error"
            />
          )}
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full rounded-lg border border-border bg-surface px-3 py-3 text-foreground placeholder-text-secondary focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
              placeholder="Email address"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={forgotPassword.isPending}
              className="group relative flex w-full justify-center rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {forgotPassword.isPending
                ? "Sending..."
                : "Send Verification Code"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-primary-500 hover:text-primary-600"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

