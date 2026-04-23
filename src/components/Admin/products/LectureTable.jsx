import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { userService } from "../../../utils/userService";

const LectureTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(1); // 1: Active, 2: Banned
  const [genderFilter, setGenderFilter] = useState(""); // "": All, "true": Nam, "false": Nữ
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 5;
  const navigate = useNavigate();

  // Gọi API để lấy danh sách giảng viên (TEACHER)
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsersByRole("TEACHER", statusFilter, 1, 1000);
      if (data.status === 200 && Array.isArray(data.result)) {
        setTeachers(data.result);
      } else {
        toast.error(data.message || "Lấy dữ liệu giảng viên thất bại");
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách giảng viên:", error);
      toast.error("Lỗi khi lấy danh sách giảng viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, genderFilter, teachers]);

  const applyFilters = () => {
    let filtered = teachers;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.fullName?.toLowerCase().includes(term) ||
          item.email?.toLowerCase().includes(term) ||
          item.phoneNumber?.toLowerCase().includes(term) ||
          item.address?.toLowerCase().includes(term)
      );
    }

    if (genderFilter !== "") {
      const isMale = genderFilter === "true";
      filtered = filtered.filter((item) => item.gender === isMale);
    }

    setFilteredList(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddLecture = () => {
    navigate(`/admin/create-user?role=2`);
  };

  const handleBanUnban = async (id, currentStatus) => {
    try {
      setLoading(true);
      const result = await userService.banUser(id);

      if (result.status === 200) {
        toast.success(result.result || "Thao tác thành công");
        loadData();
      } else {
        toast.error(result.message || "Lỗi khi cập nhật trạng thái");
      }
    } catch (err) {
      console.error("Ban/Unban error:", err);
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
            Quản lý giảng viên
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <select
              className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              disabled={loading}
            >
              <option value="">Tất cả giới tính</option>
              <option value="true">Nam</option>
              <option value="false">Nữ</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleSearch}
                value={searchTerm}
                disabled={loading}
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>

            <button
              onClick={handleAddLecture}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              Thêm giảng viên
            </button>
          </div>
        </div>

        <div className="flex bg-gray-700 rounded-lg p-1 w-fit mb-6">
          <button
            onClick={() => setStatusFilter(1)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              statusFilter === 1
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Đang hoạt động
          </button>
          <button
            onClick={() => setStatusFilter(2)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              statusFilter === 2
                ? "bg-red-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Bị khóa
          </button>
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
                  Giới tính
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Địa chỉ
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.gender ? "bg-blue-900/30 text-blue-400" : "bg-pink-900/30 text-pink-400"}`}>
                      {item.gender ? "Nam" : "Nữ"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {item.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {item.createDate ? new Date(item.createDate).toLocaleDateString("vi-VN") : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 space-x-2 flex items-center">
                    <button
                      onClick={() => handleBanUnban(item.id, item.status)}
                      className={`${
                        Number(item.status) === 1 ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                      } text-white px-3 py-1 rounded-md text-xs transition-colors`}
                      disabled={loading}
                    >
                      {Number(item.status) === 1 ? "Khóa" : "Mở khóa"}
                    </button>
                    <a
                      href={`https://zalo.me/${item.phoneNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs"
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

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default LectureTable;
