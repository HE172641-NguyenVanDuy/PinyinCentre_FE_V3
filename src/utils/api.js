import axios from "axios";
import { toast } from "react-toastify";
// We will create authService.js next
import { authService } from "./authService";

const isProd = import.meta.env.PROD;
const base = isProd ? "https://api.tiengtrungbackinh.store" : "";
const API_BASE_URL = `${base}/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // Reasonable timeout
});

let refreshingPromise = null;

const handleLogout = async () => {
    if (authService.isLoggingOut()) {
        return;
    }
    toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
    await authService.logout();
    if (!window.location.pathname.startsWith("/login")) {
        setTimeout(() => {
            window.location.replace("/login");
        }, 3000);
    }
};

api.interceptors.request.use(
    (config) => {
        // Don't add Authorization header for login endpoints or if it already exists
        const publicPaths = ['/auth/login', '/auth/login-google', '/auth/callback', '/auth/get-new-access-token'];
        const isPublicPath = publicPaths.some(path => config.url?.includes(path));
        const hasAuthHeader = config.headers?.Authorization;

        if (!isPublicPath && !hasAuthHeader) {
            const authHeader = authService.getAuthHeader();
            if (authHeader.Authorization) {
                config.headers.Authorization = authHeader.Authorization;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    async (response) => {
        const data = response.data;
        const originalRequest = response.config;

        // Soft Error: HTTP 200 but body status is 401 or 403
        if (data?.status === 401 || data?.status === 403) {
            if (!originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    if (!refreshingPromise) {
                        refreshingPromise = authService.refreshAccessToken();
                    }
                    const newAccessToken = await refreshingPromise;
                    refreshingPromise = null;

                    if (newAccessToken) {
                        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    }
                } catch (e) {
                    refreshingPromise = null;
                }
            }
            await handleLogout();
            return Promise.reject(new Error(data.message || "Session expired"));
        }

        // Return the body data (which includes status, message, data fields from ResultInfo)
        return data;
    },
    async (error) => {
        if (axios.isCancel(error)) {
            return Promise.reject(error);
        }

        const originalRequest = error.config;
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        console.error(`API Error [${status}]: ${message}`);

        // Hard Error: HTTP 401 or 403
        if ((status === 401 || status === 403) && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                if (!refreshingPromise) {
                    refreshingPromise = authService.refreshAccessToken();
                }
                const newAccessToken = await refreshingPromise;
                refreshingPromise = null;

                if (newAccessToken) {
                    originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } else {
                    await handleLogout();
                    return Promise.reject(error);
                }
            } catch (e) {
                refreshingPromise = null;
                await handleLogout();
                return Promise.reject(error);
            }
        }

        if (status !== 401 && status !== 403) {
            // For other errors, show toast
            // toast.error(message || "Có lỗi xảy ra");
        }

        return Promise.reject(error);
    }
);

// Compatibility wrapper for existing fetch-based code
export async function apiFetch(path, options = {}) {
    const { method = 'GET', body, headers } = options;
    
    try {
        const config = {
            url: path,
            method: method,
            headers: headers,
            data: body ? (typeof body === 'string' ? JSON.parse(body) : body) : undefined,
        };
        
        const response = await api(config);
        
        // Return an object that mimics the fetch response
        return {
            ok: true,
            status: 200,
            json: async () => response, // response is already the data because of the interceptor
            text: async () => JSON.stringify(response),
        };
    } catch (error) {
        console.error("apiFetch error:", error);
        return {
            ok: false,
            status: error.response?.status || 500,
            json: async () => error.response?.data || { message: error.message },
            text: async () => error.message,
        };
    }
}

export default api;
