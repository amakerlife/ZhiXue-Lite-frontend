import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
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
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AnswerSheetViewer from '@/components/AnswerSheetViewer';
import { useAuth } from '@/contexts/AuthContext';
import { examAPI } from '@/api/exam';
import { taskAPI } from '@/api/task';
import { formatTimestampToLocalDate } from '@/utils/dateUtils';
import { canViewAllData } from '@/utils/permissions';
import type { ExamDetail, BackgroundTask } from '@/types/api';

const DataViewerPage: React.FC = () => {
  const { user } = useAuth();

  // 拉取考试功能状态
  const [fetchDialog, setFetchDialog] = useState(false);
  const [fetchExamId, setFetchExamId] = useState('');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchSuccess, setFetchSuccess] = useState<string | null>(null);
  const [fetchingTask, setFetchingTask] = useState<BackgroundTask | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);

  useEffect(() => {
    document.title = '数据查看 - ZhiXue Lite';
    return () => {
      document.title = 'ZhiXue Lite';
    };
  }, []);

  // 权限检查
  if (!canViewAllData(user)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">权限不足</CardTitle>
            <CardDescription>
              您需要数据查看权限才能访问此页面
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

    try {
      const response = await examAPI.fetchExamDetails(fetchExamId.trim(), forceRefresh);
      if (response.data.success) {
        const taskId = response.data.task_id;
        setFetchDialog(false);
        setFetchExamId('');
        setForceRefresh(false);
        setFetchSuccess(`考试 ${fetchExamId.trim()} 拉取任务已创建`);
        pollTaskStatus(taskId);
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '拉取考试失败';
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

        if (task.status === 'completed') {
          setFetchingTask(null);
          setFetchSuccess('考试数据拉取完成！');
        } else if (task.status === 'failed') {
          setFetchingTask(null);
          setFetchError(task.error_message || '考试数据拉取失败');
        } else if (['pending', 'processing'].includes(task.status)) {
          setTimeout(() => pollTaskStatus(taskId), 2000);
        }
      }
    } catch {
      setFetchingTask(null);
      setFetchError('获取任务状态失败');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">数据查看</h1>
          <p className="text-muted-foreground mt-1">
            通过ID直接查看考试数据、成绩单和答题卡
          </p>
        </div>

        <Button
          onClick={() => {
            setFetchDialog(true);
            setFetchError(null);
            setFetchSuccess(null);
            setFetchExamId('');
          }}
          disabled={!!fetchingTask}
        >
          <CloudDownload className="h-4 w-4 mr-2" />
          拉取考试数据
        </Button>
      </div>

      {/* 拉取任务状态 */}
      {fetchingTask && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center space-x-3 pt-6">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">正在拉取考试数据...</p>
              <p className="text-sm text-blue-700">
                任务状态: {fetchingTask.status === 'pending' ? '等待中' : '处理中'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 成功/错误消息 */}
      {fetchSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center space-x-3 pt-6">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-green-800">{fetchSuccess}</p>
          </CardContent>
        </Card>
      )}

      {fetchError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center space-x-3 pt-6">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{fetchError}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="exam-lookup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exam-lookup" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>考试查询</span>
          </TabsTrigger>
          <TabsTrigger value="score-lookup" className="flex items-center space-x-2">
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
      <Dialog open={fetchDialog} onOpenChange={setFetchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拉取考试数据</DialogTitle>
            <DialogDescription>
              输入考试ID从源服务器拉取最新的考试数据
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFetchExam} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fetch-exam-id" className="text-sm font-medium">
                考试ID
              </label>
              <Input
                id="fetch-exam-id"
                value={fetchExamId}
                onChange={(e) => setFetchExamId(e.target.value)}
                placeholder="请输入要拉取的考试ID"
                required
              />
            </div>

            {/* 强制刷新复选框 */}
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

            {fetchError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-800 text-sm">{fetchError}</p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Button type="submit" disabled={fetchLoading || !fetchExamId.trim()}>
                {fetchLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CloudDownload className="h-4 w-4 mr-2" />
                )}
                {fetchLoading ? '拉取中...' : '开始拉取'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFetchDialog(false);
                  setForceRefresh(false);
                }}
                disabled={fetchLoading}
              >
                取消
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// 考试查询组件
const ExamLookup: React.FC = () => {
  const [examId, setExamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examDetail, setExamDetail] = useState<any | null>(null);
  const [generatingScoresheet, setGeneratingScoresheet] = useState(false);

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
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '获取考试信息失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateScoresheet = async () => {
    if (!examDetail) return;

    setGeneratingScoresheet(true);
    setError(null);

    try {
      const response = await examAPI.generateScoresheet(examDetail.id);

      // 创建下载链接
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${examDetail.name}_成绩单.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '生成成绩单失败';
      setError(errorMessage);
    } finally {
      setGeneratingScoresheet(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>考试查询</CardTitle>
        <CardDescription>
          输入考试ID查看考试详情和生成成绩单
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 搜索表单 */}
        <form onSubmit={handleExamLookup} className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="请输入考试ID..."
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
            {loading ? '查询中...' : '查询'}
          </Button>
        </form>

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

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
                      <span>{formatTimestampToLocalDate(examDetail.created_at)}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={examDetail.is_saved ? 'default' : 'secondary'}>
                  {examDetail.is_saved ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {examDetail.is_saved ? '已保存' : '未保存'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">考试ID</label>
                  <p className="font-mono">{examDetail.id}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">学校ID</label>
                  <p className="font-mono">{examDetail.school_id || '未知'}</p>
                </div>
                <div className="col-span-2">
                  <label className="font-medium text-muted-foreground">学校名称</label>
                  <p>{examDetail.school_name || '未知'}</p>
                </div>
              </div>

              {examDetail.is_saved && (
                <div className="flex items-center space-x-2 pt-2">
                  <Button
                    onClick={generateScoresheet}
                    disabled={generatingScoresheet}
                    className="flex-1"
                  >
                    {generatingScoresheet ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {generatingScoresheet ? '生成中...' : '下载成绩单'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

// 成绩查询组件
const ScoreLookup: React.FC = () => {
  const [examId, setExamId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoreData, setScoreData] = useState<any | null>(null);
  const [answerSheetDialog, setAnswerSheetDialog] = useState<{
    open: boolean;
    examId: string;
    subjectId: string;
    studentId: string;
    subjectName: string;
  }>({
    open: false,
    examId: '',
    subjectId: '',
    studentId: '',
    subjectName: '',
  });
  const [answerSheetLoading, setAnswerSheetLoading] = useState(false);
  const [answerSheetError, setAnswerSheetError] = useState<string | null>(null);
  const [answerSheetUrl, setAnswerSheetUrl] = useState<string | null>(null);

  // 清理图片URL以防内存泄漏
  useEffect(() => {
    return () => {
      if (answerSheetUrl) {
        window.URL.revokeObjectURL(answerSheetUrl);
      }
    };
  }, [answerSheetUrl]);

  const handleScoreLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId.trim() || !studentId.trim()) return;

    setLoading(true);
    setError(null);
    setScoreData(null);

    try {
      const response = await examAPI.getUserExamScore(examId.trim(), studentId.trim());
      if (response.data.success) {
        setScoreData(response.data);
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '获取成绩信息失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openAnswerSheetDialog = async (subjectId: string, subjectName: string) => {
    setAnswerSheetDialog({
      open: true,
      examId: examId.trim(),
      subjectId,
      studentId: studentId.trim(),
      subjectName,
    });

    setAnswerSheetLoading(true);
    setAnswerSheetError(null);
    setAnswerSheetUrl(null);

    try {
      const response = await examAPI.generateAnswersheet(examId.trim(), subjectId, studentId.trim());

      // 创建图片URL
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setAnswerSheetUrl(url);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '获取答题卡失败';
      setAnswerSheetError(errorMessage);
    } finally {
      setAnswerSheetLoading(false);
    }
  };

  const closeAnswerSheetDialog = () => {
    setAnswerSheetDialog({
      open: false,
      examId: '',
      subjectId: '',
      studentId: '',
      subjectName: '',
    });

    // 清理图片URL以防内存泄漏
    if (answerSheetUrl) {
      window.URL.revokeObjectURL(answerSheetUrl);
      setAnswerSheetUrl(null);
    }

    setAnswerSheetError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>成绩查询</CardTitle>
        <CardDescription>
          输入考试ID和学生ID查看详细成绩和答题卡
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 查询表单 */}
        <form onSubmit={handleScoreLookup} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="exam-id" className="text-sm font-medium">
                考试ID
              </label>
              <Input
                id="exam-id"
                placeholder="请输入考试ID"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="student-id" className="text-sm font-medium">
                学生ID
              </label>
              <Input
                id="student-id"
                placeholder="请输入学生ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !examId.trim() || !studentId.trim()}
            className="w-full"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trophy className="h-4 w-4 mr-2" />
            )}
            {loading ? '查询中...' : '查询成绩'}
          </Button>
        </form>

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* 成绩详情 */}
        {scoreData && (
          <div className="space-y-4">
            {/* 基本信息 */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{scoreData.name}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatTimestampToLocalDate(scoreData.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>学生ID: {scoreData.student_id}</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* 成绩表格 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  科目成绩
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scoreData.scores && scoreData.scores.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>科目</TableHead>
                        <TableHead>得分</TableHead>
                        <TableHead>满分</TableHead>
                        <TableHead>班级排名</TableHead>
                        <TableHead>学校排名</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scoreData.scores.map((score: any) => (
                        <TableRow key={score.subject_id}>
                          <TableCell className="font-medium">{score.subject_name}</TableCell>
                          <TableCell>{score.score || '-'}</TableCell>
                          <TableCell>{score.standard_score || '-'}</TableCell>
                          <TableCell>{score.class_rank || '-'}</TableCell>
                          <TableCell>{score.school_rank || '-'}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAnswerSheetDialog(score.subject_id, score.subject_name)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              答题卡
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>暂无成绩数据</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>

      {/* 答题卡查看对话框 */}
      <Dialog open={answerSheetDialog.open} onOpenChange={closeAnswerSheetDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>答题卡查看</DialogTitle>
            <DialogDescription>
              {answerSheetDialog.subjectName} - 考试ID: {answerSheetDialog.examId} | 学生ID: {answerSheetDialog.studentId}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {answerSheetLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">正在加载答题卡...</p>
                </div>
              </div>
            ) : answerSheetError ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                  <p className="text-red-600">{answerSheetError}</p>
                </div>
              </div>
            ) : answerSheetUrl ? (
              <div className="flex justify-center">
                <img
                  src={answerSheetUrl}
                  alt={`${answerSheetDialog.subjectName}答题卡`}
                  className="max-w-full h-auto border rounded-lg shadow-lg"
                  onLoad={() => {
                    // 图片加载完成后可以添加其他处理逻辑
                  }}
                  onError={() => {
                    setAnswerSheetError('答题卡图片加载失败');
                  }}
                />
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DataViewerPage;