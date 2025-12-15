import { ApiResponse } from "@/types/api";
import { ApiError, NetworkError } from "./errors";
import { handleUnauthorized } from "@/lib/handle-unauthorized";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://embedded-door-lock.onrender.com";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "/api/v1";
const FULL_API_URL = `${API_BASE_URL}${API_VERSION}`;

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    const url = `${this.baseURL}${endpoint}`;
    const method = options.method || "GET";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Merge existing headers if provided
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Log request details
    const sanitizedHeaders = { ...headers };
    if (sanitizedHeaders["Authorization"]) {
      const tokenValue = sanitizedHeaders["Authorization"];
      sanitizedHeaders["Authorization"] = tokenValue
        ? `Bearer ${tokenValue.split(".")[0]}...${tokenValue.slice(-10)}`
        : "Bearer [REDACTED]";
    }

    console.group(`🌐 API Request: ${method} ${endpoint}`);
    console.log("📍 Full URL:", url);
    console.log("🔧 Method:", method);
    console.log("📤 Headers:", sanitizedHeaders);
    if (options.body) {
      try {
        const bodyData = typeof options.body === "string" ? JSON.parse(options.body) : options.body;
        console.log("📦 Request Body:", bodyData);
      } catch {
        console.log("📦 Request Body:", options.body);
      }
    }
    console.log("🔗 Base URL:", this.baseURL);
    console.log("📝 Endpoint:", endpoint);
    console.groupEnd();

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      // Log network errors
      console.group(`🚫 Network Error: ${method} ${endpoint}`);
      console.log("📍 URL:", url);
      console.log("❌ Error:", error);
      console.groupEnd();

      // Handle network errors (no response received)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new NetworkError(
          "Network request failed",
          error
        );
      }
      throw new NetworkError(
        "Unable to connect to the server",
        error
      );
    }

    handleUnauthorized(response);

    // Handle non-JSON responses (like HTML error pages)
    let data: ApiResponse<T>;
    const contentType = response.headers.get("content-type");
    
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      
      console.group(`⚠️ Non-JSON Response: ${method} ${endpoint}`);
      console.log("📊 Status:", response.status, response.statusText);
      console.log("📄 Content-Type:", contentType);
      console.log("📥 Response Text:", textResponse.substring(0, 500));
      console.groupEnd();

      // If response is not JSON, it's likely an error page or routing issue
      if (!response.ok) {
        throw new ApiError(
          "The service is temporarily unavailable. Please try again later.",
          response.status,
          textResponse
        );
      }
      throw new ApiError(
        "Invalid response from server",
        response.status
      );
    }

    try {
      data = await response.json();
    } catch (error) {
      // Log JSON parsing errors
      console.group(`⚠️ JSON Parse Error: ${method} ${endpoint}`);
      console.log("📊 Status:", response.status, response.statusText);
      console.log("❌ Parse Error:", error);
      console.groupEnd();

      // JSON parsing failed
      throw new ApiError(
        "Invalid response from server. Please try again later.",
        response.status,
        error
      );
    }

    // Log response details
    console.group(`✅ API Response: ${method} ${endpoint}`);
    console.log("📊 Status:", response.status, response.statusText);
    console.log("📥 Response Data:", data);
    console.groupEnd();

    if (!response.ok) {
      // Extract error message from API response
      const errorMessage =
        data.message ||
        data.errors?.join(", ") ||
        `Request failed with status ${response.status}`;
      
      console.group(`❌ API Error: ${method} ${endpoint}`);
      console.log("📊 Status:", response.status, response.statusText);
      console.log("📍 Full URL:", url);
      console.log("📥 Error Data:", data);
      console.log("💬 Error Message:", errorMessage);
      
      // Additional debugging for 404 errors
      if (response.status === 404) {
        console.warn("⚠️ 404 Error - Possible causes:");
        console.warn("  1. The endpoint doesn't exist on the backend server");
        console.warn("  2. The API route path might be different");
        console.warn("  3. The backend server might not be running");
        console.warn("  4. CORS might be blocking the request");
        console.warn(`  Expected endpoint: ${url}`);
      }
      console.groupEnd();
      
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient(FULL_API_URL);

