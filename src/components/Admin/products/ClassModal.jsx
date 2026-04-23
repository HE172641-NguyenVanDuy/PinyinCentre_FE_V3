import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Link as LinkIcon, User, BookOpen, Layers } from "lucide-react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { courseService } from "../../../utils/courseService";
import { scheduleService } from "../../../utils/scheduleService";
import { classroomService } from "../../../utils/classroomService";

const ClassModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    courseId: "",
    teacherId: "",
    startDate: null,
    endDate: null,
    slotsPerWeek: 1,
    maxStudents: 20,
    link: "",
    schedules: [{ dayOfWeek: "Monday", startTime: "08:00", endTime: "10:00" }]
  });

  const [totalSlots, setTotalSlots] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      const courseRes = await courseService.getAllCourses(1, 1000);
      if (courseRes.status === 200) setCourses(courseRes.result);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu khóa học");
    }
  };

  useEffect(() => {
    const selectedCourse = courses.find((c) => c.id === formData.courseId);
    setTotalSlots(selectedCourse ? selectedCourse.slotNumber || 0 : 0);
  }, [formData.courseId, courses]);

  const [teacherLoading, setTeacherLoading] = useState(false);

  // Tự động tải giáo viên khi chọn ngày bắt đầu
  useEffect(() => {
    if (formData.startDate && formData.schedules.length > 0 && formData.schedules[0]?.startTime && formData.schedules[0]?.endTime) {
      loadTeachers();
    }
  }, [formData.startDate]);

  const loadTeachers = async () => {
    const slot = formData.schedules[0];
    if (!slot?.startTime || !slot?.endTime || !formData.startDate) return;

    setTeacherLoading(true);
    try {
      const startTimeStr = slot.startTime.length === 5 ? slot.startTime + ":00" : slot.startTime;
      const endTimeStr = slot.endTime.length === 5 ? slot.endTime + ":00" : slot.endTime;
      
      console.log("Fetching teachers with:", {
        class_date: formData.startDate,
        start_time: startTimeStr,
        end_time: endTimeStr,
      });

      const data = await scheduleService.getAvailableTeachers({
        class_date: formData.startDate,
        start_time: startTimeStr,
        end_time: endTimeStr,
      });

      console.log("Teacher response:", data);

      if (data.status === 200 && Array.isArray(data.result)) {
        setTeachers(data.result);
      } else {
        console.error("Unexpected response format:", data);
        setTeachers([]);
      }
    } catch (err) {
      console.error("Lỗi lấy giáo viên:", err);
      toast.error("Lỗi khi tải danh sách giáo viên: " + (err.message || "Unknown"));
      setTeachers([]);
    } finally {
      setTeacherLoading(false);
    }
  };

  const updateSchedule = (index, field, value) => {
    const newSchedules = [...formData.schedules];
    newSchedules[index][field] = value;
    setFormData({ ...formData, schedules: newSchedules });
    // Reload teachers when time changes
    if (field !== "dayOfWeek" && formData.startDate) {
      setTimeout(() => loadTeachers(), 100);
    }
  };

  const generateFullSchedules = () => {
    const fullSchedules = [];
    const numberOfWeeks = formData.slotsPerWeek > 0 ? Math.ceil(totalSlots / formData.slotsPerWeek) : 0;
    let slotCount = 0;

    const daysMap = { "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6 };

    for (let week = 0; week < numberOfWeeks && slotCount < totalSlots; week++) {
      for (const slot of formData.schedules) {
        if (slotCount >= totalSlots) break;
        const dayIndex = daysMap[slot.dayOfWeek];
        let date = dayjs(formData.startDate).add(week * 7, "day").day(dayIndex);
        
        if (date.isBefore(dayjs(formData.startDate), 'day')) {
            date = date.add(1, 'week');
        }

        fullSchedules.push({
          classDate: date.format("YYYY-MM-DD"),
          startTime: slot.startTime + ":00",
          endTime: slot.endTime + ":00",
          description: "",
          link: formData.link,
        });
        slotCount++;
      }
    }
    return fullSchedules;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate) return toast.error("Vui lòng chọn ngày bắt đầu");
    if (formData.schedules.length < formData.slotsPerWeek) return toast.error(`Cần thêm đủ ${formData.slotsPerWeek} slot`);

    setLoading(true);
    try {
      const fullSchedules = generateFullSchedules();
      const lastSchedule = fullSchedules[fullSchedules.length - 1];
      
      const payload = {
        className: formData.name,
        courseId: formData.courseId,
        teacherId: formData.teacherId,
        startDate: dayjs(formData.startDate).format("YYYY-MM-DD"),
        endDate: lastSchedule ? lastSchedule.classDate : dayjs(formData.startDate).format("YYYY-MM-DD"),
        maxStudents: formData.maxStudents,
        schedules: fullSchedules,
        link: formData.link
      };

      const res = await classroomService.createClass(payload);
      if (res.status === 200) {
        toast.success("Tạo lớp học thành công");
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Thao tác thất bại");
      }
    } catch (error) {
      toast.error("Lỗi khi tạo lớp học");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="text-blue-500" /> Tạo lớp học mới
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <X className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cột trái */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2"><BookOpen size={16} /> Tên lớp học</label>
                <input 
                  type="text" required
                  placeholder="Ví dụ: Hán ngữ sơ cấp A1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2"><Layers size={16} /> Khóa học</label>
                <select 
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.courseId}
                  onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                >
                  <option value="">Chọn khóa học</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.courseName} ({c.slotNumber} buổi)</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2"><Calendar size={16} /> Ngày bắt đầu</label>
                  <input 
                    type="date" required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.startDate || ""}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2"><Clock size={16} /> Slot/tuần</label>
                  <select 
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.slotsPerWeek}
                    onChange={(e) => {
                      const count = parseInt(e.target.value);
                      const currentSchedules = [...formData.schedules];
                      let newSchedules;
                      
                      if (count > currentSchedules.length) {
                        newSchedules = [
                          ...currentSchedules,
                          ...Array(count - currentSchedules.length).fill().map(() => ({ 
                            dayOfWeek: "Monday", 
                            startTime: "08:00", 
                            endTime: "10:00" 
                          }))
                        ];
                      } else {
                        newSchedules = currentSchedules.slice(0, count);
                      }
                      
                      setFormData({
                        ...formData, 
                        slotsPerWeek: count,
                        schedules: newSchedules
                      });
                    }}
                  >
                    {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} buổi/tuần</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2"><User size={16} /> Số học sinh tối đa</label>
                  <input 
                    type="number" required min="1"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2"><LinkIcon size={16} /> Link học tập</label>
                  <input 
                    type="url" required
                    placeholder="Zoom, Meet, v.v."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.link}
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Cột phải - Lịch học */}
            <div className="space-y-4 bg-gray-800/30 p-6 rounded-2xl border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Lịch học chi tiết</h3>
              </div>

              {formData.schedules.map((slot, index) => (
                <div key={index} className="p-4 bg-gray-800 rounded-xl border border-gray-700 space-y-3 relative group">
                  <div className="grid grid-cols-1 gap-3">
                    <select 
                      className="w-full bg-gray-700 border-none rounded-lg px-3 py-2 text-sm text-white"
                      value={slot.dayOfWeek}
                      onChange={(e) => updateSchedule(index, "dayOfWeek", e.target.value)}
                    >
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <input 
                        type="time" className="flex-1 bg-gray-700 border-none rounded-lg px-3 py-2 text-sm text-white"
                        value={slot.startTime} onChange={(e) => updateSchedule(index, "startTime", e.target.value)}
                      />
                      <input 
                        type="time" className="flex-1 bg-gray-700 border-none rounded-lg px-3 py-2 text-sm text-white"
                        value={slot.endTime} onChange={(e) => updateSchedule(index, "endTime", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2"><User size={16} /> Giáo viên khả dụng</label>
                  <button 
                    type="button"
                    onClick={loadTeachers}
                    disabled={teacherLoading || !formData.startDate}
                    className="text-xs text-blue-400 hover:text-blue-300 disabled:text-gray-600"
                  >
                    {teacherLoading ? "Đang tải..." : "🔄 Tải lại"}
                  </button>
                </div>
                <select 
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                >
                  <option value="">{teacherLoading ? "Đang tải giáo viên..." : `Chọn giáo viên (${teachers.length} khả dụng)`}</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                </select>
                {!formData.startDate && <p className="text-xs text-yellow-500 mt-2">⚠️ Vui lòng chọn ngày bắt đầu để tải danh sách giáo viên.</p>}
                {formData.startDate && teachers.length === 0 && !teacherLoading && <p className="text-xs text-orange-500 mt-2">Không tìm thấy giáo viên khả dụng. Kiểm tra console để xem chi tiết.</p>}
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-xl">
             <p className="text-blue-400 text-sm">
               Dựa trên khóa học đã chọn, hệ thống sẽ tự động tạo <strong>{totalSlots} buổi học</strong> kéo dài trong khoảng <strong>{formData.slotsPerWeek > 0 ? Math.ceil(totalSlots / formData.slotsPerWeek) : 0} tuần</strong>.
             </p>
          </div>
        </form>

        <div className="p-6 border-t border-gray-800 flex gap-4 bg-gray-800/50">
          <button onClick={onClose} className="flex-1 px-6 py-3 rounded-xl bg-gray-700 text-white font-medium hover:bg-gray-600 transition-all">Hủy</button>
          <button 
            disabled={loading}
            onClick={handleSubmit}
            className="flex-2 px-12 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/20 disabled:opacity-50 transition-all"
          >
            {loading ? "Đang xử lý..." : "Xác nhận tạo lớp"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ClassModal;
