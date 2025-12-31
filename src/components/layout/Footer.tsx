import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "@/contexts/SidebarContext";
import { GitBranch, Github } from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2025;
  const yearRange =
    currentYear === startYear ? `${startYear}` : `${startYear}-${currentYear}`;
  const location = useLocation();
  const { isOpen, isMobile } = useSidebar();

  // 格式化构建时间
  const formatBuildTime = (isoString: string) => {
    const buildDate = new Date(isoString);
    return buildDate.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const buildTime =
    typeof __BUILD_TIME__ !== "undefined"
      ? formatBuildTime(__BUILD_TIME__)
      : null;
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
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <p>© {yearRange} Makerlife</p>
            <a
              href="https://github.com/amakerlife/ZhiXue-Lite-frontend"
              target="_blank"
              rel="noopener"
              className="hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
          <span>|</span>
          <Link
            to="/privacy-policy"
            className="hover:text-foreground transition-colors"
          >
            隐私政策
          </Link>
          {/* <span>|</span>
          <Link
            to="/data-deletion"
            className="hover:text-foreground transition-colors"
          >
            数据删除请求
          </Link> */}
          <span>|</span>
          <Link
            to="/disclaimer"
            className="hover:text-foreground transition-colors"
          >
            免责声明
          </Link>
          {buildTime && (
            <>
              <span className="hidden md:inline">|</span>
              <span className="hidden md:inline text-xs flex items-center gap-1">
                构建时间: {buildTime}
                {commitHash && commitHash !== "unknown" && (
                  <>
                    {" "}
                    (<GitBranch className="inline-block w-3 h-3" />
                    <a
                      href={`https://github.com/amakerlife/ZhiXue-Lite-frontend/commit/${commitHash}`}
                      target="_blank"
                      rel="noopener"
                      className="hover:text-foreground hover:underline transition-colors"
                    >
                      {commitHash}
                    </a>
                    )
                  </>
                )}
              </span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
