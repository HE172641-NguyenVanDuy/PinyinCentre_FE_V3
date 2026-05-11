import React, { useState } from "react";
import { FaFacebook, FaTiktok, FaCaretDown } from "react-icons/fa";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import { Bell, User, ChevronDown, LogOut, Layout, Lock } from "lucide-react";
import ProfileModal from "../Shared/ProfileModal";
import ChangePasswordModal from "../Shared/ChangePasswordModal";
import { useAuth } from "../Shared/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import DarkMode from "./DarkMode";
import notificationService from "../../utils/notificationService";
import { useEffect } from "react";

const Logo = "/assets/logo/logoPinyin1.png";

const Menu = [
  { id: 1, name: "Trang Chủ", link: "/" },
  { id: 2, name: "Thi Thử", link: "/exam" },
  { id: 3, name: "Liên Hệ", link: "/contact" },
];

const CourseDropdownLinks = [
  { id: 1, name: "Khóa Học HSK", link: "/courses/hsk" },
  { id: 2, name: "Combo HSK", link: "/courses/combo-hsk" },
];

const DocumentDropdownLinks = [
  { id: 1, name: "HSK 1", link: "/documents" },
  { id: 2, name: "HSK 2", link: "/documents" },
  { id: 3, name: "HSK 3", link: "/documents" },
  { id: 4, name: "HSK 4", link: "/documents" },
  { id: 5, name: "HSK 5", link: "/documents" },
  { id: 6, name: "HSK 6", link: "/documents" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Fetch every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      const count = await notificationService.getUnreadCount();
      setNotifications(data);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleName = (role) => {
    switch (role) {
      case 1:
        return "Admin";
      case 2:
        return "Giáo viên";
      case 3:
        return "Học sinh";
      default:
        return "User";
    }
  };

  return (
    <div className="sticky top-0 z-50 shadow-md bg-white dark:bg-gray-900">
      <div className="bg-gradient-to-r from-orange-200 to-orange-300 dark:from-orange-800 dark:to-orange-900">
        <div className="container flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white"
          >
            <img src={Logo} alt="Logo" className="w-16 object-contain" />
            <div className="leading-5">
              PINYIN
              <br />
              CENTRE
            </div>
          </Link>

          {/* Menu Center */}
          <div className="hidden sm:flex items-center gap-8">
            {Menu.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="relative text-lg font-semibold hover:text-red-500 transition group"
              >
                {item.name}
                <span className="absolute left-1/2 bottom-0 w-0 h-[2px] bg-red-500 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
              </Link>
            ))}

            {/* Dropdown: Khóa học */}
            <div className="relative group cursor-pointer">
              <div className="flex items-center gap-1 text-lg font-semibold hover:text-red-500 transition">
                Khóa Học
                <FaCaretDown className="transition group-hover:rotate-180" />
              </div>
              <div className="absolute top-7 hidden group-hover:block bg-white dark:bg-gray-800 shadow-md rounded-md p-2 min-w-[180px]">
                {CourseDropdownLinks.map((course) => (
                  <Link
                    key={course.id}
                    to={course.link}
                    className="block px-3 py-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    {course.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Dropdown: Thư viện */}
            <div className="relative group cursor-pointer">
              <div className="flex items-center gap-1 text-lg font-semibold hover:text-red-500 transition">
                Thư Viện
                <FaCaretDown className="transition group-hover:rotate-180" />
              </div>
              <div className="absolute top-7 hidden group-hover:block bg-white dark:bg-gray-800 shadow-md rounded-md p-2 min-w-[180px]">
                {DocumentDropdownLinks.map((doc) => (
                  <Link
                    key={doc.id}
                    to={doc.link}
                    className="block px-3 py-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    {doc.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Social + Darkmode */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/people/Tiếng-Trung-Bắc-Kinh/61551807950988/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook className="text-2xl hover:text-blue-600 hover:scale-110 transition" />
            </a>
            <a
              href="https://www.tiktok.com/@tiengtrungbackinh235?is_from_webapp=1&sender_device=pc"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTiktok className="text-2xl hover:text-black dark:hover:text-white hover:scale-110 transition" />
            </a>
            {user ? (
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {isNotificationOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsNotificationOpen(false)}
                        ></div>
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-20 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                              Thông báo ({unreadCount})
                            </h3>
                            <button
                              onClick={handleMarkAllAsRead}
                              className="text-xs text-blue-500 hover:underline"
                            >
                              Đánh dấu tất cả đã đọc
                            </button>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                              notifications.map((n) => (
                                <div
                                  key={n.id}
                                  onClick={() => handleMarkAsRead(n.id)}
                                  className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                >
                                  <p className="text-sm font-bold text-gray-800 dark:text-white">{n.title}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{n.message}</p>
                                  <p className="text-[10px] text-gray-400 mt-1">
                                    {new Date(n.createdDate).toLocaleString()}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                Không có thông báo nào
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <User size={18} />
                    </div>
                    <div className="hidden md:block text-left leading-tight">
                      <p className="text-sm font-bold truncate max-w-[120px]">
                        {user.fullName || "User"}
                      </p>
                      <p className="text-[10px] opacity-90 font-medium">
                        {getRoleName(user.role)}
                      </p>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${
                        isProfileDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                        ></div>
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-20 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-700">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {user.fullName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                          <div className="p-1">
                            <button
                              onClick={() => {
                                setIsProfileDropdownOpen(false);
                                setIsProfileModalOpen(true);
                              }}
                              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            >
                              <User size={16} className="mr-3 text-orange-500" />
                              Hồ sơ
                            </button>
                            <button
                              onClick={() => {
                                setIsProfileDropdownOpen(false);
                                setIsChangePasswordModalOpen(true);
                              }}
                              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            >
                              <Lock size={16} className="mr-3 text-orange-500" />
                              Đổi mật khẩu
                            </button>
                            <button
                              onClick={() => {
                                setIsProfileDropdownOpen(false);
                                navigate(
                                  user.role === 2
                                    ? "/teacher"
                                    : user.role === 3
                                    ? "/student"
                                    : "/admin"
                                );
                              }}
                              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            >
                              <Layout size={16} className="mr-3 text-blue-500" />
                              Bảng điều khiển
                            </button>
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                            >
                              <LogOut size={16} className="mr-3" />
                              Đăng xuất
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold hover:brightness-110 shadow-lg shadow-orange-200 dark:shadow-none transition-all active:scale-95"
              >
                Đăng Nhập
              </Link>
            )}
            <DarkMode />

            {/* Mobile Button */}
            <div className="sm:hidden">
              <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-900 px-4 pb-4">
          <ul className="space-y-2">
            {Menu.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.link}
                  className="block py-2 font-semibold hover:text-red-500"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            {/* Khóa học */}
            <li>
              <div
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "courses" ? null : "courses"
                  )
                }
                className="flex items-center justify-between py-2 cursor-pointer font-semibold hover:text-red-500"
              >
                <span>Khóa Học</span>
                <FaCaretDown
                  className={`transition ${
                    activeDropdown === "courses" ? "rotate-180" : ""
                  }`}
                />
              </div>
              {activeDropdown === "courses" && (
                <div className="pl-4">
                  {CourseDropdownLinks.map((course) => (
                    <Link
                      key={course.id}
                      to={course.link}
                      className="block py-2 hover:text-red-500"
                      onClick={() => setIsOpen(false)}
                    >
                      {course.name}
                    </Link>
                  ))}
                </div>
              )}
            </li>
            {/* Thư viện */}
            <li>
              <div
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "documents" ? null : "documents"
                  )
                }
                className="flex items-center justify-between py-2 cursor-pointer font-semibold hover:text-red-500"
              >
                <span>Thư Viện</span>
                <FaCaretDown
                  className={`transition ${
                    activeDropdown === "documents" ? "rotate-180" : ""
                  }`}
                />
              </div>
              {activeDropdown === "documents" && (
                <div className="pl-4">
                  {DocumentDropdownLinks.map((doc) => (
                    <Link
                      key={doc.id}
                      to={doc.link}
                      className="block py-2 hover:text-red-500"
                      onClick={() => setIsOpen(false)}
                    >
                      {doc.name}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          </ul>

          {/* Social + Darkmode */}
          <div className="flex items-center gap-4 mt-4">
            <a
              href="https://www.facebook.com/people/Tiếng-Trung-Bắc-Kinh/61551807950988/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook className="text-2xl hover:text-blue-600 hover:scale-110 transition" />
            </a>
            <a
              href="https://www.tiktok.com/@tiengtrungbackinh235?is_from_webapp=1&sender_device=pc"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTiktok className="text-2xl hover:text-black dark:hover:text-white hover:scale-110 transition" />
            </a>
            {user ? (
               <button
               onClick={() => {
                 setIsOpen(false);
                 navigate(user.role === 2 ? "/teacher" : user.role === 3 ? "/student" : "/admin");
               }}
               className="block w-full text-center px-4 py-2.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold shadow-lg"
             >
               Vào Dashboard
             </button>
            ) : (
              <Link
                to="/login"
                className="block w-full text-center px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold hover:brightness-110 shadow-lg transition"
                onClick={() => setIsOpen(false)}
              >
                Đăng Nhập
              </Link>
            )}

            <DarkMode />
          </div>
        </div>
      )}
      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default Navbar;
