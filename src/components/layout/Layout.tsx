import React from 'react';
import type { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AlertCircle, X, ShieldAlert, LogOut, Mail } from 'lucide-react';
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
  const { user, isSuMode, exitSu } = useAuth();
  const [showBanner, setShowBanner] = React.useState(true);
  const [showEmailBanner, setShowEmailBanner] = React.useState(true);
  const [exitingSu, setExitingSu] = React.useState(false);

  // 启用页面追踪
  usePageTracking();

  // 不显示侧边栏的页面
  const noSidebarPages = ['/login', '/signup'];
  const showSidebar = !noSidebarPages.includes(location.pathname);

  // 检查是否需要显示未绑定账号提醒
  const shouldShowBanner = showSidebar && user && !user.zhixue_info?.username && !user.is_manual_school && showBanner && !isSuMode;

  // 检查是否需要显示邮箱未验证提醒
  const shouldShowEmailBanner = showSidebar && user && !user.email_verified && showEmailBanner && !isSuMode;

  // 处理退出 su 模式
  const handleExitSu = async () => {
    setExitingSu(true);
    try {
      await exitSu();
    } catch (error) {
      console.error('Exit su failed:', error);
      alert(error instanceof Error ? error.message : '退出 su 模式失败');
    } finally {
      setExitingSu(false);
    }
  };

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
          {/* Su 模式提示横幅 */}
          {isSuMode && user && (
            <div className="bg-orange-50 border-b border-orange-200">
              <div className="container mx-auto p-3 max-w-7xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ShieldAlert className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-900">
                        {user.su_info?.original_user_username ? (
                          <>
                            您（管理员 <span className="font-bold">{user.su_info.original_user_username}</span>）正在以 <span className="font-bold">{user.username}</span> 的身份浏览
                          </>
                        ) : (
                          <>
                            您正在以 <span className="font-bold">{user.username}</span> 的身份浏览
                          </>
                        )}
                      </p>
                      <p className="text-xs text-orange-700">
                        您当前处于 su 模式，请谨慎操作
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExitSu}
                    disabled={exitingSu}
                    className="text-orange-900 border-orange-300 hover:bg-orange-100 flex items-center space-x-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{exitingSu ? '退出中...' : '退出 su 模式'}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 邮箱未验证提醒横幅 */}
          {shouldShowEmailBanner && (
            <div className="bg-blue-50 border-b border-blue-200">
              <div className="container mx-auto p-3 max-w-7xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        您的邮箱尚未验证
                      </p>
                      <p className="text-xs text-blue-700">
                        验证邮箱后可使用完整功能，请前往个人中心验证
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link to="/profile">
                      <Button size="sm" variant="outline" className="text-blue-900 border-blue-300 hover:bg-blue-100">
                        前往验证
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowEmailBanner(false)}
                      className="text-blue-600 hover:text-blue-900 hover:bg-blue-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

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