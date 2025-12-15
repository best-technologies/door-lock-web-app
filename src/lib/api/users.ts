import { apiClient } from "@/lib/api-client";
import {
  UsersResponse,
  UpdateUserRoleDto,
  UpdateUserRoleResponse,
  UpdateUserDto,
  UpdateUserResponse,
  EnrollUserDto,
  EnrollUserResponse,
  UsersFilters,
  UserDetails,
  AddRfidTagDto,
  AddRfidTagResponse,
  RegisterFingerprintDto,
  RegisterFingerprintResponse,
  SetKeypadPinDto,
  SetKeypadPinResponse,
} from "@/types/api";
import { ApiError } from "@/lib/errors";
import { handleUnauthorized } from "@/lib/handle-unauthorized";

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

    handleUnauthorized(response);

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

    handleUnauthorized(response);

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

    handleUnauthorized(response);

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

  /**
   * Enroll a new user
   */
  enrollUser: async (userData: EnrollUserDto): Promise<EnrollUserResponse> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://embedded-door-lock.onrender.com";
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "/api/v1";
    const url = `${API_BASE_URL}${API_VERSION}/admin/users-management`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Log request
    console.group(`🌐 Users API Request: POST /admin/users-management`);
    console.log("📍 Full URL:", url);
    console.log("🔧 Method: POST");
    console.log("📤 Headers:", {
      ...headers,
      Authorization: headers.Authorization ? "Bearer ***" : undefined,
    });
    console.log("📦 Request Body:", userData);
    console.groupEnd();

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(userData),
    });

    handleUnauthorized(response);

    // Log response
    console.group(`✅ Users API Response: POST /admin/users-management`);
    console.log("📊 Status:", response.status, response.statusText);
    console.groupEnd();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      console.error("❌ Users API Error:", errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Log response data
    console.log("📥 Users API Response Data:", data);

    // Handle response structure: { success, message, data: {...} }
    if (data.success && data.data) {
      return {
        success: true,
        message: data.message || "User enrolled successfully",
        data: Array.isArray(data.data) ? data.data[0] : data.data,
      } as EnrollUserResponse;
    }

    console.error("❌ Invalid response structure:", data);
    throw new Error(data.message || "Failed to enroll user");
  },

  /**
   * Add RFID tag to user
   */
  addRfidTag: async (userId: string, tagData: AddRfidTagDto): Promise<AddRfidTagResponse> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://embedded-door-lock.onrender.com";
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "/api/v1";
    const url = `${API_BASE_URL}${API_VERSION}/admin/users-management/${userId}/rfid-tags`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.group(`🌐 Users API Request: POST /admin/users-management/${userId}/rfid-tags`);
    console.log("📍 Full URL:", url);
    console.log("📦 Request Body:", tagData);
    console.groupEnd();

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(tagData),
    });

    handleUnauthorized(response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      console.error("❌ Users API Error:", errorMessage, errorData);
      throw new ApiError(errorMessage, response.status, errorData);
    }

    const data = await response.json();
    console.log("✅ Users API Response: POST /admin/users-management/rfid-tags", data);

    if (data.success && data.data) {
      return {
        success: true,
        message: data.message || "RFID tag added successfully",
        data: Array.isArray(data.data) ? data.data[0] : data.data,
      } as AddRfidTagResponse;
    }

    throw new ApiError(data.message || "Failed to add RFID tag", response.status, data);
  },

  /**
   * Register fingerprint for user
   */
  registerFingerprint: async (
    userId: string,
    fingerprintData: RegisterFingerprintDto
  ): Promise<RegisterFingerprintResponse> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://embedded-door-lock.onrender.com";
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "/api/v1";
    const url = `${API_BASE_URL}${API_VERSION}/admin/users-management/${userId}/fingerprints`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.group(`🌐 Users API Request: POST /admin/users-management/${userId}/fingerprints`);
    console.log("📍 Full URL:", url);
    console.log("📦 Request Body:", fingerprintData);
    console.groupEnd();

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(fingerprintData),
    });

    handleUnauthorized(response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      console.error("❌ Users API Error:", errorMessage, errorData);
      throw new ApiError(errorMessage, response.status, errorData);
    }

    const data = await response.json();
    console.log("✅ Users API Response: POST /admin/users-management/fingerprints", data);

    if (data.success && data.data) {
      return {
        success: true,
        message: data.message || "Fingerprint registered successfully",
        data: Array.isArray(data.data) ? data.data[0] : data.data,
      } as RegisterFingerprintResponse;
    }

    throw new ApiError(data.message || "Failed to register fingerprint", response.status, data);
  },

  /**
   * Set/update keypad PIN for user
   */
  setKeypadPin: async (userId: string, pinData: SetKeypadPinDto): Promise<SetKeypadPinResponse> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://embedded-door-lock.onrender.com";
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "/api/v1";
    const url = `${API_BASE_URL}${API_VERSION}/admin/users-management/${userId}/keypad-pin`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.group(`🌐 Users API Request: PATCH /admin/users-management/${userId}/keypad-pin`);
    console.log("📍 Full URL:", url);
    console.log("📦 Request Body:", { pin: "***" }); // Don't log the actual PIN
    console.groupEnd();

    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(pinData),
    });

    handleUnauthorized(response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      console.error("❌ Users API Error:", errorMessage, errorData);
      throw new ApiError(errorMessage, response.status, errorData);
    }

    const data = await response.json();
    console.log("✅ Users API Response: PATCH /admin/users-management/keypad-pin", data);

    if (data.success && data.data) {
      return {
        success: true,
        message: data.message || "Keypad PIN set successfully",
        data: Array.isArray(data.data) ? data.data[0] : data.data,
      } as SetKeypadPinResponse;
    }

    throw new ApiError(data.message || "Failed to set keypad PIN", response.status, data);
  },
};

