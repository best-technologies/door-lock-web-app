import { useAuthStore } from "@/store/auth-store";

/**
 * Convenience hook to access auth state
 * Returns user, isAuthenticated, and auth actions
 */
export function useAuthState() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const updateUser = useAuthStore((state) => state.updateUser);

  return {
    user,
    isAuthenticated,
    accessToken,
    hasHydrated,
    setAuth,
    clearAuth,
    updateUser,
  };
}

