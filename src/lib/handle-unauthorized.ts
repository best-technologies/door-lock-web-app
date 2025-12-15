import { useAuthStore } from "@/store/auth-store";

/**
 * Handles 401 responses by clearing auth state and redirecting to login.
 */
export function handleUnauthorized(response: Response) {
  if (response.status !== 401 || typeof window === "undefined") return;

  try {
    // Clear global auth store (also clears storage)
    useAuthStore.getState().clearAuth();
  } catch {
    // Fallback: clear storage manually
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("auth-storage");
      sessionStorage.clear();
    } catch {
      // ignore
    }
  }

  // Redirect to login
  window.location.replace("/auth/login");
}

