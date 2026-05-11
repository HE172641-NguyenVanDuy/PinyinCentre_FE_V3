import api from './api';

const adminService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      // The api interceptor returns response.data, so response is the ApiResponse object
      return response.result;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
  getRegistrationStats: async (period = '30d') => {
    try {
      const response = await api.get(`/admin/dashboard/registration-stats?period=${period}`);
      return response.result;
    } catch (error) {
      console.error('Error fetching registration stats:', error);
      throw error;
    }
  },
  getCourseEnrollmentStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/course-stats');
      return response.result;
    } catch (error) {
      console.error('Error fetching course enrollment stats:', error);
      throw error;
    }
  },
  getStudentStatusStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/student-status-stats');
      return response.result;
    } catch (error) {
      console.error('Error fetching student status stats:', error);
      throw error;
    }
  },
  getClassSizeStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/class-size-stats');
      return response.result;
    } catch (error) {
      console.error('Error fetching class size stats:', error);
      throw error;
    }
  },
};

export default adminService;
