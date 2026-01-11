import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "@/contexts/SidebarContext";
import { GitBranch } from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2025;
  const yearRange =
    currentYear === startYear ? `${startYear}` : `${startYear}-${currentYear}`;
  const location = useLocation();
  const { isOpen, isMobile } = useSidebar();

  // 格式化构建时间
  // const formatBuildTime = (isoString: string) => {
  //   const buildDate = new Date(isoString);
  //   return buildDate.toLocaleString("zh-CN", {
  //     year: "numeric",
  //     month: "2-digit",
  //     day: "2-digit",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  // const buildTime =
  //   typeof __BUILD_TIME__ !== "undefined"
  //     ? formatBuildTime(__BUILD_TIME__)
  //     : null;
  const commitHash =
    typeof __GIT_COMMIT_HASH__ !== "undefined" ? __GIT_COMMIT_HASH__ : null;

  // 不显示侧边栏的页面
  const noSidebarPages = ["/login", "/signup"];
  const showSidebar = !noSidebarPages.includes(location.pathname);

  return (
    <footer
      className={`border-t bg-background transition-all duration-200 ${
        showSidebar && isOpen && !isMobile ? "ml-64" : ""
      }`}
    >
      <div className="container mx-auto py-4 px-4 max-w-7xl">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          {/* 第一行/主行：版权信息 + commit hash（仅 lg）+ 其他内容（仅 md+） */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <p>© {yearRange} Makerlife</p>
              {/* commit hash - 仅在大屏显示，图标和文字都可点击 */}
              {commitHash && commitHash !== "unknown" && (
                <a
                  href={`https://github.com/amakerlife/ZhiXue-Lite-frontend/commit/${commitHash}`}
                  target="_blank"
                  rel="noopener"
                  className="hidden lg:inline-flex items-center gap-1 text-xs hover:text-foreground hover:underline transition-colors"
                >
                  <GitBranch className="inline-block w-3 h-3" />
                  {commitHash}
                </a>
              )}
            </div>

            {/* 隐私政策和免责声明 - 中屏及以上显示在第一行 */}
            <span className="hidden md:inline">|</span>
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/privacy-policy"
                className="hover:text-foreground transition-colors"
              >
                隐私政策
              </Link>
              <span>|</span>
              <Link
                to="/disclaimer"
                className="hover:text-foreground transition-colors"
              >
                免责声明
              </Link>
            </div>

            {/* 备案号 - 中屏及以上显示在第一行 */}
            <span className="hidden md:inline">|</span>
            <a
              href="https://icp.gov.moe/?keyword=20242526"
              target="_blank"
              rel="noopener"
              className="hidden md:inline hover:text-foreground transition-colors"
            >
              萌 ICP 备 20242526 号
            </a>
          </div>

          {/* 第二行：隐私政策和免责声明 - 仅小屏显示 */}
          <div className="flex md:hidden items-center gap-4">
            <Link
              to="/privacy-policy"
              className="hover:text-foreground transition-colors"
            >
              隐私政策
            </Link>
            <span>|</span>
            <Link
              to="/disclaimer"
              className="hover:text-foreground transition-colors"
            >
              免责声明
            </Link>
          </div>

          {/* 第三行：备案号 - 仅小屏显示 */}
          <a
            href="https://icp.gov.moe/?keyword=20242526"
            target="_blank"
            rel="noopener"
            className="md:hidden hover:text-foreground hover:underline transition-colors"
          >
            萌 ICP 备 20242526 号
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
