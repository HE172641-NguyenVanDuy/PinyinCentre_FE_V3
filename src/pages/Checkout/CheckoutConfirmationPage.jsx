import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCreditCard, FaUser, FaBook, FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../../components/Shared/AuthContext";
import { courseService } from "../../utils/courseService";
import { paymentService } from "../../utils/paymentService";
import { toast } from "react-toastify";

const CheckoutConfirmationPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseById(courseId);
        if (data.status === 200) {
          setCourse(data.result);
        }
      } catch (error) {
        toast.error("Không tìm thấy thông tin khóa học");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleConfirmPayment = async () => {
    try {
      setProcessing(true);
      const data = await paymentService.checkout(courseId);
      if (data.status === 200 && data.result.checkoutUrl) {
        toast.success("Đang chuyển đến cổng thanh toán PayOS...");
        window.location.href = data.result.checkoutUrl;
      } else {
        toast.error(data.message || "Lỗi khi tạo link thanh toán");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi, vui lòng thử lại sau");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-8 group"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Quay lại
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 bg-opacity-40 backdrop-blur-xl border border-gray-700 rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="bg-blue-600 bg-opacity-20 p-8 border-b border-gray-700">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <FaCreditCard className="mr-4 text-blue-400" /> Xác nhận thanh toán
            </h1>
            <p className="text-blue-200 mt-2">Vui lòng kiểm tra kỹ thông tin trước khi thanh toán.</p>
          </div>

          <div className="p-8 grid md:grid-cols-2 gap-12">
            {/* Thông tin khóa học */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white flex items-center border-b border-gray-700 pb-2">
                <FaBook className="mr-2 text-blue-400" /> Thông tin khóa học
              </h2>
              <div className="bg-gray-700 bg-opacity-30 p-6 rounded-2xl border border-gray-600">
                <p className="text-gray-400 text-sm uppercase tracking-wider">Tên khóa học</p>
                <p className="text-xl font-bold text-white mt-1">{course?.courseName}</p>
                
                <div className="mt-4 flex justify-between items-end">
                  <div>
                    <p className="text-gray-400 text-sm">Danh mục</p>
                    <p className="text-blue-300">{course?.hskCategoryName || "Luyện thi HSK"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Số buổi</p>
                    <p className="text-white font-semibold">{course?.slotNumber} buổi</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-600">
                  <p className="text-gray-400 text-sm">Tổng cộng thanh toán</p>
                  <p className="text-3xl font-black text-blue-400 mt-1">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course?.price)}
                  </p>
                </div>
              </div>
            </div>

            {/* Thông tin học viên */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white flex items-center border-b border-gray-700 pb-2">
                <FaUser className="mr-2 text-blue-400" /> Thông tin học viên
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-500 text-sm">Họ và tên</label>
                  <p className="text-white font-medium text-lg">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-sm">Email liên hệ</label>
                  <p className="text-white font-medium">{user?.email}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-sm">Số điện thoại</label>
                  <p className="text-white font-medium">{user?.phone || "Chưa cập nhật"}</p>
                </div>

                <div className="mt-8 bg-blue-900 bg-opacity-20 p-4 rounded-xl border border-blue-800 border-opacity-30">
                  <p className="text-xs text-blue-300 flex items-start">
                    <FaCheckCircle className="mr-2 mt-0.5 flex-shrink-0" />
                    Bằng việc xác nhận thanh toán, bạn đồng ý với các điều khoản và lộ trình học của PinYin Centre.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-900 bg-opacity-50 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
                <p className="text-gray-400 text-sm">Cổng thanh toán an toàn qua</p>
                <img src="https://payos.vn/wp-content/uploads/2023/07/payos-logo.png" alt="PayOS" className="h-8 mt-1 opacity-70" />
            </div>
            
            <button
              onClick={handleConfirmPayment}
              disabled={processing}
              className={`w-full md:w-auto px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/20 transform transition-all active:scale-95 ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {processing ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-3"></div>
                  Đang xử lý...
                </span>
              ) : "Xác nhận & Thanh toán"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutConfirmationPage;
