import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setIsSent(true);
      toast.success("Email hướng dẫn đặt lại mật khẩu đã được gửi!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-orange-100"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="text-orange-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Quên mật khẩu?</h2>
          <p className="text-gray-500 mt-2">
            Đừng lo lắng! Hãy nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Địa chỉ Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                  placeholder="name@example.com"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  Gửi yêu cầu
                </>
              )}
            </button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft size={16} />
              Quay lại đăng nhập
            </Link>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3">
              <CheckCircle size={24} className="flex-shrink-0" />
              <p className="text-sm font-medium">
                Kiểm tra email <b>{email}</b> của bạn để nhận liên kết đặt lại mật khẩu.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Không nhận được email? Kiểm tra thư rác hoặc <button onClick={() => setIsSent(false)} className="text-orange-600 font-bold hover:underline">thử lại</button>
            </p>
            <Link
              to="/login"
              className="block w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
