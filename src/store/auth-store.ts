import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, AuthResponse } from "@/types/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (authData: AuthResponse) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (authData: AuthResponse) => {
        // Store token in localStorage for API client
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", authData.accessToken);
        }
        set({
          user: authData.user,
          accessToken: authData.accessToken,
          isAuthenticated: true,
        });
      },
      clearAuth: () => {
        if (typeof window !== "undefined") {
          // Clear access token
          localStorage.removeItem("accessToken");
          // Clear all auth-related localStorage items
          localStorage.removeItem("auth-storage");
          // Clear any other potential stored data
          localStorage.removeItem("user");
          // Clear sessionStorage as well
          sessionStorage.clear();
        }
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },
      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        // Don't persist _hasHydrated
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error rehydrating auth store:", error);
        }
        // Mark as hydrated after rehydration completes
        if (state) {
          state.setHasHydrated(true);
        } else {
          // If no state, still mark as hydrated (no stored data)
          useAuthStore.getState().setHasHydrated(true);
        }
      },
    }
  )
);

// Initialize hydration state on mount (client-side only)
if (typeof window !== "undefined") {
  // Check if store has already been hydrated
  const checkHydration = () => {
    const state = useAuthStore.getState();
    if (!state._hasHydrated) {
      // If not hydrated yet, check localStorage
      try {
        const stored = localStorage.getItem("auth-storage");
        if (stored) {
          // If we have stored data, wait for persist to hydrate
          // Otherwise mark as hydrated immediately
          setTimeout(() => {
            if (!useAuthStore.getState()._hasHydrated) {
              useAuthStore.getState().setHasHydrated(true);
            }
          }, 100);
        } else {
          // No stored data, mark as hydrated immediately
          state.setHasHydrated(true);
        }
      } catch {
        // On error, mark as hydrated
        state.setHasHydrated(true);
      }
    }
  };
  
  // Run check after a short delay to allow persist to initialize
  setTimeout(checkHydration, 0);
}

