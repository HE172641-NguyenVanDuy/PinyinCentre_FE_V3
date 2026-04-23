import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../../components/Admin/common/Header";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { userService } from "../../utils/userService";

const CreateUserPage = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [cic, setCic] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFullName(params.get("fullName") || "");
    setPhoneNumber(params.get("phoneNumber") || "");
    setEmail(params.get("email") || "");
    const roleParam = params.get("role");
    if (roleParam) {
      setRole(parseInt(roleParam, 10));
    }
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        username: email,
        email,
        phoneNumber,
        fullName,
        dob,
        gender: gender === "male",
        cic,
        address,
      };

      let result;
      // Depending on the role, call different service methods
      if (role === 2) {
        // Teacher
        result = await userService.createTeacherAccount(payload);
      } else {
        // Default to Student (role 3 or other)
        result = await userService.createUser(payload);
      }

      if (result.status === 200) {
        toast.success("Tạo người dùng thành công!", { autoClose: 2000 });
        setTimeout(() => navigate("/admin/students"), 2000);
      } else {
        toast.error(`Tạo người dùng thất bại: ${result.message}`, {
          autoClose: 2000,
        });
      }
    } catch (err) {
      console.error("Create user error:", err);
      const serverData = err.response?.data;
      if (serverData?.errors) {
        // Show all validation errors
        Object.entries(serverData.errors).forEach(([field, msg]) => {
          toast.error(`${field}: ${msg}`, { autoClose: 5000 });
        });
      } else {
        toast.error(serverData?.message || "Lỗi khi tạo người dùng", {
          autoClose: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Tạo người dùng mới" />

      <motion.div
        className="max-w-3xl mx-auto mt-10 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-gray-100 mb-6">
          Tạo người dùng mới
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-gray-300 mb-2">
              Họ tên
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-md bg-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">
              Số điện thoại
              <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="w-full rounded-md bg-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">
              Email
              <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md bg-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Ngày sinh</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-md bg-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">CIC</label>
            <input
              type="text"
              value={cic}
              onChange={(e) => setCic(e.target.value)}
              className="w-full rounded-md bg-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Địa chỉ</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md bg-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Giới tính</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-md bg-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Vai trò</label>
            <select
              value={role}
              onChange={(e) => setRole(parseInt(e.target.value, 10))}
              className="w-full rounded-md bg-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn vai trò</option>
              <option value="1">Quản trị viên</option>
              <option value="3">Học Viên</option>
              <option value="2">Giáo viên</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md text-sm disabled:opacity-50 w-full"
            >
              {loading ? "Đang tạo..." : "Tạo người dùng"}
            </button>
          </div>
        </form>
      </motion.div>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default CreateUserPage;
