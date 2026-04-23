import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { X, Calendar, Plus, Save, ArrowLeft, Clock, Link as LinkIcon, Edit3 } from "lucide-react";
import dayjs from "dayjs";
import { classroomService } from "../../utils/classroomService";
import { courseService } from "../../utils/courseService";
import { userService } from "../../utils/userService";

const EditClassPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    className: "",
    courseId: "",
    teacherId: "",
    startDate: "",
    endDate: "",
    maxStudents: 20,
    slotsPerWeek: 1,
    schedules: [],
  });
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [newSchedule, setNewSchedule] = useState({
    classDate: "",
    startTime: "08:00",
    endTime: "10:00",
    link: "",
    description: "",
  });

  useEffect(() => {
    const loadInitialData = async () => {
      setFetching(true);
      try {
        // Load class data
        const classRes = await classroomService.getClassById(id);
        if (classRes.status === 200 && classRes.result) {
          const classData = classRes.result;
          setFormData({
            className: classData.className || "",
            courseId: classData.courseId || "",
            teacherId: classData.teacherId || "",
            startDate: classData.startDate || "",
            endDate: classData.endDate || "",
            maxStudents: classData.maxStudents || 20,
            slotsPerWeek: 1,
            schedules: (classData.schedules || []).map(s => ({
              id: s.id,
              classDate: s.classDate,
              startTime: s.startTime,
              endTime: s.endTime,
              link: s.link || "",
              description: s.description || ""
            }))
          });
        } else {
          toast.error("Không tìm thấy thông tin lớp học");
          navigate("/admin/classes");
        }

        // Load courses
        const courseRes = await courseService.getAllCourses(1, 1000);
        if (courseRes.status === 200) setCourses(courseRes.result);

        // Load teachers
        const teacherRes = await userService.getUsersByRole("TEACHER", 1, 1, 1000);
        if (teacherRes.status === 200) setTeachers(teacherRes.result);

      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Lỗi khi tải dữ liệu");
      } finally {
        setFetching(false);
      }
    };

    loadInitialData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule({ ...newSchedule, [name]: value });
  };

  const addSchedule = () => {
    if (!newSchedule.classDate || !newSchedule.startTime || !newSchedule.endTime) {
      toast.error("Vui lòng điền đầy đủ ngày và giờ");
      return;
    }
    const updatedSchedules = [...formData.schedules, { ...newSchedule }].sort((a, b) => {
      const dateCompare = (a.classDate || "").localeCompare(b.classDate || "");
      if (dateCompare !== 0) return dateCompare;
      return (a.startTime || "").localeCompare(b.startTime || "");
    });
    setFormData({
      ...formData,
      schedules: updatedSchedules,
    });
    setNewSchedule({
      classDate: "",
      startTime: "08:00",
      endTime: "10:00",
      link: "",
      description: "",
    });
  };

  const removeSchedule = (index) => {
    setFormData({
      ...formData,
      schedules: formData.schedules.filter((_, i) => i !== index),
    });
  };

  const generateSchedules = () => {
    if (!formData.startDate) {
      toast.error("Vui lòng chọn ngày bắt đầu");
      return;
    }
    
    const newSchedules = [];
    let currentDate = dayjs(formData.startDate);
    
    for (let i = 0; i < formData.slotsPerWeek; i++) {
      newSchedules.push({
        classDate: currentDate.format("YYYY-MM-DD"),
        startTime: "08:00",
        endTime: "10:00",
        link: "",
        description: `Buổi học ${i + 1}`,
      });
      currentDate = currentDate.add(1, "week");
    }
    
    setFormData({
      ...formData,
      schedules: [...formData.schedules, ...newSchedules],
    });
    toast.success(`Đã tạo tự động ${formData.slotsPerWeek} buổi học`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await classroomService.updateClass(id, formData);
      if (res.status === 200) {
        toast.success("Cập nhật lớp thành công");
        navigate("/admin/classes");
      } else {
        toast.error(res.message || "Cập nhật thất bại");
      }
    } catch (error) {
      toast.error("Lỗi khi kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-400 animate-pulse font-medium">Đang tải dữ liệu lớp học...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-slate-900/40 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 backdrop-blur-md">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/30">
          <div>
            <button 
              onClick={() => navigate("/admin/classes")}
              className="flex items-center text-slate-400 hover:text-white transition-colors mb-2 text-sm font-medium"
            >
              <ArrowLeft size={14} className="mr-1" />
              Quay lại
            </button>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Edit3 className="mr-3 text-blue-400" size={24} />
              Chỉnh sửa lớp học
            </h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all font-semibold flex items-center shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-10">
          {/* Thông tin chung */}
          <section>
            <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center">
              <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
              Thông tin cơ bản
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tên lớp học</label>
                <input
                  type="text"
                  name="className"
                  value={formData.className}
                  onChange={handleInputChange}
                  placeholder="Nhập tên lớp..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Khóa học</label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                >
                  <option value="">Chọn khóa học</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.courseName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Giảng viên</label>
                <select
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                >
                  <option value="">Chọn giảng viên</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Sĩ số tối đa</label>
                <input
                  type="number"
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Ngày bắt đầu</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Ngày kết thúc</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </section>

          {/* Lịch học */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-500 flex items-center justify-center mr-3 text-sm">2</span>
                Quản lý lịch học
              </h3>
              
              <div className="flex items-center bg-gray-800 p-1.5 rounded-xl border border-gray-700">
                <span className="text-xs text-gray-500 px-3 font-medium uppercase tracking-wider">Tạo lịch nhanh:</span>
                <input
                  type="number"
                  name="slotsPerWeek"
                  value={formData.slotsPerWeek}
                  onChange={handleInputChange}
                  className="w-16 bg-gray-900 border-none rounded-lg px-2 py-1 text-white text-center focus:ring-1 focus:ring-indigo-500 outline-none"
                  min="1"
                  max="10"
                />
                <button
                  type="button"
                  onClick={generateSchedules}
                  className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-900/20 flex items-center"
                >
                  <Plus size={14} className="mr-1" />
                  GENERATE
                </button>
              </div>
            </div>

            {/* Thêm buổi học thủ công */}
            <div className="mb-8 p-5 bg-slate-800/60 rounded-2xl border border-slate-700/50">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                <Plus size={13} className="mr-2 text-blue-400" />
                Thêm buổi học thủ công
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Ngày học */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                    <Calendar size={11} className="mr-1.5 text-blue-400" /> Ngày học
                  </label>
                  <input
                    type="date"
                    name="classDate"
                    value={newSchedule.classDate}
                    onChange={handleScheduleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  />
                </div>
                {/* Giờ bắt đầu */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                    <Clock size={11} className="mr-1.5 text-green-400" /> Giờ bắt đầu
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={newSchedule.startTime}
                    onChange={handleScheduleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-green-500 outline-none text-sm transition-all"
                  />
                </div>
                {/* Giờ kết thúc */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                    <Clock size={11} className="mr-1.5 text-orange-400" /> Giờ kết thúc
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={newSchedule.endTime}
                    onChange={handleScheduleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-all"
                  />
                </div>
                {/* Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                    <LinkIcon size={11} className="mr-1.5 text-purple-400" /> Link buổi học
                  </label>
                  <input
                    type="text"
                    name="link"
                    value={newSchedule.link}
                    onChange={handleScheduleChange}
                    placeholder="Zoom / Google Meet..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all placeholder:text-slate-600"
                  />
                </div>
                {/* Mô tả */}
                <div className="space-y-1.5 sm:col-span-1 lg:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Mô tả buổi học
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={newSchedule.description}
                    onChange={handleScheduleChange}
                    placeholder="Ví dụ: Kiểm tra giữa kỳ, Ôn tập chương 3..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={addSchedule}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/30 flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Thêm buổi học
                </button>
              </div>
            </div>

            {/* Danh sách buổi học */}
            <div className="overflow-hidden rounded-xl border border-gray-800">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Buổi số</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Thời gian</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Thông tin chi tiết</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-gray-800">
                  {formData.schedules.length > 0 ? (
                    formData.schedules.map((schedule, index) => (
                      <tr key={index} className="hover:bg-gray-800/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="w-6 h-6 rounded-full bg-gray-800 text-gray-400 text-[10px] font-bold flex items-center justify-center border border-gray-700">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-white font-medium flex items-center">
                              <Calendar size={14} className="mr-2 text-gray-500" />
                              {dayjs(schedule.classDate).format("DD/MM/YYYY")}
                            </span>
                            <span className="text-gray-400 text-xs mt-1 flex items-center">
                              <Clock size={12} className="mr-2" />
                              {(schedule.startTime || "").substring(0, 5) || "--:--"} - {(schedule.endTime || "").substring(0, 5) || "--:--"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col max-w-xs">
                            <span className="text-gray-300 text-sm italic">{schedule.description || "Không có mô tả"}</span>
                            {schedule.link && (
                              <a href={schedule.link} target="_blank" rel="noreferrer" className="text-blue-400 text-xs mt-1 flex items-center hover:underline">
                                <LinkIcon size={10} className="mr-1" />
                                {schedule.link}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => removeSchedule(index)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        Chưa có buổi học nào được thiết lập. Hãy nhấn "Tạo lịch nhanh" hoặc thêm thủ công.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
};

export default EditClassPage;
