"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingOverlay } from "@/components/LoadingSpinner";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { showError } = useToast();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Production: Proper admin access control enabled
    if (!isLoading) {
      if (!isAuthenticated) {
        showError("Please login to access the admin dashboard");
        router.push("/auth/login");
        return;
      }

      if (user?.role !== "admin") {
        showError("Access denied. Admin privileges required.");
        router.push("/");
        return;
      }

      setIsAuthorized(true);
    }
  }, [isLoading, isAuthenticated, user?.id, user?.role]);

  if (isLoading) {
    return <LoadingOverlay message="Checking authentication..." />;
  }

  if (!isAuthorized) {
    return <LoadingOverlay message="Verifying admin access..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
