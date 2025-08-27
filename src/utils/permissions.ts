import type { User } from '@/types/api';

/**
 * 权限检查工具函数
 */

export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

export const isDataViewer = (user: User | null): boolean => {
  return user?.role === 'data_viewer';
};

export const canViewAllData = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'data_viewer';
};

export const canManageSystem = (user: User | null): boolean => {
  return user?.role === 'admin';
};

export const getUserRoleLabel = (role: string): string => {
  switch (role) {
    case 'admin':
      return '管理员';
    case 'data_viewer':
      return '数据查看者';
    case 'user':
      return '普通用户';
    default:
      return '未知角色';
  }
};

export const getRoleVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (role) {
    case 'admin':
      return 'destructive';
    case 'data_viewer':
      return 'default';
    case 'user':
      return 'secondary';
    default:
      return 'outline';
  }
};