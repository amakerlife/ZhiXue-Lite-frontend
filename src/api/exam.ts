import api from "./client";
import type { ApiResponse, Exam, PaginationInfo } from "@/types/api";

export interface ExamListParams {
  page?: number;
  per_page?: number;
  query?: string;
  scope?: "self" | "school" | "all";
  school_id?: string; // 新增：用于 scope=all 时过滤特定学校
  start_time?: number; // 开始时间戳
  end_time?: number; // 结束时间戳
}

export interface FetchListParams {
  query_type?: "self" | "school_id";
  school_id?: string;
  params?: Record<string, unknown>; // 拉取参数对象
}

export interface ExamSelections {
  academicYear: Array<{ code: string; name: string }>;
  academicYearTerm: Array<
    Record<
      string,
      Array<{ academicYearCode: string; termId: string; termName: string }>
    >
  >;
  examTypeList: Array<{ code: string; name: string }>;
  gradeList: Array<{
    code: string;
    name: string;
    sort: number;
    phase?: { code: string; name: string };
  }>;
  queryTypeList: Array<{ code: string; name: string }>;
  schoolInYearList: Array<{ code: string; name: string }>;
  teachingCycle: Array<
    Record<
      string,
      Array<{
        academicYearCode: string;
        beginTime: string;
        endTime: string;
        teachingCycleId: string;
        teachingCycleName: string;
        termId: string;
      }>
    >
  >;
}

export const examAPI = {
  getExamList: (params: ExamListParams = {}) =>
    api.get<ApiResponse & { exams: Exam[]; pagination: PaginationInfo }>(
      "/exam/list",
      { params },
    ),

  fetchExamList: (params?: FetchListParams) => {
    const config: { params?: { query_type?: string; school_id?: string } } = {};

    if (params?.query_type || params?.school_id) {
      config.params = {
        ...(params.query_type && { query_type: params.query_type }),
        ...(params.school_id && { school_id: params.school_id }),
      };
    }

    const requestData = params?.params ? { params: params.params } : {};

    return api.post<ApiResponse & { task_id: string }>(
      "/exam/list/fetch",
      requestData,
      config,
    );
  },

  getFetchListParams: (schoolId: string) =>
    api.get<ApiResponse & { params: ExamSelections }>(
      "/exam/fetch-list-params",
      { params: { school_id: schoolId } },
    ),

  getExamInfo: (examId: string) =>
    api.get<ApiResponse & { exam: Exam }>(`/exam/${examId}`),

  fetchExamDetails: (examId: string, forceRefresh = false, schoolId?: string) =>
    api.post<ApiResponse & { task_id: string }>(
      `/exam/${examId}/fetch`,
      {},
      {
        params: {
          force_refresh: forceRefresh,
          ...(schoolId && { school_id: schoolId }),
        },
      },
    ),

  getUserExamScore: (
    examId: string,
    studentId?: string,
    studentName?: string,
    schoolId?: string,
  ) =>
    api.get<
      ApiResponse & {
        id: string;
        name: string;
        school_id: string;
        created_at: number;
        student_id: string;
        is_multi_school?: boolean;
        schools?: Array<{
          school_id: string;
          school_name?: string;
          is_saved: boolean;
        }>;
        scores: Array<{
          subject_id: string;
          subject_name: string;
          score: string;
          standard_score: string;
          class_rank: string;
          school_rank: string;
          sort: number;
        }>;
      }
    >(`/exam/${examId}/score`, {
      params: {
        ...(studentId && { student_id: studentId }),
        ...(studentName && { student_name: studentName }),
        ...(schoolId && { school_id: schoolId }),
      },
    }),

  generateScoresheet: (
    examId: string,
    scope?: "school" | "all",
    schoolId?: string,
  ) =>
    api.get(`/exam/${examId}/scoresheet`, {
      responseType: "blob",
      params: {
        ...(scope && { scope }),
        ...(schoolId && { school_id: schoolId }),
      },
    }),

  generateAnswersheet: (
    examId: string,
    subjectId: string,
    studentId?: string,
    studentName?: string,
    schoolId?: string,
  ) =>
    api.get(`/exam/${examId}/subject/${subjectId}/answersheet`, {
      responseType: "blob",
      params: {
        ...(studentId && { student_id: studentId }),
        ...(studentName && { student_name: studentName }),
        ...(schoolId && { school_id: schoolId }),
      },
    }),

  // 权限检查辅助方法
  hasPermission: (
    user: { role?: string; permissions?: string } | null | undefined,
    permissionType: number,
    requiredLevel: number,
  ): boolean => {
    if (user?.role === "admin") return true;

    if (!user?.permissions || user.permissions.length <= permissionType) {
      return false;
    }

    const userLevel = parseInt(user.permissions[permissionType]);
    return userLevel >= requiredLevel;
  },
};
