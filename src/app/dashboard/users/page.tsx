"use client";

import { useState } from "react";
import { useUsers, useUpdateUser, useUpdateUserRole } from "@/hooks/use-users";
import { UserRole, UserStatus, Department, UserDetails } from "@/types/api";
import ErrorAlert from "@/components/ErrorAlert";
import { getErrorMessage } from "@/lib/errors";

interface EditingState {
  userId: string;
  field: "name" | "email" | "role" | "status" | "department";
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: Department | "";
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [departmentFilter, setDepartmentFilter] = useState<Department | "">("");
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [viewingUser, setViewingUser] = useState<UserDetails | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filters = {
    page,
    limit,
    ...(statusFilter && { status: statusFilter }),
    ...(roleFilter && { role: roleFilter }),
    ...(departmentFilter && { department: departmentFilter }),
  };

  const { data, isLoading, error, refetch, isRefetching } = useUsers(filters);
  const updateUserMutation = useUpdateUser();
  const updateRoleMutation = useUpdateUserRole();

  const startEditing = (
    user: UserDetails,
    field: EditingState["field"]
  ) => {
    setEditing({
      userId: user.userId,
      field,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department || "",
    });
    setErrorMessage(null);
  };

  const cancelEditing = () => {
    setEditing(null);
    setErrorMessage(null);
  };

  const saveEdit = async () => {
    if (!editing) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updateData: any = {};

      if (editing.field === "name") {
        updateData.firstName = editing.firstName;
        updateData.lastName = editing.lastName;
      } else if (editing.field === "email") {
        updateData.email = editing.email;
      } else if (editing.field === "role") {
        // Use the role-specific endpoint
        await updateRoleMutation.mutateAsync({
          userId: editing.userId,
          role: editing.role!,
        });
        setSuccessMessage("User role updated successfully");
        setEditing(null);
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      } else if (editing.field === "status") {
        updateData.status = editing.status;
      } else if (editing.field === "department") {
        updateData.department = editing.department || null;
      }

      await updateUserMutation.mutateAsync({
        userId: editing.userId,
        userData: updateData,
      });

      setSuccessMessage("User updated successfully");
      setEditing(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleDelete = async (userId: string) => {
    // TODO: Implement delete API call when backend endpoint is available
    setErrorMessage("Delete functionality not yet implemented");
    setDeleteConfirm(null);
  };

  const handleFilterChange = () => {
    setPage(1);
  };

  const clearFilters = () => {
    setStatusFilter("");
    setRoleFilter("");
    setDepartmentFilter("");
    setPage(1);
  };

  const hasActiveFilters = statusFilter || roleFilter || departmentFilter;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-sm text-text-secondary">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Manage all users in the system
            </p>
          </div>
        </div>
        <ErrorAlert message={getErrorMessage(error)} variant="error" />
      </div>
    );
  }

  const users = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Manage all users in the system
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh users list"
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
          <span className="hidden sm:inline">
            {isRefetching ? "Refreshing..." : "Refresh"}
          </span>
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-lg border border-success-200 bg-success-50 p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-success-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-success-800">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <ErrorAlert message={errorMessage} variant="error" />
      )}

      {/* Filters */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Status Filter */}
          <div className="flex-1 min-w-[150px]">
            <label
              htmlFor="status-filter"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as UserStatus | "");
                handleFilterChange();
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value={UserStatus.ACTIVE}>Active</option>
              <option value={UserStatus.SUSPENDED}>Suspended</option>
              <option value={UserStatus.TERMINATED}>Terminated</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex-1 min-w-[150px]">
            <label
              htmlFor="role-filter"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Role
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as UserRole | "");
                handleFilterChange();
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Roles</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.STAFF}>Staff</option>
              <option value={UserRole.INTERN}>Intern</option>
              <option value={UserRole.NYSC}>NYSC</option>
              <option value={UserRole.TRAINEE}>Trainee</option>
              <option value={UserRole.CONTRACTOR}>Contractor</option>
              <option value={UserRole.VISITOR}>Visitor</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex-1 min-w-[150px]">
            <label
              htmlFor="department-filter"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Department
            </label>
            <select
              id="department-filter"
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value as Department | "");
                handleFilterChange();
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

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider sticky left-0 bg-surface/50 z-10 min-w-[100px]">
                  User ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider min-w-[120px]">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider min-w-[150px]">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider min-w-[120px]">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider min-w-[100px]">
                  Emp ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider min-w-[80px]">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider min-w-[90px]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider min-w-[120px]">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider min-w-[100px]">
                  Access Level
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider min-w-[130px]">
                  Access Methods
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider min-w-[100px]">
                  RFID Tags
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider min-w-[110px]">
                  Fingerprints
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider min-w-[110px]">
                  Last Access
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider sticky right-0 bg-surface/50 z-10 min-w-[80px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={14}
                    className="px-6 py-12 text-center text-sm text-text-secondary"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isEditingName =
                    editing?.userId === user.userId && editing.field === "name";
                  const isEditingEmail =
                    editing?.userId === user.userId && editing.field === "email";
                  const isEditingRole =
                    editing?.userId === user.userId && editing.field === "role";
                  const isEditingStatus =
                    editing?.userId === user.userId && editing.field === "status";
                  const isEditingDept =
                    editing?.userId === user.userId &&
                    editing.field === "department";

                  return (
                    <tr
                      key={user.userId}
                      className="hover:bg-surface/50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-foreground sticky left-0 bg-surface z-10">
                        {user.userId}
                      </td>

                      {/* Name Column */}
                      <td className="px-4 py-4 max-w-[150px]">
                        <div className="truncate" title={`${user.firstName} ${user.lastName}`}>
                        {isEditingName ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editing.firstName || ""}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  firstName: e.target.value,
                                })
                              }
                              className="w-24 rounded border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-primary-500 focus:outline-none"
                              placeholder="First"
                            />
                            <input
                              type="text"
                              value={editing.lastName || ""}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  lastName: e.target.value,
                                })
                              }
                              className="w-24 rounded border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-primary-500 focus:outline-none"
                              placeholder="Last"
                            />
                            <button
                              onClick={saveEdit}
                              disabled={updateUserMutation.isPending}
                              className="text-success-600 hover:text-success-700 disabled:opacity-50"
                              title="Save"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-danger-600 hover:text-danger-700"
                              title="Cancel"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(user, "name")}
                            className="text-sm text-foreground hover:text-primary-500 transition-colors"
                          >
                            {user.firstName} {user.lastName}
                          </button>
                        )}
                        </div>
                      </td>

                      {/* Email Column */}
                      <td className="px-4 py-4 max-w-[200px]">
                        <div className="truncate" title={user.email}>
                        {isEditingEmail ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="email"
                              value={editing.email || ""}
                              onChange={(e) =>
                                setEditing({ ...editing, email: e.target.value })
                              }
                              className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-primary-500 focus:outline-none"
                            />
                            <button
                              onClick={saveEdit}
                              disabled={updateUserMutation.isPending}
                              className="text-success-600 hover:text-success-700 disabled:opacity-50"
                              title="Save"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-danger-600 hover:text-danger-700"
                              title="Cancel"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(user, "email")}
                            className="text-sm text-text-secondary hover:text-primary-500 transition-colors"
                          >
                            {user.email}
                          </button>
                        )}
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isEditingRole ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={editing.role || ""}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  role: e.target.value as UserRole,
                                })
                              }
                              className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary-500 focus:outline-none"
                            >
                              {Object.values(UserRole).map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={saveEdit}
                              disabled={updateRoleMutation.isPending}
                              className="text-success-600 hover:text-success-700 disabled:opacity-50"
                              title="Save"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-danger-600 hover:text-danger-700"
                              title="Cancel"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(user, "role")}
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors"
                          >
                            {user.role}
                          </button>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isEditingStatus ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={editing.status || ""}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  status: e.target.value as UserStatus,
                                })
                              }
                              className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary-500 focus:outline-none"
                            >
                              {Object.values(UserStatus).map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={saveEdit}
                              disabled={updateUserMutation.isPending}
                              className="text-success-600 hover:text-success-700 disabled:opacity-50"
                              title="Save"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-danger-600 hover:text-danger-700"
                              title="Cancel"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(user, "status")}
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                              user.status === UserStatus.ACTIVE
                                ? "bg-success-100 text-success-800 hover:bg-success-200"
                                : user.status === UserStatus.SUSPENDED
                                ? "bg-warning-100 text-warning-800 hover:bg-warning-200"
                                : "bg-danger-100 text-danger-800 hover:bg-danger-200"
                            }`}
                          >
                            {user.status}
                          </button>
                        )}
                      </td>

                      {/* Phone Column */}
                      <td className="px-4 py-4 max-w-[120px] text-sm text-text-secondary">
                        <div className="truncate" title={user.phoneNumber || undefined}>
                          {user.phoneNumber || "—"}
                        </div>
                      </td>

                      {/* Employee ID Column */}
                      <td className="px-4 py-4 max-w-[100px] text-sm text-text-secondary">
                        <div className="truncate" title={user.employeeId || undefined}>
                          {user.employeeId || "—"}
                        </div>
                      </td>

                      {/* Role Column - already exists above */}
                      {/* Status Column - already exists above */}
                      
                      {/* Department Column */}
                      <td className="px-4 py-4 max-w-[120px]">
                        {isEditingDept ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={editing.department || ""}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  department: e.target.value as Department | "",
                                })
                              }
                              className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary-500 focus:outline-none"
                            >
                              <option value="">None</option>
                              {Object.values(Department).map((dept) => (
                                <option key={dept} value={dept}>
                                  {dept}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={saveEdit}
                              disabled={updateUserMutation.isPending}
                              className="text-success-600 hover:text-success-700 disabled:opacity-50"
                              title="Save"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-danger-600 hover:text-danger-700"
                              title="Cancel"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="truncate" title={user.department || undefined}>
                            <button
                              onClick={() => startEditing(user, "department")}
                              className="text-sm text-text-secondary hover:text-primary-500 transition-colors"
                            >
                              {user.department || "—"}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Access Level Column */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {user.accessLevel ?? "—"}
                      </td>

                      {/* Access Methods Column */}
                      <td className="px-4 py-4 text-sm text-text-secondary">
                        {user.allowedAccessMethods && user.allowedAccessMethods.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.allowedAccessMethods.map((method, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-800"
                              >
                                {method}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* RFID Tags Column */}
                      <td className="px-4 py-4 text-sm text-text-secondary">
                        {user.rfidTags && user.rfidTags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.rfidTags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-info-100 text-info-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Fingerprint IDs Column */}
                      <td className="px-4 py-4 text-sm text-text-secondary">
                        {user.fingerprintIds && user.fingerprintIds.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.fingerprintIds.map((id, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-warning-100 text-warning-800"
                              >
                                FP-{id}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Last Access Column */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {user.lastAccessAt
                          ? new Date(user.lastAccessAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Never"}
                      </td>

                      {/* Actions Column */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm sticky right-0 bg-surface z-10">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setViewingUser(user)}
                            className="text-text-secondary hover:text-primary-500 transition-colors"
                            title="View user details"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(user.userId)}
                            className="text-danger-600 hover:text-danger-700 transition-colors"
                            title="Delete user"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
          <div className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(page - 1) * limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(page * limit, total)}
            </span>{" "}
            of <span className="font-medium text-foreground">{total}</span> users
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
              <span className="font-medium text-foreground">{totalPages}</span>
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-lg border border-border bg-surface p-6 shadow-lg my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                User Details
              </h2>
              <button
                onClick={() => setViewingUser(null)}
                className="text-text-secondary hover:text-foreground transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1">
                      User ID
                    </label>
                    <p className="text-sm text-foreground break-words">{viewingUser.userId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1">
                      Name
                    </label>
                    <p className="text-sm text-foreground break-words">
                      {viewingUser.firstName} {viewingUser.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1">
                      Email
                    </label>
                    <p className="text-sm text-foreground break-words">{viewingUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1">
                      Phone Number
                    </label>
                    <p className="text-sm text-foreground break-words">
                      {viewingUser.phoneNumber || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1">
                      Employee ID
                    </label>
                    <p className="text-sm text-foreground break-words">
                      {viewingUser.employeeId || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1">
                      Gender
                    </label>
                    <p className="text-sm text-foreground">
                      {viewingUser.gender || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Role & Status */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                  Role & Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1">
                      Role
                    </label>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary-100 text-primary-800">
                      {viewingUser.role}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        viewingUser.status === UserStatus.ACTIVE
                          ? "bg-success-100 text-success-800"
                          : viewingUser.status === UserStatus.SUSPENDED
                          ? "bg-warning-100 text-warning-800"
                          : "bg-danger-100 text-danger-800"
                      }`}
                    >
                      {viewingUser.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1">
                      Department
                    </label>
                    <p className="text-sm text-foreground">
                      {viewingUser.department || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1">
                      Access Level
                    </label>
                    <p className="text-sm text-foreground">
                      {viewingUser.accessLevel ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Access Methods & Biometrics */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                  Access Methods & Biometrics
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-2">
                      Allowed Access Methods
                    </label>
                    {viewingUser.allowedAccessMethods && viewingUser.allowedAccessMethods.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {viewingUser.allowedAccessMethods.map((method, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800"
                          >
                            {method}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-secondary">—</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-2">
                      RFID Tags
                    </label>
                    {viewingUser.rfidTags && viewingUser.rfidTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {viewingUser.rfidTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded px-3 py-1 text-sm font-medium bg-info-100 text-info-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-secondary">—</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-2">
                      Fingerprint IDs
                    </label>
                    {viewingUser.fingerprintIds && viewingUser.fingerprintIds.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {viewingUser.fingerprintIds.map((id, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded px-3 py-1 text-sm font-medium bg-warning-100 text-warning-800"
                          >
                            FP-{id}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-secondary">—</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Picture */}
              {viewingUser.profilePicture && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                    Profile Picture
                  </h3>
                  <div className="flex items-center gap-4">
                    <img
                      src={viewingUser.profilePicture.secureUrl}
                      alt={`${viewingUser.firstName} ${viewingUser.lastName}`}
                      className="w-24 h-24 rounded-full object-cover border-2 border-border"
                    />
                    <div>
                      <p className="text-sm text-text-secondary">
                        Public ID: {viewingUser.profilePicture.publicId}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                  Timestamps
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1">
                      Created At
                    </label>
                    <p className="text-sm text-foreground">
                      {new Date(viewingUser.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1">
                      Updated At
                    </label>
                    <p className="text-sm text-foreground">
                      {new Date(viewingUser.updatedAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1">
                      Last Access
                    </label>
                    <p className="text-sm text-foreground">
                      {viewingUser.lastAccessAt
                        ? new Date(viewingUser.lastAccessAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Never"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-lg">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Delete User
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="rounded-lg bg-danger-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
