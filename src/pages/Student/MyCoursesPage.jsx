import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { FaBookReader, FaChalkboardTeacher, FaCalendarAlt, FaChevronRight, FaSpinner } from "react-icons/fa";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import { toast } from "react-toastify";

const MyCoursesPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Flag để ngăn useEffect chạy 2 lần trong Strict Mode
  const processingRef = useRef(false);

  const fetchMyClasses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/student/classes");
      const data = await response.json();
      if (data.status === 200) {
        setClasses(data.result);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách khóa học của bạn");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Nếu đang xử lý hoặc đã xử lý rồi thì bỏ qua
    if (processingRef.current) return;

    const status = searchParams.get("status");
    const cancel = searchParams.get("cancel");
    const orderCode = searchParams.get("orderCode");

    if (status === "PAID" && cancel === "false" && orderCode) {
      processingRef.current = true; // Đánh dấu bắt đầu xử lý
      handlePaymentSuccess(orderCode);
    } else if (cancel === "true") {
      processingRef.current = true;
      toast.warning("Thanh toán đã bị hủy");
      clearUrlParams();
      fetchMyClasses();
    } else {
      fetchMyClasses();
    }
    // eslint-disable-next-line
  }, [searchParams]);

  const clearUrlParams = () => {
    // Xóa query params trên URL mà không làm load lại trang
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  };

  const handlePaymentSuccess = async (orderCode) => {
    setIsVerifying(true);
    let attempts = 0;
    const maxAttempts = 7; // Thử trong khoảng 21 giây (7 lần * 3s)

    const pollInterval = setInterval(async () => {
      attempts++;
      console.log(`Polling verification for order ${orderCode}, attempt ${attempts}...`);
      
      try {
        const response = await apiFetch(`/payment/verify-order?orderCode=${orderCode}`);
        const data = await response.json();

        if (data.result?.status === "SUCCESS") {
          clearInterval(pollInterval);
          toast.success("Thanh toán và ghi danh thành công!");
          setIsVerifying(false);
          clearUrlParams();
          fetchMyClasses();
        } else if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setIsVerifying(false);
          toast.info("Giao dịch đang được hệ thống xử lý. Vui lòng kiểm tra lại sau ít phút.");
          clearUrlParams();
          fetchMyClasses();
        }
      } catch (error) {
        console.error("Lỗi polling:", error);
      }
    }, 3000);
  };

  if (loading && !isVerifying) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-blue-500 text-4xl mb-4" />
          <p className="text-gray-500 font-medium">Đang tải khóa học của bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Trạng thái xác thực */}
      {isVerifying && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-center gap-4 shadow-md"
        >
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
            <FaSpinner className="animate-spin text-white text-xl" />
          </div>
          <div>
            <h3 className="text-blue-900 font-bold text-lg">Đang hoàn tất ghi danh...</h3>
            <p className="text-blue-700 text-sm">Hệ thống đang xử lý dữ liệu thanh toán. Vui lòng không tắt trang này.</p>
          </div>
        </motion.div>
      )}

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Khóa học của tôi</h1>
        <div className="h-1.5 w-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-sm"></div>
      </header>

      {classes.length === 0 && !isVerifying ? (
        <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-gray-100">
          <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <FaBookReader className="text-blue-200 text-5xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Bạn chưa đăng ký khóa học nào</h3>
          <p className="text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
            Hãy khám phá các khóa học Tiếng Trung HSK chuyên sâu để bắt đầu hành trình chinh phục ngôn ngữ mới.
          </p>
          <button 
            onClick={() => window.location.href = "/courses/hsk"} 
            className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            Khám phá ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
          {classes.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col shadow-sm"
            >
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-600 transition-all duration-300 shadow-inner">
                    <FaChalkboardTeacher className="text-blue-600 text-2xl group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="px-4 py-1 bg-green-50 text-green-600 text-[11px] font-black rounded-full uppercase tracking-widest border border-green-100">
                    Đang học
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-700 transition-colors">
                  {cls.name}
                </h3>
                <p className="text-gray-500 text-sm mb-8 font-medium">{cls.course_name}</p>

                <div className="space-y-4 mb-2">
                  <div className="flex items-center text-gray-600 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-4 border border-gray-100">
                      <FaCalendarAlt className="text-gray-400" />
                    </div>
                    <span className="font-medium">Bắt đầu: {new Date(cls.start_date).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-4 border border-gray-100">
                      <FaBookReader className="text-gray-400" />
                    </div>
                    <span className="font-medium">{cls.schedule_count || 0} buổi học dự kiến</span>
                  </div>
                </div>
              </div>

              <div className="px-8 pb-8">
                <button 
                  onClick={() => navigate(`/student/classes?openClassId=${cls.id}`)}
                  className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg active:scale-95 group-hover:shadow-blue-200"
                >
                  Vào lớp học <FaChevronRight className="ml-2 text-xs" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
