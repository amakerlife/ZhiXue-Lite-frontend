import React, { useState, useEffect, useRef } from "react";
import {
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ListTodo,
  Eye,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/Pagination";
import { adminAPI, type AdminTask } from "@/api/admin";
import { StatusAlert } from "@/components/StatusAlert";
import { CopyableText } from "@/components/CopyableText";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { formatUTCIsoToLocal } from "@/utils/dateUtils";

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lastRequestIdRef = useRef(0);
  const [error, setError] = useState<string | null>(null);

  // 展开详情状态
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // 参数/结果查看对话框
  const [paramDialog, setParamDialog] = useState<{
    open: boolean;
    task: AdminTask | null;
  }>({ open: false, task: null });
  const [resultDialog, setResultDialog] = useState<{
    open: boolean;
    task: AdminTask | null;
  }>({ open: false, task: null });

  const loadTasks = async (pageNum = page, status = statusFilter) => {
    const currentRequestId = ++lastRequestIdRef.current;
    try {
      setLoading(true);
      setError(null);

      const params: { page: number; per_page: number; status?: string } = {
        page: pageNum,
        per_page: 10,
      };

      if (status && status !== "all") {
        params.status = status;
      }

      const response = await adminAPI.listTasks(params);

      if (currentRequestId !== lastRequestIdRef.current) return;

      if (response.data.success) {
        setTasks(response.data.tasks);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err: unknown) {
      if (currentRequestId !== lastRequestIdRef.current) return;
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "加载任务列表失败";
      setError(errorMessage);
    } finally {
      if (currentRequestId === lastRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
    loadTasks(1, value);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadTasks(newPage, statusFilter);
  };

  const toggleTaskDetails = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "processing":
        return "secondary";
      case "failed":
        return "destructive";
      case "cancelled":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "等待中",
      processing: "处理中",
      completed: "已完成",
      failed: "失败",
      cancelling: "取消中",
      cancelled: "已取消",
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    loadTasks(1, "all");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 展开详情内容（桌面端和移动端共用）
  const renderTaskDetails = (task: AdminTask) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            用户 ID
          </span>
          <p className="text-sm">{task.user_id}</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            进度
          </span>
          <p className="text-sm">
            {task.progress}%
            {task.progress_message && (
              <span className="text-muted-foreground ml-2">
                ({task.progress_message})
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            对用户隐藏
          </span>
          <p className="text-sm">{task.is_hide ? "是" : "否"}</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            创建时间
          </span>
          <p className="text-sm">{formatUTCIsoToLocal(task.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            开始时间
          </span>
          <p className="text-sm">
            {task.started_at ? formatUTCIsoToLocal(task.started_at) : "-"}
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            完成时间
          </span>
          <p className="text-sm">
            {task.completed_at ? formatUTCIsoToLocal(task.completed_at) : "-"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {task.timeout != null && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              超时时间
            </span>
            <p className="text-sm">{task.timeout} 秒</p>
          </div>
        )}
      </div>

      {task.error_message && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-destructive">错误信息</span>
          <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {task.error_message}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        {task.parameters && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setParamDialog({ open: true, task })}
          >
            <Eye className="h-3 w-3 mr-1" />
            查看参数
          </Button>
        )}
        {task.result && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResultDialog({ open: true, task })}
          >
            <Eye className="h-3 w-3 mr-1" />
            查看结果
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>任务管理</CardTitle>
            <CardDescription>管理系统中的后台任务</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => loadTasks(page, statusFilter)}
            title="刷新"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <div className="w-[200px]">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="筛选状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="pending">等待中</SelectItem>
                <SelectItem value="processing">处理中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <StatusAlert
            variant="error"
            message={error}
            className="mb-4 text-sm"
          />
        )}

        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无任务数据</p>
            <p className="text-sm mt-2">系统中还没有任何后台任务</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 桌面端表格视图 */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[300px]">UUID</TableHead>
                    <TableHead>任务类型</TableHead>
                    <TableHead>用户</TableHead>
                    <TableHead className="min-w-[75px]">状态</TableHead>
                    <TableHead className="w-[170px]">创建时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <React.Fragment key={task.id}>
                      <TableRow
                        className={
                          expandedTasks.has(task.id)
                            ? "border-b-0 bg-muted/50"
                            : ""
                        }
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleTaskDetails(task.id)}
                          >
                            {expandedTasks.has(task.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          <CopyableText text={task.id} />
                        </TableCell>
                        <TableCell>{task.task_type}</TableCell>
                        <TableCell>{task.user_name}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(task.status)}>
                            {getStatusLabel(task.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatUTCIsoToLocal(task.created_at)}
                        </TableCell>
                      </TableRow>
                      {expandedTasks.has(task.id) && (
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableCell colSpan={6} className="p-4 pt-0">
                            {renderTaskDetails(task)}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 移动端卡片视图 */}
            <div className="md:hidden space-y-4">
              {tasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {task.task_type}
                          <Badge
                            variant={getStatusBadgeVariant(task.status)}
                            className="text-xs"
                          >
                            {getStatusLabel(task.status)}
                          </Badge>
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {task.user_name} •{" "}
                          {formatUTCIsoToLocal(task.created_at)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleTaskDetails(task.id)}
                      >
                        {expandedTasks.has(task.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="grid grid-cols-[70px_1fr] gap-2">
                      <span className="text-muted-foreground">UUID:</span>
                      <span className="font-mono break-all">
                        <CopyableText text={task.id} />
                      </span>
                    </div>
                    <div className="grid grid-cols-[70px_1fr] gap-2">
                      <span className="text-muted-foreground">进度:</span>
                      <span>
                        {task.progress}%
                        {task.progress_message && (
                          <span className="text-muted-foreground ml-1">
                            ({task.progress_message})
                          </span>
                        )}
                      </span>
                    </div>
                    {task.error_message && (
                      <div className="text-destructive bg-destructive/10 p-2 rounded text-sm">
                        {task.error_message}
                      </div>
                    )}
                    {expandedTasks.has(task.id) && (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="grid grid-cols-[70px_1fr] gap-2">
                          <span className="text-muted-foreground">
                            用户 ID:
                          </span>
                          <span>{task.user_id}</span>
                        </div>
                        <div className="grid grid-cols-[70px_1fr] gap-2">
                          <span className="text-muted-foreground">开始:</span>
                          <span>
                            {task.started_at
                              ? formatUTCIsoToLocal(task.started_at)
                              : "-"}
                          </span>
                        </div>
                        <div className="grid grid-cols-[70px_1fr] gap-2">
                          <span className="text-muted-foreground">完成:</span>
                          <span>
                            {task.completed_at
                              ? formatUTCIsoToLocal(task.completed_at)
                              : "-"}
                          </span>
                        </div>
                        {task.timeout != null && (
                          <div className="grid grid-cols-[70px_1fr] gap-2">
                            <span className="text-muted-foreground">超时:</span>
                            <span>{task.timeout} 秒</span>
                          </div>
                        )}
                        <div className="grid grid-cols-[70px_1fr] gap-2">
                          <span className="text-muted-foreground">隐藏:</span>
                          <span>{task.is_hide ? "是" : "否"}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          {task.parameters && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setParamDialog({ open: true, task })
                              }
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              查看参数
                            </Button>
                          )}
                          {task.result && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setResultDialog({ open: true, task })
                              }
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              查看结果
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 分页 */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showPageNumbers={false}
            />
          </div>
        )}
      </CardContent>

      {/* 参数查看对话框 */}
      <ResponsiveDialog
        open={paramDialog.open}
        onOpenChange={(open) => setParamDialog((prev) => ({ ...prev, open }))}
        title="任务参数"
        description={`任务类型: ${paramDialog.task?.task_type}`}
        showDefaultFooter={true}
      >
        <pre className="text-sm bg-muted p-4 rounded-md overflow-auto max-h-[50vh] whitespace-pre-wrap break-all">
          {paramDialog.task?.parameters &&
            (() => {
              try {
                return JSON.stringify(
                  JSON.parse(paramDialog.task.parameters),
                  null,
                  2,
                );
              } catch {
                return paramDialog.task.parameters;
              }
            })()}
        </pre>
      </ResponsiveDialog>

      {/* 结果查看对话框 */}
      <ResponsiveDialog
        open={resultDialog.open}
        onOpenChange={(open) => setResultDialog((prev) => ({ ...prev, open }))}
        title="任务结果"
        description={`任务类型: ${resultDialog.task?.task_type}`}
        showDefaultFooter={true}
      >
        <pre className="text-sm bg-muted p-4 rounded-md overflow-auto max-h-[50vh] whitespace-pre-wrap break-all">
          {resultDialog.task?.result &&
            (() => {
              try {
                return JSON.stringify(
                  JSON.parse(resultDialog.task.result),
                  null,
                  2,
                );
              } catch {
                return resultDialog.task.result;
              }
            })()}
        </pre>
      </ResponsiveDialog>
    </Card>
  );
};

export default TaskManagement;
