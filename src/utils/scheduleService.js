import api from "./api";

/**
 * Service for managing schedule-related API calls.
 */
export const scheduleService = {
  /**
   * Get schedules by classroom ID.
   */
  getSchedulesByClass: async (classId) => {
    return api.get(`/schedule/by-class/${classId}`);
  },

  /**
   * Get all schedules for the center.
   */
  getAllSchedules: async () => {
    return api.get("/schedule/all");
  },

  /**
   * Get schedules for a specific teacher.
   */
  getSchedulesByTeacher: async (teacherId) => {
    return api.get(`/schedule/by-teacher/${teacherId}`);
  },

  /**
   * Get schedules for a specific student.
   */
  getSchedulesByStudent: async (studentId) => {
    return api.get(`/schedule/by-student/${studentId}`);
  },

  /**
   * Get available teachers for a specific time slot.
   */
  getAvailableTeachers: async (slotData) => {
    return api.post("/schedule/available-teachers", slotData);
  },
};
