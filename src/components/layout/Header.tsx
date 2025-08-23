import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, User, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';

interface BreadcrumbItem {
  name: string;
  path?: string;
}

const routeNameMap: Record<string, string> = {
  '/': '首页',
  '/exams': '考试列表',
  '/admin': '管理面板',
  '/tasks': '任务列表',
  '/profile': '个人中心',
  '/login': '登录',
  '/signup': '注册',
};

const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { name: '首页', path: '/' }
  ];

  let currentPath = '';
  paths.forEach((path) => {
    currentPath += `/${path}`;
    const name = routeNameMap[currentPath] || path;
    breadcrumbs.push({ name, path: currentPath });
  });

  return breadcrumbs;
};

const Header: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const breadcrumbs = generateBreadcrumbs(location.pathname);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Left: Logo and Project Name */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="ZhiXue Lite" className="h-8 w-8" />
            <span className="text-lg font-semibold text-primary">ZhiXue Lite</span>
          </Link>
        </div>

        {/* Center: Breadcrumb Navigation */}
        <div className="flex-1 flex items-center justify-center">
          <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={item.path || item.name}>
                {index > 0 && (
                  <ChevronRight className="h-4 w-4" />
                )}
                {item.path && index < breadcrumbs.length - 1 ? (
                  <Link
                    to={item.path}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span className={index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''}>
                    {item.name}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right: User Menu or Login/Signup */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">个人中心</Link>
                </DropdownMenuItem>
                {/* {user?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">管理面板</Link>
                  </DropdownMenuItem>
                )} */}
                {/* <DropdownMenuItem asChild>
                  <Link to="/tasks">任务列表</Link>
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login" className="flex items-center space-x-1">
                  <LogIn className="h-4 w-4" />
                  <span>登录</span>
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup" className="flex items-center space-x-1">
                  <UserPlus className="h-4 w-4" />
                  <span>注册</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;