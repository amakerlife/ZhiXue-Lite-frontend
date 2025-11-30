import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  School,
  GraduationCap,
  UserCheck,
  FileText,
  Search,
  RefreshCw,
  Edit,
  Save,
  X,
  Eye,
  Unlink,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Trash,
  HardDriveIcon,
  Lock,
  EllipsisVertical,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { DrawerClose } from "@/components/ui/drawer";
import { Pagination } from "@/components/Pagination";
import { useAuth } from "@/contexts/AuthContext";
import { adminAPI } from "@/api/admin";
import { examAPI } from "@/api/exam";
import {
  formatUTCIsoToLocal,
  formatTimestampToLocalDate,
} from "@/utils/dateUtils";
import {
  canManageSystem,
  getUserRoleLabel,
  getRoleVariant,
  PermissionLevel,
  PERMISSION_DESCRIPTIONS,
  PERMISSION_LEVEL_DESCRIPTIONS,
} from "@/utils/permissions";
import { trackAnalyticsEvent } from "@/utils/analytics";
import { StatusAlert } from "@/components/StatusAlert";
import { CopyableText } from "@/components/CopyableText";
import type {
  AdminUser,
  School as SchoolType,
  ZhiXueAccount,
  Teacher,
  AdminExam,
} from "@/api/admin";
import type { Exam } from "@/types/api";

// 学校显示组件 - 支持单学校和多学校场景
const SchoolsDisplay: React.FC<{
  schools: Array<{ school_name?: string }>;
}> = ({ schools }) => {
  if (schools.length === 0) {
    return <span className="text-muted-foreground">未知</span>;
  }

  if (schools.length === 1) {
    return <span>{schools[0].school_name || "未知"}</span>;
  }

  // 多学校：显示"XX 中学等 N 所学校"，使用 title 属性显示完整列表
  const firstSchool = schools[0].school_name || "未知";
  const allSchoolNames = schools.map((s) => s.school_name || "未知").join("、");

  return (
    <span className="cursor-help" title={allSchoolNames}>
      {firstSchool} 等 {schools.length} 所学校
    </span>
  );
};

const AdminPage: React.FC = () => {
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

  useEffect(() => {
    document.title = "管理面板 - ZhiXue Lite";
    return () => {
      document.title = "ZhiXue Lite";
    };
  }, []);

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

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 xl:grid-cols-5 h-auto xl:h-9 p-1 gap-1 xl:gap-0">
          <TabsTrigger
            value="users"
            className="flex items-center space-x-2 w-full"
          >
            <Users className="h-4 w-4" />
            <span>用户管理</span>
          </TabsTrigger>
          <TabsTrigger
            value="schools"
            className="flex items-center space-x-2 w-full"
          >
            <School className="h-4 w-4" />
            <span>学校管理</span>
          </TabsTrigger>
          <TabsTrigger
            value="teachers"
            className="flex items-center space-x-2 w-full"
          >
            <GraduationCap className="h-4 w-4" />
            <span>教师管理</span>
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="flex items-center space-x-2 w-full"
          >
            <UserCheck className="h-4 w-4" />
            <span>学生管理</span>
          </TabsTrigger>
          <TabsTrigger
            value="exams"
            className="flex items-center space-x-2 w-full"
          >
            <FileText className="h-4 w-4" />
            <span>考试管理</span>
          </TabsTrigger>
        </TabsList>

        {/* 用户管理 */}
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        {/* 学校管理 */}
        <TabsContent value="schools">
          <SchoolManagement />
        </TabsContent>

        {/* 教师管理 */}
        <TabsContent value="teachers">
          <TeacherManagement />
        </TabsContent>

        {/* 学生管理 */}
        <TabsContent value="students">
          <StudentManagement />
        </TabsContent>

        {/* 考试管理 */}
        <TabsContent value="exams">
          <ExamManagement />
        </TabsContent>
      </Tabs>

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

// 用户管理组件
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lastRequestIdRef = useRef(0);

  // 新增：学校列表
  const [schools, setSchools] = useState<SchoolType[]>([]);

  // 编辑对话框状态
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null);

  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 新增：权限编辑相关状态
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [editingPermissionsUser, setEditingPermissionsUser] =
    useState<AdminUser | null>(null);
  const [permissionForm, setPermissionForm] = useState<Record<number, number>>(
    {},
  );
  const [permissionLoading, setPermissionLoading] = useState(false);

  // 新增：重置密码相关状态
  const [resettingPassword, setResettingPassword] = useState<number | null>(
    null,
  );
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{
    open: boolean;
    user: AdminUser | null;
  }>({
    open: false,
    user: null,
  });
  const [newPassword, setNewPassword] = useState("");

  // 新增：智学网信息展开状态
  const [expandedZhixueInfo, setExpandedZhixueInfo] = useState<Set<number>>(
    new Set(),
  );

  const loadUsers = async (pageNum = page, query = activeSearchQuery) => {
    const currentRequestId = ++lastRequestIdRef.current;
    try {
      setLoading(true);
      const response = await adminAPI.listUsers({
        page: pageNum,
        per_page: 10,
        query: query,
      });
      if (currentRequestId !== lastRequestIdRef.current) return;

      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages);
      }
    } catch {
      if (currentRequestId !== lastRequestIdRef.current) return;
      // Error handling is done by API interceptor
    } finally {
      if (currentRequestId === lastRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSearch = () => {
    setActiveSearchQuery(searchInput);
    setPage(1);
    loadUsers(1, searchInput);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadUsers(newPage, activeSearchQuery);
  };

  // 新增：加载学校列表
  const loadSchools = async () => {
    try {
      const response = await adminAPI.listSchools({ per_page: 1000 }); // 加载所有学校
      if (response.data.success) {
        setSchools(response.data.schools);
      }
    } catch {
      // Error handling is done by API interceptor
    } finally {
      // no-op
    }
  };

  // 开启编辑对话框
  const openEditDialog = (user: AdminUser) => {
    setError(null);
    setSuccess(null);
    setUserToEdit(user);
    setIsEditDialogOpen(true);
  };

  // 权限编辑相关函数
  const openPermissionDialog = (user: AdminUser) => {
    setEditingPermissionsUser(user);
    setPermissionDialogOpen(true);
    setError(null);
    setSuccess(null);

    // 初始化权限表单
    const initialPermissions: Record<number, number> = {};
    const permissions = user.permissions || "10110"; // 默认权限

    for (let i = 0; i < 5; i++) {
      if (i < permissions.length) {
        initialPermissions[i] = parseInt(permissions[i], 10) || 0;
      } else {
        initialPermissions[i] = 0;
      }
    }

    setPermissionForm(initialPermissions);
  };

  const closePermissionDialog = () => {
    setPermissionDialogOpen(false);
    setEditingPermissionsUser(null);
    setPermissionForm({});
  };

  const savePermissions = async () => {
    if (!editingPermissionsUser) return;

    setPermissionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 构建权限字符串
      const permissionsString = Object.keys(permissionForm)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((key) => permissionForm[parseInt(key)].toString())
        .join("");

      const response = await adminAPI.updateUser(editingPermissionsUser.id, {
        permissions: permissionsString,
      });

      if (response.data.success) {
        setSuccess("权限已更新");
        closePermissionDialog();
        await loadUsers(page, activeSearchQuery); // 重新加载用户列表
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "更新权限失败";
      setError(errorMessage);
    } finally {
      setPermissionLoading(false);
    }
  };

  const updatePermission = (permissionType: number, level: number) => {
    setPermissionForm((prev) => ({
      ...prev,
      [permissionType]: level,
    }));
  };

  // 保存用户修改（从编辑对话框调用）
  const saveUserEdit = async (
    userId: number,
    formData: {
      email: string;
      role: "admin" | "user" | "";
      is_active: boolean;
      manual_school_id: string | null;
    },
  ) => {
    const targetUser = users.find((u) => u.id === userId);

    // 验证：已绑定智学网账号的用户不能手动分配学校
    if (targetUser?.zhixue_info?.username && formData.manual_school_id) {
      setError("该用户已绑定智学网账号，无法手动分配学校");
      return;
    }

    setEditLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: {
        email: string;
        role?: "admin" | "user";
        is_active: boolean;
        manual_school_id?: string | null;
      } = {
        email: formData.email,
        is_active: formData.is_active,
        manual_school_id: formData.manual_school_id,
      };

      if (formData.role !== "") {
        updateData.role = formData.role;
      }

      const response = await adminAPI.updateUser(userId, updateData);
      if (response.data.success) {
        setSuccess("用户信息已更新");
        setIsEditDialogOpen(false);
        setUserToEdit(null);
        await loadUsers(page, activeSearchQuery); // 重新加载用户列表
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "更新失败";
      setError(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  // 重置密码相关函数
  const openResetPasswordDialog = (user: AdminUser) => {
    setResetPasswordDialog({ open: true, user });
    setNewPassword("");
  };

  const closeResetPasswordDialog = () => {
    setResetPasswordDialog({ open: false, user: null });
    setNewPassword("");
  };

  const generateRandomPassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const resetUserPassword = async () => {
    if (
      !resetPasswordDialog.user ||
      !newPassword ||
      !resetPasswordDialog.user.id
    )
      return;

    setResettingPassword(resetPasswordDialog.user.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await adminAPI.updateUser(resetPasswordDialog.user.id, {
        password: newPassword,
      });
      if (response.data.success) {
        setSuccess(`用户 ${resetPasswordDialog.user.username} 的密码已重置`);
        closeResetPasswordDialog();
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "重置密码失败";
      setError(errorMessage);
    } finally {
      setResettingPassword(null);
    }
  };

  // 切换智学网信息展开状态
  const toggleZhixueInfo = (userId: number) => {
    const newExpanded = new Set(expandedZhixueInfo);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedZhixueInfo(newExpanded);
  };

  useEffect(() => {
    loadUsers(1, "");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 加载学校列表
  useEffect(() => {
    loadSchools();
  }, []);

  // 新增：用户编辑对话框组件
  const UserEditDialog: React.FC<{
    user: AdminUser;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (
      userId: number,
      formData: {
        email: string;
        role: "admin" | "user" | "";
        is_active: boolean;
        manual_school_id: string | null;
      },
    ) => Promise<void>;
    schools: SchoolType[];
    editLoading: boolean;
    error: string | null;
  }> = ({ user, open, onOpenChange, onSave, schools, editLoading, error }) => {
    const [email, setEmail] = useState(user.email);
    const [role, setRole] = useState<"admin" | "user" | "">(
      user.role === "admin" || user.role === "user" ? user.role : "",
    );
    const [isActive, setIsActive] = useState(user.is_active);
    const [manualSchoolId, setManualSchoolId] = useState<string | null>(
      user.is_manual_school && !user.zhixue_info?.username
        ? user.zhixue_info?.school_id || null
        : null,
    );

    useEffect(() => {
      if (open) {
        setEmail(user.email);
        setRole(user.role === "admin" || user.role === "user" ? user.role : "");
        setIsActive(user.is_active);
        setManualSchoolId(
          user.is_manual_school && !user.zhixue_info?.username
            ? user.zhixue_info?.school_id || null
            : null,
        );
      }
    }, [open, user]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await onSave(user.id, {
        email,
        role,
        is_active: isActive,
        manual_school_id: manualSchoolId,
      });
    };

    return (
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title={`编辑用户: ${user.username}`}
        description="修改用户基本信息和分配学校"
        footer={(isDesktop) => (
          <>
            {isDesktop ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  取消
                </Button>
                <Button onClick={handleSubmit} disabled={editLoading}>
                  {editLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editLoading ? "保存中..." : "保存修改"}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSubmit} disabled={editLoading}>
                  {editLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editLoading ? "保存中..." : "保存修改"}
                </Button>
                <DrawerClose asChild>
                  <Button type="button" variant="outline">
                    取消
                  </Button>
                </DrawerClose>
              </>
            )}
          </>
        )}
      >
        <div className="space-y-4">
          {error && <StatusAlert variant="error" message={error} />}

          <div className="space-y-2">
            <Label htmlFor="edit-email">邮箱</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-role">角色</Label>
            <Select
              value={role}
              onValueChange={(value: "admin" | "user" | "") => setRole(value)}
            >
              <SelectTrigger id="edit-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">普通用户</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-is-active">状态</Label>
            <Select
              value={isActive.toString()}
              onValueChange={(value) => setIsActive(value === "true")}
            >
              <SelectTrigger id="edit-is-active">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">可用</SelectItem>
                <SelectItem value="false">禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-manual-school">手动分配学校</Label>
            <Select
              value={manualSchoolId || "none"}
              onValueChange={(value) =>
                setManualSchoolId(value === "none" ? null : value)
              }
              disabled={!!user.zhixue_info?.username}
            >
              <SelectTrigger id="edit-manual-school">
                <SelectValue placeholder="选择学校" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">不分配</SelectItem>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {user.zhixue_info?.username && (
              <p className="text-xs text-orange-600">
                已绑定智学网账号的用户无法手动分配学校
              </p>
            )}
          </div>
        </div>
      </ResponsiveDialog>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>用户管理</CardTitle>
            <CardDescription>管理系统用户账号和权限</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => loadUsers(page, activeSearchQuery)}
            title="刷新"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户名..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            搜索
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Success/Error Messages */}
        {success && (
          <StatusAlert
            variant="success"
            message={success}
            className="mb-4 text-sm"
          />
        )}
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
        ) : (
          <div className="space-y-4">
            {/* 桌面端表格视图 */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户名</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>智学网信息</TableHead>
                    <TableHead>分配学校</TableHead>
                    <TableHead>注册时间</TableHead>
                    <TableHead>最后登录</TableHead>
                    <TableHead>登录IP</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.username}
                      </TableCell>

                      {/* 邮箱 */}
                      <TableCell>{user.email}</TableCell>

                      {/* 角色 */}
                      <TableCell>
                        <Badge variant={getRoleVariant(user.role)}>
                          {getUserRoleLabel(user.role)}
                        </Badge>
                      </TableCell>

                      {/* 状态 */}
                      <TableCell>
                        <Badge
                          variant={user.is_active ? "default" : "destructive"}
                        >
                          {user.is_active ? "可用" : "禁用"}
                        </Badge>
                      </TableCell>

                      {/* 智学网信息 - 可折叠 */}
                      <TableCell>
                        {user.zhixue_info?.username ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1"
                                onClick={() => toggleZhixueInfo(user.id)}
                              >
                                {expandedZhixueInfo.has(user.id) ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </Button>
                              <Badge variant="outline" className="text-xs">
                                {user.zhixue_info.username}
                              </Badge>
                            </div>

                            {expandedZhixueInfo.has(user.id) && (
                              <div className="ml-6 space-y-1 text-xs text-muted-foreground">
                                <div>
                                  姓名: {user.zhixue_info.realname || "-"}
                                </div>
                                <div>
                                  学校: {user.zhixue_info.school_name || "-"}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            未绑定
                          </span>
                        )}
                      </TableCell>

                      {/* 手动分配学校 */}
                      <TableCell>
                        <div className="space-y-1">
                          {user.is_manual_school ? (
                            <Badge variant="secondary" className="text-xs">
                              {user.zhixue_info?.school_name || "未知学校"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              未分配
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {formatUTCIsoToLocal(user.created_at)}
                      </TableCell>
                      <TableCell>
                        {user.last_login
                          ? formatUTCIsoToLocal(user.last_login)
                          : "从未登录"}
                      </TableCell>

                      {/* 登录IP */}
                      <TableCell>
                        <span className="font-mono text-xs">
                          {user.last_login_ip || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </span>
                      </TableCell>

                      {/* 操作按钮 - 使用DropdownMenu */}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">打开菜单</span>
                              <EllipsisVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(user)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openPermissionDialog(user)}
                            >
                              <Lock className="h-4 w-4 mr-2" />
                              权限
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openResetPasswordDialog(user)}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              重置密码
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem className="text-destructive">
                              <Trash className="h-4 w-4 mr-2" />
                              删除
                            </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 移动端卡片视图 */}
            <div className="md:hidden space-y-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {user.username}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={getRoleVariant(user.role)}>
                            {getUserRoleLabel(user.role)}
                          </Badge>
                          <Badge
                            variant={user.is_active ? "default" : "destructive"}
                          >
                            {user.is_active ? "可用" : "禁用"}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <EllipsisVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openPermissionDialog(user)}
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            权限
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openResetPasswordDialog(user)}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            重置密码
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="grid grid-cols-[60px_1fr] gap-2">
                      <span className="text-muted-foreground">邮箱:</span>
                      <span className="break-all">{user.email}</span>
                    </div>

                    {/* 智学网绑定信息 */}
                    {user.zhixue_info?.username ? (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1"
                            onClick={() => toggleZhixueInfo(user.id)}
                          >
                            {expandedZhixueInfo.has(user.id) ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </Button>
                          <span className="text-muted-foreground">智学网:</span>
                          <Badge variant="outline" className="text-xs">
                            {user.zhixue_info.username}
                          </Badge>
                        </div>
                        {expandedZhixueInfo.has(user.id) && (
                          <div className="ml-6 space-y-1 text-xs text-muted-foreground">
                            <div>姓名: {user.zhixue_info.realname || "-"}</div>
                            <div>学校: {user.zhixue_info.school_name || "-"}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-[60px_1fr] gap-2">
                        <span className="text-muted-foreground">智学网:</span>
                        <span className="text-muted-foreground text-xs">未绑定</span>
                      </div>
                    )}

                    {/* 手动分配学校 */}
                    {user.is_manual_school && (
                      <div className="grid grid-cols-[60px_1fr] gap-2">
                        <span className="text-muted-foreground">学校:</span>
                        <Badge variant="secondary" className="text-xs w-fit">
                          {user.zhixue_info?.school_name || "未知学校"}
                        </Badge>
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

      {/* 新增：重置密码对话框 */}
      <ResponsiveDialog
        open={resetPasswordDialog.open}
        onOpenChange={closeResetPasswordDialog}
        title="重置用户密码"
        description={`为用户 "${resetPasswordDialog.user?.username}" 设置新密码`}
        footer={(isDesktop) => (
          <>
            {isDesktop ? (
              <>
                <Button variant="outline" onClick={closeResetPasswordDialog}>
                  取消
                </Button>
                <Button
                  onClick={resetUserPassword}
                  disabled={
                    !newPassword ||
                    resettingPassword === resetPasswordDialog.user?.id
                  }
                >
                  {resettingPassword === resetPasswordDialog.user?.id ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  {resettingPassword === resetPasswordDialog.user?.id
                    ? "重置中..."
                    : "重置密码"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={resetUserPassword}
                  disabled={
                    !newPassword ||
                    resettingPassword === resetPasswordDialog.user?.id
                  }
                >
                  {resettingPassword === resetPasswordDialog.user?.id ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  {resettingPassword === resetPasswordDialog.user?.id
                    ? "重置中..."
                    : "重置密码"}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">取消</Button>
                </DrawerClose>
              </>
            )}
          </>
        )}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="new-password" className="text-sm font-medium">
              新密码
            </label>
            <div className="flex space-x-2">
              <Input
                id="new-password"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="输入新密码"
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={generateRandomPassword}
                type="button"
              >
                生成随机密码
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              建议使用生成的随机密码以确保安全性
            </p>
          </div>
        </div>
      </ResponsiveDialog>

      {/* 权限编辑对话框 */}
      <ResponsiveDialog
        open={permissionDialogOpen}
        onOpenChange={closePermissionDialog}
        title="编辑用户权限"
        description={`为用户 "${editingPermissionsUser?.username}" 设置权限`}
        className="max-w-2xl"
        footer={(isDesktop) => (
          <>
            {isDesktop ? (
              <>
                <Button variant="outline" onClick={closePermissionDialog}>
                  取消
                </Button>
                <Button onClick={savePermissions} disabled={permissionLoading}>
                  {permissionLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {permissionLoading ? "保存中..." : "保存权限"}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={savePermissions} disabled={permissionLoading}>
                  {permissionLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {permissionLoading ? "保存中..." : "保存权限"}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">取消</Button>
                </DrawerClose>
              </>
            )}
          </>
        )}
      >
        <div className="space-y-4">
          {/* Success/Error Messages */}
          {success && (
            <StatusAlert
              variant="success"
              message={success}
              className="text-sm"
            />
          )}
          {error && (
            <StatusAlert
              variant="error"
              message={error}
              className="text-sm"
            />
          )}

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted/50 rounded-md">
              <p>
                <strong>权限级别说明：</strong>
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  <strong>禁止 (0):</strong> 完全禁止访问
                </li>
                <li>
                  <strong>个人 (1):</strong> 只能访问自己的数据
                </li>
                <li>
                  <strong>校内 (2):</strong> 可访问同校数据
                </li>
                <li>
                  <strong>全局 (3):</strong> 可访问所有数据
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              {Object.entries(PERMISSION_DESCRIPTIONS).map(
                ([typeStr, description]) => {
                  const permissionType = parseInt(typeStr, 10);
                  const currentLevel = permissionForm[permissionType] || 0;

                  return (
                    <div
                      key={permissionType}
                      className="p-4 border rounded-md"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-sm md:text-base">
                          {description.action} {description.object}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {
                            PERMISSION_LEVEL_DESCRIPTIONS[
                              currentLevel as PermissionLevel
                            ]
                          }
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(PERMISSION_LEVEL_DESCRIPTIONS).map(
                          ([levelStr, levelDescription]) => {
                            const level = parseInt(levelStr, 10);
                            const isSelected = currentLevel === level;

                            return (
                              <Button
                                key={level}
                                variant={
                                  isSelected ? "default" : "outline-solid"
                                }
                                size="sm"
                                onClick={() =>
                                  updatePermission(permissionType, level)
                                }
                                className={`text-xs ${
                                  level === 0
                                    ? "hover:bg-red-100 hover:text-red-800"
                                    : level === 1
                                      ? "hover:bg-blue-100 hover:text-blue-800"
                                      : level === 2
                                        ? "hover:bg-yellow-100 hover:text-yellow-800"
                                        : "hover:bg-green-100 hover:text-green-800"
                                }`}
                              >
                                {levelDescription}
                              </Button>
                            );
                          },
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </ResponsiveDialog>

      {/* 用户编辑对话框 */}
      {userToEdit && (
        <UserEditDialog
          user={userToEdit}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={saveUserEdit}
          schools={schools}
          editLoading={editLoading}
          error={error}
        />
      )}
    </Card>
  );
};

// 学校管理组件
const SchoolManagement: React.FC = () => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lastRequestIdRef = useRef(0);

  const loadSchools = async (pageNum = page, query = activeSearchQuery) => {
    const currentRequestId = ++lastRequestIdRef.current;
    try {
      setLoading(true);
      const response = await adminAPI.listSchools({
        page: pageNum,
        per_page: 10,
        query: query,
      });
      if (currentRequestId !== lastRequestIdRef.current) return;

      if (response.data.success) {
        setSchools(response.data.schools);
        setTotalPages(response.data.pagination.pages);
      }
    } catch {
      if (currentRequestId !== lastRequestIdRef.current) return;
      // Error handling is done by API interceptor
    } finally {
      if (currentRequestId === lastRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSearch = () => {
    setActiveSearchQuery(searchInput);
    setPage(1);
    loadSchools(1, searchInput);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadSchools(newPage, activeSearchQuery);
  };

  useEffect(() => {
    loadSchools(1, "");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>学校管理</CardTitle>
            <CardDescription>管理系统中的学校信息</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => loadSchools(page, activeSearchQuery)}
            title="刷新"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索学校名称或 ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            搜索
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 桌面端视图 */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>学校 ID</TableHead>
                    <TableHead>学校名称</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-mono text-sm">
                        <CopyableText text={school.id} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {school.name}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 移动端视图 */}
            <div className="md:hidden space-y-4">
              {schools.map((school) => (
                <Card key={school.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{school.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">学校 ID:</span>
                      <span className="font-mono">
                        <CopyableText text={school.id} />
                      </span>
                    </div>
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
    </Card>
  );
};

// 教师管理组件
const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lastRequestIdRef = useRef(0);

  // 添加教师状态
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    username: "",
    password: "",
    login_method: "changyan",
  });
  const [addLoading, setAddLoading] = useState(false);

  // 编辑教师状态
  const [editingTeacher, setEditingTeacher] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    password: "",
    login_method: "changyan",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [originalLoginMethod, setOriginalLoginMethod] =
    useState<string>("changyan");

  // 删除教师状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<{
    open: boolean;
    teacher: Teacher | null;
  }>({
    open: false,
    teacher: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 消息状态
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadTeachers = async (pageNum = page, query = activeSearchQuery) => {
    const currentRequestId = ++lastRequestIdRef.current;
    try {
      setLoading(true);
      const response = await adminAPI.listTeachers({
        page: pageNum,
        per_page: 10,
        query: query,
      });
      if (currentRequestId !== lastRequestIdRef.current) return;

      if (response.data.success) {
        setTeachers(response.data.teachers);
        setTotalPages(response.data.pagination.pages);
      }
    } catch {
      if (currentRequestId !== lastRequestIdRef.current) return;
      setError("加载教师列表失败");
    } finally {
      if (currentRequestId === lastRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSearch = () => {
    setActiveSearchQuery(searchInput);
    setPage(1);
    loadTeachers(1, searchInput);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadTeachers(newPage, activeSearchQuery);
  };

  // 添加教师
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await adminAPI.addTeacher(addForm);
      if (response.data.success) {
        setSuccess("教师账号添加成功");
        setAddDialogOpen(false);
        setAddForm({ username: "", password: "", login_method: "changyan" });
        await loadTeachers(page, activeSearchQuery);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "添加教师失败";
      setError(errorMessage);
    } finally {
      setAddLoading(false);
    }
  };

  // 开始编辑教师
  const startEditTeacher = (teacher: Teacher) => {
    setError(null);
    setSuccess(null);
    setEditingTeacher(teacher.username);
    setEditForm({
      password: "",
      login_method: teacher.login_method, // 使用当前的登录方式作为默认值
    });
    // 保存原始登录方式用于比较
    setOriginalLoginMethod(teacher.login_method);
  };

  // 取消编辑
  const cancelEditTeacher = () => {
    setEditingTeacher(null);
    setEditForm({ password: "", login_method: "changyan" });
  };

  // 保存教师修改
  const saveTeacherEdit = async (username: string) => {
    setEditLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: { password?: string; login_method?: string } = {};

      if (editForm.password) {
        updateData.password = editForm.password;
      }
      // 只有登录方式改变时才发送
      if (editForm.login_method !== originalLoginMethod) {
        updateData.login_method = editForm.login_method;
      }

      const response = await adminAPI.updateTeacher(username, updateData);
      if (response.data.success) {
        setSuccess("教师信息已更新");
        setEditingTeacher(null);
        await loadTeachers(page, activeSearchQuery);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "更新失败";
      setError(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  // 打开删除对话框
  const openDeleteDialog = (teacher: Teacher) => {
    setDeleteDialogOpen({ open: true, teacher });
  };

  // 关闭删除对话框
  const closeDeleteDialog = () => {
    setDeleteDialogOpen({ open: false, teacher: null });
  };

  // 删除教师
  const handleDeleteTeacher = async () => {
    if (!deleteDialogOpen.teacher) return;

    setDeleteLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await adminAPI.deleteTeacher(
        deleteDialogOpen.teacher.username,
      );
      if (response.data.success) {
        setSuccess(`教师 ${deleteDialogOpen.teacher.username} 已删除`);
        closeDeleteDialog();
        await loadTeachers(page, activeSearchQuery);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "删除失败";
      setError(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers(1, "");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>教师管理</CardTitle>
            <CardDescription>管理智学网教师账号</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => loadTeachers(page, activeSearchQuery)}
            title="刷新"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索教师用户名或学校..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            搜索
          </Button>
          <Button
            onClick={() => {
              setError(null);
              setSuccess(null);
              setAddDialogOpen(true);
            }}
            variant="outline"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            添加教师
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Success/Error Messages */}
        {success && (
          <StatusAlert
            variant="success"
            message={success}
            className="mb-4 text-sm"
          />
        )}
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
        ) : (
          <div className="space-y-4">
            {/* 桌面端视图 */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>教师 ID</TableHead>
                    <TableHead>用户名</TableHead>
                    <TableHead>真实姓名</TableHead>
                    <TableHead>学校</TableHead>
                    <TableHead>登录方式</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-mono text-sm">
                        <CopyableText text={teacher.id} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {teacher.username}
                      </TableCell>
                      <TableCell>{teacher.realname}</TableCell>
                      <TableCell>{teacher.school_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {teacher.login_method === "changyan"
                            ? "畅言"
                            : teacher.login_method === "zhixue"
                              ? "智学"
                              : teacher.login_method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditTeacher(teacher)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            编辑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(teacher)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash className="h-3 w-3 mr-1" />
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 移动端视图 */}
            <div className="md:hidden space-y-4">
              {teachers.map((teacher) => (
                <Card key={teacher.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {teacher.username}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{teacher.realname}</span>
                          <span>•</span>
                          <Badge variant="secondary" className="text-xs">
                            {teacher.login_method === "changyan"
                              ? "畅言"
                              : teacher.login_method === "zhixue"
                                ? "智学"
                                : teacher.login_method}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditTeacher(teacher)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(teacher)}
                          className="text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="grid grid-cols-[70px_1fr] gap-2">
                      <span className="text-muted-foreground">教师 ID:</span>
                      <span className="font-mono break-all">
                        <CopyableText text={teacher.id} />
                      </span>
                    </div>
                    <div className="grid grid-cols-[70px_1fr] gap-2">
                      <span className="text-muted-foreground">学校:</span>
                      <span>{teacher.school_name}</span>
                    </div>
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

      {/* 添加教师对话框 */}
      <ResponsiveDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="添加教师账号"
        description="添加智学网教师账号到系统中"
        footer={(isDesktop) => (
          <>
            {isDesktop ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddDialogOpen(false)}
                >
                  取消
                </Button>
                <Button onClick={handleAddTeacher} disabled={addLoading}>
                  {addLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <GraduationCap className="h-4 w-4 mr-2" />
                  )}
                  {addLoading ? "添加中..." : "添加教师"}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleAddTeacher} disabled={addLoading}>
                  {addLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <GraduationCap className="h-4 w-4 mr-2" />
                  )}
                  {addLoading ? "添加中..." : "添加教师"}
                </Button>
                <DrawerClose asChild>
                  <Button type="button" variant="outline">
                    取消
                  </Button>
                </DrawerClose>
              </>
            )}
          </>
        )}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="add-username" className="text-sm font-medium">
              智学网用户名
            </label>
            <Input
              id="add-username"
              type="text"
              value={addForm.username}
              onChange={(e) =>
                setAddForm((prev) => ({ ...prev, username: e.target.value }))
              }
              placeholder="请输入智学网用户名"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="add-password" className="text-sm font-medium">
              智学网密码
            </label>
            <Input
              id="add-password"
              type="password"
              value={addForm.password}
              onChange={(e) =>
                setAddForm((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="请输入智学网密码"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="add-login-method" className="text-sm font-medium">
              登录方式
            </label>
            <Select
              value={addForm.login_method}
              onValueChange={(value) =>
                setAddForm((prev) => ({ ...prev, login_method: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="changyan">畅言</SelectItem>
                <SelectItem value="zhixue">智学</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ResponsiveDialog>

      {/* 删除确认对话框 */}
      <ResponsiveDialog
        open={deleteDialogOpen.open}
        onOpenChange={closeDeleteDialog}
        title="确认删除教师"
        description={`确定要删除教师 "${deleteDialogOpen.teacher?.username}" 吗？此操作不可撤销。`}
        footer={(isDesktop) => (
          <>
            {isDesktop ? (
              <>
                <Button variant="outline" onClick={closeDeleteDialog}>
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteTeacher}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  {deleteLoading ? "删除中..." : "确认删除"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={handleDeleteTeacher}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  {deleteLoading ? "删除中..." : "确认删除"}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">取消</Button>
                </DrawerClose>
              </>
            )}
          </>
        )}
      />

      {/* 编辑教师对话框 */}
      <ResponsiveDialog
        open={editingTeacher !== null}
        onOpenChange={(open) => {
          if (!open) cancelEditTeacher();
        }}
        title="编辑教师信息"
        description={`修改教师 "${editingTeacher}" 的密码和登录方式`}
        footer={(isDesktop) => (
          <>
            {isDesktop ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEditTeacher}
                >
                  取消
                </Button>
                <Button
                  onClick={() => editingTeacher && saveTeacherEdit(editingTeacher)}
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editLoading ? "保存中..." : "保存修改"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => editingTeacher && saveTeacherEdit(editingTeacher)}
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editLoading ? "保存中..." : "保存修改"}
                </Button>
                <DrawerClose asChild>
                  <Button type="button" variant="outline">
                    取消
                  </Button>
                </DrawerClose>
              </>
            )}
          </>
        )}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="edit-teacher-password" className="text-sm font-medium">
              新密码
            </label>
            <Input
              id="edit-teacher-password"
              type="password"
              value={editForm.password}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="留空表示不修改密码"
            />
            <p className="text-xs text-muted-foreground">
              如果不需要修改密码，请留空
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-teacher-login-method" className="text-sm font-medium">
              登录方式
            </label>
            <Select
              value={editForm.login_method}
              onValueChange={(value) =>
                setEditForm((prev) => ({ ...prev, login_method: value }))
              }
            >
              <SelectTrigger id="edit-teacher-login-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="changyan">畅言</SelectItem>
                <SelectItem value="zhixue">智学</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ResponsiveDialog>
    </Card>
  );
};

// 学生管理组件
const StudentManagement: React.FC = () => {
  const { user } = useAuth(); // 添加当前用户信息
  const [students, setStudents] = useState<ZhiXueAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lastRequestIdRef = useRef(0);

  // 新增：绑定用户管理相关状态
  const [selectedStudent, setSelectedStudent] = useState<ZhiXueAccount | null>(
    null,
  );
  const [bindingUsers, setBindingUsers] = useState<{ username: string }[]>([]);
  const [bindingDialogOpen, setBindingDialogOpen] = useState(false);
  const [loadingBindings, setLoadingBindings] = useState(false);
  const [unbindingUser, setUnbindingUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadStudents = async (pageNum = page, query = activeSearchQuery) => {
    const currentRequestId = ++lastRequestIdRef.current;
    try {
      setLoading(true);
      const response = await adminAPI.listZhiXueAccounts({
        page: pageNum,
        per_page: 10,
        query: query,
      });
      if (currentRequestId !== lastRequestIdRef.current) return;

      if (response.data.success) {
        setStudents(response.data.zhixue_accounts);
        setTotalPages(response.data.pagination.pages);
      }
    } catch {
      if (currentRequestId !== lastRequestIdRef.current) return;
      // Error handling is done by API interceptor
    } finally {
      if (currentRequestId === lastRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSearch = () => {
    setActiveSearchQuery(searchInput);
    setPage(1);
    loadStudents(1, searchInput);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadStudents(newPage, activeSearchQuery);
  };

  // 新增：查看智学网账号绑定的用户
  const viewBindingUsers = async (student: ZhiXueAccount) => {
    setSelectedStudent(student);
    setLoadingBindings(true);
    setBindingDialogOpen(true);
    setError(null);

    try {
      const response = await adminAPI.getZhixueAccountBindings(
        student.username,
      );
      if (response.data.success) {
        setBindingUsers(response.data.binding_info.users);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "获取绑定用户失败";
      setError(errorMessage);
    } finally {
      setLoadingBindings(false);
    }
  };

  // 新增：管理员解绑用户
  const handleUnbindUser = async (username: string) => {
    if (!selectedStudent) return;

    setUnbindingUser(username);
    setError(null);
    setSuccess(null);

    try {
      const response = await adminAPI.unbindUserFromZhixueAccount(
        selectedStudent.username,
        username,
      );
      if (response.data.success) {
        setSuccess(`已成功解绑用户 ${username}`);

        trackAnalyticsEvent("admin_unbind_user_success", {
          admin_username: user?.username,
          target_username: username,
          zhixue_username: selectedStudent.username,
        });

        // 重新加载绑定用户列表
        await viewBindingUsers(selectedStudent);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "解绑失败";
      setError(errorMessage);

      trackAnalyticsEvent("admin_unbind_user_failed", {
        admin_username: user?.username,
        target_username: username,
        zhixue_username: selectedStudent?.username,
        error_message: errorMessage,
      });
    } finally {
      setUnbindingUser(null);
    }
  };

  useEffect(() => {
    loadStudents(1, "");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>学生管理</CardTitle>
            <CardDescription>管理智学网学生账号</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => loadStudents(page, activeSearchQuery)}
            title="刷新"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索学生用户名..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            搜索
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 桌面端视图 */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>学生 ID</TableHead>
                    <TableHead>用户名</TableHead>
                    <TableHead>真实姓名</TableHead>
                    <TableHead>学校</TableHead>
                    <TableHead>学校 ID</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-sm">
                        <CopyableText text={student.id} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.username}
                      </TableCell>
                      <TableCell>{student.realname}</TableCell>
                      <TableCell>{student.school_name || "未知"}</TableCell>
                      <TableCell className="font-mono text-sm">
                        <CopyableText text={student.school_id} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewBindingUsers(student)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          查看绑定
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 移动端视图 */}
            <div className="md:hidden space-y-4">
              {students.map((student) => (
                <Card key={student.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {student.username}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {student.realname} • {student.school_name || "未知"}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewBindingUsers(student)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="grid grid-cols-[70px_1fr] gap-2">
                      <span className="text-muted-foreground">学生 ID:</span>
                      <span className="font-mono break-all">
                        <CopyableText text={student.id} />
                      </span>
                    </div>
                    <div className="grid grid-cols-[70px_1fr] gap-2">
                      <span className="text-muted-foreground">学校 ID:</span>
                      <span className="font-mono break-all">
                        <CopyableText text={student.school_id} />
                      </span>
                    </div>
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

      {/* 新增：绑定用户管理对话框 */}
      <ResponsiveDialog
        open={bindingDialogOpen}
        onOpenChange={setBindingDialogOpen}
        title="智学网账号绑定管理"
        description={`账号: ${selectedStudent?.username} (${selectedStudent?.realname})`}
        className="max-w-2xl"
        showDefaultFooter={true}
      >
        <div className="space-y-4">
          {/* Success/Error Messages */}
          {success && (
            <StatusAlert
              variant="success"
              message={success}
              className="text-sm"
            />
          )}
          {error && (
            <StatusAlert
              variant="error"
              message={error}
              className="text-sm"
            />
          )}

          {loadingBindings ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">加载绑定用户中...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">绑定用户列表</h4>
                <Badge variant="outline">{bindingUsers.length} 个用户</Badge>
              </div>

              {bindingUsers.length > 0 ? (
                <div className="space-y-2">
                  {bindingUsers.map((user) => (
                    <div
                      key={user.username}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{user.username}</Badge>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUnbindUser(user.username)}
                        disabled={unbindingUser === user.username}
                      >
                        {unbindingUser === user.username ? (
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Unlink className="h-3 w-3 mr-1" />
                        )}
                        {unbindingUser === user.username
                          ? "解绑中..."
                          : "解绑"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>暂无用户绑定此智学网账号</p>
                </div>
              )}
            </div>
          )}
        </div>
      </ResponsiveDialog>
    </Card>
  );
};

// 考试管理组件
const ExamManagement: React.FC = () => {
  const [exams, setExams] = useState<AdminExam[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lastRequestIdRef = useRef(0);

  // 成绩单生成状态
  const [generatingScoresheet, setGeneratingScoresheet] = useState<
    string | null
  >(null);

  // 考试详情状态
  const [examDetailDialog, setExamDetailDialog] = useState<{
    open: boolean;
    exam: AdminExam | null;
  }>({
    open: false,
    exam: null,
  });
  const [examDetail, setExamDetail] = useState<Exam | null>(null);
  const [loadingExamDetail, setLoadingExamDetail] = useState(false);

  // 消息状态
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 辅助函数：获取考试的数据保存状态
  const getExamSaveStatus = (
    exam: AdminExam | Exam,
  ): {
    status: "all" | "partial" | "none";
    variant: "default" | "secondary" | "outline-solid";
    label: string;
    title?: string;
  } => {
    if (!exam.schools || exam.schools.length === 0) {
      return { status: "none", variant: "secondary", label: "未知" };
    }

    const savedSchools = exam.schools.filter((s) => s.is_saved);
    const unsavedSchools = exam.schools.filter((s) => !s.is_saved);
    const savedCount = savedSchools.length;
    const totalCount = exam.schools.length;

    if (savedCount === 0) {
      return { status: "none", variant: "secondary", label: "未保存" };
    } else if (savedCount === totalCount) {
      return { status: "all", variant: "default", label: "已保存" };
    } else {
      // 部分保存：生成详细的 title 信息
      const savedNames = savedSchools
        .map((s) => s.school_name || "未知")
        .join("\n");
      const unsavedNames = unsavedSchools
        .map((s) => s.school_name || "未知")
        .join("\n");

      const titleContent = [
        savedNames ? `已保存:\n${savedNames}` : "",
        unsavedNames ? `未保存:\n${unsavedNames}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      return {
        status: "partial",
        variant: "outline-solid",
        label: `已保存 ${savedCount}/${totalCount} 校`,
        title: titleContent,
      };
    }
  };

  // 辅助函数：检查是否有任何学校已保存数据
  const hasAnySavedData = (exam: AdminExam): boolean => {
    if (!exam.schools || exam.schools.length === 0) {
      return false;
    }
    return exam.schools.some((s) => s.is_saved);
  };

  const loadExams = async (pageNum = page, query = activeSearchQuery) => {
    const currentRequestId = ++lastRequestIdRef.current;
    try {
      setLoading(true);
      // 使用管理员专用的考试列表API
      const response = await adminAPI.listExams({
        page: pageNum,
        per_page: 10,
        query: query,
      });
      if (currentRequestId !== lastRequestIdRef.current) return;

      if (response.data.success) {
        setExams(response.data.exams);
        setTotalPages(response.data.pagination.pages);
      }
    } catch {
      if (currentRequestId !== lastRequestIdRef.current) return;
      setError("加载考试列表失败");
    } finally {
      if (currentRequestId === lastRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSearch = () => {
    setActiveSearchQuery(searchInput);
    setPage(1);
    loadExams(1, searchInput);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadExams(newPage, activeSearchQuery);
  };

  // 查看考试详情
  const viewExamDetail = async (exam: AdminExam) => {
    setExamDetailDialog({ open: true, exam });
    setLoadingExamDetail(true);
    setExamDetail(null);
    setError(null);

    try {
      const response = await examAPI.getExamInfo(exam.id);
      if (response.data.success) {
        setExamDetail(response.data.exam);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "获取考试详情失败";
      setError(errorMessage);
    } finally {
      setLoadingExamDetail(false);
    }
  };

  // 生成成绩单
  const generateScoresheet = async (examId: string, examName: string) => {
    setGeneratingScoresheet(examId);
    setError(null);
    setSuccess(null);

    try {
      const response = await examAPI.generateScoresheet(examId);

      // 创建下载链接
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${examName}_成绩单.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setSuccess(`${examName} 成绩单下载成功`);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "生成成绩单失败";
      setError(errorMessage);
    } finally {
      setGeneratingScoresheet(null);
    }
  };

  // 关闭考试详情对话框
  const closeExamDetailDialog = () => {
    setExamDetailDialog({ open: false, exam: null });
    setExamDetail(null);
  };

  useEffect(() => {
    loadExams(1, "");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>考试管理</CardTitle>
            <CardDescription>管理系统中的考试数据和成绩单生成</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => loadExams(page, activeSearchQuery)}
            title="刷新"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索考试名称或 ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            搜索
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Success/Error Messages */}
        {success && (
          <StatusAlert
            variant="success"
            message={success}
            className="mb-4 text-sm"
          />
        )}
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
        ) : exams.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无考试数据</p>
            <p className="text-sm mt-2">系统中还没有任何考试数据</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 桌面端视图 */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>考试名称</TableHead>
                    <TableHead>学校</TableHead>
                    <TableHead>考试时间</TableHead>
                    <TableHead>数据状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.name}</TableCell>
                      <TableCell>
                        <SchoolsDisplay schools={exam.schools} />
                      </TableCell>
                      <TableCell>
                        {formatTimestampToLocalDate(exam.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getExamSaveStatus(exam).variant}
                          title={getExamSaveStatus(exam).title}
                        >
                          {getExamSaveStatus(exam).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewExamDetail(exam)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            详情
                          </Button>
                          {hasAnySavedData(exam) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                generateScoresheet(exam.id, exam.name)
                              }
                              disabled={generatingScoresheet === exam.id}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {generatingScoresheet === exam.id ? (
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <FileText className="h-3 w-3 mr-1" />
                              )}
                              {generatingScoresheet === exam.id
                                ? "生成中..."
                                : "成绩单"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 移动端视图 */}
            <div className="md:hidden space-y-4">
              {exams.map((exam) => (
                <Card key={exam.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{exam.name}</CardTitle>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>
                            {formatTimestampToLocalDate(exam.created_at)}
                          </span>
                          <Badge
                            variant={getExamSaveStatus(exam).variant}
                            className="text-xs"
                          >
                            {getExamSaveStatus(exam).label}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewExamDetail(exam)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start justify-between text-sm mb-3">
                      <span className="text-muted-foreground shrink-0 mr-2">
                        学校:
                      </span>
                      <div className="text-right">
                        <SchoolsDisplay schools={exam.schools} />
                      </div>
                    </div>
                    {hasAnySavedData(exam) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => generateScoresheet(exam.id, exam.name)}
                        disabled={generatingScoresheet === exam.id}
                      >
                        {generatingScoresheet === exam.id ? (
                          <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                        ) : (
                          <FileText className="h-3 w-3 mr-2" />
                        )}
                        {generatingScoresheet === exam.id
                          ? "生成成绩单中..."
                          : "下载成绩单"}
                      </Button>
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
            />
          </div>
        )}
      </CardContent>

      {/* 考试详情对话框 */}
      <ResponsiveDialog
        open={examDetailDialog.open}
        onOpenChange={closeExamDetailDialog}
        title="考试详情"
        description={`考试: ${examDetailDialog.exam?.name}`}
        className="max-w-2xl"
        showDefaultFooter={true}
      >
        <div className="space-y-4">
          {loadingExamDetail ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">加载考试详情中...</p>
            </div>
          ) : examDetail ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    考试 ID
                  </label>
                  <p className="font-mono text-sm">
                    <CopyableText text={examDetail.id} />
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    考试名称
                  </label>
                  <p className="font-medium">{examDetail.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    参与学校
                  </label>
                  <p className="font-medium">
                    {examDetail.schools && examDetail.schools.length > 0 ? (
                      <SchoolsDisplay schools={examDetail.schools} />
                    ) : (
                      <span className="text-muted-foreground">未知</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    考试类型
                  </label>
                  <Badge
                    variant={
                      examDetail.is_multi_school ? "default" : "secondary"
                    }
                  >
                    {examDetail.is_multi_school ? "联考" : "单校考试"}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    学校 ID
                  </label>
                  <p className="font-mono text-sm break-all">
                    {examDetail.schools && examDetail.schools.length > 0 ? (
                      <CopyableText
                        text={examDetail.schools
                          .map((s) => s.school_id)
                          .join("、")}
                      />
                    ) : (
                      "未知"
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    数据状态
                  </label>
                  <Badge
                    variant={
                      examDetail.schools &&
                      getExamSaveStatus(examDetail).variant
                    }
                    title={
                      examDetail.schools
                        ? getExamSaveStatus(examDetail).title
                        : undefined
                    }
                  >
                    {examDetail.schools
                      ? getExamSaveStatus(examDetail).label
                      : "未知"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    考试时间
                  </label>
                  <p>{formatTimestampToLocalDate(examDetail.created_at)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>无法获取考试详情</p>
            </div>
          )}
        </div>
      </ResponsiveDialog>
    </Card>
  );
};

export default AdminPage;
