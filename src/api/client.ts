import axios from 'axios';
import { useAuthStore } from '../stores/auth-store';

// Replace with your local IP or production URL in .env
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add Bearer Token
apiClient.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// Response Interceptor: Handle 401 and Refresh Token
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { refreshToken, userId, updateAccessToken, logout } = useAuthStore.getState();

                if (refreshToken && userId) {
                    // Attempt to refresh token
                    const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
                        userId,
                        refreshToken,
                    });

                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

                    // Update store and SecureStore
                    await updateAccessToken(newAccessToken, newRefreshToken);

                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return apiClient(originalRequest);
                } else {
                    // If no tokens available, log out
                    await logout();
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                // If refresh fails, log out
                const { logout } = useAuthStore.getState();
                await logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
