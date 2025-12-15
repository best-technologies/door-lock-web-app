import {
  DashboardSummary,
  AdminDashboardData,
} from "@/types/api";
import { ApiError } from "../errors";
import { handleUnauthorized } from "@/lib/handle-unauthorized";

// Custom fetch for dashboard endpoints that return objects instead of arrays
async function fetchDashboardData<T>(endpoint: string): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://embedded-door-lock.onrender.com";
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "/api/v1";
  const url = `${API_BASE_URL}${API_VERSION}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
    
    // Throw ApiError with status code for proper error handling
    throw new ApiError(errorMessage, response.status, errorData);
  }

  const data = await response.json();
  
  // Log the response for debugging
  console.log("📥 Dashboard API Response:", data);
  
  // Handle the response structure: { success, message, data: Array(1) or {...} }
  if (data.success && data.data) {
    console.log("✅ Using nested data structure");
    // Check if data.data is an array (API returns array with one element)
    if (Array.isArray(data.data) && data.data.length > 0) {
      console.log("✅ Extracting first element from data array");
      return data.data[0] as T;
    }
    // If data.data is an object, return it directly
    return data.data as T;
  }
  
  // Handle summary endpoint which might return data directly
  if (data.totalUsers !== undefined) {
    console.log("✅ Using direct data structure");
    return data as T;
  }
  
  // If data itself is the response (no wrapper)
  if (data.stats || data.recentUsers) {
    console.log("✅ Using data as direct response");
    return data as T;
  }
  
  console.error("❌ Invalid response structure:", data);
  throw new ApiError("Invalid response structure from server", response.status);
}

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    return fetchDashboardData<DashboardSummary>("/dashboard/summary");
  },

  getAdminDashboard: async (): Promise<AdminDashboardData> => {
    return fetchDashboardData<AdminDashboardData>("/dashboard/admin");
  },
};

