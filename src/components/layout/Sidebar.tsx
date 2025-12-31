import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  ListTodo,
  Settings,
  Eye,
  Info,
  ChevronDown,
  Users,
  School,
  GraduationCap,
  UserCheck,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  canViewAllData,
  canManageSystem,
  hasPermission,
  PermissionType,
  PermissionLevel,
} from "@/utils/permissions";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  requireAuth?: boolean;
  adminOnly?: boolean;
  dataViewerAccessible?: boolean;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    name: "首页",
    href: "/",
    icon: Home,
  },
  {
    name: "考试列表",
    href: "/exams",
    icon: BookOpen,
    requireAuth: true,
  },
  {
    name: "数据查看",
    href: "/data-viewer",
    icon: Eye,
    requireAuth: true,
    dataViewerAccessible: true,
  },
  {
    name: "任务列表",
    href: "/tasks",
    icon: ListTodo,
    requireAuth: true,
  },
  {
    name: "管理面板",
    icon: Settings,
    requireAuth: true,
    adminOnly: true,
    children: [
      {
        name: "用户管理",
        href: "/admin/users",
        icon: Users,
      },
      {
        name: "学校管理",
        href: "/admin/schools",
        icon: School,
      },
      {
        name: "教师管理",
        href: "/admin/teachers",
        icon: GraduationCap,
      },
      {
        name: "学生管理",
        href: "/admin/students",
        icon: UserCheck,
      },
      {
        name: "考试管理",
        href: "/admin/exams",
        icon: FileText,
      },
    ],
  },
  {
    name: "关于",
    href: "/about",
    icon: Info,
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { isOpen, isMobile, close } = useSidebar();

  // 展开状态（仅内存状态，不持久化）
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // 切换展开状态
  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  const filteredNavItems = navItems.filter((item) => {
    if (item.requireAuth && !isAuthenticated) {
      return false;
    }
    if (item.adminOnly && !canManageSystem(user)) {
      return false;
    }
    if (item.dataViewerAccessible) {
      // 检查是否有相应数据权限
      const hasDataViewPermission =
        canViewAllData(user) ||
        hasPermission(
          user,
          PermissionType.FETCH_DATA,
          PermissionLevel.SCHOOL,
        ) ||
        hasPermission(
          user,
          PermissionType.REFETCH_EXAM_DATA,
          PermissionLevel.SCHOOL,
        ) ||
        hasPermission(
          user,
          PermissionType.VIEW_EXAM_DATA,
          PermissionLevel.SCHOOL,
        ) ||
        hasPermission(
          user,
          PermissionType.EXPORT_SCORE_SHEET,
          PermissionLevel.SELF,
        );

      if (!hasDataViewPermission) {
        return false;
      }
    }
    return true;
  });

  // 根据当前路由自动展开对应的父菜单
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => child.href && location.pathname.startsWith(child.href),
        );
        if (hasActiveChild) {
          setExpandedItems((prev) => {
            if (!prev.has(item.name)) {
              return new Set(prev).add(item.name);
            }
            return prev;
          });
        }
      }
    });
  }, [location.pathname]);

  const handleLinkClick = () => {
    if (isMobile) {
      close();
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 w-64 h-[calc(100vh-4rem)] border-r bg-background transition-transform duration-200",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <nav className="flex flex-col gap-2 p-4 h-full overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;

          // 有子菜单的项
          if (item.children && item.children.length > 0) {
            const isExpanded = expandedItems.has(item.name);
            const hasActiveChild = item.children.some(
              (child) => child.href && location.pathname.startsWith(child.href),
            );

            return (
              <Collapsible
                key={item.name}
                open={isExpanded}
                onOpenChange={() => toggleExpanded(item.name)}
              >
                {/* 父菜单按钮 */}
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      hasActiveChild
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isExpanded ? "rotate-180" : "",
                      )}
                    />
                  </button>
                </CollapsibleTrigger>

                {/* 子菜单（向下展开） */}
                <CollapsibleContent className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isActive = location.pathname === child.href;

                    return (
                      <Link
                        key={child.href}
                        to={child.href!}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <ChildIcon className="h-4 w-4" />
                        {child.name}
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          // 普通菜单项
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/" &&
              item.href &&
              location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href!}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
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
