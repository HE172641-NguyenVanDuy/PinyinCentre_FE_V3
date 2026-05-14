import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import assignmentService from "../../utils/assignmentService";
import { toast } from "react-toastify";
import { Plus, FileText, Calendar, Users, ChevronRight, Download, Eye, CheckCircle, Clock, AlertCircle, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { classroomService } from "../../utils/classroomService";

const TeacherAssignments = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [classInfo, setClassInfo] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  
  // Create Modal State
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    deadline: "",
    totalScore: 100,
    file: null,
  });

  useEffect(() => {
    fetchAssignments();
    fetchClassInfo();
  }, [classId]);

  const fetchAssignments = async () => {
    try {
      const response = await assignmentService.getAssignmentsByClass(classId);
      setAssignments(response.result);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Không thể tải danh sách bài tập");
    } finally {
      setLoading(false);
    }
  };

  const fetchClassInfo = async () => {
    try {
      const response = await classroomService.getClassById(classId);
      setClassInfo(response.result);
    } catch (error) {
      console.error("Error fetching class info:", error);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", newAssignment.title);
    formData.append("description", newAssignment.description);
    formData.append("deadline", newAssignment.deadline);
    formData.append("totalScore", newAssignment.totalScore);
    formData.append("classId", classId);
    if (newAssignment.file) {
      formData.append("file", newAssignment.file);
    }

    try {
      await assignmentService.createAssignment(formData);
      toast.success("Đã tạo bài tập thành công");
      setShowCreateModal(false);
      fetchAssignments();
      setNewAssignment({ title: "", description: "", deadline: "", totalScore: 100, file: null });
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Lỗi khi tạo bài tập");
    }
  };

  const handleEditClick = (e, assignment) => {
    e.stopPropagation();
    setEditingAssignment({
      ...assignment,
      deadline: assignment.deadline ? assignment.deadline.substring(0, 16) : "",
      file: null // Don't pre-populate file object, user can upload new one
    });
    setShowEditModal(true);
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", editingAssignment.title);
    formData.append("description", editingAssignment.description);
    formData.append("deadline", editingAssignment.deadline);
    formData.append("totalScore", editingAssignment.totalScore);
    formData.append("classId", classId);
    if (editingAssignment.file) {
      formData.append("file", editingAssignment.file);
    }

    try {
      await assignmentService.updateAssignment(editingAssignment.id, formData);
      toast.success("Cập nhật bài tập thành công");
      setShowEditModal(false);
      fetchAssignments();
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast.error("Lỗi khi cập nhật bài tập");
    }
  };

  const handleDeleteAssignment = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa bài tập này? Tất cả bài nộp của học viên cũng sẽ bị xóa.")) {
      try {
        await assignmentService.deleteAssignment(id);
        toast.success("Đã xóa bài tập thành công");
        fetchAssignments();
      } catch (error) {
        console.error("Error deleting assignment:", error);
        toast.error("Lỗi khi xóa bài tập");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Quay lại trang trước
        </button>

        <div className="flex justify-between items-center mb-8">
          <div>
            {classInfo && (
              <h1 className="text-2xl font-bold text-gray-800">Lớp: {classInfo.className}</h1>
            )}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus size={20} />
            Tạo bài tập mới
          </button>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-blue-500" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có bài tập nào</h3>
            <p className="text-gray-500 mb-6">Hãy tạo bài tập đầu tiên để học viên có thể thực hành.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-blue-600 font-semibold hover:underline"
            >
              Bắt đầu ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/teacher/assignments/${classId}/submissions/${assignment.id}`)}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                      <FileText size={24} />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => handleEditClick(e, assignment)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteAssignment(e, assignment.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center">
                        {assignment.totalScore} điểm
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{assignment.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{assignment.description}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar size={16} />
                    <span>Hạn nộp: {new Date(assignment.deadline).toLocaleString("vi-VN")}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <Users size={16} />
                    <span>Xem bài làm</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Assignment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Tạo bài tập mới</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateAssignment} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề bài tập *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ví dụ: Luyện tập HSK 3 - Phần nghe"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả yêu cầu</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Nhập hướng dẫn chi tiết cho học viên..."
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hạn nộp (Deadline) *</label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={newAssignment.deadline}
                      onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tổng điểm</label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={newAssignment.totalScore}
                      onChange={(e) => setNewAssignment({ ...newAssignment, totalScore: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">File đính kèm (PDF)</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="assignment-file"
                      className="hidden"
                      onChange={(e) => setNewAssignment({ ...newAssignment, file: e.target.files[0] })}
                      accept=".pdf"
                    />
                    <label htmlFor="assignment-file" className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="bg-gray-50 p-2 rounded-lg text-gray-400">
                        <Plus size={24} />
                      </div>
                      <span className="text-sm text-gray-500">
                        {newAssignment.file ? newAssignment.file.name : "Nhấn để chọn file hoặc kéo thả vào đây"}
                      </span>
                    </label>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                  >
                    Tạo bài tập
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Assignment Modal */}
        {showEditModal && editingAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa bài tập</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateAssignment} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề bài tập *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ví dụ: Luyện tập HSK 3 - Phần nghe"
                    value={editingAssignment.title}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, title: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả yêu cầu</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Nhập hướng dẫn chi tiết cho học viên..."
                    value={editingAssignment.description}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, description: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hạn nộp (Deadline) *</label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={editingAssignment.deadline}
                      onChange={(e) => setEditingAssignment({ ...editingAssignment, deadline: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tổng điểm</label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={editingAssignment.totalScore}
                      onChange={(e) => setEditingAssignment({ ...editingAssignment, totalScore: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">File đính kèm (PDF - Tải lên để thay thế file cũ)</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="edit-assignment-file"
                      className="hidden"
                      onChange={(e) => setEditingAssignment({ ...editingAssignment, file: e.target.files[0] })}
                      accept=".pdf"
                    />
                    <label htmlFor="edit-assignment-file" className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="bg-gray-50 p-2 rounded-lg text-gray-400">
                        <Plus size={24} />
                      </div>
                      <span className="text-sm text-gray-500">
                        {editingAssignment.file ? editingAssignment.file.name : (editingAssignment.fileUrl ? "Đã có file đính kèm. Nhấn để thay đổi." : "Nhấn để chọn file hoặc kéo thả vào đây")}
                      </span>
                    </label>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAssignments;
