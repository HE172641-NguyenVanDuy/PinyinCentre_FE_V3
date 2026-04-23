import api from "./api";

/**
 * Service for managing registration-info-related API calls (consultations).
 */
export const registrationService = {
  /**
   * Submit a new registration/consultation request.
   */
  createRegistration: async (data) => {
    return api.post("/registration-info/create", data);
  },

  /**
   * Get registration requests that haven't been converted to users yet.
   */
  getNotRegistered: async (page = 1, pageSize = 10) => {
    return api.get("/registration-info/get-not-registered", {
      params: { page, pageSize },
    });
  },

  /**
   * Mark a registration request as "registered" (e.g., when the student enrolls).
   */
  registerUser: async (id) => {
    return api.put(`/registration-info/register/${id}`);
  },

  /**
   * Soft delete a registration request.
   */
  deleteRegistration: async (id) => {
    return api.delete(`/registration-info/delete/${id}`);
  },
};
