import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Download,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Link2,
  Filter,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ExamFetchDialog } from "@/components/ExamFetchDialog";
import { Pagination } from "@/components/Pagination";
import { useAuth } from "@/contexts/AuthContext";
import { examAPI } from "@/api/exam";
import { taskAPI } from "@/api/task";
import { formatTimestampToLocalDate } from "@/utils/dateUtils";
import { trackAnalyticsEvent } from "@/utils/analytics";
import { StatusAlert } from "@/components/StatusAlert";
import type { Exam, BackgroundTask } from "@/types/api";

const ExamsPage: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 判断是否为手动分配学校的用户
  const isManualSchoolUser =
    user?.is_manual_school && !user?.zhixue_info?.username;

  // 手动分配学校的用户默认显示校内考试，其他用户显示个人考试
  const [scope, setScope] = useState<"self" | "school" | "all">(
    isManualSchoolUser ? "school" : "self",
  );

  const [schoolIdFilter, setSchoolIdFilter] = useState(""); // 新增：学校 ID 过滤
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchingTask, setFetchingTask] = useState<BackgroundTask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchConfirmOpen, setFetchConfirmOpen] = useState(false);
  const [fetchDialogOpen, setFetchDialogOpen] = useState(false);

  // 检查权限
  const canViewSchool = user && examAPI.hasPermission(user, 2, 2); // VIEW_EXAM_LIST权限，SCHOOL级别
  const canViewAll = user && examAPI.hasPermission(user, 2, 3); // VIEW_EXAM_LIST权限，GLOBAL级别
  const canFetchData =
    user &&
    (examAPI.hasPermission(user, 0, 1) || // FETCH_DATA权限，SELF级别
      examAPI.hasPermission(user, 0, 2) || // FETCH_DATA权限，SCHOOL级别
      examAPI.hasPermission(user, 0, 3)); // FETCH_DATA权限，GLOBAL级别

  // 检查是否有查看考试列表的权限（基于权限系统，而非账号绑定状态）
  const hasSchoolAccess =
    user &&
    (examAPI.hasPermission(user, 2, 1) || // VIEW_EXAM_LIST权限，SELF级别
      examAPI.hasPermission(user, 2, 2) || // VIEW_EXAM_LIST权限，SCHOOL级别
      examAPI.hasPermission(user, 2, 3)); // VIEW_EXAM_LIST权限，GLOBAL级别

  const loadExams = async (
    pageNum = 1,
    query = "",
    scopeParam = scope,
    startTime?: number,
    endTime?: number,
    schoolId = schoolIdFilter,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: pageNum,
        per_page: 10,
        scope: scopeParam,
        ...(query && { query }),
        ...(startTime && { start_time: startTime }),
        ...(endTime && { end_time: endTime }),
        ...(scopeParam === "all" && schoolId && { school_id: schoolId }),
      };

      const response = await examAPI.getExamList(params);

      if (response.data.success) {
        setExams(response.data.exams);
        setTotalPages(response.data.pagination.pages);

        trackAnalyticsEvent("exam_list_load_success", {
          username: user?.username,
          page: pageNum,
          per_page: 10,
          query: query || null,
          scope: scopeParam,
          school_id: scopeParam === "all" && schoolId ? schoolId : null,
          exam_count: response.data.exams.length,
          total_pages: response.data.pagination.pages,
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "获取考试列表失败";
      setError(errorMessage);

      trackAnalyticsEvent("exam_list_load_failed", {
        username: user?.username,
        page: pageNum,
        query: query || null,
        scope: scopeParam,
        error_message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchExams = () => {
    if (
      canFetchData &&
      (examAPI.hasPermission(user!, 0, 2) || examAPI.hasPermission(user!, 0, 3))
    ) {
      // 有高级权限，打开高级拉取对话框
      setFetchDialogOpen(true);
    } else {
      // 只有基础权限，使用简单确认对话框
      setFetchConfirmOpen(true);
    }
  };

  // 辅助函数：获取考试的数据保存状态（与管理面板逻辑一致）
  const getExamSaveStatus = (
    exam: Exam,
  ): {
    status: "all" | "partial" | "none";
    variant: "default" | "secondary" | "outline";
    label: string;
    title?: string;
  } => {
    if (!exam.schools || exam.schools.length === 0) {
      return { status: "none", variant: "secondary", label: "未知" };
    }

    const savedSchools = exam.schools.filter((s) => s.is_saved);
    const savedCount = savedSchools.length;
    const totalCount = exam.schools.length;

    if (savedCount === 0) {
      return { status: "none", variant: "secondary", label: "未保存" };
    } else if (savedCount === totalCount) {
      return { status: "all", variant: "default", label: "已保存" };
    } else {
      const savedNames = savedSchools
        .map((s) => s.school_name || "未知")
        .join("、");
      return {
        status: "partial",
        variant: "outline",
        label: `部分保存 (${savedCount}/${totalCount})`,
        title: `已保存：${savedNames}`,
      };
    }
  };

  const confirmFetchExams = async () => {
    try {
      setError(null);

      // 立即显示任务等待中状态
      setFetchingTask({
        id: "pending",
        task_type: "fetch_exam_list",
        status: "pending",
        user_id: user?.id || 0,
        progress: 0,
        created_at: new Date().toISOString(),
        started_at: undefined,
        completed_at: undefined,
        error_message: undefined,
        progress_message: undefined,
      });

      const response = await examAPI.fetchExamList();
      if (response.data.success) {
        const taskId = response.data.task_id;

        trackAnalyticsEvent("exam_list_fetch_started", {
          username: user?.username,
          task_id: taskId,
        });

        pollTaskStatus(taskId);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "拉取考试失败";
      setError(errorMessage);
      setFetchingTask(null);
    }
  };

  const handleAdvancedFetch = async (params: any) => {
    try {
      setError(null);

      // 立即显示任务等待中状态
      setFetchingTask({
        id: "pending",
        task_type: "fetch_exam_list",
        status: "pending",
        user_id: user?.id || 0,
        progress: 0,
        created_at: new Date().toISOString(),
        started_at: undefined,
        completed_at: undefined,
        error_message: undefined,
        progress_message: undefined,
      });

      const response = await examAPI.fetchExamList(params);
      if (response.data.success) {
        const taskId = response.data.task_id;

        trackAnalyticsEvent("exam_list_fetch_started", {
          username: user?.username,
          task_id: taskId,
          fetch_type: params.query_type,
          school_id: params.school_id || null,
          fetch_params: params.params || null,
        });

        pollTaskStatus(taskId);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "拉取考试失败";
      setError(errorMessage);
      setFetchingTask(null);
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    try {
      const response = await taskAPI.getTaskStatus(taskId);
      if (response.data.success) {
        const task = response.data.task;
        setFetchingTask(task);

        if (task.status === "completed") {
          setFetchingTask(null);
          loadExams(page, searchQuery);
        } else if (task.status === "failed") {
          setFetchingTask(null);
          setError(task.error_message || "任务执行失败");
        } else if (["pending", "processing"].includes(task.status)) {
          setTimeout(() => pollTaskStatus(taskId), 2000);
        }
      }
    } catch {
      setFetchingTask(null);
      setError("获取任务状态失败");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPage(1);

    const startTime = startDate ? startDate.getTime() : undefined;
    const endTime = endDate ? endDate.getTime() : undefined;

    loadExams(1, searchQuery, scope, startTime, endTime);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);

    const startTime = startDate ? startDate.getTime() : undefined;
    const endTime = endDate ? endDate.getTime() : undefined;

    loadExams(newPage, searchQuery, scope, startTime, endTime);
  };

  const handleScopeChange = (newScope: "self" | "school" | "all") => {
    setScope(newScope);
    setPage(1);

    // 切换 scope 时清空学校 ID 过滤
    if (newScope !== "all") {
      setSchoolIdFilter("");
    }

    const startTime = startDate ? startDate.getTime() : undefined;
    const endTime = endDate ? endDate.getTime() : undefined;

    loadExams(
      1,
      searchQuery,
      newScope,
      startTime,
      endTime,
      newScope === "all" ? schoolIdFilter : "",
    );
  };

  useEffect(() => {
    document.title = "考试列表 - ZhiXue Lite";
    return () => {
      document.title = "ZhiXue Lite";
    };
  }, []);

  // 手动分配学校的用户默认显示校内考试
  useEffect(() => {
    if (isManualSchoolUser && scope === "self") {
      setScope("school");
    }
  }, [isManualSchoolUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasSchoolAccess) {
      loadExams();
    }
  }, [hasSchoolAccess]); // eslint-disable-line react-hooks/exhaustive-deps

  // 如果用户没有学校访问权限，显示提示页面
  if (!hasSchoolAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-amber-600">需要学校访问权限</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 mb-6">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  您需要先绑定智学网账号或由管理员分配学校才能使用考试列表功能。
                </p>
                <p className="text-sm text-muted-foreground">
                  绑定智学网账号后，您可以：
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>查看考试成绩</li>
                  <li>同步最新数据</li>
                </ul>
              </div>
            </div>
            <Link to="/profile#zhixue-binding" className="mt-2">
              <Button className="w-full">
                <Link2 className="h-4 w-4 mr-2" />
                前往绑定智学网账号
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">考试列表</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            仅显示已缓存的数据，如需更新请点击按钮刷新
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Scope 选择器 */}
          {/* 手动分配学校的用户：无 GLOBAL 权限时隐藏下拉框，有 GLOBAL 权限时只显示校内和全部 */}
          {/* 智学网绑定用户：保持原有逻辑 */}
          {isManualSchoolUser
            ? // 手动分配学校的用户
              canViewAll && (
                <Select value={scope} onValueChange={handleScopeChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school">校内</SelectItem>
                    <SelectItem value="all">全部</SelectItem>
                  </SelectContent>
                </Select>
              )
            : // 智学网绑定用户或其他用户
              (canViewSchool || canViewAll) && (
                <Select value={scope} onValueChange={handleScopeChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">个人</SelectItem>
                    {canViewSchool && (
                      <SelectItem value="school">校内</SelectItem>
                    )}
                    {canViewAll && <SelectItem value="all">全部</SelectItem>}
                  </SelectContent>
                </Select>
              )}

          {canFetchData && (
            <Button
              onClick={handleFetchExams}
              disabled={!!fetchingTask}
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${fetchingTask ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {fetchingTask ? "获取中..." : "从智学网重新获取"}
              </span>
              <span className="sm:hidden">
                {fetchingTask ? "获取中" : "从智学网重新获取"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Task Status */}
      {fetchingTask && (
        <StatusAlert
          variant="info"
          message={`任务状态: ${fetchingTask.status === "pending" ? "等待中" : "处理中"}。此页面现在可以被安全关闭。`}
          title="正在获取考试数据..."
        />
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索考试名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">
                <Filter className="h-4 w-4 mr-2" />
                搜索
              </Button>
            </div>

            {/* 时间范围过滤 */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <Label htmlFor="start-date" className="text-sm font-medium">
                  开始日期
                </Label>
                <div className="mt-1">
                  <DatePicker
                    date={startDate}
                    onDateChange={setStartDate}
                    placeholder="选择开始日期"
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="end-date" className="text-sm font-medium">
                  结束日期
                </Label>
                <div className="mt-1">
                  <DatePicker
                    date={endDate}
                    onDateChange={setEndDate}
                    placeholder="选择结束日期"
                  />
                </div>
              </div>
            </div>

            {/* 学校 ID 过滤（仅在查看全部时显示） */}
            {scope === "all" && (
              <div>
                <Label
                  htmlFor="school-id-filter"
                  className="text-sm font-medium"
                >
                  学校 ID（可选）
                </Label>
                <div className="mt-1">
                  <Input
                    id="school-id-filter"
                    placeholder="输入学校 ID 进行过滤"
                    value={schoolIdFilter}
                    onChange={(e) => setSchoolIdFilter(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    留空则显示所有学校的考试
                  </p>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && <StatusAlert variant="error" message={error} />}

      {/* Exams List */}
      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无考试数据</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "没有找到匹配的考试"
                : `您还没有任何${scope === "self" ? "个人" : scope === "school" ? "校内" : ""}考试数据`}
            </p>
            {!searchQuery &&
              (canFetchData ? (
                <Button onClick={handleFetchExams} disabled={!!fetchingTask}>
                  <Download className="h-4 w-4 mr-2" />
                  从智学网获取
                </Button>
              ) : hasSchoolAccess ? (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <div className="flex items-center justify-center space-x-2 text-amber-800">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">权限不足</span>
                  </div>
                  <p className="text-sm text-amber-700 mt-2 text-center">
                    您没有拉取考试数据的权限，请联系管理员
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                    <div className="flex items-center justify-center space-x-2 text-amber-800">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">需要学校访问权限</span>
                    </div>
                    <p className="text-sm text-amber-700 mt-2 text-center">
                      请先绑定智学网账号或联系管理员分配学校，然后才能获取考试数据
                    </p>
                  </div>
                  <Link to="/profile#zhixue-binding">
                    <Button variant="outline" className="w-full">
                      <Link2 className="h-4 w-4 mr-2" />
                      前往绑定账号
                    </Button>
                  </Link>
                </div>
              ))}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <Link key={exam.id} to={`/exams/${exam.id}`} className="block">
              <Card className="transition-all duration-200 hover:bg-accent cursor-pointer">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-base sm:text-lg">
                        {exam.name}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatTimestampToLocalDate(exam.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 self-start">
                      {exam.is_multi_school && (
                        <Badge
                          variant="outline"
                          className="text-xs flex items-center space-x-1 w-fit"
                        >
                          <Users className="h-3 w-3" />
                          <span>联考 ({exam.schools?.length || 0} 校)</span>
                        </Badge>
                      )}

                      {exam.is_multi_school ? (
                        // 联考：显示每个学校的状态
                        <div className="flex flex-wrap gap-1">
                          {exam.schools?.map((school) => (
                            <Badge
                              key={school.school_id}
                              variant={
                                school.is_saved ? "default" : "secondary"
                              }
                              className="text-xs flex items-center space-x-1"
                            >
                              <span>
                                {school.school_name ||
                                  `学校${school.school_id.slice(0, 6)}`}
                              </span>
                              {school.is_saved ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        // 普通考试：使用统一的保存状态判断逻辑
                        <Badge
                          variant={getExamSaveStatus(exam).variant}
                          title={getExamSaveStatus(exam).title}
                          className="text-xs flex items-center space-x-1"
                        >
                          {getExamSaveStatus(exam).status === "all" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          <span>{getExamSaveStatus(exam).label}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="md:hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      点击查看详细成绩信息
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="pointer-events-none"
                    >
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <ConfirmDialog
        open={fetchConfirmOpen}
        onOpenChange={setFetchConfirmOpen}
        title="确认加载考试列表"
        description="加载考试列表可能需要一些时间，确定要继续吗？"
        confirmText="继续"
        cancelText="取消"
        variant="default"
        onConfirm={confirmFetchExams}
      />

      <ExamFetchDialog
        open={fetchDialogOpen}
        onOpenChange={setFetchDialogOpen}
        onFetch={handleAdvancedFetch}
        user={user}
      />
    </div>
  );
};

export default ExamsPage;
