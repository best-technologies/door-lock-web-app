import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { identityApi } from "@/lib/api/identity";
import { ForgotPasswordDto, ResetPasswordDto } from "@/types/api";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordDto) => identityApi.forgotPassword(data),
    onError: (error: Error) => {
      console.error("Forgot password error:", error);
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ResetPasswordDto) => identityApi.resetPassword(data),
    onSuccess: () => {
      // Redirect to login after successful password reset
      router.push("/auth/login?reset=success");
    },
    onError: (error: Error) => {
      console.error("Reset password error:", error);
    },
  });
}

