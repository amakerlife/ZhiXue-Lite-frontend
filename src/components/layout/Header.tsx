import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  User,
  LogIn,
  UserPlus,
  Menu,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useExam } from "@/contexts/ExamContext";
import { useConnection } from "@/contexts/ConnectionContext";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

interface BreadcrumbItem {
  name: string;
  path?: string;
}

const routeNameMap: Record<string, string> = {
  "/": "首页",
  "/exams": "考试列表",
  "/data-viewer": "数据查看",
  "/admin": "管理面板",
  "/tasks": "任务列表",
  "/profile": "个人中心",
  "/login": "登录",
  "/signup": "注册",
  "/verify-email": "邮箱验证",
  "/about": "关于",
  "/privacy-policy": "隐私政策",
  "/data-deletion": "数据删除请求",
  "/disclaimer": "免责声明",
};

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
    switchUser,
    isSuMode,
    exitSu,
  } = useAuth();
  const { toggle } = useSidebar();
  const { getExamData } = useExam();
  const { isConnectionError, connectionError, retryConnection } =
    useConnection();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { name: "首页", path: "/" },
  ]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showSuDialog, setShowSuDialog] = useState(false);
  const [suUsername, setSuUsername] = useState("");
  const [suError, setSuError] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);
  const [isExitingSu, setIsExitingSu] = useState(false);

  // 不显示侧边栏的页面不显示菜单按钮
  const noSidebarPages = ["/login", "/signup"];
  const showMenuButton = !noSidebarPages.includes(location.pathname);

  const generateBreadcrumbs = async (
    pathname: string,
  ): Promise<BreadcrumbItem[]> => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ name: "首页", path: "/" }];

    let currentPath = "";
    for (const path of paths) {
      currentPath += `/${path}`;
      let name = routeNameMap[currentPath] || path;

      // 处理考试详情页面的动态路由
      if (
        currentPath.startsWith("/exams/") &&
        currentPath !== "/exams" &&
        path !== "exams"
      ) {
        try {
          const examId = path;
          // 暂时使用 examId 作为显示名称
          name = examId;

          // 异步获取考试数据并更新面包屑（不递归调用 generateBreadcrumbs）
          getExamData(examId)
            .then((data) => {
              if (data) {
                // 直接更新当前面包屑中的考试名称
                setBreadcrumbs((prevBreadcrumbs) =>
                  prevBreadcrumbs.map((item) =>
                    item.path === currentPath
                      ? { ...item, name: data.name }
                      : item,
                  ),
                );
              }
            })
            .catch(() => {
              // Silently fail if exam name cannot be fetched
            });
        } catch {
          // Silently fail if exam name cannot be fetched
        }
      }

      breadcrumbs.push({ name, path: currentPath });
    }

    return breadcrumbs;
  };

  useEffect(() => {
    const loadBreadcrumbs = async () => {
      const newBreadcrumbs = await generateBreadcrumbs(location.pathname);
      setBreadcrumbs(newBreadcrumbs);
    };

    loadBreadcrumbs();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch {
      navigate("/");
    }
  };

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    try {
      await retryConnection();
      // 重试成功，提示会自动消失
    } catch {
      // 重试失败，错误信息已在Context中更新
    } finally {
      setIsRetrying(false);
    }
  };

  const handleOpenSuDialog = () => {
    setSuUsername("");
    setSuError("");
    setShowSuDialog(true);
  };

  const handleSwitchUser = async () => {
    if (!suUsername.trim()) {
      setSuError("请输入用户名");
      return;
    }

    setIsSwitching(true);
    setSuError("");

    try {
      await switchUser(suUsername.trim());
      setShowSuDialog(false);
      navigate("/"); // 切换后跳转到首页
    } catch (error) {
      setSuError(error instanceof Error ? error.message : "切换用户失败");
    } finally {
      setIsSwitching(false);
    }
  };

  const handleExitSu = async () => {
    setIsExitingSu(true);
    try {
      await exitSu();
    } catch (error) {
      alert(error instanceof Error ? error.message : "退出 su 模式失败");
    } finally {
      setIsExitingSu(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-16 items-center justify-between px-4">
        {/* Left: Menu Button (mobile) + Logo */}
        <div className="flex items-center space-x-3">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              className="md:hidden"
              aria-label="切换菜单"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link
            to="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="ZhiXue Lite" className="h-8 w-8" />
            <span className="text-lg font-semibold text-primary hidden sm:block">
              ZhiXue Lite
            </span>
          </Link>
        </div>

        {/* Center: Breadcrumb Navigation */}
        <div className="flex-1 flex items-center justify-center px-2 sm:px-4 min-w-0">
          {/* 连接状态指示器 */}
          {isConnectionError && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 mr-2 flex-shrink-0"
                >
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">连接异常</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64">
                <div className="p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-800">
                        网络连接异常
                      </p>
                      <p className="text-xs text-red-700 mt-1 break-words">
                        {connectionError || "无法连接到后端服务器"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRetryConnection}
                      disabled={isRetrying}
                      className="h-7 px-3 text-xs border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <RefreshCw
                        className={cn(
                          "h-3 w-3 mr-1",
                          isRetrying && "animate-spin",
                        )}
                      />
                      重试连接
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* 移动端：只显示当前页面名称 */}
          <nav className="flex items-center text-sm text-muted-foreground sm:hidden min-w-0">
            <span
              className="text-foreground font-medium truncate"
              title={breadcrumbs[breadcrumbs.length - 1]?.name}
            >
              {breadcrumbs[breadcrumbs.length - 1]?.name}
            </span>
          </nav>

          {/* 桌面端：智能自适应面包屑 */}
          <nav className="hidden sm:flex items-center space-x-1 text-sm text-muted-foreground min-w-0 max-w-full">
            {breadcrumbs.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === breadcrumbs.length - 1;
              const isSecondToLast = index === breadcrumbs.length - 2;

              return (
                <React.Fragment key={item.path || item.name}>
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground/60" />
                  )}
                  {item.path && !isLast ? (
                    <Link
                      to={item.path}
                      className={cn(
                        "hover:text-foreground transition-colors truncate",
                        // 首页和倒数第二项保持固定，不收缩
                        isFirst || isSecondToLast
                          ? "flex-shrink-0"
                          : // 中间项可以收缩，但保持最小可读宽度
                            "flex-shrink-1 min-w-[2.5rem]",
                      )}
                      title={item.name}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <span
                      className="text-foreground font-medium truncate flex-shrink-0 min-w-0"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Right: User Menu or Login/Signup */}
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">正在获取...</span>
            </div>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {user?.username}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">个人中心</Link>
                </DropdownMenuItem>
                {user?.role === "admin" && !isSuMode && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleOpenSuDialog}
                      className="text-orange-600"
                    >
                      切换用户
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                {isSuMode ? (
                  <DropdownMenuItem
                    onClick={handleExitSu}
                    disabled={isExitingSu}
                    className="text-orange-600"
                  >
                    {isExitingSu ? "退出中..." : "退出 su 模式"}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    退出登录
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden sm:flex"
              >
                <Link to="/login" className="flex items-center space-x-1">
                  <LogIn className="h-4 w-4" />
                  <span>登录</span>
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup" className="flex items-center space-x-1">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:block">注册</span>
                </Link>
              </Button>
              {/* 移动端登录按钮 */}
              <Button variant="ghost" size="sm" asChild className="sm:hidden">
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Su 对话框 */}
      <ResponsiveDialog
        open={showSuDialog}
        onOpenChange={setShowSuDialog}
        title="切换用户"
        description="输入要切换到的用户名。切换后您将以该用户的身份浏览系统。"
        footer={(isDesktop) => (
          <>
            {isDesktop ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowSuDialog(false)}
                  disabled={isSwitching}
                >
                  取消
                </Button>
                <Button onClick={handleSwitchUser} disabled={isSwitching}>
                  {isSwitching ? "切换中..." : "确认切换"}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSwitchUser} disabled={isSwitching}>
                  {isSwitching ? "切换中..." : "确认切换"}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">取消</Button>
                </DrawerClose>
              </>
            )}
          </>
        )}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="su-username" className="text-sm font-medium">
              用户名
            </label>
            <Input
              id="su-username"
              placeholder="请输入用户名"
              value={suUsername}
              onChange={(e) => setSuUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSwitchUser();
                }
              }}
              disabled={isSwitching}
            />
          </div>
          {suError && <div className="text-sm text-red-600">{suError}</div>}
        </div>
      </ResponsiveDialog>
    </header>
  );
};

export default Header;
