import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => {
    const storedRole = localStorage.getItem("role");
    return storedRole ? parseInt(storedRole, 10) : null;
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    if (role !== null && role !== undefined)
      localStorage.setItem("role", role.toString());
    else localStorage.removeItem("role");
  }, [token, role]);

  // Fetch user information when token is available
  useEffect(() => {
    if (token) {
      fetchUserInfo();
    } else {
      setUser(null);
    }
  }, [token]);

  const fetchUserInfo = async () => {
    try {
      const response = await apiFetch("/auth/me");
      if (response.ok) {
        const result = await response.json();
        const userData = result.data;

        if (userData) {
          // If role is missing in user object, try to determine it from roles array
          if (!userData.role && userData.roles) {
            const roleNames = userData.roles.map((r) => r.name);
            if (
              roleNames.includes("ROLE_ADMIN") ||
              roleNames.includes("ADMIN") ||
              roleNames.includes("ROLE_CENTRE_OWNER") ||
              roleNames.includes("CENTRE_OWNER") ||
              roleNames.includes("ROLE_ADMIN_SYSTEM") ||
              roleNames.includes("ADMIN_SYSTEM")
            ) {
              userData.role = 1;
            } else if (
              roleNames.includes("ROLE_TEACHER") ||
              roleNames.includes("TEACHER")
            ) {
              userData.role = 2;
            } else if (
              roleNames.includes("ROLE_STUDENT") ||
              roleNames.includes("STUDENT")
            ) {
              userData.role = 3;
            }
          }
          setUser(userData);
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const login = (token, role) => {
    console.log("Login called with role:", role, "type:", typeof role);
    setToken(token);
    setRole(role);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider
      value={{ token, role, user, login, logout, fetchUserInfo }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
