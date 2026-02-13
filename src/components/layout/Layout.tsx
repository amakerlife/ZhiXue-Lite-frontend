import React from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ShieldAlert,
  LogOut,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { detectBrowser } from "@/lib/browser";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useAuth } from "@/contexts/AuthContext";
import Banner from "@/components/Banner";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, isMobile, close } = useSidebar();
  const { user, isSuMode, exitSu } = useAuth();
  const [showBanner, setShowBanner] = React.useState(true);
  const [showEmailBanner, setShowEmailBanner] = React.useState(true);
  const [showBrowserBanner, setShowBrowserBanner] = React.useState(true);
  const [browserInfo] = React.useState(() => detectBrowser());
  const [exitingSu, setExitingSu] = React.useState(false);

  // 启用页面追踪
  usePageTracking();

  // 不显示侧边栏的页面
  const noSidebarPages = ["/login", "/signup"];
  const showSidebar = !noSidebarPages.includes(location.pathname);

  // 检查是否需要显示未绑定账号提醒
  const shouldShowBanner =
    showSidebar &&
    user &&
    !user.zhixue_info?.username &&
    !user.is_manual_school &&
    showBanner &&
    !isSuMode;

  // 检查是否需要显示邮箱未验证提醒
  const shouldShowEmailBanner =
    showSidebar && user && !user.email_verified && showEmailBanner && !isSuMode;

  // 处理退出 su 模式
  const handleExitSu = async () => {
    setExitingSu(true);
    try {
      await exitSu();
    } catch (error) {
      console.error("Exit su failed:", error);
      alert(error instanceof Error ? error.message : "退出 su 模式失败");
    } finally {
      setExitingSu(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pt-16">
      {" "}
      {/* 为固定Header留出空间 */}
      <div className="relative flex flex-1">
        {showSidebar && <Sidebar />}

        {/* 移动端遮罩层 */}
        {showSidebar && isOpen && isMobile && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={close}
            style={{ top: "4rem" }} // Header高度
          />
        )}

        <main
          className={`flex-1 transition-all duration-200 ${
            showSidebar && isOpen && !isMobile ? "ml-64" : ""
          }`}
        >
          {/* 浏览器兼容性提示横幅 */}
          {!browserInfo.isSupported && showBrowserBanner && (
            <Banner
              variant="warning"
              icon={<AlertTriangle />}
              title="浏览器版本过低"
              description={
                browserInfo.name === "Unknown"
                  ? "你的浏览器可能无法正确显示部分样式，建议更换为最新版本的主流浏览器以获得最佳体验。"
                  : `${browserInfo.name} ${browserInfo.version} 已不受支持，建议升级到最新版本以获得最佳体验。旧版浏览器可能无法正确显示部分样式。`
              }
              onClose={() => setShowBrowserBanner(false)}
            />
          )}

          {/* Su 模式提示横幅 */}
          {isSuMode && user && (
            <Banner
              variant="alert"
              icon={<ShieldAlert />}
              title={
                user.su_info?.original_user_username
                  ? `您（管理员 ${user.su_info.original_user_username}）正在以 ${user.username} 的身份浏览`
                  : `您正在以 ${user.username} 的身份浏览`
              }
              description="您当前处于 su 模式，请谨慎操作"
              actions={[
                {
                  label: exitingSu ? "退出中" : "退出 su 模式",
                  onClick: handleExitSu,
                  disabled: exitingSu,
                  loading: exitingSu,
                  icon: <LogOut className="h-4 w-4" />,
                },
              ]}
            />
          )}

          {/* 邮箱未验证提醒横幅 */}
          {shouldShowEmailBanner && (
            <Banner
              variant="info"
              icon={<Mail />}
              title="您的邮箱尚未验证"
              description="验证邮箱后可使用完整功能，请前往个人中心验证"
              actions={[
                {
                  label: "前往验证",
                  onClick: () => navigate("/profile"),
                },
              ]}
              onClose={() => setShowEmailBanner(false)}
            />
          )}

          {/* 未绑定账号提醒横幅 */}
          {shouldShowBanner && (
            <Banner
              variant="warning"
              icon={<AlertCircle />}
              title="您还未绑定智学网账号"
              description="绑定后可使用完整功能，包括查看考试成绩、同步数据等"
              actions={[
                {
                  label: "立即绑定",
                  onClick: () => navigate("/profile#zhixue-binding"),
                },
              ]}
              onClose={() => setShowBanner(false)}
            />
          )}

          <div className="container mx-auto p-4 md:p-6 max-w-7xl flex flex-col min-h-[calc(100vh-8rem)]">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
