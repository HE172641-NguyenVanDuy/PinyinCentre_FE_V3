import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGraduationCap,
  FaBookOpen,
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaStar,
  FaAward,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import Subscribe from "../../components/Subscribe/Subscribe";
import AOS from "aos";
import "aos/dist/aos.css";
import { hskCategoryService } from "../../utils/hskCategoryService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/Shared/AuthContext";

const HSKCourses = () => {
  const [hskCategories, setHskCategories] = useState([]);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token, role } = useAuth();

  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await hskCategoryService.getPublicCategories();
      if (response.status === 200) {
        setHskCategories(response.result);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = (id) => {
    setExpandedCategoryId(expandedCategoryId === id ? null : id);
  };

  const handlePayment = (courseId) => {
    if (!token) {
      toast.info("Vui lòng đăng nhập để đăng ký khóa học");
      navigate(`/login?redirect=/checkout/${courseId}`);
      return;
    }

    if (role !== 3) {
      toast.warning("Chỉ học viên mới có thể đăng ký khóa học trực tuyến");
      return;
    }

    navigate(`/checkout/${courseId}`);
  };

  const features = [
    {
      icon: <FaBookOpen className="text-2xl" />,
      title: "Giáo trình độc quyền",
      description:
        "Tài liệu biên soạn riêng bởi giảng viên nhiều năm kinh nghiệm, thiết kế theo form đề thi mới nhất của Hanban",
    },
    {
      icon: <FaGraduationCap className="text-2xl" />,
      title: "Giáo viên chất lượng",
      description:
        "Đội ngũ giáo viên có trình độ sư phạm cao, học vị Thạc sĩ và Tiến sĩ, nhiều năm kinh nghiệm luyện thi HSK",
    },
    {
      icon: <FaAward className="text-2xl" />,
      title: "Cam kết đỗ",
      description:
        "Pinyin Centre cam kết đỗ nếu học và ôn thi đầy đủ theo lộ trình. Nếu trượt sẽ được học lại miễn phí",
    },
    {
      icon: <FaStar className="text-2xl" />,
      title: "Sát đề thi thật",
      description:
        "Tài liệu có tính nâng cao, sát với đề thi thật và cập nhật theo xu hướng mới nhất",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 20, stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-yellow-600/10"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 dark:from-yellow-300 dark:via-red-400
             dark:to-red-300 bg-clip-text text-transparent mb-6 leading-tight" style={{ lineHeight: "1.55" }}>
              Khóa Luyện Thi HSK
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Hệ thống khóa học luyện thi HSK chuyên nghiệp,
              với cam kết đỗ và phương pháp giảng dạy hiệu quả tại Pinyin Centre
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { number: hskCategories.length || "0", label: "Cấp độ HSK", icon: <FaGraduationCap /> },
                { number: "165+", label: "Buổi học tổng", icon: <FaClock /> },
                { number: "400+", label: "Điểm ngữ pháp", icon: <FaBookOpen /> },
                {
                  number: "100%",
                  label: "Cam kết đỗ",
                  icon: <FaCheckCircle />,
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
                >
                  <div className="text-red-600 dark:text-yellow-400 mb-2 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl lg:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white"
            >
              Các Khóa Học Luyện Thi HSK
            </motion.h2>

            <div className="grid gap-8 max-w-6xl mx-auto">
              {hskCategories.map((category) => {
                const isExpanded = expandedCategoryId === category.id;
                return (
                  <motion.div
                    key={category.id}
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                        <div className="flex items-center mb-4 lg:mb-0">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold mr-4">
                            {category.name.match(/\d+/)?.[0] || "HSK"}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{category.name}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{category.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-600">
                            <FaClock className="text-red-600 dark:text-yellow-400 mr-2" />
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {category.courses?.length || 0} Gói học
                            </span>
                          </div>
                          <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-600">
                            <FaAward className="text-red-600 dark:text-yellow-400 mr-2" />
                            <span className="font-semibold text-gray-800 dark:text-white">
                              Cam kết đỗ
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                          <FaUsers className="text-red-600 dark:text-yellow-400 mr-2" />
                          Đối tượng học viên
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          Học viên muốn chinh phục chứng chỉ {category.name} với lộ trình bài bản, tinh gọn và hiệu quả cao tại Pinyin Centre.
                        </p>
                      </div>

                      <div>
                        {/* The Accordion Toggle Button */}
                        <button 
                          onClick={() => toggleAccordion(category.id)} 
                          className="flex items-center justify-between w-full text-left mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                            <FaBookOpen className="text-red-600 dark:text-yellow-400 mr-2" />
                            Danh sách khóa học & Thanh toán
                          </h4>
                          {isExpanded ? (
                            <FaChevronUp className="text-gray-600 dark:text-gray-400" />
                          ) : (
                            <FaChevronDown className="text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                        
                        {/* The Expanded Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-3 pb-4">
                                {category.courses && category.courses.length > 0 ? (
                                  category.courses.map(course => (
                                    <div key={course.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-800 transition-all">
                                      <div className="mb-4 sm:mb-0">
                                        <h5 className="font-bold text-gray-800 dark:text-white">{course.courseName}</h5>
                                        <div className="flex items-center gap-4 mt-1">
                                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                            <FaClock className="mr-1 text-blue-500" /> {course.slotNumber} buổi
                                          </p>
                                          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price || 0)}
                                          </p>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => handlePayment(course.id)} 
                                        className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                                      >
                                        Thanh toán
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-center py-4 text-gray-500 italic">Hiện tại chưa có khóa học nào cho cấp độ này.</p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm py-16">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl lg:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white"
            >
              Ưu Điểm Nổi Bật
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center border border-gray-100 dark:border-gray-700"
                >
                  <div className="text-red-600 dark:text-yellow-400 mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-red-600 to-yellow-600 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Sẵn sàng chinh phục chứng chỉ HSK?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Đăng ký ngay để nhận tư vấn lộ trình học phù hợp và ưu đãi đặc
              biệt từ Pinyin Centre
            </p>
          </motion.div>

          {/* Subscribe Component */}
          <div className="max-w-full mx-auto">
            <Subscribe />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HSKCourses;
