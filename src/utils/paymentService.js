import { apiFetch } from "./api";

export const paymentService = {
  checkout: async (courseId) => {
    const response = await apiFetch("/payment/checkout", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });
    return response.json();
  }
};
