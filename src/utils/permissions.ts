import type { User } from '@/types/api';

/**
 * 权限检查工具函数
 */

// 权限级别常量
export const PermissionLevel = {
  DENIED: 0,      // 禁止
  SELF: 1,        // 个人: 只能访问自己的数据
  SCHOOL: 2,      // 校内: 可访问同校数据
  GLOBAL: 3,      // 全局: 可访问所有数据
} as const;

export type PermissionLevel = typeof PermissionLevel[keyof typeof PermissionLevel];

// 权限类型常量
export const PermissionType = {
  FETCH_DATA: 0,          // 拉取数据（列表、详情）
  REFETCH_EXAM_DATA: 1,   // 重新拉取考试详情数据
  VIEW_EXAM_LIST: 2,      // 查看考试列表
  VIEW_EXAM_DATA: 3,      // 查看考试详情数据
  EXPORT_SCORE_SHEET: 4,  // 导出成绩单（无个人权限）
} as const;

export type PermissionType = typeof PermissionType[keyof typeof PermissionType];

// 权限描述映射
export const PERMISSION_DESCRIPTIONS = {
  [PermissionType.FETCH_DATA]: { action: '拉取', object: '数据' },
  [PermissionType.REFETCH_EXAM_DATA]: { action: '重新拉取', object: '考试数据' },
  [PermissionType.VIEW_EXAM_LIST]: { action: '查看', object: '考试列表' },
  [PermissionType.VIEW_EXAM_DATA]: { action: '查看', object: '考试详情' },
  [PermissionType.EXPORT_SCORE_SHEET]: { action: '导出', object: '考试成绩单' },
};

// 权限级别描述映射
export const PERMISSION_LEVEL_DESCRIPTIONS = {
  [PermissionLevel.DENIED]: '禁止',
  [PermissionLevel.SELF]: '个人',
  [PermissionLevel.SCHOOL]: '校内',
  [PermissionLevel.GLOBAL]: '全局',
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

// 已废弃的函数，保留以防旧代码仍在使用
export const isDataViewer = (_user: User | null): boolean => {
  // data_viewer 角色已被移除，现在通过权限系统控制
  return false;
};

export const canViewAllData = (user: User | null): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return true;

  // 检查是否有全局的查看考试列表或考试详情权限
  return hasPermission(user, PermissionType.VIEW_EXAM_LIST, PermissionLevel.GLOBAL) ||
         hasPermission(user, PermissionType.VIEW_EXAM_DATA, PermissionLevel.GLOBAL);
};

export const canManageSystem = (user: User | null): boolean => {
  return user?.role === 'admin';
};

/**
 * 检查用户是否有指定权限
 */
export const hasPermission = (user: User | null, permissionType: PermissionType, requiredLevel: PermissionLevel): boolean => {
  if (!user) return false;

  // 管理员默认拥有所有权限
  if (user.role === 'admin') return true;

  // 检查权限字符串
  if (!user.permissions || user.permissions.length <= permissionType) {
    return false;
  }

  const userLevel = parseInt(user.permissions[permissionType], 10);
  if (isNaN(userLevel)) return false;

  return userLevel >= requiredLevel;
};

/**
 * 获取用户在指定权限类型上的权限级别
 */
export const getUserPermissionLevel = (user: User | null, permissionType: PermissionType): PermissionLevel => {
  if (!user) return PermissionLevel.DENIED;

  // 管理员默认拥有全局权限
  if (user.role === 'admin') return PermissionLevel.GLOBAL;

  if (!user.permissions || user.permissions.length <= permissionType) {
    return PermissionLevel.DENIED;
  }

  const level = parseInt(user.permissions[permissionType], 10);
  return isNaN(level) ? PermissionLevel.DENIED : (level as PermissionLevel);
};

/**
 * 获取用户的所有权限信息，用于显示
 */
export const getUserPermissions = (user: User | null): Array<{
  type: PermissionType;
  level: PermissionLevel;
  action: string;
  object: string;
  levelDescription: string;
  allowed: boolean;
}> => {
  if (!user) return [];

  const permissions = [];

  for (let i = 0; i < 5; i++) {
    const permissionType = i as PermissionType;
    const level = getUserPermissionLevel(user, permissionType);
    const description = PERMISSION_DESCRIPTIONS[permissionType];

    permissions.push({
      type: permissionType,
      level,
      action: description.action,
      object: description.object,
      levelDescription: PERMISSION_LEVEL_DESCRIPTIONS[level],
      allowed: level > PermissionLevel.DENIED,
    });
  }

  return permissions;
};

export const getUserRoleLabel = (role: string): string => {
  switch (role) {
    case 'admin':
      return '管理员';
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
    case 'user':
      return 'secondary';
    default:
      return 'outline';
  }
};