"use client";

import Link from "next/link";
import { TodayAttendance, AttendanceStatus } from "@/types/api";

interface AttendanceOverviewProps {
  records: TodayAttendance[];
}

export default function AttendanceOverview({ records }: AttendanceOverviewProps) {
  const sortedRecords = [...records].sort((a, b) => {
    const aTime =
      a.checkIn && a.checkIn !== "-" ? new Date(a.checkIn).getTime() : new Date(a.date).getTime();
    const bTime =
      b.checkIn && b.checkIn !== "-" ? new Date(b.checkIn).getTime() : new Date(b.date).getTime();
    return bTime - aTime; // latest check-in first
  });

  const getStatusBadge = (status: AttendanceStatus) => {
    const statusClasses: Record<AttendanceStatus, string> = {
      [AttendanceStatus.PRESENT]: "bg-gradient-to-r from-success-500 to-success-600 text-white shadow-sm",
      [AttendanceStatus.LATE]: "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm",
      [AttendanceStatus.ABSENT]: "bg-gradient-to-r from-danger-500 to-danger-600 text-white shadow-sm",
      [AttendanceStatus.EARLY_DEPARTURE]: "bg-gradient-to-r from-warning-500 to-warning-600 text-white shadow-sm",
      [AttendanceStatus.HALF_DAY]: "bg-gradient-to-r from-info-500 to-info-600 text-white shadow-sm",
      [AttendanceStatus.HOLIDAY]: "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm",
      [AttendanceStatus.WEEKEND]: "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm",
    };
    
    const statusLabels: Record<AttendanceStatus, string> = {
      [AttendanceStatus.PRESENT]: "Present",
      [AttendanceStatus.LATE]: "Late",
      [AttendanceStatus.ABSENT]: "Absent",
      [AttendanceStatus.EARLY_DEPARTURE]: "Early Departure",
      [AttendanceStatus.HALF_DAY]: "Half Day",
      [AttendanceStatus.HOLIDAY]: "Holiday",
      [AttendanceStatus.WEEKEND]: "Weekend",
    };
    
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
          statusClasses[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Since today's attendance is all for the same date, we can simplify the date display
  const displayDate = records.length > 0 ? formatDate(records[0].date) : "Today";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
      <div className="border-b border-border bg-gradient-to-r from-success-50 to-transparent px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-success-500 to-success-600">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground">Today's Attendance</h3>
          </div>
          <Link
            href="/dashboard/attendance"
            className="rounded-lg bg-success-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-success-600 hover:shadow-md"
          >
            View all
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-transparent">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">
                Check In
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">
                Check Out
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
          {sortedRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <p className="mt-4 text-sm font-medium text-text-secondary">
                    No attendance records for today
                  </p>
                </td>
              </tr>
            ) : (
              sortedRecords.map((record) => (
                <tr
                  key={record.id}
                  className="transition-colors hover:bg-gradient-to-r hover:from-success-50/50 hover:to-transparent"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                    {formatDate(record.date)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                    {record.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {record.checkIn === "-" ? "—" : record.checkIn}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {record.checkOut === "-" ? "—" : record.checkOut}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {getStatusBadge(record.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

