import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { identityApi } from "@/lib/api/identity";
import { SignInDto, RegisterDto, AuthResponse } from "@/types/api";

export function useSignIn() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: SignInDto) => identityApi.signIn(credentials),
    onSuccess: (data: AuthResponse) => {
      setAuth(data);
      queryClient.invalidateQueries();
      router.push("/");
    },
    onError: (error: Error) => {
      console.error("Sign in error:", error);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (userData: RegisterDto) => identityApi.register(userData),
    onSuccess: (data: AuthResponse) => {
      setAuth(data);
      queryClient.invalidateQueries();
      // Note: Password is auto-generated and sent via email
      router.push("/");
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return () => {
    // Clear all auth state (this also clears localStorage and sessionStorage)
    clearAuth();
    
    // Clear all React Query cache and queries
    queryClient.clear();
    queryClient.removeQueries();
    
    // Clear any persisted query cache from localStorage
    if (typeof window !== "undefined") {
      // Clear all React Query/TanStack Query related localStorage items
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("react-query") ||
            key.startsWith("tanstack-query") ||
            key === "REACT_QUERY_OFFLINE_CACHE")
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }
    
    // Redirect to landing page
    router.push("/");
  };
}

