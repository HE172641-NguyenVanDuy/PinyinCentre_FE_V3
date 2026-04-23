import React from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Calendar, CreditCard, Shield, LogOut } from "lucide-react";
import { useAuth } from "../components/Shared/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../components/Admin/common/Header";
import FloatingChatIcons from "../components/Shared/FloatingChatIcons";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 1:
        return <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider">Admin</span>;
      case 2:
        return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">Giáo viên</span>;
      case 3:
        return <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-bold uppercase tracking-wider">Học sinh</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">Người dùng</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header title="Hồ sơ cá nhân" />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-white/20"
        >
          {/* Cover Area */}
          <div className="h-32 bg-gradient-to-r from-orange-400 to-red-500 relative">
             <div className="absolute -bottom-16 left-8 p-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-6 rounded-xl">
                    <User className="w-16 h-16 text-orange-500" />
                </div>
             </div>
          </div>

          {/* User Info Header */}
          <div className="pt-20 px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {user.fullName || "Người dùng"}
                    </h1>
                    {getRoleBadge(user.role)}
                </div>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Mail size={16} /> {user.email}
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                    onClick={() => navigate("/settings")}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all"
                >
                    Cài đặt
                </button>
                <button 
                    onClick={handleLogout}
                    className="px-6 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold flex items-center gap-2 transition-all"
                >
                    <LogOut size={18} /> Đăng xuất
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {/* Personal Details */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                  Thông tin cá nhân
                </h3>
                
                <div className="space-y-4">
                  <ProfileItem icon={User} label="Tên đăng nhập" value={user.username} />
                  <ProfileItem icon={Calendar} label="Ngày sinh" value={user.dob ? new Date(user.dob).toLocaleDateString("vi-VN") : "Chưa cập nhật"} />
                  <ProfileItem icon={CreditCard} label="Số CCCD/CMND" value={user.cic || "Chưa cập nhật"} />
                  <ProfileItem icon={Phone} label="Số điện thoại" value={user.phoneNumber || "Chưa cập nhật"} />
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                  Thông tin tài khoản
                </h3>

                <div className="space-y-4">
                  <ProfileItem icon={MapPin} label="Địa chỉ" value={user.address || "Chưa cập nhật"} />
                  <ProfileItem icon={Shield} label="Trạng thái" value={user.status === "ACTIVE" || user.status === "1" ? "Đang hoạt động" : "Bị khóa"} />
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/20">
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1 italic">
                      "Hãy giữ thông tin cá nhân của bạn luôn cập nhật để chúng tôi có thể hỗ trợ bạn tốt nhất."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <FloatingChatIcons showSocialIcons={false} />
    </div>
  );
};

const ProfileItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-orange-200 dark:hover:border-orange-900/50 transition-all group">
    <div className="p-2 rounded-xl bg-white dark:bg-gray-700 text-orange-500 shadow-sm group-hover:scale-110 transition-transform">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-gray-900 dark:text-gray-100 font-medium">{value}</p>
    </div>
  </div>
);

export default ProfilePage;
