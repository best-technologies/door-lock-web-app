import { useAuthStore } from "@/store/auth-store";

/**
 * Handles 401 responses by clearing auth state and redirecting to login.
 * Does NOT redirect if already on an auth page (login, register, etc.) to prevent infinite loops.
 */
export function handleUnauthorized(response: Response) {
  if (response.status !== 401 || typeof window === "undefined") return;

  // Check if we're already on an auth page
  const currentPath = window.location.pathname;
  const isOnAuthPage = currentPath.startsWith("/auth/");

  // If we're already on an auth page, don't redirect - let the form handle the error
  if (isOnAuthPage) {
    return;
  }

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

  // Redirect to login only if we're not already on an auth page
  window.location.replace("/auth/login");
}

