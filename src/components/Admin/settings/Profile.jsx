import { User } from "lucide-react";
import SettingSection from "./SettingSection";
import React from "react";
import { useAuth } from "../../Shared/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <SettingSection icon={User} title={"Hồ Sơ"}>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </SettingSection>
    );
  }

  return (
    <SettingSection icon={User} title={"Hồ Sơ"}>
      <div className="flex flex-col sm:flex-row items-center mb-6">
        <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full mr-4 mb-4 sm:mb-0">
          <User className="w-12 h-12 text-orange-500" />
        </div>

        <div className="text-center sm:text-left">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {user.fullName || user.username || "Người dùng"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
          {user.phoneNumber && (
            <p className="text-sm text-gray-400 mt-1">{user.phoneNumber}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 uppercase font-semibold">Tên đăng nhập</p>
          <p className="text-gray-700 dark:text-gray-200">{user.username}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 uppercase font-semibold">Ngày sinh</p>
          <p className="text-gray-700 dark:text-gray-200">
            {user.dob ? new Date(user.dob).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 uppercase font-semibold">CCCD/CMND</p>
          <p className="text-gray-700 dark:text-gray-200">{user.cic || "Chưa cập nhật"}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 uppercase font-semibold">Địa chỉ</p>
          <p className="text-gray-700 dark:text-gray-200">{user.address || "Chưa cập nhật"}</p>
        </div>
      </div>

      <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-xl transition duration-200 w-full sm:w-auto shadow-md hover:shadow-lg">
        Chỉnh sửa hồ sơ
      </button>
    </SettingSection>
  );
};

export default Profile;
