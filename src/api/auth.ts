import api from './client';
import type { ApiResponse, User, UserUpdateRequest } from '@/types/api';

export interface LoginRequest {
  username: string;
  password: string;
  turnstile_token?: string;
}

export interface SignupRequest extends LoginRequest {
  email: string;
}

export interface ConnectZhixueRequest {
  username: string;
  password: string;
  turnstile_token?: string;
}

export const authAPI = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse & { user: User }>('/user/login', data),

  signup: (data: SignupRequest) =>
    api.post<ApiResponse<{ id: number }>>('/user/signup', data),

  logout: () =>
    api.post<ApiResponse>('/user/logout'),

  getCurrentUser: () =>
    api.get<ApiResponse & { user: User }>('/user/me'),

  bindZhixue: (data: ConnectZhixueRequest) =>
    api.post<ApiResponse>('/user/zhixue/bind', data),

  unbindZhixue: () =>
    api.post<ApiResponse>('/user/zhixue/unbind'),

  getZhixueBindingInfo: () =>
    api.get<ApiResponse & { binding_info: { username: string }[] }>('/user/zhixue/binding_info'),

  updateUser: (userId: number, data: UserUpdateRequest) =>
    api.put<ApiResponse & { user: User }>(`/user/update/${userId}`, data),
};