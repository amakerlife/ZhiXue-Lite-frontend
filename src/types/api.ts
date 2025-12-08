export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  email_verified: boolean; // 新增：邮箱验证状态
  role: "admin" | "user"; // 移除 data_viewer 角色
  permissions?: string; // 新增权限字符串字段
  is_active: boolean;
  last_login?: string;
  is_manual_school?: boolean; // 新增：是否有手动分配的学校（用于显示判断）
  manual_school_id?: string; // 新增：管理员手动分配的学校 ID（用于编辑）
  zhixue_info?: {
    // 修改：使用嵌套结构
    username?: string;
    realname?: string;
    school_name?: string;
    school_id?: string;
    school_has_teacher?: boolean; // 新增：系统内是否有该用户学校的教师账号
  };
  su_info?: {
    // 新增：su 模式信息（仅管理员返回）
    is_su_mode: boolean;
    original_user_username?: string;
  };
}

export interface UserUpdateRequest {
  email?: string;
  role?: "admin" | "user"; // 移除 data_viewer 角色
  permissions?: string; // 新增权限字段
  is_active?: boolean;
  password?: string;
  currentPassword?: string;
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
  is_saved?: boolean; // 注意：联考场景下该字段可能不准确，应使用 is_saved_for_school
  school_id?: string; // DEPRECATED: 联考场景下使用 school_ids
  is_multi_school?: boolean; // 新增：是否为联考
  school_ids?: string[]; // 新增：参与学校列表（联考）
  schools?: Array<{
    // 新增：学校详细信息（联考）
    school_id: string;
    school_name?: string;
    is_saved: boolean;
  }>;
}

export interface Score {
  subject_id: string;
  subject_name: string;
  score: string; // 后端返回的是字符串，可能为空
  standard_score: string; // 后端返回的是字符串，可能为空
  class_rank: string; // 排名也是字符串
  school_rank: string; // 排名也是字符串
  sort: number;
  is_calculated?: boolean; // 总分是否为计算得到
}

export interface ExamDetail extends Exam {
  school_id: string; // getUserExamScore API会返回school_id
  scores: Score[];
  totalScores?: Score[]; // 总分信息
}

export interface BackgroundTask {
  id: string; // 后端 to_dict() 返回的是 id: self.uuid
  task_type: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  user_id: number;
  progress: number;
  progress_message?: string;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  result?: unknown;
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

export interface Statistics {
  total_users: number;
  total_schools: number;
  total_exams: number;
  saved_exams: number;
}
