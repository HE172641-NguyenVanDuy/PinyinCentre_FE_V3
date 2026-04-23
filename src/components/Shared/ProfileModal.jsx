import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, MapPin, Calendar, CreditCard, Shield, Save, Edit3, ArrowLeft } from "lucide-react";
import { useAuth } from "./AuthContext";
import { userService } from "../../utils/userService";
import { toast } from "react-toastify";

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, fetchUserInfo } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    dob: "",
    cic: "",
    address: "",
    gender: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
        cic: user.cic || "",
        address: user.address || "",
        gender: user.gender === true,
      });
    }
  }, [user, isOpen]);

  if (!user) return null;

  const getRoleBadge = (role) => {
    switch (role) {
      case 1:
        return <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold uppercase">Admin</span>;
      case 2:
        return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold uppercase">Giáo viên</span>;
      case 3:
        return <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-bold uppercase">Học sinh</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase">Người dùng</span>;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await userService.updateUser(user.id, formData);
      if (response.status === 200) {
        toast.success("Cập nhật hồ sơ thành công!");
        await fetchUserInfo();
        setIsEditing(false);
      } else {
        toast.error(response.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Lỗi khi cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header / Cover */}
            <div className="h-32 bg-gradient-to-r from-orange-400 to-red-500 relative">
              <div className="absolute -bottom-12 left-8 p-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-xl">
                  <User className="w-12 h-12 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="pt-16 px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="text-2xl font-extrabold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1 outline-none border-2 border-orange-500"
                        placeholder="Họ và tên"
                      />
                    ) : (
                      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {user.fullName || "Người dùng"}
                      </h2>
                    )}
                    {getRoleBadge(user.role)}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Mail size={14} /> {user.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <InfoItem icon={User} label="Tên đăng nhập" value={user.username} readOnly />
                  
                  {isEditing ? (
                    <EditItem 
                      icon={Calendar} 
                      label="Ngày sinh" 
                      type="date"
                      value={formData.dob}
                      onChange={(val) => setFormData({ ...formData, dob: val })}
                    />
                  ) : (
                    <InfoItem icon={Calendar} label="Ngày sinh" value={user.dob ? new Date(user.dob).toLocaleDateString("vi-VN") : "Chưa cập nhật"} />
                  )}

                  {isEditing ? (
                    <EditItem 
                      icon={CreditCard} 
                      label="Số CCCD/CMND" 
                      value={formData.cic}
                      onChange={(val) => setFormData({ ...formData, cic: val })}
                    />
                  ) : (
                    <InfoItem icon={CreditCard} label="Số CCCD/CMND" value={user.cic || "Chưa cập nhật"} />
                  )}
                </div>

                <div className="space-y-4">
                  {isEditing ? (
                    <EditItem 
                      icon={Phone} 
                      label="Số điện thoại" 
                      value={formData.phoneNumber}
                      onChange={(val) => setFormData({ ...formData, phoneNumber: val })}
                    />
                  ) : (
                    <InfoItem icon={Phone} label="Số điện thoại" value={user.phoneNumber || "Chưa cập nhật"} />
                  )}

                  {isEditing ? (
                    <EditItem 
                      icon={MapPin} 
                      label="Địa chỉ" 
                      value={formData.address}
                      onChange={(val) => setFormData({ ...formData, address: val })}
                    />
                  ) : (
                    <InfoItem icon={MapPin} label="Địa chỉ" value={user.address || "Chưa cập nhật"} />
                  )}

                  {isEditing ? (
                    <div className="flex flex-col gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border-2 border-orange-500/30">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Giới tính</p>
                       <div className="flex gap-4">
                         <label className="flex items-center gap-2 cursor-pointer">
                           <input 
                             type="radio" 
                             checked={formData.gender === true} 
                             onChange={() => setFormData({ ...formData, gender: true })}
                             className="text-orange-500 focus:ring-orange-500"
                           />
                           <span className="text-sm text-gray-700 dark:text-gray-200">Nam</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                           <input 
                             type="radio" 
                             checked={formData.gender === false} 
                             onChange={() => setFormData({ ...formData, gender: false })}
                             className="text-orange-500 focus:ring-orange-500"
                           />
                           <span className="text-sm text-gray-700 dark:text-gray-200">Nữ</span>
                         </label>
                       </div>
                    </div>
                  ) : (
                    <InfoItem 
                      icon={Shield} 
                      label="Giới tính" 
                      value={user.gender === true ? "Nam" : "Nữ"} 
                    />
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                      className="px-6 py-2 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all disabled:opacity-50"
                    >
                      <ArrowLeft size={18} /> Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-6 py-2 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold shadow-md shadow-orange-500/20 transition-all disabled:opacity-50"
                    >
                      {loading ? "Đang lưu..." : <><Save size={18} /> Lưu thay đổi</>}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold shadow-md shadow-orange-500/20 transition-all"
                    >
                      <Edit3 size={18} /> Chỉnh sửa hồ sơ
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const InfoItem = ({ icon: Icon, label, value, readOnly }) => (
  <div className={`flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-transparent ${!readOnly && "hover:border-orange-200 dark:hover:border-orange-900/30"} transition-all group`}>
    <div className={`p-2 rounded-lg ${readOnly ? "bg-gray-200 dark:bg-gray-600 text-gray-400" : "bg-white dark:bg-gray-600 text-orange-500 shadow-sm group-hover:scale-105"} transition-transform`}>
      <Icon size={16} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{value}</p>
    </div>
  </div>
);

const EditItem = ({ icon: Icon, label, value, onChange, type = "text" }) => (
  <div className="flex items-start gap-3 p-3 rounded-2xl bg-orange-50/50 dark:bg-orange-900/10 border-2 border-orange-500/30 transition-all">
    <div className="p-2 rounded-lg bg-orange-500 text-white shadow-sm">
      <Icon size={16} />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm bg-transparent text-gray-900 dark:text-gray-100 font-medium outline-none border-b border-orange-200 dark:border-orange-800 focus:border-orange-500"
      />
    </div>
  </div>
);

export default ProfileModal;
