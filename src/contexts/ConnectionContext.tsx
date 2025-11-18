import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { type AxiosError } from "axios";
import api from "@/api/client";

interface ConnectionContextType {
  isConnectionError: boolean;
  connectionError: string | null;
  retryConnection: () => Promise<void>;
  lastErrorTime: Date | null;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(
  undefined,
);

// eslint-disable-next-line react-refresh/only-export-components
export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
};

interface ConnectionProviderProps {
  children: ReactNode;
}

const getConnectionErrorMessage = (error: unknown): string => {
  const axiosError = error as AxiosError;

  // 只处理网络连接错误，不处理HTTP状态码错误
  if (!axiosError.response) {
    // 真正的网络连接失败
    switch (axiosError.code) {
      case "NETWORK_ERROR":
        return "网络连接失败，请检查网络设置";
      case "ECONNREFUSED":
        return "服务器拒绝连接，请稍后重试";
      case "ENOTFOUND":
        return "无法找到服务器，请检查网络连接";
      case "ETIMEDOUT":
        return "连接超时，请检查网络连接";
      default:
        return "网络连接异常，请稍后重试";
    }
  }

  // 有response说明连接正常，不应该作为连接错误处理
  return "";
};

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({
  children,
}) => {
  const [isConnectionError, setIsConnectionError] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastErrorTime, setLastErrorTime] = useState<Date | null>(null);

  const retryConnection = useCallback(async () => {
    try {
      // 使用专门的ping端点测试连接
      await api.get("/ping", { timeout: 5000 });
      // 连接成功，清除错误状态
      setIsConnectionError(false);
      setConnectionError(null);

      // 重连成功后触发用户状态刷新事件
      window.dispatchEvent(new CustomEvent("connection-recovered"));
    } catch (error) {
      const errorMessage = getConnectionErrorMessage(error);

      // 只有真正的网络错误才更新连接错误状态
      if (errorMessage) {
        setConnectionError(errorMessage);
        throw error; // 让UI知道重试失败了
      } else {
        // HTTP状态码错误不算连接异常，清除连接错误状态
        setIsConnectionError(false);
        setConnectionError(null);
      }
    }
  }, []);

  // 监听来自API拦截器的连接异常和恢复事件
  useEffect(() => {
    const handleConnectionError = (event: Event) => {
      const error = (event as CustomEvent<unknown>).detail;
      setIsConnectionError(true);
      setConnectionError(getConnectionErrorMessage(error));
      setLastErrorTime(new Date());
    };

    const handleConnectionSuccess = () => {
      // 任何API请求成功时，自动清除连接异常状态
      if (isConnectionError) {
        setIsConnectionError(false);
        setConnectionError(null);
      }
    };

    window.addEventListener("connection-error", handleConnectionError);
    window.addEventListener("connection-success", handleConnectionSuccess);

    return () => {
      window.removeEventListener("connection-error", handleConnectionError);
      window.removeEventListener("connection-success", handleConnectionSuccess);
    };
  }, [isConnectionError]); // 依赖isConnectionError以确保事件处理器能访问最新状态

  const value: ConnectionContextType = {
    isConnectionError,
    connectionError,
    retryConnection,
    lastErrorTime,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};
