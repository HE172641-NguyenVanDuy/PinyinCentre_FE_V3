import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../components/Shared/AuthContext";
import { authService } from "../utils/authService";
import Logo from "/assets/logo/logoPinyin1.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authService.login(email, password);

      if (!result.success) {
        throw new Error(result.message || "Email hoặc mật khẩu không đúng!");
      }

      const tokenData = result.tokens;
      const token = tokenData.accessToken;
      const roles = tokenData.roles || [];
      
      let roleNum = 0;
      if (
        roles.includes("ROLE_ADMIN") || roles.includes("ADMIN") ||
        roles.includes("ROLE_CENTRE_OWNER") || roles.includes("CENTRE_OWNER") ||
        roles.includes("ROLE_ADMIN_SYSTEM") || roles.includes("ADMIN_SYSTEM")
      ) {
        roleNum = 1;
      } else if (roles.includes("ROLE_TEACHER") || roles.includes("TEACHER")) {
        roleNum = 2;
      } else if (roles.includes("ROLE_STUDENT") || roles.includes("STUDENT")) {
        roleNum = 3;
      }
      
      console.log("Parsed Token:", token, "Parsed RoleNum:", roleNum);

      login(token, roleNum);
      toast.success("Đăng nhập thành công!", { autoClose: 700 });

      setTimeout(() => {
        switch (roleNum) {
          case 1:
            navigate("/admin");
            break;
          case 2:
            navigate("/teacher");
            break;
          case 3:
            navigate("/student");
            break;
          default:
            navigate("/");
        }
      }, 1000);
    } catch (err) {
      toast.error(err.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await authService.loginWithGoogle();
      if (response.status === 200 && response.data) {
        window.location.href = response.data;
      } else {
        toast.error("Không thể khởi tạo đăng nhập Google");
      }
    } catch (err) {
      toast.error("Lỗi khi kết nối Google Login");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-orange-400 to-red-500 items-center justify-center">
        <div className="text-center px-10">
          <img
            src={Logo}
            alt="Logo"
            className="w-32 mx-auto mb-6 drop-shadow-lg"
          />
          <h1 className="text-4xl font-bold text-white mb-4">
            Chào mừng đến với <br /> Pinyin Centre
          </h1>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-8">
        <div className="max-w-md w-full">
          <div className="mb-6 text-center">
            <img src={Logo} alt="Logo" className="w-16 mx-auto mb-2" />
            <h2 className="text-3xl font-bold text-red-500">Đăng Nhập</h2>
            <p className="text-gray-600 mt-1">
              Đăng nhập vào hệ thống Pinyin Centre
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email hoặc Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email hoặc username"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs font-semibold text-orange-600 hover:text-red-500 transition"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 rounded-xl hover:brightness-110 transition-all shadow-md hover:shadow-xl"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
            <div className="relative flex items-center justify-center mt-6">
              <span className="absolute bg-white px-2 text-sm text-gray-500">Hoặc</span>
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center mt-4"
            >
              <img src="/assets/icon/gg.jpg" alt="Google" className="w-5 h-5 mr-2" />
              Đăng nhập với Google
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            © {new Date().getFullYear()} Pinyin Centre. All rights reserved.
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;
