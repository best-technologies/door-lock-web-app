"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminDashboard } from "@/hooks/use-dashboard";
import { useAuthState } from "@/hooks/use-auth-state";
import { UserRole } from "@/types/api";
import { ApiError } from "@/lib/errors";
import StatsCard from "@/components/dashboard/StatsCard";
import UsersTable from "@/components/dashboard/UsersTable";
import AttendanceOverview from "@/components/dashboard/AttendanceOverview";
import ErrorAlert from "@/components/ErrorAlert";

export default function DashboardPage() {
  const { user, isAuthenticated, hasHydrated } = useAuthState();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const { data, isLoading, error, refetch, isRefetching } = useAdminDashboard();

  // Validate user access
  useEffect(() => {
    // Wait for hydration before validating
    if (!hasHydrated) {
      return;
    }

    const validateAccess = () => {
      if (!isAuthenticated) {
        router.push("/auth/login");
        return;
      }

      // Check if user has admin role (required for dashboard access)
      if (user && user.role !== UserRole.ADMIN) {
        setIsValidating(false);
        return;
      }

      // If authenticated and is admin, allow access
      if (user && user.role === UserRole.ADMIN) {
        setIsValidating(false);
      }
    };

    // Small delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      validateAccess();
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, hasHydrated, user, router]);

  // Handle 403 Forbidden - redirect to homepage
  useEffect(() => {
    if (error) {
      // Check if error is ApiError with 403 status
      const isForbidden =
        (error instanceof ApiError && error.statusCode === 403) ||
        (error as any)?.statusCode === 403 ||
        (error as any)?.message?.toLowerCase().includes("forbidden");
      
      if (isForbidden) {
        // Redirect to homepage after a brief delay
        const timer = setTimeout(() => {
          router.push("/");
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [error, router]);

  // Show loading state while hydrating or validating
  if (!hasHydrated || isValidating || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-lg font-medium text-foreground">
            {!hasHydrated ? "Loading..." : "Validating access..."}
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            {!hasHydrated
              ? "Please wait..."
              : "Please wait while we verify your permissions"}
          </p>
        </div>
      </div>
    );
  }

  // Check if user doesn't have admin role
  if (user && user.role !== UserRole.ADMIN) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-100">
            <svg
              className="h-8 w-8 text-danger-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
            <p className="mt-2 text-text-secondary">
              You don't have permission to access the dashboard. Admin access is required.
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="inline-block rounded-lg bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-sm text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Check if it's a 403 Forbidden error
    const isForbidden =
      (error instanceof ApiError && error.statusCode === 403) ||
      (error as any)?.statusCode === 403 ||
      (error as any)?.message?.toLowerCase().includes("forbidden");

    if (isForbidden) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-100">
              <svg
                className="h-8 w-8 text-danger-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-foreground">Access Denied</h2>
            <p className="mt-2 text-sm text-text-secondary">
              You don't have permission to access this page.
            </p>
            <p className="mt-4 text-sm text-text-secondary">
              Redirecting to homepage...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </div>
        <ErrorAlert
          message="Failed to load dashboard data. Please try again later."
          variant="error"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </div>
        <ErrorAlert
          message="No dashboard data available."
          variant="warning"
        />
      </div>
    );
  }

  // Ensure data structure exists with proper null checks
  const stats = data?.stats;
  const recentUsers = data?.recentUsers || [];
  const todayAttendance = data?.todayAttendance || [];

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </div>
        <ErrorAlert
          message="Dashboard statistics are not available. Please try again later."
          variant="warning"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Welcome back! Here's an overview of your system.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching || isLoading}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh dashboard data"
        >
          <svg
            className={`h-5 w-5 ${isRefetching || isLoading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="hidden sm:inline">
            {isRefetching || isLoading ? "Refreshing..." : "Refresh"}
          </span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers?.total || 0}
          color="primary"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
        />
        <StatsCard
          title="Admins"
          value={stats.totalAdmins?.total || 0}
          color="success"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          }
        />
        <StatsCard
          title="Staff Members"
          value={stats.totalStaff?.total || 0}
          color="info"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
        <StatsCard
          title="Clocked In Today"
          value={stats.clockedInToday?.total || 0}
          color="warning"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          }
        />
      </div>

      {/* Tables Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users Table */}
        <div className="lg:col-span-1">
          <UsersTable users={recentUsers} />
        </div>

        {/* Attendance Overview */}
        <div className="lg:col-span-1">
          <AttendanceOverview records={todayAttendance} />
        </div>
      </div>
    </div>
  );
}

