"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useResetPassword } from "@/hooks/use-password-reset";
import { getErrorMessage } from "@/lib/errors";
import ErrorAlert from "@/components/ErrorAlert";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const resetPassword = useResetPassword();

  // Get email from URL query params
  useEffect(() => {
    const emailParam = searchParams?.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email exists
    if (!email) {
      setError("Email is required. Please start from the forgot password page.");
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    resetPassword.mutate(
      { email, code, newPassword },
      {
        onError: (err: unknown) => {
          const userFriendlyMessage = getErrorMessage(err);
          setError(userFriendlyMessage);
        },
      }
    );
  };

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
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Enter the 6-digit verification code sent to your email and your new
            password.
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
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  readOnly
                  disabled
                  className="relative block w-full rounded-lg border border-border bg-surface/50 px-3 py-3 text-foreground/70 placeholder-text-secondary cursor-not-allowed sm:text-sm"
                  placeholder="Email address"
                />
                <div className="absolute inset-0 flex items-center justify-end pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              {!email && (
                <p className="mt-1 text-xs text-danger-600">
                  Email is required. Please start from the forgot password page.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-foreground mb-1">
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="relative block w-full rounded-lg border border-border bg-surface px-3 py-3 text-foreground placeholder-text-secondary focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm text-center text-2xl tracking-widest"
                placeholder="000000"
              />
              <p className="mt-1 text-xs text-text-secondary">
                Enter the 6-digit code from your email
              </p>
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="relative block w-full rounded-lg border border-border bg-surface px-3 py-3 text-foreground placeholder-text-secondary focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                placeholder="Enter new password"
              />
              <p className="mt-1 text-xs text-text-secondary">
                Minimum 6 characters
              </p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="relative block w-full rounded-lg border border-border bg-surface px-3 py-3 text-foreground placeholder-text-secondary focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={resetPassword.isPending}
              className="group relative flex w-full justify-center rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetPassword.isPending ? "Resetting..." : "Reset Password"}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link
              href={`/auth/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
              className="font-medium text-primary-500 hover:text-primary-600"
            >
              Resend code
            </Link>
            <Link
              href="/auth/login"
              className="font-medium text-primary-500 hover:text-primary-600"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center text-text-secondary">Loading...</div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

