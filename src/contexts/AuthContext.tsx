import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '@/api/auth';
import type { User } from '@/types/api';
import { trackAnalyticsEvent } from '@/utils/analytics';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string, turnstileToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (username: string, password: string, email: string, turnstileToken?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
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

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.data.success) {
        // 后端直接返回 user 字段，不是包装在 data 中
        setUser(response.data.user);
      }
    } catch {
      setUser(null);
    }
  };

  const login = async (username: string, password: string, turnstile_token?: string) => {
    try {
      const response = await authAPI.login({ username, password, turnstile_token });
      if (response.data.success) {
        // 后端直接返回 user 字段，不是包装在 data 中
        setUser(response.data.user);
        
        // 追踪登录成功事件
        trackAnalyticsEvent('user_login_success', {
          username: username,
          has_zhixue: !!response.data.user.zhixue_username,
          user_role: response.data.user.role,
          login_method: turnstile_token ? 'with_captcha' : 'without_captcha'
        });
      } else {
        throw new Error(response.data.message || '登录失败');
      }
    } catch (error: unknown) {
      // 追踪登录失败事件
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
        
        // 追踪注册成功事件
        trackAnalyticsEvent('user_signup_success', {
          username: username,
          email_domain: email.split('@')[1],
          registration_method: turnstile_token ? 'with_captcha' : 'without_captcha'
        });
      } else {
        throw new Error(response.data.message || '注册失败');
      }
    } catch (error: unknown) {
      // 追踪注册失败事件
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
      
      // 追踪登出成功事件
      if (currentUser) {
        trackAnalyticsEvent('user_logout_success', {
          username: currentUser.username,
          user_role: currentUser.role,
          had_zhixue: !!currentUser.zhixue_username
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      
      // 追踪登出失败事件
      if (currentUser) {
        trackAnalyticsEvent('user_logout_failed', {
          username: currentUser.username,
          error_type: 'api_error'
        });
      }
    } finally {
      setUser(null);
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

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};