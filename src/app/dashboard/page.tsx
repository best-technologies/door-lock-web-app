"use client";

import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/dashboard/StatsCard";
import UsersTable from "@/components/dashboard/UsersTable";
import AttendanceOverview from "@/components/dashboard/AttendanceOverview";
import { User } from "@/types/api";

// Mock data - Replace with actual API calls
const mockUsers: User[] = [
  {
    userId: "BTL-25-01-01",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    status: "active" as any,
    role: "staff" as any,
    department: "Engineering",
  },
  {
    userId: "BTL-25-01-02",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    status: "active" as any,
    role: "admin" as any,
    department: "IT",
  },
  {
    userId: "BTL-25-01-03",
    firstName: "Bob",
    lastName: "Johnson",
    email: "bob.johnson@example.com",
    status: "active" as any,
    role: "staff" as any,
    department: "HR",
  },
  {
    userId: "BTL-25-01-04",
    firstName: "Alice",
    lastName: "Williams",
    email: "alice.williams@example.com",
    status: "suspended" as any,
    role: "intern" as any,
    department: "Marketing",
  },
  {
    userId: "BTL-25-01-05",
    firstName: "Charlie",
    lastName: "Brown",
    email: "charlie.brown@example.com",
    status: "active" as any,
    role: "staff" as any,
    department: "Finance",
  },
];

const mockAttendance = [
  {
    date: new Date().toISOString(),
    userId: "BTL-25-01-01",
    name: "John Doe",
    checkIn: "08:30 AM",
    checkOut: "05:15 PM",
    status: "present" as const,
  },
  {
    date: new Date().toISOString(),
    userId: "BTL-25-01-02",
    name: "Jane Smith",
    checkIn: "09:15 AM",
    checkOut: null,
    status: "late" as const,
  },
  {
    date: new Date().toISOString(),
    userId: "BTL-25-01-03",
    name: "Bob Johnson",
    checkIn: "08:00 AM",
    checkOut: "05:30 PM",
    status: "present" as const,
  },
];

export default function DashboardPage() {
  // Calculate stats from mock data
  const totalUsers = mockUsers.length;
  const totalAdmins = mockUsers.filter((u) => u.role === "admin").length;
  const totalStaff = mockUsers.filter((u) => u.role === "staff").length;
  const recentUsers = mockUsers.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Welcome back! Here's an overview of your system.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={totalUsers}
          color="primary"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
          trend={{ value: "+12%", isPositive: true }}
        />
        <StatsCard
          title="Admins"
          value={totalAdmins}
          color="success"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          }
        />
        <StatsCard
          title="Staff Members"
          value={totalStaff}
          color="info"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          trend={{ value: "+5%", isPositive: true }}
        />
        <StatsCard
          title="Active Today"
          value={mockAttendance.filter((a) => a.status === "present").length}
          color="warning"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          }
        />
      </div>

      {/* Tables Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users Table */}
        <div className="lg:col-span-1">
          <UsersTable users={recentUsers} />
        </div>

        {/* Attendance Overview */}
        <div className="lg:col-span-1">
          <AttendanceOverview records={mockAttendance} />
        </div>
      </div>
    </div>
  );
}

