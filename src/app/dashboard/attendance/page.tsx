"use client";

import { useState } from "react";
import { useAttendanceRecords, useAttendanceStats, useHolidays, useCreateAttendance, useCreateHoliday, useDeleteHoliday } from "@/hooks/use-attendance";
import { AttendanceStatus, Department } from "@/types/api";
import ErrorAlert from "@/components/ErrorAlert";
import { getErrorMessage } from "@/lib/errors";

export default function AttendancePage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "">("");
  const [departmentFilter, setDepartmentFilter] = useState<Department | "">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeTab, setActiveTab] = useState<"records" | "stats" | "holidays">("records");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual entry form state
  const [manualEntry, setManualEntry] = useState({
    userId: "",
    date: "",
    checkIn: "",
    checkOut: "",
    notes: "",
  });

  // Holiday form state
  const [holidayForm, setHolidayForm] = useState({
    name: "",
    date: "",
    isRecurring: false,
    description: "",
  });

  const filters = {
    page,
    limit,
    ...(statusFilter && { status: statusFilter }),
    ...(departmentFilter && { department: departmentFilter }),
    ...(fromDate && { from: fromDate }),
    ...(toDate && { to: toDate }),
  };

  const { data: attendanceData, isLoading, error, refetch, isRefetching } = useAttendanceRecords(filters);
  const { data: statsData } = useAttendanceStats(undefined, fromDate || undefined, toDate || undefined);
  const { data: holidaysData, refetch: refetchHolidays } = useHolidays();
  const createAttendanceMutation = useCreateAttendance();
  const createHolidayMutation = useCreateHoliday();
  const deleteHolidayMutation = useDeleteHoliday();

  // Debug logging
  if (typeof window !== "undefined") {
    console.log("📊 Attendance Page State:", {
      filters,
      isLoading,
      error: error ? getErrorMessage(error) : null,
      hasData: !!attendanceData,
      recordsCount: attendanceData?.data.data?.length || 0,
    });
  }

  const handleCreateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await createAttendanceMutation.mutateAsync({
        userId: manualEntry.userId,
        date: manualEntry.date,
        checkIn: manualEntry.checkIn || undefined,
        checkOut: manualEntry.checkOut || undefined,
        notes: manualEntry.notes || undefined,
      });

      setSuccessMessage("Attendance recorded successfully");
      setShowManualEntry(false);
      setManualEntry({ userId: "", date: "", checkIn: "", checkOut: "", notes: "" });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await createHolidayMutation.mutateAsync({
        name: holidayForm.name,
        date: holidayForm.date,
        isRecurring: holidayForm.isRecurring,
        description: holidayForm.description || undefined,
      });

      setSuccessMessage("Holiday created successfully");
      setShowHolidayForm(false);
      setHolidayForm({ name: "", date: "", isRecurring: false, description: "" });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleMarkTodayAsHoliday = async () => {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0]; // YYYY-MM-DD format
    const todayFormatted = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Check if today is a weekend (Saturday = 6, Sunday = 0)
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      setErrorMessage("Cannot mark weekends as holidays. Weekends are automatically handled by the system.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await createHolidayMutation.mutateAsync({
        name: `Holiday - ${todayFormatted}`,
        date: todayString,
        isRecurring: false,
        description: `Holiday marked on ${todayFormatted}`,
      });

      setSuccessMessage(`Today (${todayFormatted}) marked as holiday successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  // Check if today is a weekend
  const isTodayWeekend = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  };

  const handleDeleteHoliday = async (holidayId: string) => {
    if (!confirm("Are you sure you want to delete this holiday?")) return;

    setErrorMessage(null);
    try {
      await deleteHolidayMutation.mutateAsync(holidayId);
      setSuccessMessage("Holiday deleted successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const formatTime = (dateTime: string | null): string => {
    if (!dateTime) return "—";
    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date time:", dateTime);
        return "—";
      }
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", dateTime, error);
      return "—";
    }
  };

  const formatDate = (date: string): string => {
    if (!date) return "—";
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        console.warn("Invalid date:", date);
        return "—";
      }
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", date, error);
      return "—";
    }
  };

  const getStatusColor = (status: AttendanceStatus): string => {
    const colors: Record<AttendanceStatus, string> = {
      [AttendanceStatus.PRESENT]: "bg-success-100 text-success-800",
      [AttendanceStatus.ABSENT]: "bg-danger-100 text-danger-800",
      [AttendanceStatus.LATE]: "bg-warning-100 text-warning-800",
      [AttendanceStatus.EARLY_DEPARTURE]: "bg-warning-100 text-warning-800",
      [AttendanceStatus.HALF_DAY]: "bg-info-100 text-info-800",
      [AttendanceStatus.HOLIDAY]: "bg-purple-100 text-purple-800",
      [AttendanceStatus.WEEKEND]: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: AttendanceStatus): string => {
    const labels: Record<AttendanceStatus, string> = {
      [AttendanceStatus.PRESENT]: "Present",
      [AttendanceStatus.ABSENT]: "Absent",
      [AttendanceStatus.LATE]: "Late",
      [AttendanceStatus.EARLY_DEPARTURE]: "Early Departure",
      [AttendanceStatus.HALF_DAY]: "Half Day",
      [AttendanceStatus.HOLIDAY]: "Holiday",
      [AttendanceStatus.WEEKEND]: "Weekend",
    };
    return labels[status] || status;
  };

  const getRowTone = (status: AttendanceStatus): string => {
    const tones: Record<AttendanceStatus, string> = {
      [AttendanceStatus.PRESENT]: "bg-success-50",
      [AttendanceStatus.ABSENT]: "bg-danger-50/60",
      [AttendanceStatus.LATE]: "bg-warning-50",
      [AttendanceStatus.EARLY_DEPARTURE]: "bg-warning-50/70",
      [AttendanceStatus.HALF_DAY]: "bg-info-50",
      [AttendanceStatus.HOLIDAY]: "bg-purple-50",
      [AttendanceStatus.WEEKEND]: "bg-gray-50",
    };
    return tones[status] || "";
  };

  const getDayInfo = (dateStr: string): { label: string; className: string } => {
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) {
        return { label: "—", className: "bg-gray-100 text-gray-600" };
      }
      const day = dateObj.getDay();
      const label = dateObj.toLocaleDateString("en-US", { weekday: "short" });

      if (day === 0 || day === 6) {
        return { label, className: "bg-gray-100 text-gray-700" };
      }
      if (day === 5) {
        return { label, className: "bg-warning-100 text-warning-800" };
      }
      return { label, className: "bg-primary-100 text-primary-800" };
    } catch {
      return { label: "—", className: "bg-gray-100 text-gray-600" };
    }
  };

  const getTimeColor = (time: string | null): string => {
    if (!time) return "text-text-secondary";
    return "text-success-700";
  };

  const records = attendanceData?.data.data || [];
  const pagination = attendanceData?.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };
  const stats = statsData?.data;
  const holidays = holidaysData?.data || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Track and manage employee attendance records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManualEntry(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface/80"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Manual Entry
          </button>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className={`h-5 w-5 ${isRefetching ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="rounded-lg border border-success-200 bg-success-50 p-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-success-800">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && <ErrorAlert message={errorMessage} variant="error" />}

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab("records")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "records"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-text-secondary hover:text-foreground"
            }`}
          >
            Records
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "stats"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-text-secondary hover:text-foreground"
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab("holidays")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "holidays"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-text-secondary hover:text-foreground"
            }`}
          >
            Holidays
          </button>
        </nav>
      </div>

      {/* Records Tab */}
      {activeTab === "records" && (
        <>
          {/* Filters */}
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as AttendanceStatus | "");
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">All Statuses</option>
                  {Object.values(AttendanceStatus).map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Department
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value as Department | "");
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">All Departments</option>
                  {Object.values(Department).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                <p className="mt-4 text-sm text-text-secondary">Loading attendance records...</p>
              </div>
            </div>
          ) : error ? (
            <ErrorAlert message={getErrorMessage(error)} variant="error" />
          ) : (
            <div className="rounded-lg border border-border bg-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Check In
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Check Out
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Hours
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Late/Early
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-sm text-text-secondary">
                          No attendance records found
                        </td>
                      </tr>
                    ) : (
                      records.map((record) => (
                        <tr key={record.id} className="hover:bg-surface/50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            {record.user
                              ? `${record.user.firstName} ${record.user.lastName}`
                              : record.userId}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {record.user?.department || "—"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {formatTime(record.checkIn)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {formatTime(record.checkOut)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {record.totalHours ? `${record.totalHours.toFixed(1)}h` : "—"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                                record.status
                              )}`}
                            >
                              {getStatusLabel(record.status)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {record.minutesLate
                              ? `${record.minutesLate}m late`
                              : record.minutesEarly
                              ? `${record.minutesEarly}m early`
                              : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
              <div className="text-sm text-text-secondary">
                Showing <span className="font-medium text-foreground">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-medium text-foreground">{Math.min(page * limit, pagination.total)}</span> of{" "}
                <span className="font-medium text-foreground">{pagination.total}</span> records
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="text-sm text-text-secondary">
                  Page <span className="font-medium text-foreground">{page}</span> of{" "}
                  <span className="font-medium text-foreground">{pagination.totalPages}</span>
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages || isLoading}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Statistics Tab */}
      {activeTab === "stats" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats ? (
            <>
              <div className="rounded-lg border border-border bg-surface p-6">
                <div className="text-sm font-medium text-text-secondary">Total Days</div>
                <div className="mt-2 text-3xl font-bold text-foreground">{stats.totalDays}</div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-6">
                <div className="text-sm font-medium text-text-secondary">Working Days</div>
                <div className="mt-2 text-3xl font-bold text-foreground">{stats.workingDays}</div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-6">
                <div className="text-sm font-medium text-text-secondary">Present</div>
                <div className="mt-2 text-3xl font-bold text-success-600">{stats.present}</div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-6">
                <div className="text-sm font-medium text-text-secondary">Absent</div>
                <div className="mt-2 text-3xl font-bold text-danger-600">{stats.absent}</div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-6">
                <div className="text-sm font-medium text-text-secondary">Late</div>
                <div className="mt-2 text-3xl font-bold text-warning-600">{stats.late}</div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-6">
                <div className="text-sm font-medium text-text-secondary">Early Departure</div>
                <div className="mt-2 text-3xl font-bold text-warning-600">{stats.earlyDeparture}</div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-6">
                <div className="text-sm font-medium text-text-secondary">Half Day</div>
                <div className="mt-2 text-3xl font-bold text-info-600">{stats.halfDay}</div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-6">
                <div className="text-sm font-medium text-text-secondary">Attendance %</div>
                <div className="mt-2 text-3xl font-bold text-primary-600">
                  {stats.attendancePercentage.toFixed(1)}%
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-6">
                <div className="text-sm font-medium text-text-secondary">Avg Hours/Day</div>
                <div className="mt-2 text-3xl font-bold text-foreground">
                  {stats.averageHoursPerDay.toFixed(1)}h
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-6">
                <div className="text-sm font-medium text-text-secondary">Holidays</div>
                <div className="mt-2 text-3xl font-bold text-purple-600">{stats.holidays}</div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-6">
                <div className="text-sm font-medium text-text-secondary">Weekends</div>
                <div className="mt-2 text-3xl font-bold text-gray-600">{stats.weekends}</div>
              </div>
            </>
          ) : (
            <div className="col-span-full flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                <p className="mt-4 text-sm text-text-secondary">Loading statistics...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Holidays Tab */}
      {activeTab === "holidays" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Holidays</h2>
            <div className="flex items-center gap-2">
              {isTodayWeekend() ? (
                <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Weekend
                </div>
              ) : (
                <button
                  onClick={handleMarkTodayAsHoliday}
                  disabled={createHolidayMutation.isPending}
                  className="flex items-center gap-2 rounded-lg border border-primary-500 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Mark today as a holiday instantly"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark Today
                </button>
              )}
              <button
                onClick={() => setShowHolidayForm(true)}
                className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Holiday
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Recurring
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {holidays.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-text-secondary">
                        No holidays found
                      </td>
                    </tr>
                  ) : (
                    holidays.map((holiday) => (
                      <tr key={holiday.id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {holiday.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {formatDate(holiday.date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {holiday.isRecurring ? (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary-100 text-primary-800">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-text-secondary max-w-[300px]">
                          <div className="truncate" title={holiday.description || undefined}>
                            {holiday.description || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeleteHoliday(holiday.id)}
                            disabled={deleteHolidayMutation.isPending}
                            className="text-danger-600 hover:text-danger-700 disabled:opacity-50"
                            title="Delete holiday"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Manual Attendance Entry</h2>
              <button
                onClick={() => setShowManualEntry(false)}
                className="text-text-secondary hover:text-foreground"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateAttendance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  required
                  value={manualEntry.userId}
                  onChange={(e) => setManualEntry({ ...manualEntry, userId: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="BTL-25-11-13"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={manualEntry.date}
                  onChange={(e) => setManualEntry({ ...manualEntry, date: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Check In Time
                </label>
                <input
                  type="datetime-local"
                  value={manualEntry.checkIn}
                  onChange={(e) => setManualEntry({ ...manualEntry, checkIn: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Check Out Time
                </label>
                <input
                  type="datetime-local"
                  value={manualEntry.checkOut}
                  onChange={(e) => setManualEntry({ ...manualEntry, checkOut: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={manualEntry.notes}
                  onChange={(e) => setManualEntry({ ...manualEntry, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowManualEntry(false)}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAttendanceMutation.isPending}
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                >
                  {createAttendanceMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Holiday Form Modal */}
      {showHolidayForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Add Holiday</h2>
              <button
                onClick={() => setShowHolidayForm(false)}
                className="text-text-secondary hover:text-foreground"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateHoliday} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Holiday Name
                </label>
                <input
                  type="text"
                  required
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Christmas Day"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={holidayForm.date}
                  onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={holidayForm.isRecurring}
                  onChange={(e) => setHolidayForm({ ...holidayForm, isRecurring: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary-500 focus:ring-primary-500"
                />
                <label htmlFor="recurring" className="text-sm font-medium text-foreground">
                  Recurring (repeats every year)
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={holidayForm.description}
                  onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Holiday description..."
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowHolidayForm(false)}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createHolidayMutation.isPending}
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                >
                  {createHolidayMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

