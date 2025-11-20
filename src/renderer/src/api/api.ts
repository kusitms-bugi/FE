import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Ref } from 'react';

interface RefreshResponse {
  timestamp: string;
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  code: string;
  message: string | null;
}

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL as string,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    }; // 무한 요청 방지

    /* 에러가 401,403일 때  토큰 갱신 */
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');

        const { data: newToken } = await axios.post<RefreshResponse>(
          `${import.meta.env.VITE_BASE_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true },
        );

        /* success가 false이거나 응답으로 온 데이터가 비었을 때 */
        if (!newToken.success || !newToken.data) {
          throw new Error('Refresh token expired');
        }

        /* 새로 발급 받은 토큰 저장 */
        const newAccessToken = newToken.data.accessToken;
        const newRefreshToken = newToken.data.refreshToken;

        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        api.defaults.headers.common['Authorization'] =
          `Bearer ${newAccessToken}`;
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (_err) {
        localStorage.clear();
        window.location.href = '/auth/login';
        return Promise.reject(_err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
