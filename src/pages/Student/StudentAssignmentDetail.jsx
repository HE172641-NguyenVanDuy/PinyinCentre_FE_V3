import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import assignmentService from "../../utils/assignmentService";
import { toast } from "react-toastify";
import { FileText, Calendar, CheckCircle, Clock, AlertCircle, Download, Upload, MessageSquare, Star, ArrowLeft } from "lucide-react";

const StudentAssignmentDetail = () => {
  const { classId, assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const fetchData = async () => {
    try {
      const [assignmentRes, submissionRes] = await Promise.all([
        assignmentService.getAssignmentById(assignmentId),
        assignmentService.getMySubmission(assignmentId)
      ]);
      setAssignment(assignmentRes.result);
      setSubmission(submissionRes.result);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải thông tin bài tập");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setSubmitting(true);
    const formData = new FormData();
    formData.append("assignmentId", assignmentId);
    formData.append("file", file);

    try {
      await assignmentService.submitAssignment(formData);
      toast.success("Đã nộp bài thành công");
      fetchData();
      setFile(null);
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("Lỗi khi nộp bài");
    } finally {
      setSubmitting(false);
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
        
        // Trích xuất tên file từ URL
        const urlParts = url.split('/');
        let fileName = urlParts[urlParts.length - 1] || 'tai-lieu';
        
        // Nếu tên file không có phần mở rộng, thử lấy từ blob type hoặc mặc định là .pdf
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
      
      // Cách dự phòng: Iframe ẩn giúp kích hoạt trình tải xuống của trình duyệt
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

  const isOverdue = new Date() > new Date(assignment.deadline);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(`/student/assignments/${classId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách bài tập
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Assignment Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{assignment.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8 pb-4 border-b border-gray-50">
              <span className="flex items-center gap-1"><Calendar size={16} /> Hạn nộp: {new Date(assignment.deadline).toLocaleString("vi-VN")}</span>
              <span className="flex items-center gap-1"><Star size={16} /> {assignment.totalScore} điểm</span>
            </div>
            
            <div className="prose max-w-none text-gray-600 mb-8">
              <p className="whitespace-pre-wrap">{assignment.description}</p>
            </div>

            {assignment.fileUrl && (
              <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Tài liệu đính kèm</p>
                    <p className="text-xs text-gray-500">Xem yêu cầu từ giáo viên</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(assignment.fileUrl)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download size={16} /> Tải xuống
                </button>
              </div>
            )}
          </div>

          {/* Results/Feedback Section if Graded */}
          {submission?.status === "GRADED" && (
            <div className="bg-green-50 p-8 rounded-2xl border border-green-100 shadow-sm">
              <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle size={24} />
                Kết quả bài làm
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-green-600 font-medium mb-1">Điểm số</p>
                  <p className="text-3xl font-black text-green-700">{submission.score} / {assignment.totalScore}</p>
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium mb-1">Thời gian chấm</p>
                  <p className="text-gray-700 font-medium">{new Date(submission.gradedAt).toLocaleString("vi-VN")}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-green-200">
                <p className="text-sm text-green-600 font-medium mb-2 flex items-center gap-2">
                  <MessageSquare size={16} /> Nhận xét từ giáo viên
                </p>
                <div className="bg-white p-4 rounded-xl text-gray-700 italic">
                  {submission.comment || "Không có nhận xét nào."}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Submission Status */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Trạng thái bài nộp</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Tình trạng:</span>
                {submission ? (
                  <span className="font-semibold text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Đã nộp</span>
                ) : (
                  <span className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                    {isOverdue ? 'Quá hạn' : 'Chưa nộp'}
                  </span>
                )}
              </div>
              {submission && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Thời gian nộp:</span>
                  <span className="font-medium text-gray-700">
                    {new Date(submission.submittedAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              )}
            </div>

            {(!submission || (submission.status === "SUBMITTED" && !isOverdue)) && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="submit-file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <label htmlFor="submit-file" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="bg-gray-50 p-2 rounded-lg text-gray-400">
                      <Upload size={24} />
                    </div>
                    <span className="text-xs text-gray-500">
                      {file ? file.name : "Nhấn để chọn bài làm"}
                    </span>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={!file || submitting}
                  className={`w-full py-2 rounded-lg font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                    !file || submitting 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <> <Upload size={18} /> {submission ? 'Nộp lại bài' : 'Nộp bài làm'} </>
                  )}
                </button>
              </form>
            )}

            {submission && (
              <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-500 mb-2 uppercase font-black tracking-wider">File đã nộp</p>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText size={16} className="text-red-500 shrink-0" />
                    <span className="text-sm text-gray-700 truncate">Bài làm của tôi</span>
                  </div>
                  <button 
                    onClick={() => handleDownload(submission.fileUrl)} 
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
             <h3 className="font-bold mb-2 flex items-center gap-2"><AlertCircle size={18} /> Lưu ý</h3>
             <ul className="text-xs space-y-2 opacity-90 list-disc pl-4">
               <li>Chỉ chấp nhận file PDF hoặc định dạng văn bản/hình ảnh phổ biến.</li>
               <li>Sau khi giáo viên đã chấm điểm, bạn sẽ không thể nộp lại bài.</li>
               <li>Nộp bài sau thời gian quy định sẽ được đánh dấu là "Nộp muộn".</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default StudentAssignmentDetail;
