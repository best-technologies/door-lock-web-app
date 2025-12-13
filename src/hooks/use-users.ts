import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";
import {
  UsersFilters,
  UpdateUserRoleDto,
  UpdateUserRoleResponse,
  UpdateUserDto,
  UpdateUserResponse,
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

