import { apiClient } from "@/lib/api-client";
import {
  ApiResponse,
  AuthResponse,
  SignInDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "@/types/api";

export const identityApi = {
  signIn: async (credentials: SignInDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/identity/sign-in",
      credentials
    );
    if (!response.data || response.data.length === 0) {
      throw new Error("Invalid response from server");
    }
    return response.data[0];
  },

  register: async (userData: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/identity/register",
      userData
    );
    if (!response.data || response.data.length === 0) {
      throw new Error("Invalid response from server");
    }
    return response.data[0];
  },

  forgotPassword: async (data: ForgotPasswordDto): Promise<ApiResponse<void>> => {
    return await apiClient.post<void>("/identity/forgot-password", data);
  },

  resetPassword: async (data: ResetPasswordDto): Promise<ApiResponse<void>> => {
    return await apiClient.post<void>("/identity/reset-password", data);
  },
};

