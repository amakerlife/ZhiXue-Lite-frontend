import api from './client';
import type { ApiResponse, PaginationInfo } from '@/types/api';

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
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  registration_ip?: string;
  last_login_ip?: string;
  zhixue_account_id?: string;
  zhixue_username?: string;
  zhixue_realname?: string;
  zhixue_school?: string;
}

export interface AdminExam {
  id: string;
  name: string;
  is_saved: boolean;
  school: string; // 注意：这里是学校名称，不是school_id
  created_at: number;
}

export const adminAPI = {
  // 学校管理
  listSchools: (params: AdminListParams = {}) =>
    api.get<ApiResponse & { schools: School[]; pagination: PaginationInfo }>('/admin/list/schools', { params }),
  
  // 考试管理  
  listExams: (params: AdminListParams = {}) =>
    api.get<ApiResponse & { exams: AdminExam[]; pagination: PaginationInfo }>('/admin/list/exams', { params }),
  
  // 用户管理
  listUsers: (params: AdminListParams = {}) =>
    api.get<ApiResponse & { users: AdminUser[]; pagination: PaginationInfo }>('/admin/list/users', { params }),
  
  // 智学网学生账户管理
  listZhiXueAccounts: (params: AdminListParams = {}) =>
    api.get<ApiResponse & { zhixue_accounts: ZhiXueAccount[]; pagination: PaginationInfo }>('/admin/list/zhixue_accounts', { params }),
  
  // 教师管理
  listTeachers: (params: AdminListParams = {}) =>
    api.get<ApiResponse & { teachers: Teacher[]; pagination: PaginationInfo }>('/teacher/list', { params }),
  
  addTeacher: (data: { username: string; password: string; login_method?: string }) =>
    api.post<ApiResponse & { teacher: Teacher }>('/teacher/add', data),
  
  getTeacher: (username: string) =>
    api.get<ApiResponse & { teacher: Teacher }>(`/teacher/${username}`),
  
  updateTeacher: (username: string, data: { password?: string; login_method?: string; is_active?: boolean }) =>
    api.put<ApiResponse>(`/teacher/${username}`, data),
  
  deleteTeacher: (username: string) =>
    api.delete<ApiResponse>(`/teacher/${username}`),
  
  // 智学网账号管理
  getZhixueAccountBindings: (zhixueUsername: string) =>
    api.get<ApiResponse & { binding_info: { total: number; users: { username: string }[] } }>(`/admin/zhixue/${zhixueUsername}/users`),
  
  unbindUserFromZhixueAccount: (zhixueUsername: string, username: string) =>
    api.post<ApiResponse>(`/admin/zhixue/${zhixueUsername}/unbind/${username}`),

  // 缓存管理
  clearCache: () =>
    api.delete<ApiResponse>('/admin/cache'),

  // 用户管理
  updateUser: (userId: number, data: { email?: string; role?: string; is_active?: boolean; password?: string }) =>
    api.put<ApiResponse & { user: AdminUser }>(`/admin/user/${userId}`, data),
};