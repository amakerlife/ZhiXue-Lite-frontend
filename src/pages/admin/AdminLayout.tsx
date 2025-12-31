import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { RefreshCw, HardDriveIcon } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusAlert } from "@/components/StatusAlert";
import { useAuth } from "@/contexts/AuthContext";
import { adminAPI } from "@/api/admin";
import { canManageSystem } from "@/utils/permissions";

const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  // 清除缓存状态
  const [clearingCache, setClearingCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [clearCacheConfirmOpen, setClearCacheConfirmOpen] = useState(false);

  // 清除缓存函数
  const confirmClearCache = async () => {
    setClearingCache(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await adminAPI.clearCache();
      if (response.data.success) {
        setSuccess("缓存已成功清除");
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "清除缓存失败";
      setError(errorMessage);
    } finally {
      setClearingCache(false);
    }
  };

  // 如果不是管理员，显示权限不足
  if (!canManageSystem(user)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">权限不足</CardTitle>
            <CardDescription>您需要管理员权限才能访问此页面</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">管理面板</h1>
          <p className="text-muted-foreground mt-1">系统管理和数据维护</p>
        </div>
        <Button
          onClick={() => setClearCacheConfirmOpen(true)}
          disabled={clearingCache}
          variant="outline"
          className="flex items-center space-x-2"
        >
          {clearingCache ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <HardDriveIcon className="h-4 w-4" />
          )}
          <span>{clearingCache ? "清除中..." : "清除缓存"}</span>
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <StatusAlert variant="success" message={success} className="text-sm" />
      )}
      {error && (
        <StatusAlert variant="error" message={error} className="text-sm" />
      )}

      {/* 子页面渲染 */}
      <Outlet />

      {/* 清除缓存确认对话框 */}
      <ConfirmDialog
        open={clearCacheConfirmOpen}
        onOpenChange={setClearCacheConfirmOpen}
        title="确认清除缓存"
        description="清除缓存可能会导致系统响应变慢，因为需要重新从数据库或外部服务获取数据。确定要继续吗？"
        confirmText="清除"
        cancelText="取消"
        variant="destructive"
        onConfirm={confirmClearCache}
      />
    </div>
  );
};

export default AdminLayout;
