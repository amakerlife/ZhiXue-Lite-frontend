import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/api/auth';
import type { User } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (username: string, password: string, email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    } catch (error) {
      setUser(null);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login({ username, password });
      if (response.data.success) {
        // 后端直接返回 user 字段，不是包装在 data 中
        setUser(response.data.user);
      } else {
        throw new Error(response.data.message || '登录失败');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '登录失败');
    }
  };

  const signup = async (username: string, password: string, email: string) => {
    try {
      const response = await authAPI.signup({ username, password, email });
      if (response.data.success) {
        await refreshUser();
      } else {
        throw new Error(response.data.message || '注册失败');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '注册失败');
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
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