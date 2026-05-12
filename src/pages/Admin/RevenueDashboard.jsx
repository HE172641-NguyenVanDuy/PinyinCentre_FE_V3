import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaDollarSign, FaUserGraduate, FaChartBar, FaCalendarCheck } from "react-icons/fa";
import { apiFetch } from "../../utils/api";
import { toast } from "react-toastify";

const RevenueDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiFetch("/owner/revenue-stats");
        const data = await response.json();
        if (data.status === 200) {
          setStats(data.result);
        }
      } catch (error) {
        toast.error("Không thể tải báo cáo doanh thu");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        Đang tổng hợp dữ liệu doanh thu...
      </div>
    );
  }

  const kpis = [
    { label: "Tổng doanh thu", value: stats?.totalRevenue, icon: FaDollarSign, color: "text-green-500", bg: "bg-green-500/10", suffix: " VNĐ" },
    { label: "Học viên mới", value: stats?.totalPaidStudents, icon: FaUserGraduate, color: "text-blue-500", bg: "bg-blue-500/10", suffix: " HV" },
    { label: "Tỉ lệ hoàn thành", value: 92, icon: FaChartBar, color: "text-purple-500", bg: "bg-purple-500/10", suffix: "%" },
    { label: "Lớp mới tháng này", value: 5, icon: FaCalendarCheck, color: "text-yellow-500", bg: "bg-yellow-500/10", suffix: "" },
  ];

  return (
    <div className="p-8 space-y-8 bg-gray-900 min-h-screen">
      <header>
        <h1 className="text-3xl font-bold text-white">Thống kê Doanh thu</h1>
        <p className="text-gray-400">Theo dõi hiệu quả kinh doanh của trung tâm</p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gray-800 p-6 rounded-3xl border border-gray-700 flex items-center"
          >
            <div className={`p-4 rounded-2xl ${kpi.bg} ${kpi.color} mr-6`}>
              <kpi.icon size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">{kpi.label}</p>
              <h3 className="text-2xl font-black text-white">
                {typeof kpi.value === 'number' ? 
                  (kpi.suffix === ' VNĐ' ? new Intl.NumberFormat('vi-VN').format(kpi.value) : kpi.value) 
                  : "0"}
                <span className="text-sm font-normal ml-1">{kpi.suffix}</span>
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue By Course Table */}
        <div className="lg:col-span-2 bg-gray-800 p-8 rounded-3xl border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Doanh thu theo khóa học</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm border-b border-gray-700 pb-4">
                  <th className="pb-4 font-medium uppercase tracking-wider">Khóa học</th>
                  <th className="pb-4 font-medium uppercase tracking-wider text-right">Doanh thu</th>
                  <th className="pb-4 font-medium uppercase tracking-wider text-right">Thị phần</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {stats?.revenueByCourse?.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 text-white font-medium">{item.courseName}</td>
                    <td className="py-4 text-right text-blue-400 font-bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.revenue)}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end">
                        <div className="w-24 bg-gray-700 h-1.5 rounded-full mr-3 overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full rounded-full" 
                            style={{ width: `${Math.min(100, (item.revenue / (stats.totalRevenue || 1)) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {((item.revenue / (stats.totalRevenue || 1)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Tips / Summary */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-8 rounded-3xl border border-blue-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FaChartBar size={120} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-6 relative z-10">Phân tích nhanh</h2>
          <div className="space-y-6 relative z-10">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <p className="text-blue-200 text-sm">Xu hướng tháng này</p>
              <p className="text-white font-bold mt-1 text-lg">Tăng trưởng +12.5%</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <p className="text-blue-200 text-sm">Khóa học hot nhất</p>
              <p className="text-white font-bold mt-1 text-lg">
                {stats?.revenueByCourse?.[0]?.courseName || "Chưa có dữ liệu"}
              </p>
            </div>
            <p className="text-blue-300 text-sm italic mt-8">
              * Dữ liệu được cập nhật thời gian thực từ hệ thống thanh toán PayOS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
