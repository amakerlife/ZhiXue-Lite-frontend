import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Users,
  Calendar,
  Trophy,
  TrendingUp,
  CloudDownload,
} from "lucide-react";
import { StatusAlert } from "@/components/StatusAlert";
import { CopyableText } from "@/components/CopyableText";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { DrawerClose } from "@/components/ui/drawer";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Label } from "@/components/ui/label";
import AnswerSheetViewer from "@/components/AnswerSheetViewer";
import { useAuth } from "@/contexts/AuthContext";
import type { Exam, Score } from "@/types/api";
import { examAPI } from "@/api/exam";
import { taskAPI } from "@/api/task";
import { formatTimestampToLocalDate } from "@/utils/dateUtils";
import {
  canViewAllData,
  hasPermission,
  PermissionType,
  PermissionLevel,
} from "@/utils/permissions";
import { trackAnalyticsEvent } from "@/utils/analytics";
import type { BackgroundTask } from "@/types/api";

const DataViewerPage: React.FC = () => {
  const { user } = useAuth();

  // 拉取考试功能状态
  const [fetchDialog, setFetchDialog] = useState(false);
  const [fetchExamId, setFetchExamId] = useState("");
  const [fetchSchoolId, setFetchSchoolId] = useState(""); // 新增学校ID状态
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchSuccess, setFetchSuccess] = useState<string | null>(null);
  const [fetchingTask, setFetchingTask] = useState<BackgroundTask | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);

  useEffect(() => {
    document.title = "数据查看 - ZhiXue Lite";
    return () => {
      document.title = "ZhiXue Lite";
    };
  }, []);

  // 权限检查 - 满足以下任一条件即可访问数据查看页面：
  // 1. 拉取校内数据及以上权限
  // 2. 重新拉取考试详情数据校内及以上权限
  // 3. 查看校内考试详情及以上权限
  // 4. 导出个人成绩单及以上权限
  const hasDataViewPermission =
    canViewAllData(user) ||
    hasPermission(user, PermissionType.FETCH_DATA, PermissionLevel.SCHOOL) ||
    hasPermission(
      user,
      PermissionType.REFETCH_EXAM_DATA,
      PermissionLevel.SCHOOL,
    ) ||
    hasPermission(
      user,
      PermissionType.VIEW_EXAM_DATA,
      PermissionLevel.SCHOOL,
    ) ||
    hasPermission(
      user,
      PermissionType.EXPORT_SCORE_SHEET,
      PermissionLevel.SELF,
    );

  if (!hasDataViewPermission) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">权限不足</CardTitle>
            <CardDescription>
              您需要相应的数据权限才能访问此页面
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // 处理拉取考试
  const handleFetchExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fetchExamId.trim()) return;

    setFetchLoading(true);
    setFetchError(null);
    setFetchSuccess(null);

    // 确保尽可能传递 school_id：优先使用用户输入的，否则使用用户自己的
    const finalSchoolId = fetchSchoolId.trim() || user?.zhixue_info?.school_id;

    try {
      const response = await examAPI.fetchExamDetails(
        fetchExamId.trim(),
        forceRefresh,
        finalSchoolId, // 传递学校 ID 参数
      );
      if (response.data.success) {
        const taskId = response.data.task_id;
        setFetchDialog(false);
        setFetchExamId("");
        setFetchSchoolId(""); // 清空学校 ID
        setForceRefresh(false);
        setFetchSuccess(`考试 ${fetchExamId.trim()} 拉取任务已创建`);

        trackAnalyticsEvent("data_viewer_exam_fetch_started", {
          username: user?.username,
          exam_id: fetchExamId.trim(),
          school_id: finalSchoolId || null, // 记录学校 ID
          task_id: taskId,
          force_refresh: forceRefresh,
        });

        pollTaskStatus(taskId);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "拉取考试失败";
      setFetchError(errorMessage);
    } finally {
      setFetchLoading(false);
    }
  };

  // 轮询任务状态
  const pollTaskStatus = async (taskId: string) => {
    try {
      const response = await taskAPI.getTaskStatus(taskId);
      if (response.data.success) {
        const task = response.data.task;
        setFetchingTask(task);

        if (task.status === "completed") {
          setFetchingTask(null);
          setFetchSuccess("考试数据拉取完成！");
        } else if (task.status === "failed") {
          setFetchingTask(null);
          setFetchError(task.error_message || "考试数据拉取失败");
        } else if (["pending", "processing"].includes(task.status)) {
          setTimeout(() => pollTaskStatus(taskId), 2000);
        }
      }
    } catch {
      setFetchingTask(null);
      setFetchError("获取任务状态失败");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">数据查看</h1>
          <p className="text-muted-foreground mt-1">
            通过 ID 直接查看考试数据、成绩单和答题卡
          </p>
        </div>

        <Button
          onClick={() => {
            setFetchDialog(true);
            setFetchError(null);
            setFetchSuccess(null);
            setFetchExamId("");
            setFetchSchoolId(""); // 清空学校ID
          }}
          disabled={!!fetchingTask}
        >
          <CloudDownload className="h-4 w-4 mr-2" />
          拉取考试数据
        </Button>
      </div>

      {/* 拉取任务状态 */}
      {fetchingTask && (
        <StatusAlert
          variant="info"
          message={`正在拉取考试数据... 任务状态: ${fetchingTask.status === "pending" ? "等待中" : "处理中"}`}
        />
      )}

      {/* 成功/错误消息 */}
      {fetchSuccess && <StatusAlert variant="success" message={fetchSuccess} />}

      {fetchError && <StatusAlert variant="error" message={fetchError} />}

      <Tabs defaultValue="exam-lookup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 lg:grid-cols-2 h-auto lg:h-9 p-1 gap-1 lg:gap-0">
          <TabsTrigger
            value="exam-lookup"
            className="flex items-center space-x-2 w-full"
          >
            <Search className="h-4 w-4" />
            <span>考试查询</span>
          </TabsTrigger>
          <TabsTrigger
            value="score-lookup"
            className="flex items-center space-x-2 w-full"
          >
            <Trophy className="h-4 w-4" />
            <span>成绩查询</span>
          </TabsTrigger>
        </TabsList>

        {/* 考试查询 */}
        <TabsContent value="exam-lookup">
          <ExamLookup />
        </TabsContent>

        {/* 成绩查询 */}
        <TabsContent value="score-lookup">
          <ScoreLookup />
        </TabsContent>
      </Tabs>

      {/* 拉取考试对话框 */}
      <ResponsiveDialog
        open={fetchDialog}
        onOpenChange={setFetchDialog}
        title="拉取考试数据"
        description="输入考试 ID 从源服务器拉取最新的考试数据"
        footer={(isDesktop) => (
          <>
            {isDesktop ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFetchDialog(false);
                    setForceRefresh(false);
                    setFetchSchoolId("");
                  }}
                  disabled={fetchLoading}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  form="fetch-exam-form"
                  disabled={fetchLoading || !fetchExamId.trim()}
                >
                  {fetchLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CloudDownload className="h-4 w-4 mr-2" />
                  )}
                  {fetchLoading ? "拉取中..." : "开始拉取"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="submit"
                  form="fetch-exam-form"
                  disabled={fetchLoading || !fetchExamId.trim()}
                >
                  {fetchLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CloudDownload className="h-4 w-4 mr-2" />
                  )}
                  {fetchLoading ? "拉取中..." : "开始拉取"}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">取消</Button>
                </DrawerClose>
              </>
            )}
          </>
        )}
      >
        <form
          id="fetch-exam-form"
          onSubmit={handleFetchExam}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label htmlFor="fetch-exam-id" className="text-sm font-medium">
              考试 ID
            </label>
            <Input
              id="fetch-exam-id"
              value={fetchExamId}
              onChange={(e) => setFetchExamId(e.target.value)}
              placeholder="请输入要拉取的考试 ID"
              required
            />
          </div>

          {/* 学校ID输入框 - 仅对有全局拉取数据权限的用户显示 */}
          {hasPermission(
            user,
            PermissionType.FETCH_DATA,
            PermissionLevel.GLOBAL,
          ) && (
            <div className="space-y-2">
              <label htmlFor="fetch-school-id" className="text-sm font-medium">
                学校 ID（可选）
              </label>
              <Input
                id="fetch-school-id"
                value={fetchSchoolId}
                onChange={(e) => setFetchSchoolId(e.target.value)}
                placeholder="输入学校 ID 以指定学校（留空则使用默认本校）"
              />
              <p className="text-xs text-muted-foreground">
                如果有全局拉取数据权限，可以指定学校 ID 来拉取特定学校的考试数据
              </p>
            </div>
          )}

          {/* 强制刷新复选框 - 仅对有重新拉取个人考试详情数据及以上权限的用户显示 */}
          {hasPermission(
            user,
            PermissionType.REFETCH_EXAM_DATA,
            PermissionLevel.SELF,
          ) && (
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
                强制重新拉取（重新从智学网获取数据）
              </label>
            </div>
          )}

          {fetchError && <StatusAlert variant="error" message={fetchError} />}
        </form>
      </ResponsiveDialog>
    </div>
  );
};

// 考试查询组件
const ExamLookup: React.FC = () => {
  const { user } = useAuth();
  const [examId, setExamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examDetail, setExamDetail] = useState<Exam | null>(null);
  const [generatingScoresheet, setGeneratingScoresheet] = useState(false);

  // 下载成绩单对话框状态
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadSchoolId, setDownloadSchoolId] = useState<string>("");
  const [downloadScope, setDownloadScope] = useState<"school" | "all">(
    "school",
  );
  const [downloadIsMultiSchool, setDownloadIsMultiSchool] = useState(false);

  // 检查考试是否已保存（至少有一个学校保存了数据）
  const isExamSaved = (examData: Exam | null): boolean => {
    if (!examData || !examData.schools || examData.schools.length === 0) {
      return false;
    }
    // 至少有一个学校已保存就算已保存
    return examData.schools.some((school) => school.is_saved);
  };

  const handleExamLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId.trim()) return;

    setLoading(true);
    setError(null);
    setExamDetail(null);

    try {
      const response = await examAPI.getExamInfo(examId.trim());
      if (response.data.success) {
        setExamDetail(response.data.exam);

        trackAnalyticsEvent("data_viewer_exam_info_success", {
          username: user?.username,
          exam_id: examId.trim(),
          exam_name: response.data.exam?.name || "unknown",
          is_saved: isExamSaved(response.data.exam),
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "获取考试信息失败";
      setError(errorMessage);

      trackAnalyticsEvent("data_viewer_exam_info_failed", {
        username: user?.username,
        exam_id: examId.trim(),
        error_message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadScoresheet = () => {
    if (!examDetail) return;

    // 初始化对话框状态，保存当前考试信息
    // 从 schools 数组中获取第一个学校作为默认值（如果有的话）
    const defaultSchoolId =
      examDetail.schools && examDetail.schools.length > 0
        ? examDetail.schools[0].school_id
        : "";

    setDownloadSchoolId(defaultSchoolId);
    setDownloadScope("school");
    setDownloadIsMultiSchool(examDetail.is_multi_school || false);
    setDownloadDialogOpen(true);
  };

  const confirmDownloadScoresheet = async () => {
    if (!examDetail) return;

    try {
      setGeneratingScoresheet(true);
      setDownloadDialogOpen(false);

      // 确定最终的 school_id 和 scope
      // 联考场景：使用用户选择的 school_id 和 scope
      // 单校场景：也需要传递 school_id（防止下载非本校考试时 400 错误）
      const finalSchoolId =
        downloadSchoolId ||
        (examDetail.schools && examDetail.schools.length > 0
          ? examDetail.schools[0].school_id
          : undefined);
      const finalScope = downloadIsMultiSchool ? downloadScope : undefined;

      const response = await examAPI.generateScoresheet(
        examDetail.id,
        finalScope,
        finalSchoolId,
      );

      // 创建下载链接
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${examDetail.name}_成绩单.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      trackAnalyticsEvent("data_viewer_scoresheet_success", {
        username: user?.username,
        exam_id: examDetail.id,
        exam_name: examDetail.name,
        scope: downloadScope,
        school_id: downloadSchoolId,
      });
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "生成成绩单失败";
      setError(errorMessage);

      trackAnalyticsEvent("data_viewer_scoresheet_failed", {
        username: user?.username,
        exam_id: examDetail.id,
        exam_name: examDetail.name,
        error_message: errorMessage,
      });
    } finally {
      setGeneratingScoresheet(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>考试查询</CardTitle>
        <CardDescription>输入考试 ID 查看考试详情和生成成绩单</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 搜索表单 */}
        <form onSubmit={handleExamLookup} className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="请输入考试 ID..."
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={loading || !examId.trim()}>
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {loading ? "查询中..." : "查询"}
          </Button>
        </form>

        {/* 错误信息 */}
        {error && <StatusAlert variant="error" message={error} />}

        {/* 考试详情 */}
        {examDetail && (
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{examDetail.name}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatTimestampToLocalDate(examDetail.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant={isExamSaved(examDetail) ? "default" : "secondary"}
                >
                  {isExamSaved(examDetail) ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {isExamSaved(examDetail) ? "已保存" : "未保存"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">
                    考试 ID
                  </label>
                  <p className="font-mono">
                    <CopyableText text={examDetail.id} />
                  </p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">
                    考试类型
                  </label>
                  <p>{examDetail.is_multi_school ? "联考" : "单校考试"}</p>
                </div>

                {/* 学校信息 */}
                <div className="col-span-2">
                  <label className="font-medium text-muted-foreground">
                    参与学校
                  </label>
                  {examDetail.schools && examDetail.schools.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {examDetail.schools.map((school) => (
                        <div
                          key={school.school_id}
                          className="flex items-center justify-between p-2 bg-background rounded border"
                        >
                          <div>
                            <p className="font-medium">
                              {school.school_name || "未知学校"}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              <CopyableText text={school.school_id} />
                            </p>
                          </div>
                          <Badge
                            variant={school.is_saved ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {school.is_saved ? "已保存" : "未保存"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">无学校信息</p>
                  )}
                </div>
              </div>

              {isExamSaved(examDetail) && (
                <div className="flex items-center space-x-2 pt-2">
                  <Button
                    onClick={handleDownloadScoresheet}
                    disabled={generatingScoresheet}
                    className="flex-1"
                  >
                    {generatingScoresheet ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {generatingScoresheet ? "生成中..." : "下载成绩单"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
                        {examDetail?.schools?.map((school) => (
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
      </CardContent>
    </Card>
  );
};

// 成绩查询组件
const ScoreLookup: React.FC = () => {
  const { user } = useAuth();
  const [examId, setExamId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [finalSchoolId, setFinalSchoolId] = useState<string | undefined>(
    undefined,
  );
  const [searchType, setSearchType] = useState<"id" | "name">("id");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoreData, setScoreData] = useState<{
    id: string;
    name: string;
    created_at?: number;
    student_id?: string;
    scores?: Score[];
    schools?: Array<{
      school_id: string;
      school_name?: string;
      is_saved: boolean;
    }>;
  } | null>(null);

  const handleScoreLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const searchValue =
      searchType === "id" ? studentId.trim() : studentName.trim();
    if (!examId.trim() || !searchValue) return;

    // 确定最终使用的 school_id：优先使用输入的，否则使用用户自己的
    const computedSchoolId =
      schoolId.trim() || user?.zhixue_info?.school_id || user?.manual_school_id;

    // 使用学生姓名查询时必须提供 school_id
    if (searchType === "name" && !computedSchoolId) {
      setError("使用学生姓名查询时必须指定学校 ID");
      return;
    }

    setLoading(true);
    setError(null);
    setScoreData(null);
    setFinalSchoolId(computedSchoolId);

    try {
      const response = await examAPI.getUserExamScore(
        examId.trim(),
        searchType === "id" ? studentId.trim() : undefined,
        searchType === "name" ? studentName.trim() : undefined,
        computedSchoolId,
      );
      if (response.data.success) {
        setScoreData(response.data);

        trackAnalyticsEvent("data_viewer_score_lookup_success", {
          username: user?.username,
          exam_id: examId.trim(),
          search_type: searchType,
          student_identifier:
            searchType === "id" ? studentId.trim() : studentName.trim(),
          school_id: computedSchoolId,
          has_scores: response.data.scores && response.data.scores.length > 0,
          subject_count: response.data.scores ? response.data.scores.length : 0,
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "获取成绩信息失败";
      setError(errorMessage);

      trackAnalyticsEvent("data_viewer_score_lookup_failed", {
        username: user?.username,
        exam_id: examId.trim(),
        search_type: searchType,
        student_identifier:
          searchType === "id" ? studentId.trim() : studentName.trim(),
        school_id: computedSchoolId,
        error_message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>成绩查询</CardTitle>
        <CardDescription>
          输入考试 ID 和学生 ID 或姓名查看详细成绩和答题卡
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 查询表单 */}
        <form onSubmit={handleScoreLookup} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="exam-id" className="text-sm font-medium">
                考试 ID
              </label>
              <Input
                id="exam-id"
                placeholder="请输入考试 ID"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="search-type" className="text-sm font-medium">
                学生查找方式
              </label>
              <Select
                value={searchType}
                onValueChange={(value: "id" | "name") => {
                  setSearchType(value);
                  setStudentId("");
                  setStudentName("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">使用学生 ID</SelectItem>
                  <SelectItem value="name">使用学生姓名</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="student-info" className="text-sm font-medium">
              {searchType === "id" ? "学生 ID" : "学生姓名"}
            </label>
            <Input
              id="student-info"
              placeholder={
                searchType === "id" ? "请输入学生 ID" : "请输入学生姓名"
              }
              value={searchType === "id" ? studentId : studentName}
              onChange={(e) => {
                if (searchType === "id") {
                  setStudentId(e.target.value);
                } else {
                  setStudentName(e.target.value);
                }
              }}
            />
          </div>

          {/* 学校 ID 输入框 - 对于有 GLOBAL 权限的用户或使用姓名查询时显示 */}
          {(hasPermission(
            user,
            PermissionType.VIEW_EXAM_DATA,
            PermissionLevel.GLOBAL,
          ) ||
            searchType === "name") && (
            <div className="space-y-2">
              <label htmlFor="school-id" className="text-sm font-medium">
                学校 ID{" "}
                {searchType === "name" &&
                  !user?.zhixue_info?.school_id &&
                  !user?.manual_school_id && (
                    <span className="text-destructive">*</span>
                  )}
              </label>
              <Input
                id="school-id"
                placeholder="请输入学校 ID（留空则使用默认学校）"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="font-mono"
              />
              {searchType === "name" && (
                <p className="text-xs text-muted-foreground">
                  使用学生姓名查询时必须指定学校 ID
                  {(user?.zhixue_info?.school_id || user?.manual_school_id) &&
                    "（留空则使用您的默认学校）"}
                </p>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={
              loading ||
              !examId.trim() ||
              (!studentId.trim() && !studentName.trim())
            }
            className="w-full"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trophy className="h-4 w-4 mr-2" />
            )}
            {loading ? "查询中..." : "查询成绩"}
          </Button>
        </form>

        {/* 错误信息 */}
        {error && <StatusAlert variant="error" message={error} />}

        {/* 成绩详情 */}
        {scoreData && (
          <div className="space-y-4">
            {/* 基本信息 */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{scoreData.name}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {scoreData.created_at && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatTimestampToLocalDate(scoreData.created_at)}
                      </span>
                    </div>
                  )}
                  {scoreData.student_id && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>学生 ID: {scoreData.student_id}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {(() => {
              // 分离总分和科目分数
              const allScores = scoreData.scores || [];
              const totalScores = allScores.filter(
                (score) =>
                  score.subject_name.includes("总") ||
                  score.subject_name.includes("合计"),
              );
              const subjectScores = allScores.filter(
                (score) =>
                  !score.subject_name.includes("总") &&
                  !score.subject_name.includes("合计"),
              );

              return (
                <>
                  {/* 总分信息 */}
                  {totalScores.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          总分信息
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-linear-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
                          {totalScores.map((totalScore) => {
                            // 检测是否缺失满分数据（后端返回 "-1"）
                            const isStandardScoreMissing =
                              totalScore.standard_score === "-1";

                            // 如果缺失，尝试通过各科满分累加计算
                            const calculatedStandardScore =
                              isStandardScoreMissing
                                ? subjectScores.reduce((acc, curr) => {
                                    // 仅计算有有效分数的科目
                                    if (
                                      !curr.score ||
                                      !/^[\d.]+$/.test(curr.score)
                                    ) {
                                      return acc;
                                    }
                                    const score = parseFloat(
                                      curr.standard_score,
                                    );
                                    return acc + (isNaN(score) ? 0 : score);
                                  }, 0)
                                : null;

                            const displayStandardScore = isStandardScoreMissing
                              ? calculatedStandardScore
                              : totalScore.standard_score;

                            return (
                              <React.Fragment key={totalScore.subject_id}>
                                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                  <div className="flex items-baseline space-x-2 justify-center sm:justify-start">
                                    <span className="text-2xl sm:text-3xl font-bold text-primary">
                                      {totalScore.score || "-"}
                                    </span>
                                    <span className="text-lg sm:text-xl text-muted-foreground">
                                      / {displayStandardScore || "-"}
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
                                {(isStandardScoreMissing ||
                                  totalScore.is_calculated) && (
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    {isStandardScoreMissing &&
                                    totalScore.is_calculated ? (
                                      <span>
                                        本次考试可能为新高考六选三等模式，智学网未提供满分和总分数据。当前满分和总分仅供参考。
                                      </span>
                                    ) : isStandardScoreMissing ? (
                                      <span>
                                        本次考试可能为新高考六选三等模式，智学网未提供满分数据。当前满分仅供参考。
                                      </span>
                                    ) : (
                                      <span>
                                        本次考试的总分由各科成绩累加计算得出，非智学网原始数据，仅供参考。
                                      </span>
                                    )}
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 成绩表格 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        科目成绩
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {subjectScores.length > 0 ? (
                        <>
                          {/* 桌面端表格视图 */}
                          <div className="hidden md:block">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>科目</TableHead>
                                  <TableHead>得分</TableHead>
                                  <TableHead>满分</TableHead>
                                  <TableHead>班级排名</TableHead>
                                  <TableHead>学校排名</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {subjectScores.map((score) => (
                                  <TableRow key={score.subject_id}>
                                    <TableCell className="font-medium">
                                      {score.subject_name}
                                    </TableCell>
                                    <TableCell>{score.score || "-"}</TableCell>
                                    <TableCell>
                                      {score.standard_score || "-"}
                                    </TableCell>
                                    <TableCell>
                                      {score.class_rank || "-"}
                                    </TableCell>
                                    <TableCell>
                                      {score.school_rank || "-"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>

                          {/* 移动端卡片视图 */}
                          <div className="md:hidden space-y-3">
                            {subjectScores.map((score) => (
                              <Card
                                key={score.subject_id}
                                className="bg-muted/20"
                              >
                                <CardContent className="p-4">
                                  <div className="font-medium text-lg mb-3">
                                    {score.subject_name}
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        得分:
                                      </span>
                                      <span className="font-medium">
                                        {score.score || "-"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        满分:
                                      </span>
                                      <span className="font-medium">
                                        {score.standard_score || "-"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        班级排名:
                                      </span>
                                      <span className="font-medium">
                                        {score.class_rank || "-"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        学校排名:
                                      </span>
                                      <span className="font-medium">
                                        {score.school_rank || "-"}
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>暂无成绩数据</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              );
            })()}

            {/* 答题卡查看组件 */}
            {scoreData.scores && scoreData.scores.length > 0 && (
              <AnswerSheetViewer
                examId={examId.trim()}
                scores={scoreData.scores}
                studentId={searchType === "id" ? studentId.trim() : undefined}
                studentName={
                  searchType === "name" ? studentName.trim() : undefined
                }
                schoolId={finalSchoolId}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default DataViewerPage;
