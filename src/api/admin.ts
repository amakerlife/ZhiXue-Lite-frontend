import api from "./client";
import type { ApiResponse, PaginationInfo } from "@/types/api";

export interface AdminListParams {
  page?: number;
  per_page?: number;
  query?: string;
}

export interface School {
  id: string;
  name: string;
}

export interface ZhiXueAccount {
  id: string;
  username: string;
  realname: string;
  school_id: string;
  school_name?: string;
}

export interface Teacher {
  id: string;
  username: string;
  realname: string;
  school_name: string;
  login_method: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  email_verified: boolean; // 新增：邮箱验证状态
  role: string;
  permissions?: string; // 新增权限字段
  is_active: boolean;
  created_at: string;
  last_login?: string;
  registration_ip?: string;
  last_login_ip?: string;
  is_manual_school?: boolean; // 新增：是否有手动分配的学校（用于显示判断）
  manual_school_id?: string; // 新增：管理员手动分配的学校 ID（用于编辑）
  zhixue_info?: {
    // 修改：使用嵌套结构
    username?: string;
    realname?: string;
    school_name?: string;
    school_id?: string;
  };
  su_info?: {
    // 新增：su 模式信息（仅管理员返回）
    is_su_mode: boolean;
    original_user_username?: string;
  };
}

export interface AdminExam {
  id: string;
  name: string;
  created_at: number;
  schools: Array<{
    // 必需字段：学校详细信息（支持联考）
    school_id: string;
    school_name: string;
    is_saved: boolean;
  }>;
  // 以下字段已废弃，保留用于向后兼容
  /** @deprecated 使用 schools 数组中各学校的 is_saved 状态 */
  is_saved?: boolean;
  /** @deprecated 使用 schools 数组获取学校名称 */
  school?: string;
}

export const adminAPI = {
  // 学校管理
  listSchools: (params: AdminListParams = {}) =>
    api.get<ApiResponse & { schools: School[]; pagination: PaginationInfo }>(
      "/admin/list/schools",
      { params },
    ),

  // 考试管理
  listExams: (params: AdminListParams = {}) =>
    api.get<ApiResponse & { exams: AdminExam[]; pagination: PaginationInfo }>(
      "/admin/list/exams",
      { params },
    ),

  // 用户管理
  listUsers: (params: AdminListParams = {}) =>
    api.get<ApiResponse & { users: AdminUser[]; pagination: PaginationInfo }>(
      "/admin/list/users",
      { params },
    ),

  // 智学网学生账户管理
  listZhiXueAccounts: (params: AdminListParams = {}) =>
    api.get<
      ApiResponse & {
        zhixue_accounts: ZhiXueAccount[];
        pagination: PaginationInfo;
      }
    >("/admin/list/zhixue_accounts", { params }),

  // 教师管理
  listTeachers: (params: AdminListParams = {}) =>
    api.get<ApiResponse & { teachers: Teacher[]; pagination: PaginationInfo }>(
      "/teacher/list",
      { params },
    ),

  addTeacher: (data: {
    username: string;
    password: string;
    login_method?: string;
  }) => api.post<ApiResponse & { teacher: Teacher }>("/teacher/add", data),

  getTeacher: (username: string) =>
    api.get<ApiResponse & { teacher: Teacher }>(`/teacher/${username}`),

  updateTeacher: (
    username: string,
    data: { password?: string; login_method?: string; is_active?: boolean },
  ) => api.put<ApiResponse>(`/teacher/${username}`, data),

  deleteTeacher: (username: string) =>
    api.delete<ApiResponse>(`/teacher/${username}`),

  // 智学网账号管理
  getZhixueAccountBindings: (zhixueUsername: string) =>
    api.get<
      ApiResponse & {
        binding_info: { total: number; users: { username: string }[] };
      }
    >(`/admin/zhixue/${zhixueUsername}/users`),

  unbindUserFromZhixueAccount: (zhixueUsername: string, username: string) =>
    api.post<ApiResponse>(`/admin/zhixue/${zhixueUsername}/unbind/${username}`),

  // 缓存管理
  clearCache: () => api.delete<ApiResponse>("/admin/cache"),

  // 用户管理
  updateUser: (
    userId: number,
    data: {
      email?: string;
      role?: string;
      permissions?: string;
      is_active?: boolean;
      password?: string;
      manual_school_id?: string | null;
    },
  ) =>
    api.put<ApiResponse & { user: AdminUser }>(`/admin/user/${userId}`, data),

  // Su 功能
  switchUser: (username: string) =>
    api.post<ApiResponse & { user: AdminUser }>(`/admin/su/${username}`),

  exitSu: () => api.post<ApiResponse & { user: AdminUser }>("/admin/su/exit"),
};
