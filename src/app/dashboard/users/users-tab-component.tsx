"use client";

import { useState } from "react";
import {
  useUsers,
  useUpdateUser,
  useUpdateUserRole,
  useEnrollUser,
  useAddRfidTag,
  useRegisterFingerprint,
  useSetKeypadPin,
} from "@/hooks/use-users";
import { UserRole, UserStatus, Department, UserDetails, Gender, AccessMethod } from "@/types/api";
import ErrorAlert from "@/components/ErrorAlert";
import { getErrorMessage } from "@/lib/errors";

interface EditingState {
  userId: string;
  field: "name" | "email" | "role" | "status" | "department" | "accessMethods";
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: Department | "";
  allowedAccessMethods?: AccessMethod[];
}

export default function UsersTabComponent() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [departmentFilter, setDepartmentFilter] = useState<Department | "">("");
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [viewingUser, setViewingUser] = useState<UserDetails | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Enroll user form state
  const [enrollForm, setEnrollForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "" as Gender | "",
    role: UserRole.STAFF as UserRole,
    department: "" as Department | "",
    accessLevel: 1,
    allowedAccessMethods: [] as AccessMethod[],
    keypadPin: "",
    status: UserStatus.ACTIVE as UserStatus,
  });

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
  const enrollUserMutation = useEnrollUser();
  const addRfidTagMutation = useAddRfidTag();
  const registerFingerprintMutation = useRegisterFingerprint();
  const setKeypadPinMutation = useSetKeypadPin();

  // State for RFID, Fingerprint, and Keypad PIN inputs
  const [rfidTagInput, setRfidTagInput] = useState("");
  const [fingerprintIdInput, setFingerprintIdInput] = useState("");
  const [keypadPinInput, setKeypadPinInput] = useState("");

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
      allowedAccessMethods: user.allowedAccessMethods || [],
    });
    setErrorMessage(null);
  };

  const cancelEditing = () => {
    setEditing(null);
    setErrorMessage(null);
  };

  const saveEdit = async () => {
    if (!editing) return;

    try {
      setErrorMessage(null);

      if (editing.field === "name") {
        await updateUserMutation.mutateAsync({
          userId: editing.userId,
          userData: {
            firstName: editing.firstName,
            lastName: editing.lastName,
          },
        });
      } else if (editing.field === "email") {
        await updateUserMutation.mutateAsync({
          userId: editing.userId,
          userData: {
            email: editing.email,
          },
        });
      } else if (editing.field === "role") {
        await updateRoleMutation.mutateAsync({
          userId: editing.userId,
          role: editing.role!,
        });
      } else if (editing.field === "status") {
        await updateUserMutation.mutateAsync({
          userId: editing.userId,
          userData: {
            status: editing.status,
          },
        });
      } else if (editing.field === "department") {
        await updateUserMutation.mutateAsync({
          userId: editing.userId,
          userData: {
            department: editing.department || undefined,
          },
        });
      } else if (editing.field === "accessMethods") {
        await updateUserMutation.mutateAsync({
          userId: editing.userId,
          userData: {
            allowedAccessMethods: editing.allowedAccessMethods || [],
          },
        });
      }

      setSuccessMessage("User updated successfully");
      setEditing(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const toggleAccessMethodInEdit = (method: AccessMethod) => {
    if (!editing) return;
    setEditing({
      ...editing,
      allowedAccessMethods: editing.allowedAccessMethods?.includes(method)
        ? editing.allowedAccessMethods.filter((m) => m !== method)
        : [...(editing.allowedAccessMethods || []), method],
    });
  };

  const handleFilterChange = () => {
    setPage(1);
  };

  const hasActiveFilters =
    statusFilter !== "" || roleFilter !== "" || departmentFilter !== "";

  const clearFilters = () => {
    setStatusFilter("");
    setRoleFilter("");
    setDepartmentFilter("");
    setPage(1);
  };

  const handleEnrollUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await enrollUserMutation.mutateAsync({
        firstName: enrollForm.firstName,
        lastName: enrollForm.lastName,
        email: enrollForm.email,
        phoneNumber: enrollForm.phoneNumber || undefined,
        gender: enrollForm.gender || undefined,
        role: enrollForm.role,
        department: enrollForm.department || undefined,
        accessLevel: enrollForm.accessLevel,
        allowedAccessMethods: enrollForm.allowedAccessMethods,
        keypadPin: enrollForm.keypadPin || undefined,
        status: enrollForm.status,
      });
      setSuccessMessage("User enrolled successfully");
      setShowEnrollForm(false);
      setEnrollForm({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        gender: "",
        role: UserRole.STAFF,
        department: "",
        accessLevel: 1,
        allowedAccessMethods: [],
        keypadPin: "",
        status: UserStatus.ACTIVE,
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleEnrollFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      const method = value as AccessMethod;

      if (checked) {
        setEnrollForm({
          ...enrollForm,
          allowedAccessMethods: [...enrollForm.allowedAccessMethods, method],
        });
      } else {
        setEnrollForm({
          ...enrollForm,
          allowedAccessMethods: enrollForm.allowedAccessMethods.filter((m) => m !== method),
        });
      }
    } else if (name === "accessLevel") {
      setEnrollForm({
        ...enrollForm,
        [name]: parseInt(value) || 1,
      });
    } else {
      setEnrollForm({
        ...enrollForm,
        [name]: value,
      });
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <ErrorAlert message={getErrorMessage(error)} />
      </div>
    );
  }

  const users = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users Management</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <button
            onClick={() => setShowEnrollForm(true)}
            className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Enroll User
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="rounded-lg bg-success-50 border border-success-200 px-4 py-3 text-sm text-success-800">
          {successMessage}
        </div>
      )}
      {errorMessage && <ErrorAlert message={errorMessage} />}

      {/* Filters */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-wrap items-end gap-4">
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
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

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
              {isLoading ? (
                <tr>
                  <td
                    colSpan={14}
                    className="px-6 py-12 text-center text-sm text-text-secondary"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="h-5 w-5 animate-spin text-primary-500"
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
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
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
                  const isEditingAccessMethods =
                    editing?.userId === user.userId &&
                    editing.field === "accessMethods";

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
                          <button
                            onClick={() => startEditing(user, "department")}
                            className="text-sm text-text-secondary hover:text-primary-500 transition-colors"
                          >
                            {user.department || "—"}
                          </button>
                        )}
                      </td>

                      {/* Access Level Column */}
                      <td className="px-4 py-4 text-sm text-text-secondary">
                        {user.accessLevel ?? "—"}
                      </td>

                      {/* Access Methods Column */}
                      <td className="px-4 py-4 text-sm text-text-secondary">
                        {isEditingAccessMethods ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-2">
                              {Object.values(AccessMethod).map((method) => (
                                <label
                                  key={method}
                                  className="flex items-center gap-1 rounded border border-border bg-background px-2 py-1 cursor-pointer hover:bg-surface transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={editing.allowedAccessMethods?.includes(method) || false}
                                    onChange={() => toggleAccessMethodInEdit(method)}
                                    className="h-3 w-3 rounded border-border text-primary-500 focus:ring-primary-500"
                                  />
                                  <span className="text-xs text-foreground capitalize">{method}</span>
                                </label>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={saveEdit}
                                disabled={updateUserMutation.isPending || (editing.allowedAccessMethods?.length || 0) === 0}
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
                            {(editing.allowedAccessMethods?.length || 0) === 0 && (
                              <p className="text-xs text-danger-600">At least one access method is required</p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(user, "accessMethods")}
                            className="text-left hover:text-primary-500 transition-colors"
                          >
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
                              <span className="text-text-secondary">—</span>
                            )}
                          </button>
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
                      <td className="px-4 py-4 text-sm text-text-secondary">
                        {user.lastAccessAt
                          ? new Date(user.lastAccessAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions Column */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-surface z-10">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingUser(user)}
                            className="text-primary-600 hover:text-primary-700 transition-colors"
                            title="View Details"
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
                            title="Delete User"
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
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Showing <span className="font-medium text-foreground">{(page - 1) * limit + 1}</span> to{" "}
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
            {successMessage && (
              <div className="mb-4 rounded-lg bg-success-50 border border-success-200 px-4 py-3 text-sm text-success-800">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-4">
                <ErrorAlert message={errorMessage} />
              </div>
            )}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                User Details
              </h2>
              <button
                onClick={() => {
                  setViewingUser(null);
                  setRfidTagInput("");
                  setFingerprintIdInput("");
                  setKeypadPinInput("");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
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
                <div className="space-y-6">
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

                  {/* RFID Tags Section */}
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-2">
                      RFID Tags
                    </label>
                    {viewingUser.rfidTags && viewingUser.rfidTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-3">
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
                      <p className="text-sm text-text-secondary mb-3">—</p>
                    )}
                    {viewingUser.allowedAccessMethods?.includes(AccessMethod.RFID) && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={rfidTagInput}
                          onChange={(e) => setRfidTagInput(e.target.value)}
                          placeholder="Enter RFID tag (e.g., 0xA1B2C3D4)"
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <button
                          onClick={async () => {
                            if (!rfidTagInput.trim()) {
                              setErrorMessage("Please enter an RFID tag");
                              return;
                            }
                            try {
                              await addRfidTagMutation.mutateAsync({
                                userId: viewingUser.userId,
                                tagData: { tag: rfidTagInput.trim() },
                              });
                              setRfidTagInput("");
                              setSuccessMessage("RFID tag added successfully");
                              setTimeout(() => setSuccessMessage(null), 3000);
                              // Refetch users to get updated data
                              refetch();
                            } catch (error) {
                              setErrorMessage(getErrorMessage(error));
                            }
                          }}
                          disabled={addRfidTagMutation.isPending || !rfidTagInput.trim()}
                          className="rounded-lg bg-info-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-info-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {addRfidTagMutation.isPending ? "Adding..." : "Add Tag"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Fingerprint IDs Section */}
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-2">
                      Fingerprint IDs
                    </label>
                    {viewingUser.fingerprintIds && viewingUser.fingerprintIds.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-3">
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
                      <p className="text-sm text-text-secondary mb-3">—</p>
                    )}
                    {viewingUser.allowedAccessMethods?.includes(AccessMethod.FINGERPRINT) && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={fingerprintIdInput}
                          onChange={(e) => setFingerprintIdInput(e.target.value)}
                          placeholder="Enter fingerprint ID (e.g., 1, 2, 3...)"
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <button
                          onClick={async () => {
                            const fingerprintId = parseInt(fingerprintIdInput);
                            if (!fingerprintIdInput.trim() || isNaN(fingerprintId) || fingerprintId < 1) {
                              setErrorMessage("Please enter a valid fingerprint ID (minimum 1)");
                              return;
                            }
                            try {
                              await registerFingerprintMutation.mutateAsync({
                                userId: viewingUser.userId,
                                fingerprintData: { fingerprintId },
                              });
                              setFingerprintIdInput("");
                              setSuccessMessage("Fingerprint registered successfully");
                              setTimeout(() => setSuccessMessage(null), 3000);
                              // Refetch users to get updated data
                              refetch();
                            } catch (error) {
                              setErrorMessage(getErrorMessage(error));
                            }
                          }}
                          disabled={registerFingerprintMutation.isPending || !fingerprintIdInput.trim()}
                          className="rounded-lg bg-warning-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-warning-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {registerFingerprintMutation.isPending ? "Registering..." : "Register"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Keypad PIN Section */}
                  {viewingUser.allowedAccessMethods?.includes(AccessMethod.KEYPAD) && (
                    <div>
                      <label className="text-sm font-medium text-text-secondary block mb-2">
                        Keypad PIN
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="password"
                          value={keypadPinInput}
                          onChange={(e) => setKeypadPinInput(e.target.value)}
                          placeholder="Enter PIN (4-10 characters)"
                          maxLength={10}
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <button
                          onClick={async () => {
                            if (!keypadPinInput.trim() || keypadPinInput.length < 4 || keypadPinInput.length > 10) {
                              setErrorMessage("PIN must be between 4 and 10 characters");
                              return;
                            }
                            try {
                              await setKeypadPinMutation.mutateAsync({
                                userId: viewingUser.userId,
                                pinData: { pin: keypadPinInput },
                              });
                              setKeypadPinInput("");
                              setSuccessMessage("Keypad PIN set successfully");
                              setTimeout(() => setSuccessMessage(null), 3000);
                              // Refetch users to get updated data
                              refetch();
                            } catch (error) {
                              setErrorMessage(getErrorMessage(error));
                            }
                          }}
                          disabled={setKeypadPinMutation.isPending || !keypadPinInput.trim() || keypadPinInput.length < 4}
                          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {setKeypadPinMutation.isPending ? "Setting..." : "Set PIN"}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary">PIN will be hashed for security</p>
                    </div>
                  )}
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
                  {viewingUser.lastAccessAt && (
                    <div>
                      <label className="text-sm font-medium text-text-secondary block mb-1">
                        Last Access At
                      </label>
                      <p className="text-sm text-foreground">
                        {new Date(viewingUser.lastAccessAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
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
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Delete User
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  // TODO: Implement delete functionality when backend endpoint is available
                  setDeleteConfirm(null);
                  setSuccessMessage("Delete functionality coming soon");
                  setTimeout(() => setSuccessMessage(null), 3000);
                }}
                className="rounded-lg bg-danger-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll User Modal */}
      {showEnrollForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-lg border border-border bg-surface p-6 shadow-lg my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Enroll New User</h2>
              <button
                onClick={() => setShowEnrollForm(false)}
                className="text-text-secondary hover:text-foreground transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEnrollUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1">
                    First Name <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={enrollForm.firstName}
                    onChange={handleEnrollFormChange}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="John"
                  />
                </div>
                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1">
                    Last Name <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={enrollForm.lastName}
                    onChange={handleEnrollFormChange}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Doe"
                  />
                </div>
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                    Email <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={enrollForm.email}
                    onChange={handleEnrollFormChange}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="john.doe@example.com"
                  />
                </div>
                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={enrollForm.phoneNumber}
                    onChange={handleEnrollFormChange}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="+1234567890"
                  />
                </div>
                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-foreground mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={enrollForm.gender || ""}
                    onChange={handleEnrollFormChange}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">Select Gender</option>
                    <option value={Gender.M}>Male</option>
                    <option value={Gender.F}>Female</option>
                  </select>
                </div>
                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
                    Role <span className="text-danger-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    value={enrollForm.role}
                    onChange={handleEnrollFormChange}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">Select Role</option>
                    {Object.values(UserRole).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-foreground mb-1">
                    Status <span className="text-danger-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    value={enrollForm.status}
                    onChange={(e) => setEnrollForm({ ...enrollForm, status: e.target.value as UserStatus })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {Object.values(UserStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Department */}
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-foreground mb-1">
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={enrollForm.department || ""}
                    onChange={handleEnrollFormChange}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">Select Department</option>
                    {Object.values(Department).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Access Level */}
                <div>
                  <label htmlFor="accessLevel" className="block text-sm font-medium text-foreground mb-1">
                    Access Level (1-10)
                  </label>
                  <input
                    type="number"
                    id="accessLevel"
                    name="accessLevel"
                    min="1"
                    max="10"
                    value={enrollForm.accessLevel || ""}
                    onChange={handleEnrollFormChange}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="1"
                  />
                </div>
              </div>

              {/* Allowed Access Methods */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Allowed Access Methods <span className="text-danger-500">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {Object.values(AccessMethod).map((method) => (
                    <div key={method} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`method-${method}`}
                        name="allowedAccessMethods"
                        value={method}
                        checked={enrollForm.allowedAccessMethods.includes(method)}
                        onChange={handleEnrollFormChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
                      />
                      <label htmlFor={`method-${method}`} className="ml-2 text-sm text-foreground capitalize">
                        {method}
                      </label>
                    </div>
                  ))}
                </div>
                {enrollForm.allowedAccessMethods.length === 0 && (
                  <p className="mt-1 text-xs text-danger-500">At least one access method is required.</p>
                )}
              </div>

              {/* Keypad PIN (conditional) */}
              {enrollForm.allowedAccessMethods.includes(AccessMethod.KEYPAD) && (
                <div className="mt-4">
                  <label htmlFor="keypadPin" className="block text-sm font-medium text-foreground mb-1">
                    Keypad PIN
                  </label>
                  <input
                    type="text"
                    id="keypadPin"
                    name="keypadPin"
                    value={enrollForm.keypadPin}
                    onChange={handleEnrollFormChange}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="1234"
                    maxLength={10}
                  />
                  <p className="mt-1 text-xs text-text-secondary">PIN will be hashed for security</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEnrollForm(false);
                    setEnrollForm({
                      firstName: "",
                      lastName: "",
                      email: "",
                      phoneNumber: "",
                      gender: "",
                      role: UserRole.STAFF,
                      department: "",
                      accessLevel: 1,
                      allowedAccessMethods: [],
                      keypadPin: "",
                      status: UserStatus.ACTIVE,
                    });
                  }}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enrollUserMutation.isPending || enrollForm.allowedAccessMethods.length === 0}
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrollUserMutation.isPending ? "Enrolling..." : "Enroll User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

