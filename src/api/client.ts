import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // if (error.response?.status === 401) {
    //   // 只有在需要登录的页面才重定向，公开页面（首页、登录、注册）不重定向
    //   const currentPath = window.location.pathname;
    //   const publicPaths = ['/', '/login', '/signup'];
    //   if (!publicPaths.includes(currentPath)) {
    //     window.location.href = '/login';
    //   }
    // }
    return Promise.reject(error);
  }
);

export default api;