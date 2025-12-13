import { apiClient } from "@/lib/api-client";
import {
  UsersResponse,
  UpdateUserRoleDto,
  UpdateUserRoleResponse,
  UpdateUserDto,
  UpdateUserResponse,
  UsersFilters,
  UserDetails,
} from "@/types/api";

export const usersApi = {
  /**
   * Get all users with optional filters and pagination
   */
  getAllUsers: async (filters?: UsersFilters): Promise<UsersResponse> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://embedded-door-lock.onrender.com";
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "/api/v1";
    
    const params = new URLSearchParams();
    
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.status) params.append("status", filters.status);
    if (filters?.role) params.append("role", filters.role);
    if (filters?.department) params.append("department", filters.department);

    const queryString = params.toString();
    const url = `${API_BASE_URL}${API_VERSION}/admin/users-management${queryString ? `?${queryString}` : ""}`;

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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Handle the response structure: { success, message, data: [...], total, page, limit, totalPages }
    if (data.success && Array.isArray(data.data)) {
      return {
        success: true,
        message: data.message || "Users retrieved successfully",
        data: data.data,
        total: data.total || data.data.length,
        page: data.page || 1,
        limit: data.limit || 20,
        totalPages: data.totalPages || Math.ceil((data.total || data.data.length) / (data.limit || 20)),
      };
    }

    // Fallback
    return {
      success: data.success || false,
      message: data.message || "Users retrieved successfully",
      data: Array.isArray(data.data) ? data.data : [],
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 20,
      totalPages: data.totalPages || 0,
    };
  },

  /**
   * Update user role
   */
  updateUserRole: async (
    userId: string,
    updateData: UpdateUserRoleDto
  ): Promise<UpdateUserRoleResponse> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://embedded-door-lock.onrender.com";
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "/api/v1";
    const url = `${API_BASE_URL}${API_VERSION}/admin/users-management/${userId}/role`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Handle response structure: { success, message, data: {...} }
    if (data.success && data.data) {
      return {
        success: true,
        message: data.message || "User role updated successfully",
        data: Array.isArray(data.data) ? data.data[0] : data.data,
      } as UpdateUserRoleResponse;
    }

    throw new Error(data.message || "Failed to update user role");
  },

  /**
   * Update user information
   */
  updateUser: async (
    userId: string,
    updateData: UpdateUserDto
  ): Promise<UpdateUserResponse> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://embedded-door-lock.onrender.com";
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "/api/v1";
    const url = `${API_BASE_URL}${API_VERSION}/admin/users-management/${userId}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Handle response structure: { success, message, data: {...} }
    if (data.success && data.data) {
      return {
        success: true,
        message: data.message || "User updated successfully",
        data: Array.isArray(data.data) ? data.data[0] : data.data,
      } as UpdateUserResponse;
    }

    throw new Error(data.message || "Failed to update user");
  },
};

