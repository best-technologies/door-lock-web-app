"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import ProtectedRoute from "@/components/dashboard/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

