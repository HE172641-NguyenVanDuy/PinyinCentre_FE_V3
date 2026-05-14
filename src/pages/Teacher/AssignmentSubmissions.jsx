import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import assignmentService from "../../utils/assignmentService";
import { toast } from "react-toastify";
import { Download, Eye, CheckCircle, Clock, AlertCircle, MessageSquare, Star, FileText, ArrowLeft } from "lucide-react";

const AssignmentSubmissions = () => {
  const { classId, assignmentId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grading, setGrading] = useState({ score: "", comment: "" });

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const fetchData = async () => {
    try {
      const [assignmentRes, submissionsRes] = await Promise.all([
        assignmentService.getAssignmentById(assignmentId),
        assignmentService.getSubmissions(assignmentId)
      ]);
      setAssignment(assignmentRes.result);
      setSubmissions(submissionsRes.result);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    try {
      await assignmentService.gradeSubmission(selectedSubmission.id, grading.score, grading.comment);
      toast.success("Đã chấm điểm thành công");
      setSelectedSubmission(null);
      fetchData();
    } catch (error) {
      console.error("Error grading:", error);
      toast.error("Lỗi khi chấm điểm");
    }
  };

  const handleDownload = async (url) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        const urlParts = url.split('/');
        let fileName = urlParts[urlParts.length - 1] || 'bai-lam';
        if (!fileName.includes('.')) {
          const extension = blob.type.split('/')[1] || 'pdf';
          fileName += `.${extension === 'octet-stream' ? 'pdf' : extension}`;
        }
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (error) {
      console.warn("Fetch download failed, falling back to iframe method:", error);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 5000);
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
          onClick={() => navigate(`/teacher/assignments/${classId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách bài tập
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">{assignment?.title}</h1>
          <p className="text-gray-600">Tổng điểm: {assignment?.totalScore} | Hạn nộp: {new Date(assignment?.deadline).toLocaleString("vi-VN")}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Học viên</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Thời gian nộp</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Trạng thái</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Điểm</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800">{s.studentName}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(s.submittedAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      s.status === 'GRADED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {s.status === 'GRADED' ? 'Đã chấm' : 'Chưa chấm'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800">
                    {s.score !== null ? `${s.score}/${assignment.totalScore}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedSubmission(s);
                        setGrading({ score: s.score || "", comment: s.comment || "" });
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 ml-auto"
                    >
                      <Star size={16} />
                      Chấm điểm
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {submissions.length === 0 && (
            <div className="p-12 text-center text-gray-500">Chưa có học viên nào nộp bài.</div>
          )}
        </div>

        {/* Grading Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Chấm bài: {selectedSubmission.studentName}</h2>
                <button onClick={() => setSelectedSubmission(null)} className="text-gray-400 hover:text-gray-600">
                  <FileText className="rotate-45" size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* PDF Preview (Simple link for now, could be an iframe) */}
                <div className="flex-1 bg-gray-100 p-4 flex items-center justify-center border-r border-gray-100">
                  <div className="text-center">
                    <FileText size={64} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">File bài làm của học viên</p>
                    <button
                      onClick={() => handleDownload(selectedSubmission.fileUrl)}
                      className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
                    >
                      <Eye size={18} />
                      Xem/Tải file bài làm
                    </button>
                  </div>
                </div>
                
                {/* Grading Form */}
                <form onSubmit={handleGrade} className="w-full md:w-80 p-6 space-y-6 overflow-y-auto">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Điểm (Tối đa: {assignment.totalScore})</label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      max={assignment.totalScore}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={grading.score}
                      onChange={(e) => setGrading({ ...grading, score: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nhận xét</label>
                    <textarea
                      rows={8}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      placeholder="Nhập nhận xét của bạn..."
                      value={grading.comment}
                      onChange={(e) => setGrading({ ...grading, comment: e.target.value })}
                    />
                  </div>
                  
                  <div className="pt-4 flex flex-col gap-3">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Lưu kết quả
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSubmission(null)}
                      className="w-full border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentSubmissions;
