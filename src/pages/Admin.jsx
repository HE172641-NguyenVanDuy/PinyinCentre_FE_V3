import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import Sidebar from "../components/Admin/common/Sidebar";

import OverviewPage from "../pages/OverviewPage";
import UsersPage from "../pages/UsersPage";
import SalesPage from "../pages/SalesPage";
import OrdersPage from "../pages/OrdersPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import CreateUserPage from "./Admin/CreateUser";
import RegistrationsPage from "./Admin/RegistrationsPage.jsx";
import CoursesPage from "./Admin/CoursesPage.jsx";
import StudentPage from "./Admin/StudentPage.jsx";
import LecturePage from "./Admin/LecturePage.jsx";
import CreateClassPage from "./Admin/CreateClassPage.jsx";
import ClassListPage from "./Admin/ClassListPage.jsx";
import EditClassPage from "./Admin/EditClassPage.jsx";
import SchedulePage from "./Admin/SchedulePage.jsx";
import HskCategoryPage from "./Admin/HskCategoryPage.jsx";
import RevenueDashboard from "./Admin/RevenueDashboard.jsx";
import { useAuth } from "../components/Shared/AuthContext";

const Admin = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (parseInt(role) !== 1) {
      navigate("/login");
    }
  }, [role, navigate]);
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden relative">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-90" />
      </div>

      <Sidebar />
      
      <main className="flex-1 overflow-auto relative z-10">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="registrations" element={<RegistrationsPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="create-user" element={<CreateUserPage />} />
          <Route path="students" element={<StudentPage />} />
          <Route path="lectures" element={<LecturePage />} />
          <Route path="create-class" element={<CreateClassPage />} />
          <Route path="classes" element={<ClassListPage />} />
          <Route path="edit-class/:id" element={<EditClassPage />} />
          <Route path="schedule-page" element={<SchedulePage />} />
          <Route path="hsk-categories" element={<HskCategoryPage />} />
          <Route path="revenue" element={<RevenueDashboard />} />
        </Routes>
      </main>
    </div>
  );
};
export default Admin;
