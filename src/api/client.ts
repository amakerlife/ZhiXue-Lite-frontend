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
    // 提取后端返回的友好错误消息
    if (error.response?.data?.message) {
      // 直接修改错误对象的message属性，保留原有的错误结构
      error.message = error.response.data.message;
    }
    
    return Promise.reject(error);
  }
);

export default api;