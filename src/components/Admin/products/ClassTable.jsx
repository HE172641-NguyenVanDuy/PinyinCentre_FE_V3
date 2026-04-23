import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Calendar, User, X, Edit } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { classroomService } from "../../../utils/classroomService";
import { scheduleService } from "../../../utils/scheduleService";
import ClassModal from "./ClassModal";
import StudentListModal from "./StudentListModal";
import RemoveStudentModal from "./RemoveStudentModal";

const ClassListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [classes, setClasses] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [openAddStudentModal, setOpenAddStudentModal] = useState(false);
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [openRemoveStudentModal, setOpenRemoveStudentModal] = useState(false);
  const [openClassModal, setOpenClassModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const rowsPerPage = 5;

  // Lấy danh sách lớp học
  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await classroomService.getClassList();
      if (data.status === 200 && Array.isArray(data.result)) {
        setClasses(data.result);
        setFilteredList(data.result);
      } else {
        toast.error(data.message || "Lấy dữ liệu lớp học thất bại");
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách lớp:", error);
      toast.error("Lỗi khi lấy danh sách lớp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  // Tìm kiếm lớp
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = classes.filter(
      (item) =>
        item.name?.toLowerCase().includes(term) ||
        item.course_name?.toLowerCase().includes(term) ||
        item.teacher_name?.toLowerCase().includes(term)
    );
    setFilteredList(filtered);
    setCurrentPage(1);
  };

  const handleOpenAddStudentModal = (classId) => {
    setSelectedClassId(classId);
    setOpenAddStudentModal(true);
  };

  const handleCloseAddStudentModal = () => {
    setOpenAddStudentModal(false);
    setSelectedClassId(null);
  };

  const handleOpenRemoveStudentModal = (classId) => {
    setSelectedClassId(classId);
    setOpenRemoveStudentModal(true);
  };

  const handleCloseRemoveStudentModal = () => {
    setOpenRemoveStudentModal(false);
    setSelectedClassId(null);
  };

  const handleOpenScheduleModal = (classId) => {
    setSelectedClassId(classId);
    fetchSchedules(classId);
    setOpenScheduleModal(true);
  };

  const handleCloseScheduleModal = () => {
    setOpenScheduleModal(false);
    setSelectedClassId(null);
    setSchedules([]);
    setSelectedWeek(null);
  };

  const fetchSchedules = async (classId) => {
    try {
      const data = await scheduleService.getSchedulesByClass(classId);
      if (data.status === 200 && Array.isArray(data.result)) {
        setSchedules(data.result);
        if (data.result.length > 0) {
          const earliestDate = data.result
            .map((s) => dayjs(s.classDate))
            .sort((a, b) => a - b)[0];
          setSelectedWeek(earliestDate.startOf("week").add(1, "day"));
        }
      }
    } catch (error) {
      console.error("Lỗi lấy lịch:", error);
    }
  };

  const handleStudentChangeSuccess = () => {
    handleCloseAddStudentModal();
    handleCloseRemoveStudentModal();
    loadClasses();
  };

  const getWeekOptions = () => {
    if (!schedules.length) return [];
    const dates = schedules.map((s) => dayjs(s.classDate)).sort((a, b) => a - b);
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    const weeks = [];
    let current = minDate.startOf("week").add(1, "day");
    while (current.isBefore(maxDate, "week") || current.isSame(maxDate, "week")) {
      weeks.push(current);
      current = current.add(1, "week");
    }
    return weeks;
  };

  const generateWeeklyCalendar = () => {
    if (!selectedWeek) return { days: [], calendarData: [] };
    const days = Array.from({ length: 7 }, (_, i) => selectedWeek.add(i, "day").format("YYYY-MM-DD"));
    const calendarData = days.map((day) => {
      return schedules.filter((s) => dayjs(s.classDate).format("YYYY-MM-DD") === day).map((schedule) => {
        const classInfo = classes.find((c) => c.id === selectedClassId);
        return {
          className: classInfo?.name || "Unnamed Class",
          time: `${schedule.startTime?.substring(0, 5)} - ${schedule.endTime?.substring(0, 5)}`,
          link: schedule.link,
          description: schedule.description,
        };
      });
    });
    return { days, calendarData };
  };

  const { days, calendarData } = generateWeeklyCalendar();
  const totalPages = Math.ceil(filteredList.length / rowsPerPage);
  const paginatedData = filteredList.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getClassStatus = (startDate, endDate) => {
    const now = dayjs();
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    if (now.isBefore(start)) return { label: "Sắp diễn ra", color: "text-blue-400 bg-blue-900/20" };
    if (now.isAfter(end)) return { label: "Đã kết thúc", color: "text-gray-400 bg-gray-900/20" };
    return { label: "Đang học", color: "text-green-400 bg-green-900/20" };
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-xl rounded-2xl p-6 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-1">Quản lý Lớp học</h2>
            <p className="text-gray-400 text-sm">Theo dõi danh sách lớp, lịch học và học viên.</p>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Tìm lớp, giáo viên..."
                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                onChange={handleSearch}
                value={searchTerm}
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            </div>
            
            <button
              onClick={() => setOpenClassModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
            >
              <Plus size={18} /> Thêm lớp mới
            </button>
            
            <button
              onClick={() => navigate("/admin/schedule-page")}
              className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all border border-gray-600"
            >
              <Calendar size={18} /> Xem lịch tổng
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Tên lớp & Khóa học</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Giáo viên</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Học viên</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-transparent">
              {paginatedData.map((item) => {
                const status = getClassStatus(item.start_date, item.end_date);
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="font-semibold text-gray-100">{item.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{item.course_name}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 text-xs font-bold">
                          {item.teacher_name?.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-300">{item.teacher_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-200">
                        {dayjs(item.start_date).format("DD/MM/YYYY")}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">đến {dayjs(item.end_date).format("DD/MM/YYYY")}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 bg-purple-900/20 text-purple-400 px-2 py-1 rounded-lg text-xs font-medium">
                         <User size={12} /> {item.student_count} HV
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right space-x-2">
                       <button
                        onClick={() => navigate(`/admin/edit-class/${item.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                        title="Chỉnh sửa lớp"
                      >
                        <Edit size={18} />
                      </button>
                       <button
                        onClick={() => handleOpenScheduleModal(item.id)}
                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-all"
                        title="Xem lịch học"
                      >
                        <Calendar size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenAddStudentModal(item.id)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                        title="Thêm học viên"
                      >
                        <Plus size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenRemoveStudentModal(item.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        title="Xóa học viên"
                      >
                        <X size={18} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40"
            >
              « Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                disabled={loading}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40"
            >
              Next »
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-400 mt-4">
            Đang tải dữ liệu...
          </div>
        )}
      </motion.div>

      {/* Modal thêm học sinh */}
      {openAddStudentModal && (
        <StudentListModal
          classId={selectedClassId}
          onClose={handleCloseAddStudentModal}
          onAddSuccess={handleStudentChangeSuccess}
        />
      )}

      {/* Modal xóa học sinh */}
      {openRemoveStudentModal && (
        <RemoveStudentModal
          classId={selectedClassId}
          onClose={handleCloseRemoveStudentModal}
          onRemoveSuccess={handleStudentChangeSuccess}
        />
      )}

      {/* Modal xem lịch */}
      {openScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-7xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              Lịch học
            </h3>
            <div className="mb-4">
              <label className="text-gray-100 mr-2">Chọn tuần:</label>
              <select
                value={selectedWeek ? selectedWeek.format("YYYY-MM-DD") : ""}
                onChange={(e) => setSelectedWeek(dayjs(e.target.value))}
                className="bg-gray-700 text-white rounded-lg p-2"
              >
                {getWeekOptions().map((week) => (
                  <option
                    key={week.format("YYYY-MM-DD")}
                    value={week.format("YYYY-MM-DD")}
                  >
                    Tuần {week.format("DD/MM/YYYY")} -{" "}
                    {week.add(6, "day").format("DD/MM/YYYY")}
                  </option>
                ))}
              </select>
            </div>
            {schedules.length > 0 && selectedWeek ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      {days.map((day) => (
                        <th
                          key={day}
                          className="border border-gray-700 p-2 text-gray-100"
                        >
                          {dayjs(day).format("ddd, DD/MM")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {calendarData.map((daySchedules, index) => (
                        <td
                          key={days[index]}
                          className="border border-gray-700 p-2 min-w-[150px] align-top"
                        >
                          {daySchedules.map((slot, slotIndex) => (
                            <div
                              key={slotIndex}
                              className="bg-blue-900 bg-opacity-50 rounded p-2 text-gray-100 text-sm mb-2"
                            >
                               <p className="font-semibold">{slot.className}</p>
                              <p>{slot.time}</p>
                              {slot.link && (
                                <a
                                  href={slot.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 underline"
                                >
                                  Link
                                </a>
                              )}
                              {slot.description && <p>{slot.description}</p>}
                            </div>
                          ))}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-300">Không có lịch học</p>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCloseScheduleModal}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo lớp mới */}
      <ClassModal
        isOpen={openClassModal}
        onClose={() => setOpenClassModal(false)}
        onSuccess={loadClasses}
      />

      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
};

export default ClassListPage;
