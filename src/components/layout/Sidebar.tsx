import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  ListTodo,
  Settings,
  Eye,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { canViewAllData, canManageSystem, hasPermission, PermissionType, PermissionLevel } from '@/utils/permissions';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requireAuth?: boolean;
  adminOnly?: boolean;
  dataViewerAccessible?: boolean;
}

const navItems: NavItem[] = [
  {
    name: '首页',
    href: '/',
    icon: Home,
  },
  {
    name: '考试列表',
    href: '/exams',
    icon: BookOpen,
    requireAuth: true,
  },
  {
    name: '数据查看',
    href: '/data-viewer',
    icon: Eye,
    requireAuth: true,
    dataViewerAccessible: true,
  },
  {
    name: '任务列表',
    href: '/tasks',
    icon: ListTodo,
    requireAuth: true,
  },
  // {
  //   name: '个人中心',
  //   href: '/profile',
  //   icon: User,
  //   requireAuth: true,
  // },
  {
    name: '管理面板',
    href: '/admin',
    icon: Settings,
    requireAuth: true,
    adminOnly: true,
  },
  {
    name: '关于',
    href: '/about',
    icon: Info,
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { isOpen, isMobile, close } = useSidebar();

  const filteredNavItems = navItems.filter((item) => {
    if (item.requireAuth && !isAuthenticated) {
      return false;
    }
    if (item.adminOnly && !canManageSystem(user)) {
      return false;
    }
    if (item.dataViewerAccessible) {
      // 检查是否有全局数据查看权限
      const hasGlobalViewPermission = canViewAllData(user) ||
        hasPermission(user, PermissionType.VIEW_EXAM_DATA, PermissionLevel.GLOBAL) ||
        hasPermission(user, PermissionType.VIEW_EXAM_LIST, PermissionLevel.GLOBAL);

      if (!hasGlobalViewPermission) {
        return false;
      }
    }
    return true;
  });

  const handleLinkClick = () => {
    if (isMobile) {
      close();
    }
  };

  return (
    <aside className={cn(
      "fixed left-0 top-16 z-40 w-64 h-[calc(100vh-4rem)] border-r bg-background transition-transform duration-200",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <nav className="flex flex-col gap-2 p-4 h-full overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;