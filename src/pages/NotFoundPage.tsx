import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = '404 - 页面未找到 - ZhiXue Lite';
    return () => {
      document.title = 'ZhiXue Lite';
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-muted-foreground">
            <AlertCircle className="h-6 w-6" />
            <span>404 - 页面未找到</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground mb-6">
            抱歉，您访问的页面不存在或已被移除。
          </p>
          <Link to="/">
            <Button className="w-full">
              <Home className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
