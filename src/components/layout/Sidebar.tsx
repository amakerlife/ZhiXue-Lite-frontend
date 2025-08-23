import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  ListTodo,
  Settings,
  Users,
  School,
  GraduationCap,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requireAuth?: boolean;
  adminOnly?: boolean;
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
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (item.requireAuth && !isAuthenticated) {
      return false;
    }
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background">
      <nav className="flex flex-col gap-2 p-4">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
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