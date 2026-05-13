import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  FileText,
  Video,
  GraduationCap,
  Menu,
  ChevronLeft
} from "lucide-react";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const logo = "/assets/logo/logoPinyin1.png";

const SIDEBAR_ITEMS = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    color: "#6366f1",
    href: "/student",
  },
  {
    name: "Khóa học của tôi",
    icon: GraduationCap,
    color: "#10B981",
    href: "/student/my-courses",
  },
  {
    name: "Lịch học",
    icon: Calendar,
    color: "#8B5CF6",
    href: "/student/schedule",
  },
  {
    name: "Lớp học trực tuyến",
    icon: Video,
    color: "#F59E0B",
    href: "/student/classes",
  },
  {
    name: "Thư viện đề thi",
    icon: FileText,
    color: "#EC4899",
    href: "/student/exams",
  },
];

const StudentSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <motion.div
      className={`relative z-20 transition-all duration-300 ease-in-out flex-shrink-0 ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
    >
      <div className="h-full bg-white bg-opacity-90 backdrop-blur-md p-4 flex flex-col border-r border-gray-200 shadow-xl">
        {/* Logo Section */}
        <Link to="/student" className="flex items-center justify-center mb-8 px-2">
          <img src={logo} className="w-10 h-10 object-contain" alt="Logo" />
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span
                className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                Pinyin Student
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors z-30"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
        </button>

        {/* Navigation Items */}
        <nav className="mt-4 flex-grow space-y-2">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center p-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    size={22}
                    className={`${isActive ? "text-blue-600" : "text-gray-400"}`}
                    style={{ minWidth: "22px" }}
                  />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        className="ml-4 whitespace-nowrap overflow-hidden"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Info Bottom */}
        {isSidebarOpen && (
          <div className="mt-auto p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                S
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-gray-900 truncate">Học viên Pinyin</p>
                <p className="text-[10px] text-gray-500">Học tập chăm chỉ nhé!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StudentSidebar;
