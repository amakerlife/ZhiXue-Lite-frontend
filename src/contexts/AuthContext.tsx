import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '@/api/auth';
import { adminAPI } from '@/api/admin';
import type { User } from '@/types/api';
import { trackAnalyticsEvent } from '@/utils/analytics';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isBanned: boolean;
  isSuMode: boolean;
  login: (username: string, password: string, turnstileToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (username: string, password: string, email: string, turnstileToken?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateEmailVerified: () => void;
  clearBanned: () => void;
  switchUser: (username: string) => Promise<void>;
  exitSu: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* eslint-disable react-refresh/only-export-components */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const [isSuMode, setIsSuMode] = useState(false);

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.data.success) {
        // 后端直接返回 user 字段，不是包装在 data 中
        setUser(response.data.user);
        // 检查是否为管理员且当前用户角色为 user，可能处于 su 模式
        // 注意：这是一个简单的启发式检测，实际 su 状态由后端 session 管理
        const storedSuMode = sessionStorage.getItem('su_mode') === 'true';
        setIsSuMode(storedSuMode);
      }
    } catch {
      setUser(null);
      setIsSuMode(false);
      sessionStorage.removeItem('su_mode');
    }
  };

  const login = async (username: string, password: string, turnstile_token?: string) => {
    try {
      const response = await authAPI.login({ username, password, turnstile_token });
      if (response.data.success) {
        // 后端直接返回 user 字段，不是包装在 data 中
        setUser(response.data.user);

        trackAnalyticsEvent('user_login_success', {
          username: username,
          has_zhixue: !!response.data.user.zhixue_info?.username,
          user_role: response.data.user.role,
          login_method: turnstile_token ? 'with_captcha' : 'without_captcha'
        });
      } else {
        throw new Error(response.data.message || '登录失败');
      }
    } catch (error: unknown) {
      trackAnalyticsEvent('user_login_failed', {
        username: username,
        error_type: error instanceof Error ? 'api_error' : 'unknown_error',
        has_captcha: !!turnstile_token
      });

      // API拦截器已经提取了友好的错误消息，直接使用即可
      const errorMessage = error instanceof Error ? error.message : '登录失败，请稍后重试';
      throw new Error(errorMessage);
    }
  };

  const signup = async (username: string, password: string, email: string, turnstile_token?: string) => {
    try {
      const response = await authAPI.signup({ username, password, email, turnstile_token });
      if (response.data.success) {
        await refreshUser();

        trackAnalyticsEvent('user_signup_success', {
          username: username,
          email_domain: email.split('@')[1],
          registration_method: turnstile_token ? 'with_captcha' : 'without_captcha'
        });
      } else {
        throw new Error(response.data.message || '注册失败');
      }
    } catch (error: unknown) {
      trackAnalyticsEvent('user_signup_failed', {
        username: username,
        email_domain: email.split('@')[1],
        error_type: error instanceof Error ? 'api_error' : 'unknown_error',
        has_captcha: !!turnstile_token
      });

      // API拦截器已经提取了友好的错误消息，直接使用即可
      const errorMessage = error instanceof Error ? error.message : '注册失败，请稍后重试';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    const currentUser = user; // 保存当前用户信息用于追踪

    try {
      await authAPI.logout();

      if (currentUser) {
        trackAnalyticsEvent('user_logout_success', {
          username: currentUser.username,
          user_role: currentUser.role,
          had_zhixue: !!currentUser.zhixue_info?.username
        });
      }
    } catch (error) {
      console.error('Logout error:', error);

      if (currentUser) {
        trackAnalyticsEvent('user_logout_failed', {
          username: currentUser.username,
          error_type: 'api_error'
        });
      }
    } finally {
      setUser(null);
      setIsSuMode(false);
      sessionStorage.removeItem('su_mode');
    }
  };

  const switchUser = async (username: string) => {
    try {
      const response = await adminAPI.switchUser(username);
      if (response.data.success && response.data.user) {
        setUser(response.data.user as User);
        setIsSuMode(true);
        sessionStorage.setItem('su_mode', 'true');

        trackAnalyticsEvent('admin_switch_user', {
          target_username: username,
        });
      } else {
        throw new Error(response.data.message || '切换用户失败');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '切换用户失败，请稍后重试';
      throw new Error(errorMessage);
    }
  };

  const exitSu = async () => {
    try {
      const response = await adminAPI.exitSu();
      if (response.data.success && response.data.user) {
        setUser(response.data.user as User);
        setIsSuMode(false);
        sessionStorage.removeItem('su_mode');

        trackAnalyticsEvent('admin_exit_su', {});
      } else {
        throw new Error(response.data.message || '退出 su 模式失败');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '退出 su 模式失败，请稍后重试';
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Init auth error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 监听连接恢复事件，重连成功后刷新用户状态
  useEffect(() => {
    const handleConnectionRecovered = async () => {
      console.log('Connection recovered, refreshing user state...');
      try {
        await refreshUser();
      } catch (error) {
        console.error('Failed to refresh user after connection recovery:', error);
      }
    };

    window.addEventListener('connection-recovered', handleConnectionRecovered);

    return () => {
      window.removeEventListener('connection-recovered', handleConnectionRecovered);
    };
  }, [refreshUser]);

  // 监听账号被封禁事件
  useEffect(() => {
    const handleAccountBanned = () => {
      console.log('Account banned, logging out...');
      setUser(null);
      setIsBanned(true);
    };

    window.addEventListener('account-banned', handleAccountBanned);

    return () => {
      window.removeEventListener('account-banned', handleAccountBanned);
    };
  }, []);

  const clearBanned = () => {
    setIsBanned(false);
  };

  const updateEmailVerified = () => {
    if (user) {
      setUser({
        ...user,
        email_verified: true
      });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isBanned,
    isSuMode,
    login,
    logout,
    signup,
    refreshUser,
    updateEmailVerified,
    clearBanned,
    switchUser,
    exitSu,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};