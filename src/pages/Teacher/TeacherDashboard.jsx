import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Users,
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  X,
  MapPin,
  CheckCircle,
  Info,
} from "lucide-react";
import Header from "../../components/Admin/common/Header";
import { useAuth } from "../../components/Shared/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import FloatingChatIcons from "../../components/Shared/FloatingChatIcons";

const defaultStats = {
  totalClasses: 0,
  totalStudents: 0,
  todayClasses: 0,
  weeklyHours: 0,
};

const TeacherDashboard = () => {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); // overview, schedule, classes
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(false);

  // Schedule States
  const [selectedWeek, setSelectedWeek] = useState(dayjs().startOf("week"));
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Classes States
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedClass, setExpandedClass] = useState(null);

  useEffect(() => {
    if (role !== 2 && role !== "2") {
      navigate("/login");
      return;
    }
    fetchTeacherStats();
  }, [role, navigate]);

  useEffect(() => {
    if (activeTab === "schedule") {
      fetchSchedules();
    } else if (activeTab === "classes") {
      fetchClasses();
    }
  }, [activeTab, selectedWeek]);

  const fetchTeacherStats = async () => {
    try {
      const res = await apiFetch("/teacher/stats");
      const data = await res.json();
      if (data.status === 200 && data.result) {
        setStats(data.result);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error);
    }
  };

  const fetchSchedules = async () => {
    setLoadingSchedule(true);
    try {
      const startDate = selectedWeek.format("YYYY-MM-DD");
      const endDate = selectedWeek.endOf("week").format("YYYY-MM-DD");
      const res = await apiFetch(
        `/teacher/schedule?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      if (data.status === 200) {
        setSchedules(data.result || []);
      }
    } catch (error) {
      toast.error("Không thể tải lịch dạy");
    } finally {
      setLoadingSchedule(false);
    }
  };

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const res = await apiFetch("/teacher/classes");
      const data = await res.json();
      if (data.status === 200) {
        setClasses(data.result || []);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách lớp");
    } finally {
      setLoadingClasses(false);
    }
  };

  const menuItems = [
    {
      id: "schedule",
      title: "Lịch dạy",
      description: "Xem chi tiết lịch dạy của bạn",
      icon: CalendarIcon,
      color: "bg-blue-500",
    },
    {
      id: "classes",
      title: "Danh sách lớp",
      description: "Quản lý lớp học và học viên",
      icon: Users,
      color: "bg-green-500",
    },
  ];

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Schedule Helpers
  const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
    selectedWeek.add(i, "day")
  );
  const getSchedulesForDay = (date) =>
    schedules.filter((s) => dayjs(s.class_date).isSame(dayjs(date), "day"));

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title={activeTab === "overview" ? "Dashboard Giáo viên" : activeTab === "schedule" ? "Lịch dạy của tôi" : "Lớp học & Học viên"} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-fit">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
              activeTab === "overview"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
              activeTab === "schedule"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Lịch dạy
          </button>
          <button
            onClick={() => setActiveTab("classes")}
            className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
              activeTab === "classes"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Danh sách lớp
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Welcome */}
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl">
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-2">
                    Chào mừng trở lại, {user?.fullName || "Giáo viên"}! 👋
                  </h2>
                  <p className="text-blue-100 max-w-xl">
                    Hôm nay bạn có {stats.todayClasses} lớp học. Hãy kiểm tra lịch dạy và chuẩn bị thật tốt nhé!
                  </p>
                </div>
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-10">
                  <Users size={300} />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Tổng số lớp", value: stats.totalClasses, icon: BookOpen, color: "blue", tab: "classes" },
                  { label: "Tổng học viên", value: stats.totalStudents, icon: Users, color: "green", tab: "classes" },
                  { label: "Lớp hôm nay", value: stats.todayClasses, icon: CalendarIcon, color: "purple", tab: "schedule" },
                  { label: "Giờ dạy tuần", value: `${stats.weeklyHours}h`, icon: Clock, color: "orange", tab: "schedule" },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -5 }}
                    onClick={() => setActiveTab(stat.tab)}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-colors`}>
                        <stat.icon size={24} />
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thống kê</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
                    <div className="text-slate-500 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer flex items-center space-x-6 group"
                  >
                    <div className={`${item.color} p-5 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <item.icon size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{item.title}</h3>
                      <p className="text-slate-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "schedule" && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Lịch dạy chi tiết</h2>
                  <p className="text-slate-500">Tuần từ {selectedWeek.format("DD/MM/YYYY")} đến {selectedWeek.endOf("week").format("DD/MM/YYYY")}</p>
                </div>
                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                  <button onClick={() => setSelectedWeek(selectedWeek.subtract(1, "week"))} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setSelectedWeek(dayjs().startOf("week"))} className="px-5 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 hover:bg-slate-200">
                    Hôm nay
                  </button>
                  <button onClick={() => setSelectedWeek(selectedWeek.add(1, "week"))} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {daysOfWeek.map((day, idx) => {
                  const daySchedules = getSchedulesForDay(day);
                  const isToday = day.isSame(dayjs(), "day");
                  return (
                    <div key={idx} className={`bg-white rounded-2xl p-4 border ${isToday ? "border-blue-500 ring-4 ring-blue-50" : "border-slate-100"} shadow-sm min-h-[300px]`}>
                      <div className="text-center mb-4 pb-4 border-b border-slate-50">
                        <p className={`text-xs font-bold uppercase ${isToday ? "text-blue-600" : "text-slate-400"}`}>{day.locale("vi").format("dddd")}</p>
                        <p className={`text-2xl font-black ${isToday ? "text-blue-700" : "text-slate-800"}`}>{day.format("DD")}</p>
                      </div>
                      <div className="space-y-3">
                        {daySchedules.map((s, sIdx) => (
                          <div key={sIdx} className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer group">
                            <p className="font-bold text-blue-900 text-sm mb-1">{s.classroom_name}</p>
                            <div className="flex items-center text-[10px] text-blue-700 font-semibold mb-2">
                              <Clock size={10} className="mr-1" /> {s.start_time} - {s.end_time}
                            </div>
                            <button
                              onClick={() => navigate(`/attendance?scheduleId=${s.id}&classId=${s.classroom_id}`)}
                              className="w-full py-1.5 bg-white text-blue-600 rounded-lg text-xs font-bold border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                            >
                              Điểm danh
                            </button>
                          </div>
                        ))}
                        {daySchedules.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                            <Clock size={24} className="opacity-20 mb-2" />
                            <p className="text-[10px] font-bold uppercase italic">Nghỉ dạy</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "classes" && (
            <motion.div
              key="classes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Quản lý lớp học</h2>
                  <p className="text-slate-500">Bạn đang phụ trách {classes.length} lớp học</p>
                </div>
                <div className="relative mt-4 md:mt-0 w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Tìm tên lớp hoặc khóa học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {filteredClasses.map((cls, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex items-center space-x-5">
                        <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
                          <BookOpen size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">{cls.name}</h3>
                          <p className="text-slate-500 font-medium">{cls.course_name}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="flex items-center text-xs font-bold text-slate-400">
                              <Users size={14} className="mr-1" /> {cls.student_count} học viên
                            </span>
                            <span className="flex items-center text-xs font-bold text-slate-400">
                              <CalendarIcon size={14} className="mr-1" /> {dayjs(cls.start_date).format("DD/MM/YYYY")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3 w-full md:w-auto">
                        <button
                          onClick={() => setExpandedClass(expandedClass === cls.id ? null : cls.id)}
                          className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                            expandedClass === cls.id
                              ? "bg-slate-800 text-white"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                          }`}
                        >
                          <Users size={18} />
                          <span>{expandedClass === cls.id ? "Ẩn danh sách" : "Xem học viên"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Students List Expansion */}
                    <AnimatePresence>
                      {expandedClass === cls.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-50 bg-slate-50/50"
                        >
                          <div className="p-6">
                            <h4 className="font-bold text-slate-700 mb-4 flex items-center">
                              <Info size={16} className="mr-2 text-blue-500" />
                              Danh sách học viên ({cls.students?.length || 0})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {cls.students && cls.students.length > 0 ? (
                                cls.students.map((student, sIdx) => (
                                  <div key={sIdx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm">
                                      {student.fullName?.charAt(0) || "S"}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-800 text-sm">{student.fullName}</p>
                                      <p className="text-xs text-slate-500 truncate max-w-[150px]">{student.email}</p>
                                    </div>
                                    <div className="ml-auto">
                                       <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="col-span-full py-8 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                                  Lớp này hiện chưa có học viên nào.
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                {filteredClasses.length === 0 && !loadingClasses && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-medium">Không tìm thấy lớp học nào khớp với tìm kiếm.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FloatingChatIcons showSocialIcons={false} />
    </div>
  );
};

export default TeacherDashboard;
