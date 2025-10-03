import React from 'react';
import type { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useSidebar } from '@/contexts/SidebarContext';
import { usePageTracking } from '@/hooks/usePageTracking';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isOpen, isMobile, close } = useSidebar();
  const { user } = useAuth();
  const [showBanner, setShowBanner] = React.useState(true);

  // 启用页面追踪
  usePageTracking();

  // 不显示侧边栏的页面
  const noSidebarPages = ['/login', '/signup'];
  const showSidebar = !noSidebarPages.includes(location.pathname);

  // 检查是否需要显示未绑定账号提醒
  const shouldShowBanner = showSidebar && user && !user.zhixue_username && showBanner;

  return (
    <div className="min-h-screen flex flex-col bg-background pt-16"> {/* 为固定Header留出空间 */}
      <div className="relative flex flex-1">
        {showSidebar && <Sidebar />}

        {/* 移动端遮罩层 */}
        {showSidebar && isOpen && isMobile && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={close}
            style={{ top: '4rem' }} // Header高度
          />
        )}

        <main className={`flex-1 transition-all duration-200 ${
          showSidebar && isOpen && !isMobile
            ? 'ml-64'
            : ''
        }`}>
          {/* 未绑定账号提醒横幅 */}
          {shouldShowBanner && (
            <div className="bg-amber-50 border-b border-amber-200">
              <div className="container mx-auto p-3 max-w-7xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900">
                        您还未绑定智学网账号
                      </p>
                      <p className="text-xs text-amber-700">
                        绑定后可使用完整功能，包括查看考试成绩、同步数据等
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link to="/profile#zhixue-binding">
                      <Button size="sm" variant="outline" className="text-amber-900 border-amber-300 hover:bg-amber-100">
                        立即绑定
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowBanner(false)}
                      className="text-amber-600 hover:text-amber-900 hover:bg-amber-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            className="container mx-auto p-4 md:p-6 max-w-7xl flex flex-col min-h-[calc(100vh-8rem)]"
          >
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;