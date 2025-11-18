import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 连接异常检测函数 - 只检测真正的网络连接问题
const isConnectionError = (error: unknown): boolean => {
  if (!error) return false;

  const axiosError = error as any;

  // 网络错误或无响应 - 这是真正的连接问题
  if (!axiosError.response) {
    return true;
  }

  // 检查具体的网络错误类型
  if (
    axiosError.code === "NETWORK_ERROR" ||
    axiosError.code === "ECONNREFUSED" ||
    axiosError.code === "ENOTFOUND" ||
    axiosError.code === "ETIMEDOUT"
  ) {
    return true;
  }

  return false;
};

api.interceptors.response.use(
  (response) => {
    // 请求成功，触发连接恢复事件
    window.dispatchEvent(new CustomEvent("connection-success"));
    return response;
  },
  (error) => {
    // 检查是否是连接异常
    if (isConnectionError(error)) {
      // 触发全局连接异常状态
      window.dispatchEvent(
        new CustomEvent("connection-error", { detail: error }),
      );
    }

    // 检查是否是账号被封禁（403 且 code 为 account_banned）
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "account_banned"
    ) {
      // 触发账号被封禁事件
      window.dispatchEvent(
        new CustomEvent("account-banned", {
          detail: { message: error.response.data?.message },
        }),
      );
    }

    // 检查是否是邮箱未验证（403 且 code 为 email_not_verified）
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "email_not_verified"
    ) {
      // 触发邮箱未验证事件
      window.dispatchEvent(
        new CustomEvent("email-not-verified", {
          detail: { message: error.response.data?.message },
        }),
      );
    }

    // 提取后端返回的友好错误消息
    if (error.response?.data?.message) {
      // 直接修改错误对象的 message 属性，保留原有的错误结构
      error.message = error.response.data.message;
    }

    return Promise.reject(error);
  },
);

export default api;
