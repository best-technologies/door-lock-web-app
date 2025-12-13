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
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache persists for 10 minutes (formerly cacheTime)
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes in background
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: () => dashboardApi.getAdminDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache persists for 10 minutes (formerly cacheTime)
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes in background
  });
}

