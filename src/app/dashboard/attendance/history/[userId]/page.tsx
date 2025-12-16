"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAttendanceHistory } from "@/hooks/use-attendance";
import { AttendanceStatus } from "@/types/api";
import { getErrorMessage } from "@/lib/errors";

function formatDate(date: string) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateTime: string | null) {
  if (!dateTime) return "—";
  const d = new Date(dateTime);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getStatusColor(status: AttendanceStatus) {
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
}

export default function AttendanceHistoryPage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<AttendanceStatus | "">("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const filters = useMemo(
    () => ({
      from: from || undefined,
      to: to || undefined,
      status: (status as AttendanceStatus) || undefined,
      page,
      limit,
    }),
    [from, to, status, page, limit]
  );

  const { data, isLoading, error, refetch, isRefetching } = useAttendanceHistory(userId, filters);

  const records = data?.data.data ?? [];
  const pagination = data?.data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance History</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Viewing history for user: <span className="font-mono text-foreground">{userId}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/attendance"
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-surface"
          >
            ← Back to Attendance
          </Link>
          <button
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface/80 disabled:opacity-50"
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

      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">From Date</label>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">To Date</label>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as AttendanceStatus | "");
                setPage(1);
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              {Object.values(AttendanceStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-4 text-sm text-text-secondary">Loading attendance history...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-danger-800">
          {getErrorMessage(error)}
        </div>
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
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-text-secondary">
                      No history found
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-success-700">
                        {formatTime(record.checkIn)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-success-700">
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
                          {record.status}
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

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
          <div className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-medium text-foreground">{(pagination.page - 1) * limit + 1}</span> to{" "}
            <span className="font-medium text-foreground">
              {Math.min(pagination.page * limit, pagination.total)}
            </span>{" "}
            of <span className="font-medium text-foreground">{pagination.total}</span> records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page === 1 || isLoading}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="text-sm text-text-secondary">
              Page <span className="font-medium text-foreground">{pagination.page}</span> of{" "}
              <span className="font-medium text-foreground">{pagination.totalPages}</span>
            </div>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page === pagination.totalPages || isLoading}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

