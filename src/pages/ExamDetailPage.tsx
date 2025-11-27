import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Trophy,
  TrendingUp,
  FileText,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CopyableText } from "@/components/CopyableText";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import AnswerSheetViewer from "@/components/AnswerSheetViewer";
import { useAuth } from "@/contexts/AuthContext";
import { useExam, type ExamData } from "@/contexts/ExamContext";
import { examAPI } from "@/api/exam";
import { taskAPI } from "@/api/task";
import { formatTimestampToLocalDate } from "@/utils/dateUtils";
import {
  hasPermission,
  PermissionType,
  PermissionLevel,
} from "@/utils/permissions";
import { trackAnalyticsEvent } from "@/utils/analytics";
import { StatusAlert } from "@/components/StatusAlert";
import type { BackgroundTask } from "@/types/api";

const ExamDetailPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { user } = useAuth();
  const { getExamData } = useExam();
  const [examDetail, setExamDetail] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchingTask, setFetchingTask] = useState<BackgroundTask | null>(null);
  const [downloadingScoresheet, setDownloadingScoresheet] = useState(false);
  const [fetchDialogOpen, setFetchDialogOpen] = useState(false);

  // 联考场景：学校选择相关状态
  const [selectedSchoolId, setSelectedSchoolId] = useState<
    string | undefined
  >();
  const [availableSchools, setAvailableSchools] = useState<
    Array<{
      school_id: string;
      school_name?: string;
      is_saved: boolean;
    }>
  >([]);

  // 下载成绩单对话框状态
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadSchoolId, setDownloadSchoolId] = useState<string>("");
  const [downloadScope, setDownloadScope] = useState<"school" | "all">(
    "school",
  );
  const [downloadIsMultiSchool, setDownloadIsMultiSchool] = useState(false);

  // 拉取详情对话框状态
  const [fetchSchoolId, setFetchSchoolId] = useState("");
  const [forceRefresh, setForceRefresh] = useState(false);

  // 检查考试是否已保存（从成绩数据或 schools 数组判断）
  const isExamSaved = (examData: ExamData | null): boolean => {
    if (!examData) {
      return false;
    }

    // 如果有成绩数据，说明已保存
    if (examData.scores && examData.scores.length > 0) {
      return true;
    }

    // 否则检查 schools 数组
    if (!examData.schools || examData.schools.length === 0) {
      return false;
    }

    // 至少有一个学校已保存就算已保存
    return examData.schools.some((school) => school.is_saved);
  };

  const loadExamDetail = async () => {
    if (!examId) return;

    try {
      setLoading(true);
      setError(null);

      // 使用 ExamContext 获取考试数据，联考场景传递 schoolId
      const examData = await getExamData(examId, {
        schoolId: selectedSchoolId,
      });

      if (examData) {
        setExamDetail(examData);

        trackAnalyticsEvent("exam_detail_load_success", {
          username: user?.username,
          exam_id: examId,
          exam_name: examData.name,
          is_saved: isExamSaved(examData),
          subject_count: examData.scores.length,
        });
      } else {
        setError("获取考试详情失败");

        trackAnalyticsEvent("exam_detail_load_failed", {
          username: user?.username,
          exam_id: examId,
          error_message: "获取考试详情失败",
          stage: "api_response",
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "获取考试详情失败";
      setError(errorMessage);

      trackAnalyticsEvent("exam_detail_load_failed", {
        username: user?.username,
        exam_id: examId,
        error_message: errorMessage,
        stage: "api_request",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchDetails = () => {
    setFetchDialogOpen(true);
  };

  const confirmFetchDetails = async () => {
    if (!examId) return;

    // 确保尽可能传递 school_id：优先使用对话框输入的，否则使用用户自己的
    const finalSchoolId = fetchSchoolId.trim() || user?.zhixue_info?.school_id;

    try {
      setError(null);
      setFetchDialogOpen(false);

      // 立即显示任务等待中状态
      setFetchingTask({
        id: "pending",
        task_type: "fetch_exam_details",
        status: "pending",
        user_id: user?.id || 0,
        progress: 0,
        created_at: new Date().toISOString(),
        started_at: undefined,
        completed_at: undefined,
        error_message: undefined,
        progress_message: undefined,
      });

      const response = await examAPI.fetchExamDetails(
        examId,
        forceRefresh,
        finalSchoolId,
      );
      if (response.data.success) {
        const taskId = response.data.task_id;

        trackAnalyticsEvent("exam_detail_fetch_started", {
          username: user?.username,
          exam_id: examId,
          task_id: taskId,
          force_refresh: forceRefresh,
          school_id: finalSchoolId,
        });

        pollTaskStatus(taskId);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "拉取考试详情失败";
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

          // 重新加载考试详情
          await loadExamDetail();
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

  const handleDownloadScoresheet = () => {
    // 初始化对话框状态，保存当前考试信息
    setDownloadSchoolId(selectedSchoolId || "");
    setDownloadScope("school");
    setDownloadIsMultiSchool(examDetail?.is_multi_school || false);
    setDownloadDialogOpen(true);
  };

  const confirmDownloadScoresheet = async () => {
    if (!examId) return;

    try {
      setDownloadingScoresheet(true);
      setDownloadDialogOpen(false);

      // 确定最终的 school_id 和 scope
      // 联考场景：使用用户选择的 school_id 和 scope
      // 单校场景：也需要传递 school_id（防止下载非本校考试时 400 错误）
      const finalSchoolId =
        downloadSchoolId ||
        selectedSchoolId ||
        (availableSchools.length > 0
          ? availableSchools[0].school_id
          : undefined);
      const finalScope = downloadIsMultiSchool ? downloadScope : undefined;

      const response = await examAPI.generateScoresheet(
        examId,
        finalScope,
        finalSchoolId,
      );

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${examDetail?.name}_成绩单.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      trackAnalyticsEvent("exam_detail_scoresheet_success", {
        username: user?.username,
        exam_id: examDetail?.id,
        exam_name: examDetail?.name,
        scope: downloadScope,
        school_id: downloadSchoolId,
      });
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "下载成绩单失败";
      setError(errorMessage);

      trackAnalyticsEvent("exam_detail_scoresheet_failed", {
        username: user?.username,
        exam_id: examDetail?.id,
        exam_name: examDetail?.name,
        error_message: errorMessage,
      });
    } finally {
      setDownloadingScoresheet(false);
    }
  };

  // 智能选择学校逻辑
  useEffect(() => {
    if (!examDetail) return;

    // 检测是否为联考
    const isMultiSchool = examDetail.is_multi_school || false;
    const schools = examDetail.schools || [];
    setAvailableSchools(schools);

    if (!isMultiSchool) {
      setSelectedSchoolId(undefined); // 非联考不需要
      return;
    }

    const userSchoolId = user?.zhixue_info?.school_id || user?.manual_school_id;

    if (userSchoolId) {
      // 普通用户：默认选中自己的学校
      setSelectedSchoolId(userSchoolId);
    } else {
      // 管理员：只有1个已保存则自动选择
      const savedSchools = schools.filter(
        (s: { is_saved: boolean }) => s.is_saved,
      );
      if (savedSchools.length === 1) {
        setSelectedSchoolId(savedSchools[0].school_id);
      }
      // 多个已保存则不预选（selectedSchoolId 保持 undefined）
    }
  }, [examDetail, user]);

  useEffect(() => {
    loadExamDetail();
  }, [examId, selectedSchoolId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 设置页面标题
  useEffect(() => {
    if (examDetail?.name) {
      document.title = `${examDetail.name} - 考试详情 - ZhiXue Lite`;
    }
    return () => {
      document.title = "ZhiXue Lite";
    };
  }, [examDetail?.name]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link to="/exams">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回考试列表
            </Button>
          </Link>
        </div>

        <StatusAlert variant="error" message={error} />
      </div>
    );
  }

  if (!examDetail) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">考试不存在</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <Link to="/exams">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回考试列表
            </Button>
          </Link>

          <div className="sm:ml-4">
            <h1 className="text-2xl sm:text-3xl font-bold wrap-break-word">
              {examDetail.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              考试详情和成绩信息
            </p>
          </div>
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
          {/* 下载成绩单按钮 - 个人成绩单权限及以上 */}
          {hasPermission(
            user,
            PermissionType.EXPORT_SCORE_SHEET,
            PermissionLevel.SELF,
          ) &&
            isExamSaved(examDetail) && (
              <Button
                onClick={handleDownloadScoresheet}
                disabled={downloadingScoresheet}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                {downloadingScoresheet ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                <span className="hidden sm:inline">
                  {downloadingScoresheet ? "下载中..." : "下载成绩单"}
                </span>
                <span className="sm:hidden">
                  {downloadingScoresheet ? "下载中" : "成绩单"}
                </span>
              </Button>
            )}

          {/* 拉取详情按钮 - 基于 FETCH_DATA 权限显示 */}
          {hasPermission(
            user,
            PermissionType.FETCH_DATA,
            PermissionLevel.SELF,
          ) && (
            <Button
              onClick={handleFetchDetails}
              disabled={!!fetchingTask}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${fetchingTask ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {fetchingTask ? "加载中..." : "加载最新详情"}
              </span>
              <span className="sm:hidden">
                {fetchingTask ? "加载中" : "最新详情"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Task Status */}
      {fetchingTask && (
        <StatusAlert
          variant="info"
          message={`任务状态: ${fetchingTask.status === "pending" ? "等待中" : "处理中"}`}
          title="正在获取考试详情..."
        />
      )}

      {/* Error Message */}
      {error && <StatusAlert variant="error" message={error} />}

      {/* Exam Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>考试信息</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                考试 ID
              </label>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm break-all">
                  <CopyableText text={examDetail.id} />
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                考试时间
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm sm:text-base">
                  {formatTimestampToLocalDate(parseInt(examDetail.created_at))}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                数据状态
              </label>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={isExamSaved(examDetail) ? "default" : "secondary"}
                >
                  {isExamSaved(examDetail) ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  {isExamSaved(examDetail) ? "已保存" : "未保存"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                科目数量
              </label>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {examDetail.scores.length} 科
                </span>
              </div>
            </div>

            {/* 联考标识 */}
            {examDetail.is_multi_school && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  考试类型
                </label>
                <Badge
                  variant="outline"
                  className="flex items-center space-x-1 w-fit"
                >
                  <Users className="h-3 w-3" />
                  <span>联考</span>
                </Badge>
              </div>
            )}

            {/* 学校选择器（联考时显示） */}
            {examDetail.is_multi_school && (
              <div className="col-span-full space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                  选择学校
                  {!user?.zhixue_info?.school_id && !user?.manual_school_id && (
                    <span className="text-amber-600 ml-2">（管理员）</span>
                  )}
                </label>

                <Select
                  value={selectedSchoolId}
                  onValueChange={setSelectedSchoolId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择要查看的学校" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSchools.map((school) => (
                      <SelectItem
                        key={school.school_id}
                        value={school.school_id}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span>{school.school_name || school.school_id}</span>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                school.is_saved ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              {school.is_saved ? "已保存" : "未保存"}
                            </Badge>
                            {!school.is_saved && (
                              <AlertCircle className="h-3 w-3 text-amber-500" />
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 未选择警告 */}
                {!selectedSchoolId && (
                  <StatusAlert
                    variant="warning"
                    message="请先选择学校以查看成绩详情和导出数据"
                    className="text-sm"
                  />
                )}

                {/* 未保存数据警告 */}
                {selectedSchoolId &&
                  !availableSchools.find(
                    (s) => s.school_id === selectedSchoolId,
                  )?.is_saved && (
                    <StatusAlert
                      variant="warning"
                      message="该学校的数据尚未完全保存，成绩信息可能不完整"
                      className="text-sm"
                    />
                  )}
              </div>
            )}

            {/* 导出范围选择已移至下载对话框中 */}

            {/* 总分信息 */}
            {examDetail.totalScores && examDetail.totalScores.length > 0 && (
              <div className="col-span-full space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                  总分
                </label>
                <div className="bg-linear-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
                  {examDetail.totalScores.map((totalScore) => (
                    <div
                      key={totalScore.subject_id}
                      className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
                    >
                      <div className="flex items-baseline space-x-2 justify-center sm:justify-start">
                        <span className="text-2xl sm:text-3xl font-bold text-primary">
                          {totalScore.score || "-"}
                        </span>
                        <span className="text-lg sm:text-xl text-muted-foreground">
                          / {totalScore.standard_score || "-"}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
                        {totalScore.class_rank && (
                          <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg text-center">
                            <span className="text-sm font-medium text-blue-700">
                              班级第 {totalScore.class_rank} 名
                            </span>
                          </div>
                        )}
                        {totalScore.school_rank && (
                          <div className="bg-green-50 border border-green-200 px-3 py-2 rounded-lg text-center">
                            <span className="text-sm font-medium text-green-700">
                              学校第 {totalScore.school_rank} 名
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Scores */}
      {isExamSaved(examDetail) && examDetail.scores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>成绩详情</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 桌面端表格视图 */}
            <div className="hidden md:block">
              <div className="space-y-4">
                {examDetail.scores.map((score, index) => (
                  <div key={score.subject_id}>
                    {index > 0 && <Separator />}
                    <div className="grid grid-cols-5 gap-4 py-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          科目
                        </label>
                        <p className="font-medium">{score.subject_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          得分
                        </label>
                        <p className="font-medium text-lg">
                          {score.score || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          满分
                        </label>
                        <p className="font-medium">
                          {score.standard_score || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          班级排名
                        </label>
                        <p className="font-medium">{score.class_rank || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          学校排名
                        </label>
                        <p className="font-medium">
                          {score.school_rank || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 移动端卡片视图 */}
            <div className="md:hidden space-y-4">
              {examDetail.scores.map((score) => (
                <Card key={score.subject_id} className="bg-muted/20">
                  <CardContent className="p-4">
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-lg text-primary mb-1">
                        {score.subject_name}
                      </h3>
                      <div className="flex items-baseline justify-center space-x-1">
                        <span className="text-2xl font-bold">
                          {score.score || "-"}
                        </span>
                        <span className="text-lg text-muted-foreground">
                          / {score.standard_score || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-background rounded-lg p-3 text-center">
                        <div className="text-muted-foreground mb-1">
                          班级排名
                        </div>
                        <div className="font-medium text-blue-600">
                          {score.class_rank ? `第 ${score.class_rank} 名` : "-"}
                        </div>
                      </div>
                      <div className="bg-background rounded-lg p-3 text-center">
                        <div className="text-muted-foreground mb-1">
                          学校排名
                        </div>
                        <div className="font-medium text-green-600">
                          {score.school_rank
                            ? `第 ${score.school_rank} 名`
                            : "-"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Answer Sheet Viewer */}
      {isExamSaved(examDetail) && examDetail.scores.length > 0 && (
        <AnswerSheetViewer
          examId={examDetail.id}
          scores={examDetail.scores}
          schoolId={selectedSchoolId}
        />
      )}

      {/* Empty State for Unsaved Exam */}
      {!isExamSaved(examDetail) && (
        <Card>
          <CardContent className="text-center py-8 sm:py-12">
            <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">考试详情未保存</h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base max-w-md mx-auto">
              此考试的详细信息尚未保存到服务器，请点击"加载最新详情"获取成绩信息
            </p>
            {hasPermission(
              user,
              PermissionType.FETCH_DATA,
              PermissionLevel.SELF,
            ) && (
              <Button
                onClick={handleFetchDetails}
                disabled={!!fetchingTask}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                加载最新详情
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* 拉取考试详情对话框 */}
      <ConfirmDialog
        open={fetchDialogOpen}
        onOpenChange={(open) => {
          setFetchDialogOpen(open);
          if (!open) {
            // 关闭对话框时重置状态
            setFetchSchoolId("");
            setForceRefresh(false);
          }
        }}
        title="确认获取考试详情"
        description={
          <div className="space-y-3">
            <p>获取考试详情可能需要一些时间，确定要继续吗？</p>

            {/* 学校 ID 输入（GLOBAL 权限用户） */}
            {hasPermission(
              user,
              PermissionType.FETCH_DATA,
              PermissionLevel.GLOBAL,
            ) && (
              <div className="space-y-2">
                <Label
                  htmlFor="fetch-school-id"
                  className="text-sm font-medium"
                >
                  学校 ID（可选，19 位数字）
                </Label>
                <Input
                  id="fetch-school-id"
                  type="text"
                  placeholder="输入学校 ID 以拉取指定学校的考试数据"
                  value={fetchSchoolId}
                  onChange={(e) => setFetchSchoolId(e.target.value)}
                  maxLength={19}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  留空则拉取当前用户所属学校的数据
                </p>
              </div>
            )}

            {/* Force Refresh 复选框 */}
            {hasPermission(
              user,
              PermissionType.REFETCH_EXAM_DATA,
              PermissionLevel.SELF,
            ) &&
              isExamSaved(examDetail) && (
                <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Checkbox
                    id="force-refresh"
                    checked={forceRefresh}
                    onCheckedChange={(checked) => setForceRefresh(!!checked)}
                  />
                  <label
                    htmlFor="force-refresh"
                    className="text-sm text-amber-800 cursor-pointer"
                  >
                    强制刷新（重新从智学网获取数据）
                  </label>
                </div>
              )}
          </div>
        }
        confirmText="继续"
        cancelText="取消"
        variant="default"
        onConfirm={confirmFetchDetails}
      />

      {/* 下载成绩单对话框 */}
      <ConfirmDialog
        open={downloadDialogOpen}
        onOpenChange={(open) => {
          setDownloadDialogOpen(open);
          if (!open) {
            // 关闭对话框时重置状态
            setDownloadSchoolId("");
            setDownloadScope("school");
            setDownloadIsMultiSchool(false);
          }
        }}
        title="下载成绩单"
        description={
          <div className="space-y-3">
            {/* 非联考场景：简单提示 */}
            {!downloadIsMultiSchool && (
              <p>即将下载成绩单 Excel 文件，确定要继续吗？</p>
            )}

            {/* 联考场景：选择参数 */}
            {downloadIsMultiSchool && (
              <>
                <p>此考试为联考，请选择下载参数：</p>

                {/* 学校选择 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="download-school-select"
                    className="text-sm font-medium"
                  >
                    选择学校
                  </Label>
                  <Select
                    value={downloadSchoolId}
                    onValueChange={setDownloadSchoolId}
                  >
                    <SelectTrigger id="download-school-select">
                      <SelectValue placeholder="请选择要下载的学校" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSchools.map((school) => (
                        <SelectItem
                          key={school.school_id}
                          value={school.school_id}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span>
                              {school.school_name || school.school_id}
                            </span>
                            <Badge
                              variant={
                                school.is_saved ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              {school.is_saved ? "已保存" : "未保存"}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 导出范围选择（GLOBAL 权限） */}
                {hasPermission(
                  user,
                  PermissionType.EXPORT_SCORE_SHEET,
                  PermissionLevel.GLOBAL,
                ) && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="download-scope-select"
                      className="text-sm font-medium"
                    >
                      导出范围
                    </Label>
                    <Select
                      value={downloadScope}
                      onValueChange={(v) =>
                        setDownloadScope(v as "school" | "all")
                      }
                    >
                      <SelectTrigger id="download-scope-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school">仅当前学校</SelectItem>
                        <SelectItem value="all">所有参与学校</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      导出所有学校时将包含联考中所有参与学校的成绩数据
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        }
        confirmText="下载"
        cancelText="取消"
        variant="default"
        onConfirm={confirmDownloadScoresheet}
      />
    </div>
  );
};

export default ExamDetailPage;
