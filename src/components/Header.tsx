"use client";

import Link from "next/link";
import { useAuthState } from "@/hooks/use-auth-state";
import UserDropdown from "./UserDropdown";

export default function Header() {
  const { isAuthenticated } = useAuthState();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-sm">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-foreground">DoorLock Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <UserDropdown />
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden text-sm font-medium text-foreground transition-colors hover:text-primary-500 sm:block"
              >
                Sign In
              </Link>
              <Link
                href="/auth/login"
                className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

