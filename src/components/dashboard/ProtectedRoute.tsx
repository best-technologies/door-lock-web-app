"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/hooks/use-auth-state";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

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

