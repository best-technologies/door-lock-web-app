import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import {
  DashboardSummary,
  AdminDashboardData,
} from "@/types/api";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => dashboardApi.getSummary(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - data is considered fresh for 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - cache persists for 24 hours (formerly cacheTime)
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchInterval: false, // Disable automatic refetching - admin can manually refresh
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: () => dashboardApi.getAdminDashboard(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - data is considered fresh for 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - cache persists for 24 hours (formerly cacheTime)
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchInterval: false, // Disable automatic refetching - admin can manually refresh
  });
}

