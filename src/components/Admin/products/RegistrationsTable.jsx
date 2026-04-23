import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { registrationService } from "../../../utils/registrationService";

const RegistrationsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const rowsPerPage = 5;
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await registrationService.getNotRegistered(1, 1000);

      if (data.status === 200 && Array.isArray(data.result)) {
        setRegistrations(data.result);
        setFilteredList(data.result);
      } else {
        toast.error(data.message || "Lấy dữ liệu thất bại");
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách đăng ký:", error);
      toast.error("Lỗi khi lấy danh sách đăng ký");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, registrations]);

  const applyFilters = () => {
    let filtered = registrations;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.fullName?.toLowerCase().includes(term) ||
          item.email?.toLowerCase().includes(term) ||
          item.phoneNumber?.toLowerCase().includes(term)
      );
    }

    setFilteredList(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Mở modal confirm xóa
  const openConfirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  // Đóng modal confirm xóa
  const closeConfirmDelete = () => {
    setShowConfirm(false);
    setDeleteId(null);
  };

  // Xác nhận xóa thực tế
  const confirmDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      const result = await registrationService.deleteRegistration(deleteId);
      
      if (result.status === 200) {
        toast.success("Xóa thành công");
        await loadData();
      } else {
        throw new Error(result.message || "Xóa thất bại");
      }
    } catch (error) {
      console.error("Delete registration error:", error);
      toast.error(error.message || "Lỗi khi xóa");
    } finally {
      setLoading(false);
      closeConfirmDelete();
    }
  };

  const handleAddStudent = (item) => {
    const queryParams = new URLSearchParams({
      fullName: item.fullName,
      phoneNumber: item.phoneNumber,
      email: item.email,
      role: "3", // Pre-select Học Viên
    }).toString();
    navigate(`/admin/create-user?${queryParams}`);
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
            Quản lý Đăng ký Tư vấn
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleSearch}
                value={searchTerm}
                disabled={loading}
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Họ tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ngày đăng ký
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700">
              {paginatedData.map((item) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100 font-medium">
                    {item.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {item.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {item.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {item.createdDate ? new Date(item.createdDate).toLocaleDateString("vi-VN") : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 space-x-2 flex items-center">
                    <button
                      onClick={() => handleAddStudent(item)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs transition-colors"
                      disabled={loading}
                    >
                      + Học viên
                    </button>
                    <button
                      onClick={() => openConfirmDelete(item.id)}
                      disabled={loading}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs transition-colors"
                    >
                      Xóa
                    </button>
                    <a
                      href={`https://zalo.me/${item.phoneNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md text-xs transition-colors"
                    >
                      Zalo
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG */}
        {totalPages > 1 && (
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40"
            >
              &laquo; Prev
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
              Next &raquo;
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-400 mt-4">
            Đang tải dữ liệu...
          </div>
        )}
      </motion.div>

      {/* Modal confirm xóa */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl p-8 max-w-sm w-full text-center border border-gray-700 shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Xác nhận xóa</h3>
            <p className="text-gray-400 mb-6">Bạn có chắc muốn xóa bản đăng ký này không? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={closeConfirmDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Xóa
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default RegistrationsTable;
