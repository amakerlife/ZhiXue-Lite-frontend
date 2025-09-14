import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 连接异常检测函数
const isConnectionError = (error: unknown): boolean => {
  if (!error) return false;

  const axiosError = error as any;

  // 网络错误或无响应
  if (!axiosError.response) {
    return true;
  }

  // 检查具体的网络错误类型
  if (axiosError.code === 'NETWORK_ERROR' ||
      axiosError.code === 'ECONNREFUSED' ||
      axiosError.code === 'ENOTFOUND' ||
      axiosError.code === 'ETIMEDOUT') {
    return true;
  }

  // 检查状态码 - 5xx服务器错误也算连接异常
  if (axiosError.response?.status >= 500) {
    return true;
  }

  return false;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 检查是否是连接异常
    if (isConnectionError(error)) {
      // 触发全局连接异常状态
      window.dispatchEvent(new CustomEvent('connection-error', { detail: error }));
    }

    // 提取后端返回的友好错误消息
    if (error.response?.data?.message) {
      // 直接修改错误对象的message属性，保留原有的错误结构
      error.message = error.response.data.message;
    }

    return Promise.reject(error);
  }
);

export default api;