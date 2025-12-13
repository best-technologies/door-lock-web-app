"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuthState } from "@/hooks/use-auth-state";
import { useSignOut } from "@/hooks/use-auth";
import { UserRole } from "@/types/api";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthState();
  const signOut = useSignOut();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const userInitials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "U";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white">
          {userInitials}
        </div>
        <span className="hidden sm:block">
          {user?.firstName} {user?.lastName}
        </span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-surface shadow-lg">
          <div className="py-1">
            {user?.role === UserRole.ADMIN && (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface/80"
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface/80"
            >
              Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface/80"
            >
              Settings
            </Link>
            <hr className="my-1 border-border" />
            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="block w-full px-4 py-2 text-left text-sm text-danger-600 transition-colors hover:bg-surface/80"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

