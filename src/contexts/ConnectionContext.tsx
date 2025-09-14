import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '@/api/client';

interface ConnectionContextType {
  isConnectionError: boolean;
  connectionError: string | null;
  retryConnection: () => Promise<void>;
  lastErrorTime: Date | null;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};

interface ConnectionProviderProps {
  children: ReactNode;
}

const getConnectionErrorMessage = (error: unknown): string => {
  const axiosError = error as any;

  if (!axiosError.response) {
    return '无法连接到服务器，请检查网络连接';
  }

  if (axiosError.response?.status >= 500) {
    return '服务器暂时不可用，请稍后重试';
  }

  switch (axiosError.code) {
    case 'NETWORK_ERROR':
      return '网络连接失败，请检查网络设置';
    case 'ECONNREFUSED':
      return '服务器拒绝连接，请稍后重试';
    case 'ENOTFOUND':
      return '无法找到服务器，请检查网络连接';
    case 'ETIMEDOUT':
      return '连接超时，请检查网络连接';
    default:
      return '后端连接异常，请稍后重试';
  }
};

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({ children }) => {
  const [isConnectionError, setIsConnectionError] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastErrorTime, setLastErrorTime] = useState<Date | null>(null);

  const retryConnection = useCallback(async () => {
    try {
      // 简单的连接测试，使用最基本的端点
      await api.get('/', { timeout: 5000 });
      // 连接成功，清除错误状态
      setIsConnectionError(false);
      setConnectionError(null);
    } catch (error) {
      console.error('Retry connection failed:', error);
      // 重试失败，更新错误信息
      setConnectionError(getConnectionErrorMessage(error));
      throw error; // 让UI知道重试失败了
    }
  }, []);

  // 监听来自API拦截器的连接异常事件
  useEffect(() => {
    const handleConnectionError = (event: any) => {
      const error = event.detail;
      console.error('Connection error detected:', error);

      setIsConnectionError(true);
      setConnectionError(getConnectionErrorMessage(error));
      setLastErrorTime(new Date());
    };

    window.addEventListener('connection-error', handleConnectionError);

    return () => {
      window.removeEventListener('connection-error', handleConnectionError);
    };
  }, []);

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