import api from "./api";

export const hskCategoryService = {
  getAllCategories: async () => {
    return api.get("/hsk-categories");
  },

  getPublicCategories: async () => {
    return api.get("/public/hsk-categories");
  },

  createCategory: async (data) => {
    return api.post("/hsk-categories", data);
  },

  updateCategory: async (id, data) => {
    return api.put(`/hsk-categories/${id}`, data);
  },

  deleteCategory: async (id) => {
    return api.delete(`/hsk-categories/${id}`);
  },
};
