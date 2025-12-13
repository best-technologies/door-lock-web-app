import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, AuthResponse } from "@/types/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (authData: AuthResponse) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
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
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

