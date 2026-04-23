import api from "./api";

/**
 * Service for managing course-related API calls.
 */
export const courseService = {
  /**
   * Get all courses with pagination.
   */
  getAllCourses: async (page = 1, pageSize = 10) => {
    return api.get("/course/get-all-course", {
      params: { page, pageSize },
    });
  },

  /**
   * Get a specific course by its ID.
   */
  getCourseById: async (id) => {
    return api.get(`/course/get-course/${id}`);
  },

  /**
   * Create a new course.
   */
  createCourse: async (courseData) => {
    return api.post("/course/create", courseData);
  },

  /**
   * Update an existing course.
   */
  updateCourse: async (id, courseData) => {
    return api.put(`/course/update/${id}`, courseData);
  },

  /**
   * Soft delete or toggle delete status of a course.
   */
  deleteCourse: async (id) => {
    return api.patch(`/course/delete/${id}`);
  },
};
