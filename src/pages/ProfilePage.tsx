import React, { useState } from 'react';
import { User, Mail, Calendar, Shield, Link2, Unlink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/api/auth';
import { formatUTCIsoToLocal } from '@/utils/dateUtils';

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

  const handleConnectZhixue = (e: React.FormEvent) => {
    e.preventDefault();
    setConnectConfirmOpen(true);
  };

  const confirmConnectZhixue = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authAPI.connectZhixue({
        username: connectForm.username,
        password: connectForm.password,
      });
      
      if (response.data.success) {
        setSuccess('智学网账号绑定成功！');
        setConnectForm({ username: '', password: '', showForm: false });
        await refreshUser();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '绑定失败');
    } finally {
      setLoading(false);
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
      const response = await authAPI.disconnectZhixue();
      if (response.data.success) {
        setSuccess('智学网账号已解绑');
        await refreshUser();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '解绑失败');
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
              <label className="text-sm font-medium text-muted-foreground">邮箱</label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{user.email}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">角色</label>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role === 'admin' ? '管理员' : '普通用户'}
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

                  <div className="flex items-center space-x-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? '绑定中...' : '确认绑定'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConnectForm({ username: '', password: '', showForm: false })}
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