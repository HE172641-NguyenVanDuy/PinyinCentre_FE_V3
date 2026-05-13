import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import { useAuth } from "../Shared/AuthContext";

const StudentDashboardLayout = () => {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Role 3 is Student
    if (!loading && role !== 3) {
      navigate("/login");
    }
  }, [role, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
        <div className="p-4 md:p-8 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentDashboardLayout;
