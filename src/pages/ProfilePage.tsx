import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Mail, Calendar, Shield, Link2, Unlink, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/api/auth';
import { formatUTCIsoToLocal } from '@/utils/dateUtils';
import { getUserRoleLabel, getRoleVariant } from '@/utils/permissions';
import Turnstile, { type TurnstileRef } from '@/components/ui/turnstile';

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [connectForm, setConnectForm] = useState({
    username: '',
    password: '',
    showForm: false,
  });
  const [connectConfirmOpen, setConnectConfirmOpen] = useState(false);
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const turnstileRef = useRef<TurnstileRef>(null);

  // 检查是否启用验证码
  const isTurnstileEnabled = import.meta.env.VITE_TURNSTILE_ENABLED === 'true';

  // 新增：智学网绑定信息
  const [bindingInfo, setBindingInfo] = useState<{ username: string }[]>([]);
  const [loadingBindingInfo, setLoadingBindingInfo] = useState(false);

  // 新增：修改用户信息相关状态
  const [editMode, setEditMode] = useState<'none' | 'email' | 'password'>('none');
  const [editForm, setEditForm] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    document.title = '个人中心 - ZhiXue Lite';
    return () => {
      document.title = 'ZhiXue Lite';
    };
  }, []);

  // 新增：进入个人中心时获取最新用户数据
  useEffect(() => {
    const loadLatestUserData = async () => {
      await refreshUser();
    };

    loadLatestUserData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 新增：当用户信息加载完成且有智学网账号时，加载绑定信息
  useEffect(() => {
    if (user?.zhixue_username) {
      loadBindingInfo();
    }
  }, [user?.zhixue_username]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnectZhixue = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTurnstileEnabled && !turnstileToken) {
      setError('请完成验证码验证');
      return;
    }
    setConnectConfirmOpen(true);
  };

  const confirmConnectZhixue = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authAPI.bindZhixue({
        username: connectForm.username,
        password: connectForm.password,
        turnstile_token: isTurnstileEnabled ? turnstileToken : undefined,
      });

      if (response.data.success) {
        setSuccess('智学网账号绑定成功！');
        setConnectForm({ username: '', password: '', showForm: false });
        if (isTurnstileEnabled) {
          setTurnstileToken('');
        }
        await refreshUser();
        // 绑定成功后加载绑定信息
        await loadBindingInfo();
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '绑定失败';
      setError(errorMessage);
      // 重置验证码
      if (isTurnstileEnabled) {
        setTurnstileToken('');
        turnstileRef.current?.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    setError(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken('');
    setError('验证码验证失败，请重试');
    // 自动重置验证码
    turnstileRef.current?.reset();
  }, []);

  // 新增：加载智学网账号绑定信息
  const loadBindingInfo = async () => {
    if (!user?.zhixue_username) {
      setBindingInfo([]);
      return;
    }

    setLoadingBindingInfo(true);
    try {
      const response = await authAPI.getZhixueBindingInfo();
      if (response.data.success) {
        setBindingInfo(response.data.binding_info);
      }
    } catch (err: unknown) {
      console.error('获取绑定信息失败:', err);
      // 如果获取失败，不显示错误给用户，只是不显示绑定信息
      setBindingInfo([]);
    } finally {
      setLoadingBindingInfo(false);
    }
  };

  const handleDisconnectZhixue = () => {
    setDisconnectConfirmOpen(true);
  };

  const confirmDisconnectZhixue = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authAPI.unbindZhixue();
      if (response.data.success) {
        setSuccess('智学网账号已解绑');
        await refreshUser();
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '解绑失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 新增：初始化编辑表单
  const startEdit = (type: 'email' | 'password') => {
    setError(null);
    setSuccess(null);
    setEditMode(type);
    if (type === 'email') {
      setEditForm(prev => ({ ...prev, email: user?.email || '' }));
    } else {
      setEditForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    }
  };

  // 新增：取消编辑
  const cancelEdit = () => {
    setEditMode('none');
    setEditForm({
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  // 提交修改
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('用户信息不完整');
      return;
    }

    // 验证逻辑
    if (editMode === 'email') {
      if (editForm.email === user.email) {
        setError('新邮箱与当前邮箱相同');
        return;
      }
    } else if (editMode === 'password') {
      if (editForm.newPassword !== editForm.confirmPassword) {
        setError('两次输入的新密码不一致');
        return;
      }
      if (editForm.newPassword.length < 6) {
        setError('密码长度不能少于6位');
        return;
      }
      if (!editForm.currentPassword) {
        setError('请输入当前密码');
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: { email?: string; currentPassword?: string; password?: string } = {};

      if (editMode === 'email') {
        updateData.email = editForm.email;
      } else if (editMode === 'password') {
        updateData.currentPassword = editForm.currentPassword;
        updateData.password = editForm.newPassword;
      }

      const response = await authAPI.updateCurrentUser(updateData);
      
      if (response.data.success) {
        setSuccess(editMode === 'email' ? '邮箱修改成功' : '密码修改成功');
        setEditMode('none');
        setEditForm({
          email: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        await refreshUser();
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '修改失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">请先登录</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">个人中心</h1>
        <p className="text-muted-foreground mt-1">
          管理您的账号信息和设置
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-800">{success}</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>账号信息</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">用户名</label>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{user.username}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="user-email" className="text-sm font-medium text-muted-foreground">邮箱</label>
              {editMode === 'email' ? (
                <form onSubmit={handleUpdateUser} className="space-y-3">
                  <Input
                    id="user-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="请输入新邮箱"
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <Button 
                      type="submit" 
                      size="sm" 
                      disabled={loading}
                    >
                      {loading ? '保存中...' : '保存'}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                      取消
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => startEdit('email')}>
                    修改
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="user-password" className="text-sm font-medium text-muted-foreground">密码</label>
              {editMode === 'password' ? (
                <form onSubmit={handleUpdateUser} className="space-y-3">
                  <Input
                    id="current-password"
                    type="password"
                    value={editForm.currentPassword}
                    onChange={(e) => setEditForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="请输入当前密码"
                    required
                  />
                  <Input
                    id="new-password"
                    type="password"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="请输入新密码"
                    required
                  />
                  <Input
                    id="confirm-password"
                    type="password"
                    value={editForm.confirmPassword}
                    onChange={(e) => setEditForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="请确认新密码"
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <Button 
                      type="submit" 
                      size="sm" 
                      disabled={loading}
                    >
                      {loading ? '保存中...' : '保存'}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                      取消
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">••••••••</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => startEdit('password')}>
                    修改
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">角色</label>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Badge variant={getRoleVariant(user.role)}>
                  {getUserRoleLabel(user.role)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">最后登录</label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {user.last_login ? formatUTCIsoToLocal(user.last_login) : '从未登录'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ZhiXue Account Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link2 className="h-5 w-5" />
            <span>智学网账号</span>
          </CardTitle>
          <CardDescription>
            绑定智学网账号以查看考试数据和成绩信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.zhixue_username ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">已绑定智学网账号</p>
                    <p className="text-sm text-green-700 mt-1">
                      用户名: {user.zhixue_username} |
                      姓名: {user.zhixue_realname} |
                      学校: {user.zhixue_school}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnectZhixue}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    解绑
                  </Button>
                </div>
              </div>

              {/* 显示绑定信息 - 根据绑定用户数量调整显示 */}
              <div className={`rounded-md p-4 border ${
                bindingInfo.length <= 1
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${
                    bindingInfo.length <= 1 ? 'text-green-900' : 'text-yellow-900'
                  }`}>账号绑定情况</h4>
                  {loadingBindingInfo && (
                    <RefreshCw className={`h-4 w-4 animate-spin ${
                      bindingInfo.length <= 1 ? 'text-green-600' : 'text-yellow-600'
                    }`} />
                  )}
                </div>

                {bindingInfo.length <= 1 ? (
                  // 只有当前用户绑定，显示安全信息
                  <div className="space-y-2">
                    <p className="text-sm text-green-700">
                      仅该账号绑定了此智学网账号，数据安全
                    </p>
                  </div>
                ) : (
                  // 多个用户绑定，显示警告信息和用户列表
                  <div className="space-y-2">
                    <p className="text-sm text-yellow-800 font-medium">
                      此智学网账号已被 {bindingInfo.length} 个用户绑定：
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {bindingInfo.map((info) => (
                        <Badge
                          key={info.username}
                          variant="outline"
                          className="text-yellow-800 border-yellow-400 bg-yellow-100"
                        >
                          {info.username}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-yellow-700 mt-2">
                      请确保知悉以上信息，如有疑问请联系管理员。
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-yellow-800">
                  您还未绑定智学网账号，绑定后可以查看考试数据和成绩信息。
                </p>
              </div>

              {!connectForm.showForm ? (
                <Button
                  onClick={() => {
                    setError(null);
                    setSuccess(null);
                    setConnectForm(prev => ({ ...prev, showForm: true }));
                    // 重置验证码状态
                    if (isTurnstileEnabled) {
                      setTurnstileToken('');
                      setTimeout(() => turnstileRef.current?.reset(), 100);
                    }
                  }}
                  className="w-full md:w-auto"
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  绑定智学网账号
                </Button>
              ) : (
                <form onSubmit={handleConnectZhixue} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="zhixue-username" className="text-sm font-medium">
                      智学网用户名
                    </label>
                    <Input
                      id="zhixue-username"
                      type="text"
                      value={connectForm.username}
                      onChange={(e) => setConnectForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="请输入智学网用户名"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="zhixue-password" className="text-sm font-medium">
                      智学网密码
                    </label>
                    <Input
                      id="zhixue-password"
                      type="password"
                      value={connectForm.password}
                      onChange={(e) => setConnectForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="请输入智学网密码"
                      disabled={loading}
                      required
                    />
                  </div>

                  {isTurnstileEnabled && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        安全验证
                      </label>
                      <Turnstile
                        ref={turnstileRef}
                        siteKey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                        onVerify={handleTurnstileVerify}
                        onError={handleTurnstileError}
                        theme="auto"
                        className="w-full"
                        enabled={isTurnstileEnabled}
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? '绑定中...' : '确认绑定'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setConnectForm({ username: '', password: '', showForm: false });
                        if (isTurnstileEnabled) {
                          setTurnstileToken('');
                          turnstileRef.current?.reset();
                        }
                      }}
                      disabled={loading}
                    >
                      取消
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={connectConfirmOpen}
        onOpenChange={setConnectConfirmOpen}
        title="确认绑定智学网账号"
        description="绑定智学网账号可能需要一些时间，确定要继续吗？"
        confirmText="确认绑定"
        cancelText="取消"
        variant="default"
        onConfirm={confirmConnectZhixue}
      />

      <ConfirmDialog
        open={disconnectConfirmOpen}
        onOpenChange={setDisconnectConfirmOpen}
        title="确认解绑智学网账号"
        description="确定要解绑智学网账号吗？解绑后将无法查看考试数据。"
        confirmText="确认解绑"
        cancelText="取消"
        variant="destructive"
        onConfirm={confirmDisconnectZhixue}
      />
    </div>
  );
};

export default ProfilePage;