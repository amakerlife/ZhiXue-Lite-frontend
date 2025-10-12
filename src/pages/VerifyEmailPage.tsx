import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authAPI } from '@/api/auth';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在验证邮箱...');
  const hasVerified = useRef(false); // 防止重复请求

  const token = searchParams.get('token');

  useEffect(() => {
    document.title = '邮箱验证 - ZhiXue Lite';

    const verifyEmail = async () => {
      // 防止在 StrictMode 下重复执行
      if (hasVerified.current) return;
      hasVerified.current = true;

      if (!token) {
        setStatus('error');
        setMessage('验证令牌无效');
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || '邮箱验证成功！');
        } else {
          setStatus('error');
          setMessage(response.data.message || '验证失败，请重试');
        }
      } catch (error) {
        setStatus('error');
        const errorMessage = error instanceof Error ? error.message : '验证失败，请重试';
        setMessage(errorMessage);
      }
    };

    verifyEmail();

    return () => {
      document.title = 'ZhiXue Lite';
    };
  }, [token]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">邮箱验证</h1>
        <p className="text-muted-foreground mt-1">
          {status === 'loading' && '正在验证您的邮箱地址，请稍候...'}
          {status === 'success' && '您的邮箱已成功验证'}
          {status === 'error' && '验证过程中出现问题'}
        </p>
      </div>

      {/* Status Card */}
      <Card className={
        status === 'success' ? 'border-green-200 bg-green-50' :
        status === 'error' ? 'border-red-200 bg-red-50' :
        'border-blue-200 bg-blue-50'
      }>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {status === 'loading' && (
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              )}
              {status === 'success' && (
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              )}
              {status === 'error' && (
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${
                status === 'success' ? 'text-green-900' :
                status === 'error' ? 'text-red-900' :
                'text-blue-900'
              }`}>
                {status === 'loading' && '验证中'}
                {status === 'success' && '验证成功'}
                {status === 'error' && '验证失败'}
              </h3>
              <p className={`text-sm mt-1 ${
                status === 'success' ? 'text-green-700' :
                status === 'error' ? 'text-red-700' :
                'text-blue-700'
              }`}>
                {message}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {status === 'success' && (
        <Card>
          <CardHeader>
            <CardTitle>后续操作</CardTitle>
            <CardDescription>您现在可以使用完整功能了</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={handleGoHome}
              className="w-full"
            >
              返回首页
            </Button>
            <Button
              onClick={handleGoProfile}
              variant="outline"
              className="w-full"
            >
              查看个人资料
            </Button>
          </CardContent>
        </Card>
      )}

      {status === 'error' && (
        <Card>
          <CardHeader>
            <CardTitle>需要帮助？</CardTitle>
            <CardDescription>您可以尝试以下操作</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={handleGoProfile}
              className="w-full"
            >
              前往个人中心重新发送
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full"
            >
              返回首页
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VerifyEmailPage;
