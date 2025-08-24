import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  Download,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { examAPI } from '@/api/exam';
import { taskAPI } from '@/api/task';
import { formatTimestampToLocalDate } from '@/utils/dateUtils';
import type { Exam, BackgroundTask } from '@/types/api';

const ExamsPage: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchingTask, setFetchingTask] = useState<BackgroundTask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchConfirmOpen, setFetchConfirmOpen] = useState(false);

  const loadExams = async (pageNum = 1, query = '') => {
    try {
      setLoading(true);
      setError(null); // 清除之前的错误信息
      const response = await examAPI.getExamList({
        page: pageNum,
        per_page: 10,
        query: query || undefined,
      });

      if (response.data.success) {
        setExams(response.data.exams);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '获取考试列表失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchExams = () => {
    setFetchConfirmOpen(true);
  };

  const confirmFetchExams = async () => {
    try {
      setError(null);
      const response = await examAPI.fetchExamList();
      if (response.data.success) {
        const taskId = response.data.task_id;
        pollTaskStatus(taskId);
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '拉取考试失败';
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
          loadExams(page, searchQuery);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // 清除之前的错误信息
    setPage(1);
    loadExams(1, searchQuery);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadExams(newPage, searchQuery);
  };

  useEffect(() => {
    document.title = '考试列表 - ZhiXue Lite';
    return () => {
      document.title = 'ZhiXue Lite';
    };
  }, []);

  useEffect(() => {
    loadExams();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">考试列表</h1>
          <p className="text-muted-foreground mt-1">
            仅显示已缓存的数据，如需更新请点击按钮刷新
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {user?.zhixue_username && (
            <Button
              onClick={handleFetchExams}
              disabled={!!fetchingTask}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${fetchingTask ? 'animate-spin' : ''}`} />
              {fetchingTask ? '获取中...' : '从智学网重新获取'}
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
              <p className="font-medium text-blue-900">正在获取考试数据...</p>
              <p className="text-sm text-blue-700">
                任务状态: {fetchingTask.status === 'pending' ? '等待中' : '处理中'}。此页面现在可以被安全关闭。
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索考试名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">搜索</Button>
          </form>
        </CardContent>
      </Card>

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
              {searchQuery ? '没有找到匹配的考试' : '您还没有任何考试数据'}
            </p>
            {!searchQuery && (
              user?.zhixue_username ? (
                <Button onClick={handleFetchExams} disabled={!!fetchingTask}>
                  <Download className="h-4 w-4 mr-2" />
                  从智学网获取
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                    <div className="flex items-center justify-center space-x-2 text-amber-800">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">需要先绑定智学网账号</span>
                    </div>
                    <p className="text-sm text-amber-700 mt-2 text-center">
                      请先到个人中心绑定智学网账号，然后才能获取考试数据
                    </p>
                  </div>
                  <Link to="/profile">
                    <Button variant="outline" className="w-full">
                      <Link2 className="h-4 w-4 mr-2" />
                      前往绑定账号
                    </Button>
                  </Link>
                </div>
              )
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      <Link
                        to={`/exams/${exam.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {exam.name}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatTimestampToLocalDate(exam.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={exam.is_saved ? 'default' : 'secondary'}>
                      {exam.is_saved ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {exam.is_saved ? '已保存' : '未保存'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    点击查看详细成绩信息
                  </p>

                  <Link to={`/exams/${exam.id}`}>
                    <Button variant="outline" size="sm">
                      查看详情
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            上一页
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            下一页
          </Button>
        </div>
      )}

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
    </div>
  );
};

export default ExamsPage;