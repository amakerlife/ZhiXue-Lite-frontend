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

export interface EmailVerificationStatusResponse {
  email_verification_enabled: boolean;
  email_verified: boolean;
  email: string;
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

  updateCurrentUser: (data: Partial<UserUpdateRequest>) =>
    api.put<ApiResponse & { user: User }>('/user/me', data),

  // 邮件验证相关 API
  verifyEmail: (token: string) =>
    api.get<ApiResponse>(`/user/email/verify/${token}`),

  resendVerificationEmail: () =>
    api.post<ApiResponse>('/user/email/resend-verification'),

  getEmailVerificationStatus: () =>
    api.get<ApiResponse & EmailVerificationStatusResponse>('/user/email/verification-status'),
};