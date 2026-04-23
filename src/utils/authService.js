import { jwtDecode } from "jwt-decode";
import api from "./api";

let isLoggingOut = false;

/* =======================
   Helpers (private)
======================= */
function setTokens({
                       accessToken,
                       refreshToken,
                       tokenType,
                       expiresIn,
                       expiresInRefreshToken,
                   }) {
    const accessTokenExpiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("tokenType", tokenType || "Bearer");
    localStorage.setItem("accessTokenExpiresAt", accessTokenExpiresAt.toString());

    if (refreshToken && expiresInRefreshToken) {
        const refreshTokenExpiresAt = Date.now() + expiresInRefreshToken * 1000;
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("refreshTokenExpiresAt", refreshTokenExpiresAt.toString());
    }
}

function clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("accessTokenExpiresAt");
    localStorage.removeItem("refreshTokenExpiresAt");
}

function isTokenValid(expiryKey) {
    const exp = localStorage.getItem(expiryKey);
    return exp && Date.now() < parseInt(exp, 10);
}

/* =======================
   Public API
======================= */
export const authService = {
    login: async (usernameOrEmail, password) => {
        try {
            // Using the axios instance 'api' directly
            const response = await api.post("/auth/login", {
                usernameOrEmail,
                password,
            });

            // axios response already parsed the body, and our interceptor returns data
            const resData = response; 
            
            if (resData.status !== 200) {
                return { success: false, message: resData.message || "Đăng nhập thất bại" };
            }

            const {
                accessToken,
                refreshToken,
                tokenType,
                expiresIn,
                expiresInRefreshToken,
                roles,
                username: responseUsername
            } = resData.data;

            setTokens({
                accessToken,
                refreshToken,
                tokenType,
                expiresIn,
                expiresInRefreshToken,
            });

            const user = { username: responseUsername || usernameOrEmail, role: roles ?? [] };
            localStorage.setItem("user", JSON.stringify(user));
            // Compatibility with existing code that uses 'token' and 'role'
            localStorage.setItem("token", accessToken); 
            
            return { success: true, user, tokens: resData.data };
        } catch (error) {
            console.error("Login error:", error);
            const errorMsg = error.response?.data?.message || error.message || "Có lỗi xảy ra khi login";
            return { success: false, message: errorMsg };
        }
    },

    logout: async () => {
        if (isLoggingOut) return;
        isLoggingOut = true;
        try {
            const token = localStorage.getItem("accessToken");
            const type = localStorage.getItem("tokenType") || "Bearer";

            await api.get("/auth/logout", {
                headers: {
                    Authorization: `${type} ${token}`,
                },
            });

            clearTokens();
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            
            window.dispatchEvent(new Event("auth:logout"));

            setTimeout(() => { isLoggingOut = false; }, 1000);
            return { success: true, message: "Đăng xuất thành công" };
        } catch (error) {
            console.error("Logout error:", error);
            clearTokens();
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            isLoggingOut = false;
            return { success: false, message: "Có lỗi xảy ra khi đăng xuất" };
        }
    },

    getCurrentUser: () => {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        const accessValid = isTokenValid("accessTokenExpiresAt");
        return !!accessValid;
    },

    getAuthHeader: () => {
        const token = localStorage.getItem("accessToken");
        const type = localStorage.getItem("tokenType") || "Bearer";
        return token ? { Authorization: `${type} ${token}` } : {};
    },

    loginWithGoogle: async () => {
        const response = await api.get("/auth/login-google");
        return response; // ResultInfo with redirect URL in data
    },

    handleGoogleCallback: async (code, state) => {
        try {
            const resData = await api.get(`/auth/callback?code=${code}&state=${state}`);
            
            if (resData.status !== 200) {
                return { success: false, message: resData.message || "Login Google thất bại" };
            }

            const {
                accessToken,
                refreshToken,
                tokenType,
                expiresIn,
                expiresInRefreshToken,
                roles,
                username: responseUsername,
                email,
            } = resData.data;

            let finalUsername = responseUsername || email || "GoogleUser";
            if (accessToken) {
                try {
                    const decodedToken = jwtDecode(accessToken);
                    finalUsername = decodedToken.sub || decodedToken.username || finalUsername;
                } catch (decodeError) {
                    console.warn("Lỗi decode token:", decodeError);
                }
            }

            setTokens({
                accessToken,
                refreshToken,
                tokenType,
                expiresIn,
                expiresInRefreshToken,
            });

            const user = { username: finalUsername, role: roles ?? [] };
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", accessToken);

            return { success: true, user, tokens: resData.data };
        } catch (error) {
            console.error("Google callback error:", error);
            return { success: false, message: "Có lỗi xảy ra khi xử lý callback Google" };
        }
    },

    refreshAccessToken: async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        const type = localStorage.getItem("tokenType") || "Bearer";

        if (!refreshToken) {
            return null;
        }

        try {
            // Use axios 'api' instance
            const resData = await api.post("/auth/get-new-access-token", {}, {
                headers: { Authorization: `${type} ${refreshToken}` }
            });

            if (resData.status === 200 && resData.data?.accessToken) {
                const {
                    accessToken,
                    refreshToken: newRefreshToken,
                    tokenType,
                    expiresIn,
                    expiresInRefreshToken,
                } = resData.data;

                setTokens({
                    accessToken,
                    refreshToken: newRefreshToken || refreshToken,
                    tokenType: tokenType || "Bearer",
                    expiresIn,
                    expiresInRefreshToken: expiresInRefreshToken || null,
                });

                localStorage.setItem("token", accessToken);
                return accessToken;
            }

            return null;
        } catch (error) {
            console.error("Refresh token error:", error);
            return null;
        }
    },

    setTokens: (tokens) => setTokens(tokens),

    getUserRoles: () => {
        const user = authService.getCurrentUser();
        return user?.role || [];
    },

    hasRole: (requiredRoles) => {
        const roles = authService.getUserRoles();
        if (!roles || roles.length === 0) return false;

        if (typeof requiredRoles === "string") {
            return roles.includes(requiredRoles);
        }
        return requiredRoles.some((role) => roles.includes(role));
    },

    isLoggingOut: () => isLoggingOut,
};
