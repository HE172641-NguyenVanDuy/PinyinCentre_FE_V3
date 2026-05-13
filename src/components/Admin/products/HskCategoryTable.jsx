import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Edit, Trash2, Plus } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { hskCategoryService } from "../../../utils/hskCategoryService";

const HskCategoryTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  
  const rowsPerPage = 10;

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await hskCategoryService.getAllCategories();
      if (data.status === 200 && Array.isArray(data.result)) {
        setCategories(data.result);
        setFilteredList(data.result);
      } else {
        toast.error(data.message || "Lấy dữ liệu thất bại");
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách HSK Category:", error);
      toast.error("Lỗi khi lấy danh sách");
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
    const filtered = categories.filter(
      (item) =>
        item.name?.toLowerCase().includes(term)
    );
    setFilteredList(filtered);
    setCurrentPage(1);
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", description: "" });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let result;
      if (editingCategory) {
        result = await hskCategoryService.updateCategory(editingCategory.id, formData);
      } else {
        result = await hskCategoryService.createCategory(formData);
      }

      if (result.status === 200) {
        toast.success(editingCategory ? "Cập nhật thành công" : "Tạo thành công");
        setShowModal(false);
        loadData();
      } else {
        // If it's a duplication error, the backend message will be used
        toast.error(result.message || "Thao tác thất bại");
      }
    } catch (error) {
      // Axios error handling
      const errorMessage = error.response?.data?.message || "Lỗi khi lưu";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này? (Lưu ý: Các khóa học thuộc danh mục này cũng sẽ bị ẩn đi)")) return;
    setLoading(true);
    try {
      const result = await hskCategoryService.deleteCategory(id);
      if (result.status === 200) {
        toast.success("Xóa thành công");
        loadData();
      } else {
        toast.error(result.message || "Xóa thất bại");
      }
    } catch (error) {
      toast.error("Lỗi khi xóa");
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
    <div className="p-6">
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-100">Quản lý HSK Categories</h2>
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
              <Plus size={18} /> Thêm mới
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">STT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tên danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mô tả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {paginatedData.map((item, index) => (
                <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100 font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-300 max-w-md">
                    <p className="truncate">{item.description}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {item.createdDate ? new Date(item.createdDate).toLocaleDateString("vi-VN") : "N/A"}
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">{editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tên danh mục (ví dụ: Luyện thi HSK 1)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Mô tả</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
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
    </div>
  );
};

export default HskCategoryTable;
