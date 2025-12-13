"use client";

import Link from "next/link";
import { TodayAttendance, AttendanceStatus } from "@/types/api";

interface AttendanceOverviewProps {
  records: TodayAttendance[];
}

export default function AttendanceOverview({ records }: AttendanceOverviewProps) {
  const getStatusBadge = (status: AttendanceStatus) => {
    const statusClasses: Record<AttendanceStatus, string> = {
      [AttendanceStatus.PRESENT]: "bg-success-100 text-success-700",
      [AttendanceStatus.LATE]: "bg-orange-100 text-orange-700",
      [AttendanceStatus.ABSENT]: "bg-danger-100 text-danger-700",
      [AttendanceStatus.EARLY_DEPARTURE]: "bg-warning-100 text-warning-700",
      [AttendanceStatus.HALF_DAY]: "bg-info-100 text-info-700",
      [AttendanceStatus.HOLIDAY]: "bg-primary-100 text-primary-700",
      [AttendanceStatus.WEEKEND]: "bg-gray-100 text-gray-700",
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
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
    <div className="rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Today's Attendance</h3>
          <Link
            href="/dashboard/attendance"
            className="text-sm font-medium text-primary-500 hover:text-primary-600"
          >
            View all
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Check In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Check Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-text-secondary">
                  No attendance records for today
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-surface/50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                    {formatDate(record.date)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
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

