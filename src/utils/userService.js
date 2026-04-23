import api from "./api";

/**
 * Service for managing user-related API calls.
 */
export const userService = {
  /**
   * Get all active users.
   */
  getUsersActive: async (page = 1, pageSize = 10) => {
    return api.get("/user/get-users-active", {
      params: { page, pageSize },
    });
  },

  /**
   * Get users by their role (e.g., ROLE_STUDENT, ROLE_TEACHER).
   */
  getUsersByRole: async (role, status = 1, page = 1, pageSize = 100) => {
    return api.get("/user/get-users-by-role", {
      params: { role, status, page, pageSize },
    });
  },

  /**
   * Get a specific user by their ID.
   */
  getUserById: async (id) => {
    return api.get(`/user/get-user/${id}`);
  },

  /**
   * Ban or unban a user.
   * Note: The backend uses /ban-user/${id} and it seems to toggle or set a status.
   */
  banUser: async (id) => {
    return api.patch(`/user/ban-user/${id}`);
  },

  /**
   * Update user information.
   */
  updateUser: async (id, userData) => {
    return api.put(`/user/update-user/${id}`, userData);
  },

  /**
   * Create a new user (Student).
   */
  createUser: async (userData) => {
    return api.post("/user/create-user", userData);
  },

  /**
   * Create a new teacher account.
   */
  createTeacherAccount: async (userData) => {
    return api.post("/user/create-teacher-account", userData);
  },

  /**
   * Get students who are currently in a specific class.
   */
  getStudentsInClass: async (classId) => {
    return api.get(`/user/students/in-class/${classId}`);
  },

  /**
   * Get students who are NOT in a specific class.
   */
  getStudentsNotInClass: async (classId) => {
    return api.get(`/user/students/not-in-class/${classId}`);
  },
};
