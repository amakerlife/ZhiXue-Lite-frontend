export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface User {
  username: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  last_login?: string;
  zhixue_username?: string;  // 后端返回的是扁平化的字段
  zhixue_realname?: string;
  zhixue_school?: string;
}

// 为了兼容性，创建一个包含zhixue对象的接口
export interface UserWithZhixue extends User {
  id?: number;
  created_at?: string;
  zhixue?: {
    id: string;
    username: string;
    realname: string;
    school_id: string;
  };
}

export interface ZhiXueStudentAccount {
  id: string;
  username: string;
  realname: string;
  school_id: string;
}

export interface School {
  id: string;
  name: string;
}

export interface Exam {
  id: string;
  name: string;
  created_at: number; // 后端返回的是Unix时间戳（毫秒级）
  is_saved: boolean;
  school_id?: string; // 从后端API可以看到会返回school_id
}

export interface Score {
  subject_id: string;
  subject_name: string;
  score: string; // 后端返回的是字符串，可能为空
  standard_score: string; // 后端返回的是字符串，可能为空
  class_rank: string; // 排名也是字符串
  school_rank: string; // 排名也是字符串
  sort: number;
}

export interface ExamDetail extends Exam {
  school_id: string; // getUserExamScore API会返回school_id
  scores: Score[];
  totalScores?: Score[]; // 总分信息
}

export interface BackgroundTask {
  id: string; // 后端 to_dict() 返回的是 id: self.uuid
  task_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  user_id: number;
  progress: number;
  progress_message?: string;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  result?: any;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}