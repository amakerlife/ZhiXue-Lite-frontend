import React, { useState, useEffect } from 'react';
import { Users, School, GraduationCap, UserCheck, FileText, Search, RefreshCw, Edit, Save, X, Eye, Unlink, RotateCcw, ChevronDown, ChevronRight, Trash, HardDriveIcon, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination } from '@/components/Pagination';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/api/admin';
import { examAPI } from '@/api/exam';
import { formatUTCIsoToLocal, formatTimestampToLocalDate } from '@/utils/dateUtils';
import { canManageSystem, getUserRoleLabel, getRoleVariant, PermissionLevel, PERMISSION_DESCRIPTIONS, PERMISSION_LEVEL_DESCRIPTIONS } from '@/utils/permissions';
import { trackAnalyticsEvent } from '@/utils/analytics';
import { StatusAlert } from '@/components/StatusAlert';
import { CopyableText } from '@/components/CopyableText';
import type { AdminUser, School as SchoolType, ZhiXueAccount, Teacher, AdminExam } from '@/api/admin';
import type { Exam } from '@/types/api';

// 学校显示组件 - 支持单学校和多学校场景
const SchoolsDisplay: React.FC<{ schools: Array<{ school_name?: string }> }> = ({ schools }) => {
  if (schools.length === 0) {
    return <span className="text-muted-foreground">未知</span>;
  }

  if (schools.length === 1) {
    return <span>{schools[0].school_name || '未知'}</span>;
  }

  // 多学校：显示"XX 中学等 N 所学校"，使用 title 属性显示完整列表
  const firstSchool = schools[0].school_name || '未知';
  const allSchoolNames = schools.map(s => s.school_name || '未知').join('、');

  return (
    <span
      className="cursor-help"
      title={allSchoolNames}
    >
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

  // 清除缓存函数
  const handleClearCache = async () => {
    setClearingCache(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await adminAPI.clearCache();
      if (response.data.success) {
        setSuccess('缓存已成功清除');
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '清除缓存失败';
      setError(errorMessage);
    } finally {
      setClearingCache(false);
    }
  };

  useEffect(() => {
    document.title = '管理面板 - ZhiXue Lite';
    return () => {
      document.title = 'ZhiXue Lite';
    };
  }, []);

  // 如果不是管理员，显示权限不足
  if (!canManageSystem(user)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">权限不足</CardTitle>
            <CardDescription>
              您需要管理员权限才能访问此页面
            </CardDescription>
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
          <p className="text-muted-foreground mt-1">
            系统管理和数据维护
          </p>
        </div>
        <Button
          onClick={handleClearCache}
          disabled={clearingCache}
          variant="outline"
          className="flex items-center space-x-2"
        >
          {clearingCache ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <HardDriveIcon className="h-4 w-4" />
          )}
          <span>{clearingCache ? '清除中...' : '清除缓存'}</span>
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <StatusAlert variant="success" message={success} className="text-sm" />}
      {error && <StatusAlert variant="error" message={error} className="text-sm" />}

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 xl:grid-cols-5 h-auto xl:h-9 p-1 gap-1 xl:gap-0">
          <TabsTrigger value="users" className="flex items-center space-x-2 w-full">
            <Users className="h-4 w-4" />
            <span>用户管理</span>
          </TabsTrigger>
          <TabsTrigger value="schools" className="flex items-center space-x-2 w-full">
            <School className="h-4 w-4" />
            <span>学校管理</span>
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center space-x-2 w-full">
            <GraduationCap className="h-4 w-4" />
            <span>教师管理</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center space-x-2 w-full">
            <UserCheck className="h-4 w-4" />
            <span>学生管理</span>
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center space-x-2 w-full">
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
    </div>
  );
};

// 用户管理组件
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 新增：学校列表
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  // 新增：编辑状态管理
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    email: string;
    role: 'admin' | 'user' | '';
    is_active: boolean;
    manual_school_id: string | null;  // 新增：手动分配学校
  }>({
    email: '',
    role: '',
    is_active: true,
    manual_school_id: null,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 新增：权限编辑相关状态
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<AdminUser | null>(null);
  const [permissionForm, setPermissionForm] = useState<Record<number, number>>({});
  const [permissionLoading, setPermissionLoading] = useState(false);

  // 新增：重置密码相关状态
  const [resettingPassword, setResettingPassword] = useState<number | null>(null);
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null
  });
  const [newPassword, setNewPassword] = useState('');

  // 新增：智学网信息展开状态
  const [expandedZhixueInfo, setExpandedZhixueInfo] = useState<Set<number>>(new Set());

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.listUsers({ page, per_page: 10, query: search });
      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  // 新增：加载学校列表
  const loadSchools = async () => {
    try {
      setLoadingSchools(true);
      const response = await adminAPI.listSchools({ per_page: 1000 });  // 加载所有学校
      if (response.data.success) {
        setSchools(response.data.schools);
      }
    } catch (error) {
      console.error('Failed to load schools:', error);
    } finally {
      setLoadingSchools(false);
    }
  };

  // 新增：开始编辑用户
  const startEditUser = (user: AdminUser) => {
    setError(null);
    setSuccess(null);
    setEditingUser(user.id);

    // 推导 manual_school_id：如果有手动分配的学校，从 zhixue_info.school_id 获取
    const manualSchoolId = user.is_manual_school && !user.zhixue_info?.username
      ? user.zhixue_info?.school_id || null
      : null;

    setEditForm({
      email: user.email,
      role: user.role as 'admin' | 'user',
      is_active: user.is_active,
      manual_school_id: manualSchoolId,
    });
  };

  // 新增：取消编辑
  const cancelEditUser = () => {
    setEditingUser(null);
    setEditForm({
      email: '',
      role: '',
      is_active: true,
      manual_school_id: null,
    });
  };

  // 新增：权限编辑相关函数
  const openPermissionDialog = (user: AdminUser) => {
    setEditingPermissionsUser(user);
    setPermissionDialogOpen(true);
    setError(null);
    setSuccess(null);

    // 初始化权限表单
    const initialPermissions: Record<number, number> = {};
    const permissions = user.permissions || '10110'; // 默认权限

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
        .map(key => permissionForm[parseInt(key)].toString())
        .join('');

      const response = await adminAPI.updateUser(editingPermissionsUser.id, {
        permissions: permissionsString
      });

      if (response.data.success) {
        setSuccess('权限已更新');
        closePermissionDialog();
        await loadUsers(); // 重新加载用户列表
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '更新权限失败';
      setError(errorMessage);
    } finally {
      setPermissionLoading(false);
    }
  };

  const updatePermission = (permissionType: number, level: number) => {
    setPermissionForm(prev => ({
      ...prev,
      [permissionType]: level
    }));
  };

  // 新增：保存用户修改
  const saveUserEdit = async (userId: number) => {
    const targetUser = users.find(u => u.id === userId);

    // 验证：已绑定智学网账号的用户不能手动分配学校
    if (targetUser?.zhixue_info?.username && editForm.manual_school_id) {
      setError('该用户已绑定智学网账号，无法手动分配学校');
      return;
    }

    setEditLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: {
        email: string;
        role?: 'admin' | 'user';
        is_active: boolean;
        manual_school_id?: string | null;
      } = {
        email: editForm.email,
        is_active: editForm.is_active,
        manual_school_id: editForm.manual_school_id,
      };

      if (editForm.role !== '') {
        updateData.role = editForm.role;
      }

      const response = await adminAPI.updateUser(userId, updateData);
      if (response.data.success) {
        setSuccess('用户信息已更新');
        setEditingUser(null);
        await loadUsers(); // 重新加载用户列表
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '更新失败';
      setError(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  // 新增：重置密码相关函数
  const openResetPasswordDialog = (user: AdminUser) => {
    setResetPasswordDialog({ open: true, user });
    setNewPassword('');
  };

  const closeResetPasswordDialog = () => {
    setResetPasswordDialog({ open: false, user: null });
    setNewPassword('');
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const resetUserPassword = async () => {
    if (!resetPasswordDialog.user || !newPassword || !resetPasswordDialog.user.id) return;

    setResettingPassword(resetPasswordDialog.user.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await adminAPI.updateUser(resetPasswordDialog.user.id, { password: newPassword });
      if (response.data.success) {
        setSuccess(`用户 ${resetPasswordDialog.user.username} 的密码已重置`);
        closeResetPasswordDialog();
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '重置密码失败';
      setError(errorMessage);
    } finally {
      setResettingPassword(null);
    }
  };

  // 新增：切换智学网信息展开状态
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
    loadUsers();
  }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  // 新增：加载学校列表
  useEffect(() => {
    loadSchools();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardHeader>
        <CardTitle>用户管理</CardTitle>
        <CardDescription>
          管理系统用户账号和权限
        </CardDescription>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户名..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={loadUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Success/Error Messages */}
        {success && <StatusAlert variant="success" message={success} className="mb-4 text-sm" />}
        {error && <StatusAlert variant="error" message={error} className="mb-4 text-sm" />}

        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
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
                    <TableCell className="font-medium">{user.username}</TableCell>

                    {/* 邮箱 - 可编辑 */}
                    <TableCell>
                      {editingUser === user.id ? (
                        <Input
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full"
                        />
                      ) : (
                        user.email
                      )}
                    </TableCell>

                    {/* 角色 - 可编辑 */}
                    <TableCell>
                      {editingUser === user.id ? (
                        <Select
                          value={editForm.role}
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value as 'admin' | 'user' | '' }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">普通用户</SelectItem>
                            <SelectItem value="admin">管理员</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={getRoleVariant(user.role)}>
                          {getUserRoleLabel(user.role)}
                        </Badge>
                      )}
                    </TableCell>

                    {/* 状态 - 可编辑 */}
                    <TableCell>
                      {editingUser === user.id ? (
                        <Select
                          value={editForm.is_active.toString()}
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, is_active: value === 'true' }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">可用</SelectItem>
                            <SelectItem value="false">禁用</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={user.is_active ? 'default' : 'destructive'}>
                          {user.is_active ? '可用' : '禁用'}
                        </Badge>
                      )}
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
                              <div>姓名: {user.zhixue_info.realname || '-'}</div>
                              <div>学校: {user.zhixue_info.school_name || '-'}</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">未绑定</span>
                      )}
                    </TableCell>

                    {/* 手动分配学校 - 可编辑 */}
                    <TableCell>
                      {editingUser === user.id ? (
                        <Select
                          value={editForm.manual_school_id || 'none'}
                          onValueChange={(value) => setEditForm(prev => ({
                            ...prev,
                            manual_school_id: value === 'none' ? null : value
                          }))}
                          disabled={!!user.zhixue_info?.username || loadingSchools}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={loadingSchools ? "加载中..." : "选择学校"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">不分配</SelectItem>
                            {schools.map(school => (
                              <SelectItem key={school.id} value={school.id}>
                                {school.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="space-y-1">
                          {user.is_manual_school ? (
                            <Badge variant="secondary" className="text-xs">
                              {user.zhixue_info?.school_name || '未知学校'}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">未分配</span>
                          )}
                          {user.zhixue_info?.username && user.is_manual_school && (
                            <p className="text-xs text-orange-600">
                              已绑定智学网，无法修改
                            </p>
                          )}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>{formatUTCIsoToLocal(user.created_at)}</TableCell>
                    <TableCell>
                      {user.last_login ? formatUTCIsoToLocal(user.last_login) : '从未登录'}
                    </TableCell>

                    {/* 登录IP */}
                    <TableCell>
                      <span className="font-mono text-xs">
                        {user.last_login_ip || <span className="text-muted-foreground">-</span>}
                      </span>
                    </TableCell>

                    {/* 操作按钮 */}
                    <TableCell>
                      {editingUser === user.id ? (
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            onClick={() => saveUserEdit(user.id)}
                            disabled={editLoading}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            {editLoading ? '保存中...' : '保存'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEditUser}
                            disabled={editLoading}
                          >
                            <X className="h-3 w-3 mr-1" />
                            取消
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditUser(user)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            编辑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPermissionDialog(user)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Lock className="h-3 w-3 mr-1" />
                            权限
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openResetPasswordDialog(user)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            重置密码
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>

            {/* 分页 */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              showPageNumbers={false}
            />
          </div>
        )}
      </CardContent>

      {/* 新增：重置密码对话框 */}
      <Dialog open={resetPasswordDialog.open} onOpenChange={closeResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重置用户密码</DialogTitle>
            <DialogDescription>
              为用户 "{resetPasswordDialog.user?.username}" 设置新密码
            </DialogDescription>
          </DialogHeader>

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

            <div className="flex items-center space-x-2 pt-4">
              <Button
                onClick={resetUserPassword}
                disabled={!newPassword || resettingPassword === resetPasswordDialog.user?.id}
              >
                {resettingPassword === resetPasswordDialog.user?.id ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                {resettingPassword === resetPasswordDialog.user?.id ? '重置中...' : '重置密码'}
              </Button>
              <Button variant="outline" onClick={closeResetPasswordDialog}>
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 权限编辑对话框 */}
      <Dialog open={permissionDialogOpen} onOpenChange={closePermissionDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>编辑用户权限</DialogTitle>
            <DialogDescription>
              为用户 "{editingPermissionsUser?.username}" 设置权限
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
            {/* Success/Error Messages */}
            {success && <StatusAlert variant="success" message={success} className="text-sm" />}
            {error && <StatusAlert variant="error" message={error} className="text-sm" />}

            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted/50 rounded-md">
                <p><strong>权限级别说明：</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>禁止 (0):</strong> 完全禁止访问</li>
                  <li><strong>个人 (1):</strong> 只能访问自己的数据</li>
                  <li><strong>校内 (2):</strong> 可访问同校数据</li>
                  <li><strong>全局 (3):</strong> 可访问所有数据</li>
                </ul>
              </div>

              <div className="space-y-3">
                {Object.entries(PERMISSION_DESCRIPTIONS).map(([typeStr, description]) => {
                  const permissionType = parseInt(typeStr, 10);
                  const currentLevel = permissionForm[permissionType] || 0;

                  return (
                    <div key={permissionType} className="p-4 border rounded-md">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-sm md:text-base">
                          {description.action} {description.object}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {PERMISSION_LEVEL_DESCRIPTIONS[currentLevel as PermissionLevel]}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(PERMISSION_LEVEL_DESCRIPTIONS).map(([levelStr, levelDescription]) => {
                          const level = parseInt(levelStr, 10);
                          const isSelected = currentLevel === level;

                          return (
                            <Button
                              key={level}
                              variant={isSelected ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updatePermission(permissionType, level)}
                              className={`text-xs ${
                                level === 0 ? 'hover:bg-red-100 hover:text-red-800' :
                                level === 1 ? 'hover:bg-blue-100 hover:text-blue-800' :
                                level === 2 ? 'hover:bg-yellow-100 hover:text-yellow-800' :
                                'hover:bg-green-100 hover:text-green-800'
                              }`}
                            >
                              {levelDescription}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-4 border-t mt-4">
            <Button
              onClick={savePermissions}
              disabled={permissionLoading}
            >
              {permissionLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {permissionLoading ? '保存中...' : '保存权限'}
            </Button>
            <Button variant="outline" onClick={closePermissionDialog}>
              取消
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// 学校管理组件
const SchoolManagement: React.FC = () => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.listSchools({ page, per_page: 10, query: search });
      if (response.data.success) {
        setSchools(response.data.schools);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to load schools:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardHeader>
        <CardTitle>学校管理</CardTitle>
        <CardDescription>
          管理系统中的学校信息
        </CardDescription>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索学校名称或 ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={loadSchools} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
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
                    <TableCell className="font-medium">{school.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 分页 */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
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
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 添加教师状态
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    username: '',
    password: '',
    login_method: 'changyan',
  });
  const [addLoading, setAddLoading] = useState(false);

  // 编辑教师状态
  const [editingTeacher, setEditingTeacher] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    password: '',
    login_method: 'changyan',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [originalLoginMethod, setOriginalLoginMethod] = useState<string>('changyan');

  // 删除教师状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<{ open: boolean; teacher: Teacher | null }>({
    open: false,
    teacher: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 消息状态
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.listTeachers({ page, per_page: 10, query: search });
      if (response.data.success) {
        setTeachers(response.data.teachers);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to load teachers:', error);
      setError('加载教师列表失败');
    } finally {
      setLoading(false);
    }
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
        setSuccess('教师账号添加成功');
        setAddDialogOpen(false);
        setAddForm({ username: '', password: '', login_method: 'changyan' });
        await loadTeachers();
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '添加教师失败';
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
      password: '',
      login_method: teacher.login_method, // 使用当前的登录方式作为默认值
    });
    // 保存原始登录方式用于比较
    setOriginalLoginMethod(teacher.login_method);
  };

  // 取消编辑
  const cancelEditTeacher = () => {
    setEditingTeacher(null);
    setEditForm({ password: '', login_method: 'changyan' });
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
        setSuccess('教师信息已更新');
        setEditingTeacher(null);
        await loadTeachers();
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '更新失败';
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
      const response = await adminAPI.deleteTeacher(deleteDialogOpen.teacher.username);
      if (response.data.success) {
        setSuccess(`教师 ${deleteDialogOpen.teacher.username} 已删除`);
        closeDeleteDialog();
        await loadTeachers();
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '删除失败';
      setError(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardHeader>
        <CardTitle>教师管理</CardTitle>
        <CardDescription>
          管理智学网教师账号
        </CardDescription>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索教师用户名或学校..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => {
              setError(null);
              setSuccess(null);
              setAddDialogOpen(true);
            }}
            size="sm"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            添加教师
          </Button>
          <Button onClick={loadTeachers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Success/Error Messages */}
        {success && <StatusAlert variant="success" message={success} className="mb-4 text-sm" />}
        {error && <StatusAlert variant="error" message={error} className="mb-4 text-sm" />}

        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
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
                      <TableCell className="font-medium">{teacher.username}</TableCell>
                      <TableCell>{teacher.realname}</TableCell>
                      <TableCell>{teacher.school_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {teacher.login_method === 'changyan' ? '畅言' : teacher.login_method === 'zhixue' ? '智学' : teacher.login_method}
                        </Badge>
                      </TableCell>
                    <TableCell>
                      {editingTeacher === teacher.username ? (
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            onClick={() => saveTeacherEdit(teacher.username)}
                            disabled={editLoading}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            {editLoading ? '保存中...' : '保存'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEditTeacher}
                            disabled={editLoading}
                          >
                            <X className="h-3 w-3 mr-1" />
                            取消
                          </Button>
                        </div>
                      ) : (
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
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>

            {/* 编辑表单 */}
            {editingTeacher && (
              <div className="bg-muted/50 p-4 rounded-md">
                <h4 className="font-medium mb-3">编辑教师: {editingTeacher}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="edit-password" className="text-sm font-medium">
                      新密码（留空则不修改）
                    </label>
                    <Input
                      id="edit-password"
                      type="password"
                      value={editForm.password}
                      onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="输入新密码"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-login-method" className="text-sm font-medium">
                      登录方式
                    </label>
                    <Select
                      value={editForm.login_method}
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, login_method: value }))}
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
              </div>
            )}

            {/* 分页 */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              showPageNumbers={false}
            />
          </div>
        )}
      </CardContent>

      {/* 添加教师对话框 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加教师账号</DialogTitle>
            <DialogDescription>
              添加智学网教师账号到系统中
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddTeacher} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="add-username" className="text-sm font-medium">
                智学网用户名
              </label>
              <Input
                id="add-username"
                type="text"
                value={addForm.username}
                onChange={(e) => setAddForm(prev => ({ ...prev, username: e.target.value }))}
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
                onChange={(e) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
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
                onValueChange={(value) => setAddForm(prev => ({ ...prev, login_method: value }))}
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

            <div className="flex items-center space-x-2 pt-4">
              <Button type="submit" disabled={addLoading}>
                {addLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <GraduationCap className="h-4 w-4 mr-2" />
                )}
                {addLoading ? '添加中...' : '添加教师'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                取消
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen.open} onOpenChange={closeDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除教师</DialogTitle>
            <DialogDescription>
              确定要删除教师 "{deleteDialogOpen.teacher?.username}" 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2 pt-4">
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
              {deleteLoading ? '删除中...' : '确认删除'}
            </Button>
            <Button variant="outline" onClick={closeDeleteDialog}>
              取消
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// 学生管理组件
const StudentManagement: React.FC = () => {
  const { user } = useAuth(); // 添加当前用户信息
  const [students, setStudents] = useState<ZhiXueAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 新增：绑定用户管理相关状态
  const [selectedStudent, setSelectedStudent] = useState<ZhiXueAccount | null>(null);
  const [bindingUsers, setBindingUsers] = useState<{ username: string }[]>([]);
  const [bindingDialogOpen, setBindingDialogOpen] = useState(false);
  const [loadingBindings, setLoadingBindings] = useState(false);
  const [unbindingUser, setUnbindingUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.listZhiXueAccounts({ page, per_page: 10, query: search });
      if (response.data.success) {
        setStudents(response.data.zhixue_accounts);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  // 新增：查看智学网账号绑定的用户
  const viewBindingUsers = async (student: ZhiXueAccount) => {
    setSelectedStudent(student);
    setLoadingBindings(true);
    setBindingDialogOpen(true);
    setError(null);

    try {
      const response = await adminAPI.getZhixueAccountBindings(student.username);
      if (response.data.success) {
        setBindingUsers(response.data.binding_info.users);
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '获取绑定用户失败';
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
      const response = await adminAPI.unbindUserFromZhixueAccount(selectedStudent.username, username);
      if (response.data.success) {
        setSuccess(`已成功解绑用户 ${username}`);

        trackAnalyticsEvent('admin_unbind_user_success', {
          admin_username: user?.username,
          target_username: username,
          zhixue_username: selectedStudent.username
        });

        // 重新加载绑定用户列表
        await viewBindingUsers(selectedStudent);
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '解绑失败';
      setError(errorMessage);

      trackAnalyticsEvent('admin_unbind_user_failed', {
        admin_username: user?.username,
        target_username: username,
        zhixue_username: selectedStudent?.username,
        error_message: errorMessage
      });
    } finally {
      setUnbindingUser(null);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardHeader>
        <CardTitle>学生管理</CardTitle>
        <CardDescription>
          管理智学网学生账号
        </CardDescription>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索学生用户名..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={loadStudents} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
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
            <div className="overflow-x-auto">
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
                      <TableCell className="font-medium">{student.username}</TableCell>
                      <TableCell>{student.realname}</TableCell>
                      <TableCell>{student.school_name || '未知'}</TableCell>
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

            {/* 分页 */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              showPageNumbers={false}
            />
          </div>
        )}
      </CardContent>

      {/* 新增：绑定用户管理对话框 */}
      <Dialog open={bindingDialogOpen} onOpenChange={setBindingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>智学网账号绑定管理</DialogTitle>
            <DialogDescription>
              账号: {selectedStudent?.username} ({selectedStudent?.realname})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Success/Error Messages */}
            {success && <StatusAlert variant="success" message={success} className="text-sm" />}
            {error && <StatusAlert variant="error" message={error} className="text-sm" />}

            {loadingBindings ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">加载绑定用户中...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">绑定用户列表</h4>
                  <Badge variant="outline">
                    {bindingUsers.length} 个用户
                  </Badge>
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
                          {unbindingUser === user.username ? '解绑中...' : '解绑'}
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
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// 考试管理组件
const ExamManagement: React.FC = () => {
  const [exams, setExams] = useState<AdminExam[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 成绩单生成状态
  const [generatingScoresheet, setGeneratingScoresheet] = useState<string | null>(null);

  // 考试详情状态
  const [examDetailDialog, setExamDetailDialog] = useState<{ open: boolean; exam: AdminExam | null }>({
    open: false,
    exam: null,
  });
  const [examDetail, setExamDetail] = useState<Exam | null>(null);
  const [loadingExamDetail, setLoadingExamDetail] = useState(false);

  // 消息状态
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 辅助函数：获取考试的数据保存状态
  const getExamSaveStatus = (exam: AdminExam | Exam): { status: 'all' | 'partial' | 'none'; variant: 'default' | 'secondary' | 'outline'; label: string; title?: string } => {
    if (!exam.schools || exam.schools.length === 0) {
      return { status: 'none', variant: 'secondary', label: '未知' };
    }

    const savedSchools = exam.schools.filter(s => s.is_saved);
    const savedCount = savedSchools.length;
    const totalCount = exam.schools.length;

    if (savedCount === 0) {
      return { status: 'none', variant: 'secondary', label: '未保存' };
    } else if (savedCount === totalCount) {
      return { status: 'all', variant: 'default', label: '已保存' };
    } else {
      const savedNames = savedSchools.map(s => s.school_name || '未知').join('、');
      return {
        status: 'partial',
        variant: 'outline',
        label: `部分保存 (${savedCount}/${totalCount})`,
        title: `已保存：${savedNames}`
      };
    }
  };

  // 辅助函数：检查是否有任何学校已保存数据
  const hasAnySavedData = (exam: AdminExam): boolean => {
    return exam.schools.some(s => s.is_saved);
  };

  const loadExams = async () => {
    try {
      setLoading(true);
      // 使用管理员专用的考试列表API
      const response = await adminAPI.listExams({ page, per_page: 10, query: search });
      if (response.data.success) {
        setExams(response.data.exams);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to load exams:', error);
      setError('加载考试列表失败');
    } finally {
      setLoading(false);
    }
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
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '获取考试详情失败';
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
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${examName}_成绩单.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setSuccess(`${examName} 成绩单下载成功`);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '生成成绩单失败';
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

  // 分页处理函数
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadExams();
  };

  useEffect(() => {
    loadExams();
  }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardHeader>
        <CardTitle>考试管理</CardTitle>
        <CardDescription>
          管理系统中的考试数据和成绩单生成
        </CardDescription>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索考试名称或 ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={loadExams} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Success/Error Messages */}
        {success && <StatusAlert variant="success" message={success} className="mb-4 text-sm" />}
        {error && <StatusAlert variant="error" message={error} className="mb-4 text-sm" />}

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
            <div className="overflow-x-auto">
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
                      <TableCell><SchoolsDisplay schools={exam.schools} /></TableCell>
                      <TableCell>{formatTimestampToLocalDate(exam.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={getExamSaveStatus(exam).variant} title={getExamSaveStatus(exam).title}>
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
                            onClick={() => generateScoresheet(exam.id, exam.name)}
                            disabled={generatingScoresheet === exam.id}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {generatingScoresheet === exam.id ? (
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <FileText className="h-3 w-3 mr-1" />
                            )}
                            {generatingScoresheet === exam.id ? '生成中...' : '成绩单'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
      <Dialog open={examDetailDialog.open} onOpenChange={closeExamDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>考试详情</DialogTitle>
            <DialogDescription>
              考试: {examDetailDialog.exam?.name}
            </DialogDescription>
          </DialogHeader>

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
                    <label className="text-sm font-medium text-muted-foreground">考试 ID</label>
                    <p className="font-mono text-sm">
                      <CopyableText text={examDetail.id} />
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">考试名称</label>
                    <p className="font-medium">{examDetail.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">参与学校</label>
                    <p className="font-medium">
                      {examDetail.schools && examDetail.schools.length > 0 ? (
                        <SchoolsDisplay schools={examDetail.schools} />
                      ) : (
                        <span className="text-muted-foreground">未知</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">考试类型</label>
                    <Badge variant={examDetail.is_multi_school ? 'default' : 'secondary'}>
                      {examDetail.is_multi_school ? '联考' : '单校考试'}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">学校 ID</label>
                    <p className="font-mono text-sm break-all">
                      {examDetail.schools && examDetail.schools.length > 0 ? (
                        <CopyableText text={examDetail.schools.map(s => s.school_id).join('、')} />
                      ) : (
                        '未知'
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">数据状态</label>
                    <Badge variant={examDetail.schools && getExamSaveStatus(examDetail).variant} title={examDetail.schools ? getExamSaveStatus(examDetail).title : undefined}>
                      {examDetail.schools ? getExamSaveStatus(examDetail).label : '未知'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">考试时间</label>
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
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminPage;