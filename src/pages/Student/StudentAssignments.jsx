import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import assignmentService from "../../utils/assignmentService";
import { toast } from "react-toastify";
import { FileText, Calendar, ChevronRight, CheckCircle, Clock, AlertCircle, ArrowLeft } from "lucide-react";
import { classroomService } from "../../utils/classroomService";

const StudentAssignments = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState(null);

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

  const getStatusBadge = (status) => {
    switch (status) {
      case "Đã chấm":
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Đã chấm</span>;
      case "Đã nộp":
        return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12} /> Đã nộp</span>;
      case "Quá hạn":
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><AlertCircle size={12} /> Quá hạn</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12} /> Chưa nộp</span>;
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
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/student/classes")}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách lớp
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Bài tập về nhà</h1>
          {classInfo && (
            <p className="text-gray-600 text-lg">Lớp: {classInfo.className}</p>
          )}
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Chưa có bài tập nào</h3>
            <p className="text-gray-500">Giáo viên chưa giao bài tập cho lớp này.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                onClick={() => navigate(`/student/assignments/${classId}/${assignment.id}`)}
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center"
              >
                <div className="flex gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-blue-600 h-fit">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">{assignment.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        Hạn nộp: {new Date(assignment.deadline).toLocaleString("vi-VN")}
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusBadge(assignment.status)}
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight className="text-gray-400" size={20} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;
