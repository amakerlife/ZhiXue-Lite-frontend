import api from './client';
import type { ApiResponse, User, PaginatedResponse } from '@/types/api';

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
}

export const adminAPI = {
  // 学校管理
  listSchools: (params: AdminListParams = {}) =>
    api.get<ApiResponse & { schools: School[]; pagination: any }>('/admin/list/schools', { params }),
  
  // 用户管理
  listUsers: (params: AdminListParams = {}) =>
    api.get<ApiResponse & { users: AdminUser[]; pagination: any }>('/admin/list/users', { params }),
  
  // 智学网学生账户管理
  listZhiXueAccounts: (params: AdminListParams = {}) =>
    api.get<ApiResponse & { zhixue_accounts: ZhiXueAccount[]; pagination: any }>('/admin/list/zhixue_accounts', { params }),
  
  // 教师管理
  listTeachers: (params: AdminListParams = {}) =>
    api.get<ApiResponse & { teachers: Teacher[]; pagination: any }>('/teacher/list', { params }),
  
  addTeacher: (data: { username: string; password: string; login_method?: string }) =>
    api.post<ApiResponse & { teacher: Teacher }>('/teacher/add', data),
  
  getTeacher: (username: string) =>
    api.get<ApiResponse & { teacher: Teacher }>(`/teacher/${username}`),
  
  updateTeacher: (username: string, data: { password?: string; login_method?: string; is_active?: boolean }) =>
    api.put<ApiResponse>(`/teacher/${username}`, data),
  
  deleteTeacher: (username: string) =>
    api.delete<ApiResponse>(`/teacher/${username}`),
};