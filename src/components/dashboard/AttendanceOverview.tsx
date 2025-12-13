"use client";

import Link from "next/link";

interface AttendanceRecord {
  date: string;
  userId: string;
  name: string;
  checkIn: string;
  checkOut: string | null;
  status: "present" | "late" | "absent";
}

interface AttendanceOverviewProps {
  records: AttendanceRecord[];
}

export default function AttendanceOverview({ records }: AttendanceOverviewProps) {
  const getStatusBadge = (status: string) => {
    const statusClasses = {
      present: "bg-success-100 text-success-700",
      late: "bg-orange-100 text-orange-700",
      absent: "bg-danger-100 text-danger-700",
    };
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
          statusClasses[status as keyof typeof statusClasses] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
              records.map((record, index) => (
                <tr key={index} className="hover:bg-surface/50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                    {formatDate(record.date)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                    {record.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {record.checkIn || "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {record.checkOut || "—"}
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

