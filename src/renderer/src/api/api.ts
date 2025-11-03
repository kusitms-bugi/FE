import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');

        const { data: newToken } = await axios.post<{
          accessToken: string;
          refreshToken: string;
        }>(
          `${import.meta.env.VITE_BASE_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true },
        );

        localStorage.setItem('accessToken', newToken.accessToken);
        localStorage.setItem('refreshToken', newToken.refreshToken);

        api.defaults.headers.common['Authorization'] =
          `Bearer ${newToken.accessToken}`;
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] =
            `Bearer ${newToken.accessToken}`;
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
