"use client";

import { RecentUser } from "@/types/api";
import Link from "next/link";

interface UsersTableProps {
  users: RecentUser[];
}

export default function UsersTable({ users }: UsersTableProps) {
  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: "bg-success-100 text-success-700",
      suspended: "bg-orange-100 text-orange-700",
      terminated: "bg-danger-100 text-danger-700",
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

  const getRoleBadge = (role: string) => {
    return (
      <span className="inline-flex rounded-md bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Recent Users</h3>
          <Link
            href="/dashboard/users"
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
                User ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-text-secondary">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.userId} className="hover:bg-surface/50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                    {user.userId}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
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
                      className="text-primary-500 hover:text-primary-600"
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

