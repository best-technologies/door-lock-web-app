import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";
import {
  UsersFilters,
  UpdateUserRoleDto,
  UpdateUserResponse,
  UpdateUserDto,
  UpdateUserRoleResponse,
  EnrollUserDto,
  EnrollUserResponse,
  AddRfidTagDto,
  AddRfidTagResponse,
  RegisterFingerprintDto,
  RegisterFingerprintResponse,
  SetKeypadPinDto,
  SetKeypadPinResponse,
} from "@/types/api";
import { getErrorMessage } from "@/lib/errors";

export function useUsers(filters?: UsersFilters) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => usersApi.getAllUsers(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: UpdateUserRoleDto["role"];
    }) => usersApi.updateUserRole(userId, { role }),
    onSuccess: (data: UpdateUserRoleResponse) => {
      // Invalidate users queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      console.log("User role updated successfully:", data.message);
    },
    onError: (error: Error) => {
      console.error("Update user role error:", getErrorMessage(error));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      userData,
    }: {
      userId: string;
      userData: UpdateUserDto;
    }) => usersApi.updateUser(userId, userData),
    onSuccess: (data: UpdateUserResponse) => {
      // Invalidate users queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      console.log("User updated successfully:", data.message);
    },
    onError: (error: Error) => {
      console.error("Update user error:", getErrorMessage(error));
    },
  });
}

export function useEnrollUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: EnrollUserDto) => usersApi.enrollUser(userData),
    onSuccess: (data: EnrollUserResponse) => {
      // Invalidate users queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      console.log("User enrolled successfully:", data.message);
    },
    onError: (error: Error) => {
      console.error("Enroll user error:", getErrorMessage(error));
    },
  });
}

export function useAddRfidTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, tagData }: { userId: string; tagData: AddRfidTagDto }) =>
      usersApi.addRfidTag(userId, tagData),
    onSuccess: (data: AddRfidTagResponse) => {
      // Invalidate users queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      console.log("RFID tag added successfully:", data.message);
    },
    onError: (error: Error) => {
      console.error("Add RFID tag error:", getErrorMessage(error));
    },
  });
}

export function useRegisterFingerprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, fingerprintData }: { userId: string; fingerprintData: RegisterFingerprintDto }) =>
      usersApi.registerFingerprint(userId, fingerprintData),
    onSuccess: (data: RegisterFingerprintResponse) => {
      // Invalidate users queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      console.log("Fingerprint registered successfully:", data.message);
    },
    onError: (error: Error) => {
      console.error("Register fingerprint error:", getErrorMessage(error));
    },
  });
}

export function useSetKeypadPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, pinData }: { userId: string; pinData: SetKeypadPinDto }) =>
      usersApi.setKeypadPin(userId, pinData),
    onSuccess: (data: SetKeypadPinResponse) => {
      // Invalidate users queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      console.log("Keypad PIN set successfully:", data.message);
    },
    onError: (error: Error) => {
      console.error("Set keypad PIN error:", getErrorMessage(error));
    },
  });
}

