import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api/attendance";
import {
  AttendanceFilters,
  CreateAttendanceDto,
  CreateHolidayDto,
  AttendanceRecord,
  Holiday,
} from "@/types/api";
import { getErrorMessage } from "@/lib/errors";

export function useAttendanceRecords(filters?: AttendanceFilters) {
  return useQuery({
    queryKey: ["attendance", "records", filters],
    queryFn: async () => {
      console.log("🔄 useAttendanceRecords: Fetching with filters:", filters);
      const result = await attendanceApi.getAttendanceRecords(filters);
      console.log("✅ useAttendanceRecords: Received data:", result);
      return result;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: true, // Always enabled
  });
}

export function useAttendanceStats(userId?: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ["attendance", "stats", userId, from, to],
    queryFn: () => attendanceApi.getAttendanceStats(userId, from, to),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useHolidays(from?: string, to?: string) {
  return useQuery({
    queryKey: ["attendance", "holidays", from, to],
    queryFn: () => attendanceApi.getHolidays(from, to),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttendanceDto) => attendanceApi.createOrUpdateAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      console.log("Attendance created/updated successfully");
    },
    onError: (error: Error) => {
      console.error("Create attendance error:", getErrorMessage(error));
    },
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHolidayDto) => attendanceApi.createHoliday(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", "holidays"] });
      console.log("Holiday created successfully");
    },
    onError: (error: Error) => {
      console.error("Create holiday error:", getErrorMessage(error));
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (holidayId: string) => attendanceApi.deleteHoliday(holidayId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", "holidays"] });
      console.log("Holiday deleted successfully");
    },
    onError: (error: Error) => {
      console.error("Delete holiday error:", getErrorMessage(error));
    },
  });
}

