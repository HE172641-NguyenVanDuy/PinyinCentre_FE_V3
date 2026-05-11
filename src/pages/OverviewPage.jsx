import { BarChart2, ShoppingBag, Users, Zap, UserPlus, UserCheck, UserX, GraduationCap, BookOpen, Layers, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import Header from "../components/Admin/common/Header";
import StatCard from "../components/Admin/common/StatCard";
import RegistrationChart from "../components/Admin/overview/RegistrationChart";
import CourseEnrollmentChart from "../components/Admin/overview/CourseEnrollmentChart";
import StudentStatusChart from "../components/Admin/overview/StudentStatusChart";
import ClassSizeChart from "../components/Admin/overview/ClassSizeChart";
import adminService from "../utils/adminService";

const OverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Không thể tải dữ liệu thống kê.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Thống Kê Tổng Quan" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* Section 1: Quản lý học viên */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
            <Users className="mr-2 text-blue-400" /> Quản lý học viên
          </h2>
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StatCard name="Tổng số học viên" icon={Users} value={stats.totalStudents} color="#3B82F6" />
            <StatCard name="Học viên mới (30 ngày)" icon={UserPlus} value={stats.newStudents} color="#10B981" />
            <StatCard name="Học viên đang học" icon={UserCheck} value={stats.activeStudents} color="#6366F1" />
            <StatCard name="Học viên nghỉ / bảo lưu" icon={UserX} value={stats.inactiveStudents} color="#EF4444" />
          </motion.div>
        </div>

        {/* Section 2: Quản lý giáo viên */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
            <GraduationCap className="mr-2 text-pink-400" /> Quản lý giáo viên
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 grid grid-cols-1 gap-5">
              <StatCard name="Tổng số giáo viên" icon={GraduationCap} value={stats.totalTeachers} color="#EC4899" />
              <StatCard name="Giáo viên đang dạy" icon={UserCheck} value={stats.teachingTeachers} color="#10B981" />
            </div>
            <div className="lg:col-span-2 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-100 mb-4">Số lớp mỗi giáo viên</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tên giáo viên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Số lớp đang dạy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {stats.classesPerTeacher.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{item.teacherName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.classCount}</td>
                      </tr>
                    ))}
                    {stats.classesPerTeacher.length === 0 && (
                      <tr>
                        <td colSpan="2" className="px-6 py-4 text-center text-gray-500">Chưa có dữ liệu giáo viên.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Biểu đồ thống kê */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
            <BarChart2 className="mr-2 text-green-400" /> Phân tích dữ liệu
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RegistrationChart />
            <CourseEnrollmentChart />
            <StudentStatusChart />
            <ClassSizeChart />
          </div>
        </div>

        {/* Section 4: Quản lý khóa học / lớp học */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
            <BookOpen className="mr-2 text-yellow-400" /> Quản lý khóa học / lớp học
          </h2>
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StatCard name="Tổng khóa học" icon={BookOpen} value={stats.totalCourses} color="#F59E0B" />
            <StatCard name="Tổng lớp đang mở" icon={Layers} value={stats.totalOpenClasses} color="#3B82F6" />
            <StatCard name="Lớp sắp khai giảng" icon={Clock} value={stats.upcomingClasses} color="#8B5CF6" />
            <StatCard name="Lớp đã đầy" icon={AlertTriangle} value={stats.fullClasses} color="#EF4444" />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;
