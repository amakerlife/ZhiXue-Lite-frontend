import api from './client';
import type { ApiResponse, User } from '@/types/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest extends LoginRequest {
  email: string;
}

export interface ConnectZhixueRequest {
  username: string;
  password: string;
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
  
  connectZhixue: (data: ConnectZhixueRequest) =>
    api.post<ApiResponse>('/user/connect', data),
  
  disconnectZhixue: () =>
    api.post<ApiResponse>('/user/disconnect'),
  
  updateUser: (userId: number, data: Partial<User>) =>
    api.put<ApiResponse & { user: User }>(`/user/update/${userId}`, data),
};