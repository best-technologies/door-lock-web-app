import {
  AttendanceListResponse,
  AttendanceStatsResponse,
  AttendanceHistoryResponse,
  HolidaysResponse,
  CreateAttendanceDto,
  CreateHolidayDto,
  AttendanceFilters,
  AttendanceHistoryFilters,
  AttendanceRecord,
  Holiday,
} from "@/types/api";
import { handleUnauthorized } from "@/lib/handle-unauthorized";

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://embedded-door-lock.onrender.com";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "/api/v1";

export const attendanceApi = {
  /**
   * Get attendance records with optional filtering
   */
  getAttendanceRecords: async (filters?: AttendanceFilters): Promise<AttendanceListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.from) params.append("from", filters.from);
    if (filters?.to) params.append("to", filters.to);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.department) params.append("department", filters.department);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    // Use Next.js API route proxy to enable server-side logging
    const url = `/api/attendance${queryString ? `?${queryString}` : ""}`;

    // Log request (client-side)
    console.group(`🌐 Attendance API Request: GET /attendance`);
    console.log("📍 Full URL:", url);
    console.log("🔧 Method: GET");
    console.log("📤 Headers:", {
      ...getAuthHeaders(),
      Authorization: getAuthHeaders().Authorization ? "Bearer ***" : undefined,
    });
    console.log("🔍 Filters:", filters);
    console.groupEnd();

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    // Log response (client-side)
    console.group(`✅ Attendance API Response: GET /attendance`);
    console.log("📊 Status:", response.status, response.statusText);
    console.groupEnd();

    handleUnauthorized(response);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      console.error("❌ Attendance API Error:", errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Log response data (client-side)
    console.log("📥 Attendance API Response Data:", data);

    // Handle response structure: { success, message, data: [{ data: [...], pagination: {...} }] }
    // OR: { success, message, data: { data: [...], pagination: {...} } }
    if (data.success && data.data) {
      let records: any[] = [];
      let pagination: any = {
        page: data.page || filters?.page || 1,
        limit: data.limit || filters?.limit || 20,
        total: data.total || 0,
        totalPages: data.totalPages || 0,
      };

      // Check if data.data is an array (backend returns array with one element)
      if (Array.isArray(data.data) && data.data.length > 0) {
        // Extract from first element: { data: [...], pagination: {...} }
        const firstElement = data.data[0];
        if (firstElement && firstElement.data) {
          records = Array.isArray(firstElement.data) ? firstElement.data : [];
          pagination = firstElement.pagination || pagination;
        } else {
          // If array elements are records directly
          records = data.data;
        }
      } else if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
        // Handle object structure: { data: { data: [...], pagination: {...} } }
        if (Array.isArray(data.data.data)) {
          records = data.data.data;
          pagination = data.data.pagination || pagination;
        } else if (Array.isArray(data.data)) {
          records = data.data;
        }
      }

      const result = {
        success: true,
        message: data.message || "Attendance records retrieved successfully",
        data: {
          data: records,
          pagination: pagination,
        },
      };
      console.log("✅ Processed Attendance Records:", result);
      return result;
    }

    console.error("❌ Invalid response structure:", data);
    throw new Error(data.message || "Failed to fetch attendance records");
  },

  /**
   * Get attendance history for a specific user
   */
  getAttendanceHistory: async (
    userId: string,
    filters?: AttendanceHistoryFilters
  ): Promise<AttendanceHistoryResponse> => {
    const params = new URLSearchParams();
    if (filters?.from) params.append("from", filters.from);
    if (filters?.to) params.append("to", filters.to);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = `/api/attendance/user/${userId}/history${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    handleUnauthorized(response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Response shape (per docs):
    // {
    //   success: true,
    //   message: "...",
    //   data: [...records],
    //   total, page, limit, totalPages,
    //   timestamp: { date, time }
    // }
    const records = Array.isArray(data.data) ? data.data : [];
    const pagination = {
      page: data.page || filters?.page || 1,
      limit: data.limit || filters?.limit || 20,
      total: data.total || 0,
      totalPages: data.totalPages || 0,
    };

    return {
      success: !!data.success,
      message: data.message || "Attendance history retrieved successfully",
      data: {
        data: records,
        pagination,
      },
      timestamp: data.timestamp,
    };
  },

  /**
   * Create or update attendance record manually
   */
  createOrUpdateAttendance: async (
    attendanceData: CreateAttendanceDto
  ): Promise<{ success: boolean; message: string; data: AttendanceRecord }> => {
    const url = `${API_BASE_URL}${API_VERSION}/attendance`;

    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(attendanceData),
    });

    handleUnauthorized(response);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.success && data.data) {
      return {
        success: true,
        message: data.message || "Attendance recorded successfully",
        data: Array.isArray(data.data) ? data.data[0] : data.data,
      };
    }

    throw new Error(data.message || "Failed to create/update attendance");
  },

  /**
   * Get attendance statistics
   */
  getAttendanceStats: async (
    userId?: string,
    from?: string,
    to?: string
  ): Promise<AttendanceStatsResponse> => {
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const queryString = params.toString();
    // Use Next.js API route proxy to enable server-side logging
    const url = `/api/attendance/stats${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    handleUnauthorized(response);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Handle response structure: { success, message, data: {...} }
    // OR: { success, message, data: [{...}] } (array with one element)
    if (data.success && data.data) {
      // Check if data.data is an array (backend might return array with one element)
      let statsData = data.data;
      if (Array.isArray(data.data) && data.data.length > 0) {
        statsData = data.data[0];
      }

      return {
        success: true,
        message: data.message || "Attendance statistics retrieved successfully",
        data: statsData,
      };
    }

    throw new Error(data.message || "Failed to fetch attendance statistics");
  },

  /**
   * Get all holidays
   */
  getHolidays: async (from?: string, to?: string): Promise<HolidaysResponse> => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const queryString = params.toString();
    const url = `${API_BASE_URL}${API_VERSION}/attendance/holidays${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    handleUnauthorized(response);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.data)) {
      return {
        success: true,
        message: data.message || "Holidays retrieved successfully",
        data: data.data,
      };
    }

    throw new Error(data.message || "Failed to fetch holidays");
  },

  /**
   * Create a new holiday
   */
  createHoliday: async (
    holidayData: CreateHolidayDto
  ): Promise<{ success: boolean; message: string; data: Holiday }> => {
    const url = `${API_BASE_URL}${API_VERSION}/attendance/holidays`;

    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(holidayData),
    });

    handleUnauthorized(response);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.success && data.data) {
      return {
        success: true,
        message: data.message || "Holiday created successfully",
        data: Array.isArray(data.data) ? data.data[0] : data.data,
      };
    }

    throw new Error(data.message || "Failed to create holiday");
  },

  /**
   * Delete a holiday
   */
  deleteHoliday: async (holidayId: string): Promise<{ success: boolean; message: string }> => {
    const url = `${API_BASE_URL}${API_VERSION}/attendance/holidays/${holidayId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    handleUnauthorized(response);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        message: data.message || "Holiday deleted successfully",
      };
    }

    throw new Error(data.message || "Failed to delete holiday");
  },
};

