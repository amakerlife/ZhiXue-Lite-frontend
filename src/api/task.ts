import api from './client';
import type { ApiResponse, BackgroundTask, PaginatedResponse } from '@/types/api';

export interface TaskListParams {
  page?: number;
  per_page?: number;
  status?: string;
}

export const taskAPI = {
  getTaskStatus: (taskUuid: string) =>
    api.get<ApiResponse & { task: BackgroundTask }>(`/task/status/${taskUuid}`),
  
  getUserTasks: (params: TaskListParams = {}) =>
    api.get<ApiResponse & { tasks: BackgroundTask[]; pagination: any }>('/task/list', { params }),
  
  cancelTask: (taskUuid: string) =>
    api.post<ApiResponse>(`/task/cancel/${taskUuid}`),
};