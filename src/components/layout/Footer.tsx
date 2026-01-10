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
  const showIcpLink = showSidebar && isOpen && !isMobile;

  return (
    <footer
      className={`border-t bg-background transition-all duration-200 ${
        showSidebar && isOpen && !isMobile ? "ml-64" : ""
      }`}
    >
      <div className="container mx-auto py-4 px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <p>© {yearRange} Makerlife</p>
            {/* <a
              href="https://github.com/amakerlife/ZhiXue-Lite-frontend"
              target="_blank"
              rel="noopener"
              className="hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a> */}
            {commitHash && commitHash !== "unknown" && (
              <span className="hidden lg:inline-flex items-center gap-1 text-xs">
                <GitBranch className="inline-block w-3 h-3" />
                <a
                  href={`https://github.com/amakerlife/ZhiXue-Lite-frontend/commit/${commitHash}`}
                  target="_blank"
                  rel="noopener"
                  className="hover:text-foreground hover:underline transition-colors"
                >
                  {commitHash}
                </a>
              </span>
            )}
          </div>
          <span className="hidden lg:inline">|</span>
          <div className="flex items-center gap-4">
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
          {showIcpLink && (
            <>
              <span className="hidden lg:inline">|</span>
              <a
                href="https://icp.gov.moe/?keyword=20242526"
                target="_blank"
                rel="noopener"
                className="hidden lg:inline hover:text-foreground hover:underline transition-colors"
              >
                萌 ICP 备 20242526 号
              </a>
            </>
          )}
          {/* {buildTime && (
            <>
              <span className="hidden lg:inline">|</span>
              <span className="hidden lg:inline text-xs flex items-center gap-1">
                构建时间: {buildTime}
              </span>
            </>
          )} */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
