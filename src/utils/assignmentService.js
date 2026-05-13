import api from './api';

const assignmentService = {
  createAssignment: async (formData) => {
    const response = await api.post('/assignments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  getAssignmentsByClass: async (classId) => {
    const response = await api.get(`/assignments/class/${classId}`);
    return response;
  },

  getAssignmentById: async (id) => {
    const response = await api.get(`/assignments/${id}`);
    return response;
  },

  submitAssignment: async (formData) => {
    const response = await api.post('/assignments/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  getSubmissions: async (assignmentId) => {
    const response = await api.get(`/assignments/${assignmentId}/submissions`);
    return response;
  },

  getMySubmission: async (assignmentId) => {
    const response = await api.get(`/assignments/${assignmentId}/my-submission`);
    return response;
  },

  gradeSubmission: async (submissionId, score, comment) => {
    const response = await api.put(`/assignments/submissions/${submissionId}/grade`, null, {
      params: { score, comment },
    });
    return response.data;
  },
  
  updateAssignment: async (id, formData) => {
    const response = await api.put(`/assignments/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  deleteAssignment: async (id) => {
    const response = await api.delete(`/assignments/${id}`);
    return response;
  },
};

export default assignmentService;
