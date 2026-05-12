import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Edit, Trash2, Plus, Layers } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { courseService } from "../../../utils/courseService";
import { hskCategoryService } from "../../../utils/hskCategoryService";

const CourseTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ 
    courseName: "", 
    slotNumber: 0, 
    price: 0,
    hskCategoryId: ""
  });
  
  const rowsPerPage = 10;

  const loadData = async () => {
    try {
      setLoading(true);
      const [courseData, catData] = await Promise.all([
        courseService.getAllCourses(1, 1000),
        hskCategoryService.getAllCategories()
      ]);

      if (courseData.status === 200 && Array.isArray(courseData.result)) {
        setCourses(courseData.result);
        setFilteredList(courseData.result);
      }
      
      if (catData.status === 200 && Array.isArray(catData.result)) {
        setCategories(catData.result);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      toast.error("Lỗi khi lấy dữ liệu từ hệ thống");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = courses.filter(
      (item) =>
        item.courseName?.toLowerCase().includes(term) ||
        item.hskCategoryName?.toLowerCase().includes(term)
    );
    setFilteredList(filtered);
    setCurrentPage(1);
  };

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({ 
        courseName: course.courseName, 
        slotNumber: course.slotNumber,
        price: course.price || 0,
        hskCategoryId: course.hskCategoryId || ""
      });
    } else {
      setEditingCourse(null);
      setFormData({ 
        courseName: "", 
        slotNumber: 0, 
        price: 0,
        hskCategoryId: ""
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const dataToSave = {
      ...formData,
      slotNumber: parseInt(formData.slotNumber) || 0,
      price: parseInt(formData.price) || 0
    };

    if (dataToSave.price < 2000 || dataToSave.price > 500000000) {
      toast.error("Giá tiền phải trong khoảng 2.000 VNĐ đến 500.000.000 VNĐ");
      setLoading(false);
      return;
    }
    
    try {
      let result;
      if (editingCourse) {
        result = await courseService.updateCourse(editingCourse.id, dataToSave);
      } else {
        result = await courseService.createCourse(dataToSave);
      }

      if (result.status === 200) {
        toast.success(editingCourse ? "Cập nhật thành công" : "Tạo khóa học thành công");
        setShowModal(false);
        loadData();
      } else {
        toast.error(result.message || "Thao tác thất bại");
      }
    } catch (error) {
      console.error("Save course error:", error);
      toast.error(error.response?.data?.message || "Lỗi khi lưu khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa/thay đổi trạng thái khóa học này?")) return;
    setLoading(true);
    try {
      const result = await courseService.deleteCourse(id);
      if (result.status === 200) {
        toast.success("Thao tác thành công");
        loadData();
      } else {
        toast.error(result.message || "Thao tác thất bại");
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(filteredList.length / rowsPerPage);
  const paginatedData = filteredList.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <>
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-100">
            Quản lý Khóa học
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleSearch}
                value={searchTerm}
                disabled={loading}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors"
              disabled={loading}
            >
              <Plus size={18} /> Thêm khóa học
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tên khóa học</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Danh mục HSK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Số buổi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Giá tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {paginatedData.map((item) => (
                <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100 font-medium">{item.courseName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-yellow-500" />
                      {item.hskCategoryName || <span className="text-gray-600 italic">Chưa gán</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs">{item.slotNumber} buổi</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 space-x-2">
                    <button onClick={() => handleOpenModal(item)} className="text-blue-400 hover:text-blue-300 transition-colors">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end mt-4 space-x-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-700 text-white"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">{editingCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tên khóa học</label>
                <input
                  type="text"
                  required
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Danh mục HSK</label>
                <select
                  value={formData.hskCategoryId}
                  onChange={(e) => setFormData({ ...formData, hskCategoryId: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn danh mục HSK --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Số buổi học</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.slotNumber}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setFormData({ ...formData, slotNumber: isNaN(val) ? "" : val });
                    }}
                    className="w-full bg-gray-700 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Giá tiền (VNĐ)</label>
                  <input
                    type="number"
                    required
                    min="2000"
                    max="500000000"
                    value={formData.price}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setFormData({ ...formData, price: isNaN(val) ? "" : val });
                    }}
                    className="w-full bg-gray-700 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 text-right">Khoảng: 2.000đ - 500trđ</p>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-colors">Hủy</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                  {loading ? "Đang lưu..." : "Lưu lại"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default CourseTable;
