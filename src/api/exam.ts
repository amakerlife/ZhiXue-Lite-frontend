import api from './client';
import type { ApiResponse, Exam, PaginationInfo } from '@/types/api';

export interface ExamListParams {
  page?: number;
  per_page?: number;
  query?: string;
}

export const examAPI = {
  getExamList: (params: ExamListParams = {}) =>
    api.get<ApiResponse & { exams: Exam[]; pagination: PaginationInfo }>('/exam/list', { params }),

  fetchExamList: () =>
    api.post<ApiResponse & { task_id: string }>('/exam/list/fetch'),

  getExamInfo: (examId: string) =>
    api.get<ApiResponse & { exam: Exam }>(`/exam/${examId}`),

  fetchExamDetails: (examId: string, forceRefresh = false) =>
    api.post<ApiResponse & { task_id: string }>(`/exam/${examId}/fetch`, {}, {
      params: { force_refresh: forceRefresh }
    }),

  getUserExamScore: (examId: string) =>
    api.get<ApiResponse & {
      id: string;
      name: string;
      school_id: string;
      is_saved: boolean;
      created_at: number;
      scores: Array<{
        subject_id: string;
        subject_name: string;
        score: string;
        standard_score: string;
        class_rank: string;
        school_rank: string;
        sort: number;
      }>;
    }>(`/exam/${examId}/score`),

  generateScoresheet: (examId: string) =>
    api.get(`/exam/${examId}/scoresheet`, {
      responseType: 'blob',
    }),

  generateAnswersheet: (examId: string, subjectId: string, studentId?: string) =>
    api.get(`/exam/${examId}/subject/${subjectId}/answersheet`, {
      responseType: 'blob',
      params: studentId ? { student_id: studentId } : undefined,
    }),
};