import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authAPI } from '@/api/auth';
import { StatusAlert } from '@/components/StatusAlert';

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
      {status === 'loading' && (
        <StatusAlert variant="info" message={message} />
      )}
      {status === 'success' && (
        <StatusAlert variant="success" message={message} />
      )}
      {status === 'error' && (
        <StatusAlert variant="error" message={message} />
      )}

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
