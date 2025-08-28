import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Trophy,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import AnswerSheetViewer from '@/components/AnswerSheetViewer';
import { useAuth } from '@/contexts/AuthContext';
import { examAPI } from '@/api/exam';
import { taskAPI } from '@/api/task';
import { formatTimestampToLocalDate } from '@/utils/dateUtils';
import type { BackgroundTask, ExamDetail } from '@/types/api';

const ExamDetailPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { user } = useAuth();
  const [examDetail, setExamDetail] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchingTask, setFetchingTask] = useState<BackgroundTask | null>(null);
  const [downloadingScoresheet, setDownloadingScoresheet] = useState(false);
  const [fetchConfirmOpen, setFetchConfirmOpen] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);

  const loadExamDetail = async () => {
    if (!examId) return;

    try {
      setLoading(true);
      setError(null);

      // 直接获取考试详情和用户分数
      const response = await examAPI.getUserExamScore(examId);
      if (response.data.success) {
        // 分离总分和科目分数
        const allScores = response.data.scores || [];
        const totalScores = allScores.filter(score =>
          score.subject_name.includes('总') || score.subject_name.includes('合计')
        );
        const subjectScores = allScores.filter(score =>
          !score.subject_name.includes('总') && !score.subject_name.includes('合计')
        );

        setExamDetail({
          id: response.data.id,
          name: response.data.name,
          school_id: response.data.school_id,
          is_saved: response.data.is_saved,
          created_at: response.data.created_at,
          scores: subjectScores,
          totalScores: totalScores
        });
      } else {
        setError(response.data.message || '获取考试详情失败');
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '获取考试详情失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchDetails = () => {
    setFetchConfirmOpen(true);
  };

  const confirmFetchDetails = async () => {
    if (!examId) return;

    try {
      setError(null);
      const response = await examAPI.fetchExamDetails(examId, forceRefresh);
      if (response.data.success) {
        const taskId = response.data.task_id;
        pollTaskStatus(taskId);
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '拉取考试详情失败';
      setError(errorMessage);
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    try {
      const response = await taskAPI.getTaskStatus(taskId);
      if (response.data.success) {
        const task = response.data.task;
        setFetchingTask(task);

        if (task.status === 'completed') {
          setFetchingTask(null);
          await loadExamDetail();
        } else if (task.status === 'failed') {
          setFetchingTask(null);
          setError(task.error_message || '任务执行失败');
        } else if (['pending', 'processing'].includes(task.status)) {
          setTimeout(() => pollTaskStatus(taskId), 2000);
        }
      }
    } catch {
      setFetchingTask(null);
      setError('获取任务状态失败');
    }
  };

  const handleDownloadScoresheet = async () => {
    if (!examId) return;

    try {
      setDownloadingScoresheet(true);
      const response = await examAPI.generateScoresheet(examId);

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${examDetail?.name}_成绩单.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '下载成绩单失败';
      setError(errorMessage);
    } finally {
      setDownloadingScoresheet(false);
    }
  };

  useEffect(() => {
    loadExamDetail();
  }, [examId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 设置页面标题
  useEffect(() => {
    if (examDetail?.name) {
      document.title = `${examDetail.name} - 考试详情 - ZhiXue Lite`;
    }
    return () => {
      document.title = 'ZhiXue Lite';
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

        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center space-x-3 pt-6">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">错误</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
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
            <h1 className="text-2xl sm:text-3xl font-bold break-words">{examDetail.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              考试详情和成绩信息
            </p>
          </div>
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
          {/* 管理员下载成绩单按钮 */}
          {user?.role === 'admin' && examDetail.is_saved && (
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
              <span className="hidden sm:inline">{downloadingScoresheet ? '下载中...' : '下载成绩单'}</span>
              <span className="sm:hidden">{downloadingScoresheet ? '下载中' : '成绩单'}</span>
            </Button>
          )}

          {/* 拉取详情按钮 */}
          {user?.zhixue_username && (
            <Button
              onClick={handleFetchDetails}
              disabled={!!fetchingTask}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${fetchingTask ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{fetchingTask ? '加载中...' : '加载最新详情'}</span>
              <span className="sm:hidden">{fetchingTask ? '加载中' : '最新详情'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Task Status */}
      {fetchingTask && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center space-x-3 pt-6">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">正在获取考试详情...</p>
              <p className="text-sm text-blue-700">
                任务状态: {fetchingTask.status === 'pending' ? '等待中' : '处理中'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center space-x-3 pt-6">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">错误</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

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
              <label className="text-sm font-medium text-muted-foreground">考试 ID</label>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm break-all">{examDetail.id}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">考试时间</label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm sm:text-base">{formatTimestampToLocalDate(examDetail.created_at)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">数据状态</label>
              <div className="flex items-center space-x-2">
                <Badge variant={examDetail.is_saved ? 'default' : 'secondary'}>
                  {examDetail.is_saved ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  {examDetail.is_saved ? '已保存' : '未保存'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">科目数量</label>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{examDetail.scores.length} 科</span>
              </div>
            </div>

            {/* 总分信息 */}
            {examDetail.totalScores && examDetail.totalScores.length > 0 && (
              <div className="col-span-full space-y-3">
                <label className="text-sm font-medium text-muted-foreground">总分</label>
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
                  {examDetail.totalScores.map((totalScore) => (
                    <div key={totalScore.subject_id} className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div className="flex items-baseline space-x-2 justify-center sm:justify-start">
                        <span className="text-2xl sm:text-3xl font-bold text-primary">{totalScore.score || '-'}</span>
                        <span className="text-lg sm:text-xl text-muted-foreground">/ {totalScore.standard_score || '-'}</span>
                      </div>
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
                        {totalScore.class_rank && (
                          <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg text-center">
                            <span className="text-sm font-medium text-blue-700">班级第 {totalScore.class_rank} 名</span>
                          </div>
                        )}
                        {totalScore.school_rank && (
                          <div className="bg-green-50 border border-green-200 px-3 py-2 rounded-lg text-center">
                            <span className="text-sm font-medium text-green-700">学校第 {totalScore.school_rank} 名</span>
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
      {examDetail.is_saved && examDetail.scores.length > 0 && (
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
                        <label className="text-sm font-medium text-muted-foreground">科目</label>
                        <p className="font-medium">{score.subject_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">得分</label>
                        <p className="font-medium text-lg">{score.score || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">满分</label>
                        <p className="font-medium">{score.standard_score || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">班级排名</label>
                        <p className="font-medium">{score.class_rank || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">学校排名</label>
                        <p className="font-medium">{score.school_rank || '-'}</p>
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
                      <h3 className="font-bold text-lg text-primary mb-1">{score.subject_name}</h3>
                      <div className="flex items-baseline justify-center space-x-1">
                        <span className="text-2xl font-bold">{score.score || '-'}</span>
                        <span className="text-lg text-muted-foreground">/ {score.standard_score || '-'}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-background rounded-lg p-3 text-center">
                        <div className="text-muted-foreground mb-1">班级排名</div>
                        <div className="font-medium text-blue-600">{score.class_rank ? `第 ${score.class_rank} 名` : '-'}</div>
                      </div>
                      <div className="bg-background rounded-lg p-3 text-center">
                        <div className="text-muted-foreground mb-1">学校排名</div>
                        <div className="font-medium text-green-600">{score.school_rank ? `第 ${score.school_rank} 名` : '-'}</div>
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
      {examDetail.is_saved && examDetail.scores.length > 0 && (
        <AnswerSheetViewer examId={examDetail.id} scores={examDetail.scores} />
      )}

      {/* Empty State for Unsaved Exam */}
      {!examDetail.is_saved && (
        <Card>
          <CardContent className="text-center py-8 sm:py-12">
            <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">考试详情未保存</h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base max-w-md mx-auto">
              此考试的详细信息尚未保存到服务器，请点击"加载最新详情"获取成绩信息
            </p>
            {user?.zhixue_username && (
              <Button onClick={handleFetchDetails} disabled={!!fetchingTask} className="w-full sm:w-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                加载最新详情
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={fetchConfirmOpen}
        onOpenChange={(open) => {
          setFetchConfirmOpen(open);
          if (!open) {
            setForceRefresh(false); // 关闭对话框时重置状态
          }
        }}
        title="确认获取考试详情"
        description={
          <div className="space-y-3">
            <p>获取考试详情可能需要一些时间，确定要继续吗？</p>
            {user?.role === 'admin' && examDetail?.is_saved && (
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
    </div>
  );
};

export default ExamDetailPage;