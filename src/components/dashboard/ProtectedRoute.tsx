"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/hooks/use-auth-state";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, hasHydrated } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we've hydrated and user is not authenticated
    if (hasHydrated && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, hasHydrated, router]);

  // Show loading state while hydrating
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-sm text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // After hydration, check authentication
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

