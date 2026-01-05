"use client";

import { RecentUser } from "@/types/api";
import Link from "next/link";

interface UsersTableProps {
  users: RecentUser[];
}

export default function UsersTable({ users }: UsersTableProps) {
  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: "bg-gradient-to-r from-success-500 to-success-600 text-white shadow-sm",
      suspended: "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm",
      terminated: "bg-gradient-to-r from-danger-500 to-danger-600 text-white shadow-sm",
    };
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
          statusClasses[status as keyof typeof statusClasses] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      admin: "bg-gradient-to-r from-primary-500 to-primary-600 text-white",
      staff: "bg-gradient-to-r from-info-500 to-info-600 text-white",
      user: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
    };
    const roleColor = roleColors[role.toLowerCase()] || "bg-primary-100 text-primary-700";
    
    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${roleColor}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
      <div className="border-b border-border bg-gradient-to-r from-primary-50 to-transparent px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground">Recent Users</h3>
          </div>
          <Link
            href="/dashboard/users"
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-600 hover:shadow-md"
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
                User ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">
                Department
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <p className="mt-4 text-sm font-medium text-text-secondary">No users found</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.userId}
                  className="transition-colors hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-transparent"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-foreground">
                    {user.userId}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                    {user.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {user.department || "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Link
                      href={`/dashboard/users/${user.userId}`}
                      className="rounded-lg bg-primary-100 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-all hover:bg-primary-200 hover:shadow-sm"
                    >
                      View
                    </Link>
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

