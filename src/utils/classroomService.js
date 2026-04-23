import api from "./api";

/**
 * Service for managing classroom-related API calls.
 */
export const classroomService = {
  /**
   * Get all active classes with pagination.
   */
  getAllClassesActive: async (page = 1, pageSize = 10) => {
    return api.get("/classroom/get-all-class-active", {
      params: { page, pageSize },
    });
  },

  /**
   * Get all classes for simple list display.
   */
  getClassList: async () => {
    return api.get("/classroom/list");
  },

  /**
   * Create a new class along with its schedules.
   */
  createClass: async (classData) => {
    return api.post("/classroom/create", classData);
  },

  /**
   * Update an existing class.
   */
  updateClass: async (id, classData) => {
    return api.put(`/classroom/${id}`, classData);
  },

  /**
   * Soft delete a class.
   */
  deleteClass: async (id) => {
    return api.patch(`/classroom/delete-class/${id}`);
  },

  /**
   * Get class details by ID including schedules.
   */
  getClassById: async (id) => {
    return api.get(`/classroom/${id}`);
  },

  /**
   * Get classes by course ID.
   */
  getClassByCourseId: async (courseId) => {
    return api.get(`/classroom/get-class-by-course-id/${courseId}`);
  },

  /**
   * Add students to a class.
   */
  addStudents: async (classId, userIds) => {
    return api.post("/classroom/add-student", {
      class_id: classId,
      user_ids: userIds,
    });
  },

  /**
   * Remove students from a class.
   */
  removeStudents: async (classId, userIds) => {
    return api.post("/classroom/remove-student", {
      class_id: classId,
      user_ids: userIds,
    });
  },
};
