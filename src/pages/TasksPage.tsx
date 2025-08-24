import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { taskAPI } from '@/api/task';
import { formatUTCIsoToLocal, parseUTCIsoString } from '@/utils/dateUtils';
import type { BackgroundTask } from '@/types/api';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<BackgroundTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; taskUuid: string | null }>({
    open: false,
    taskUuid: null
  });

  const loadTasks = async (pageNum = 1, statusFilter = 'all') => {
    try {
      setLoading(true);
      setError(null);
      const params: { page: number; per_page: number; status?: string } = {
        page: pageNum,
        per_page: 10,
      };
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await taskAPI.getUserTasks(params);
      if (response.data.success) {
        setTasks(response.data.tasks);
        setTotalPages(response.data.pagination.pages);
        setTotalTasks(response.data.pagination.total);
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '获取任务列表失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTask = (taskUuid: string) => {
    setCancelDialog({ open: true, taskUuid });
  };

  const confirmCancelTask = async () => {
    if (!cancelDialog.taskUuid) return;
    
    try {
      setError(null);
      const response = await taskAPI.cancelTask(cancelDialog.taskUuid);
      if (response.data.success) {
        await loadTasks(page, statusFilter);
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '取消任务失败';
      setError(errorMessage);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
    loadTasks(1, value);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadTasks(newPage, statusFilter);
  };

  useEffect(() => {
    document.title = '任务列表 - ZhiXue Lite';
    return () => {
      document.title = 'ZhiXue Lite';
    };
  }, []);

  useEffect(() => {
    loadTasks(1, 'all');
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      case 'processing':
        return '处理中';
      case 'pending':
        return '等待中';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getTaskTypeText = (taskType: string) => {
    switch (taskType) {
      case 'fetch_exam_list':
        return '拉取考试列表';
      case 'fetch_exam_details':
        return '拉取考试详情';
      default:
        return taskType;
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    if (!startTime) return 'N/A';
    // 使用正确的UTC时区解析
    const start = parseUTCIsoString(startTime);
    const end = endTime ? parseUTCIsoString(endTime) : new Date();
    const duration = end.getTime() - start.getTime();
    const seconds = Math.floor(duration / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">任务列表</h1>
          <p className="text-muted-foreground mt-1">
            查看和管理您的后台任务状态
          </p>
        </div>
        <Button onClick={() => loadTasks(page, statusFilter)} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">状态筛选:</span>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">等待中</SelectItem>
                <SelectItem value="processing">处理中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              共 {totalTasks} 个任务
            </div>
          </div>
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

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无任务</h3>
            <p className="text-muted-foreground">
              您还没有任何后台任务
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      <span>{getTaskTypeText(task.task_type)}</span>
                    </CardTitle>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>ID: {task.id?.slice(0, 8) || 'N/A'}...</span>
                        {/* 只有实际执行的任务才显示执行时间 */}
                        {(['completed', 'processing'].includes(task.status)) && (
                          <span>执行时间: {formatDuration(task.started_at || task.created_at, task.completed_at)}</span>
                        )}
                        {task.progress > 0 && <span>进度: {task.progress} %</span>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span>创建: {formatUTCIsoToLocal(task.created_at)}</span>
                        {task.started_at && (
                          <span className="ml-4">开始: {formatUTCIsoToLocal(task.started_at)}</span>
                        )}
                        {task.completed_at && (
                          <span className="ml-4">完成: {formatUTCIsoToLocal(task.completed_at)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusVariant(task.status)}>
                      {getStatusText(task.status)}
                    </Badge>
                    {task.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelTask(task.id)}
                      >
                        取消
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {task.error_message && (
                <CardContent className="pt-0">
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800 break-words">
                      <strong>错误信息:</strong> {task.error_message}
                    </p>
                  </div>
                </CardContent>
              )}
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
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog({ open, taskUuid: null })}
        title="确认取消任务"
        description="确定要取消这个任务吗？取消后任务将停止执行。"
        confirmText="取消任务"
        cancelText="保留任务"
        variant="destructive"
        onConfirm={confirmCancelTask}
      />
    </div>
  );
};

export default TasksPage;