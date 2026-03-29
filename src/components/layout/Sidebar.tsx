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
import { useLanguage } from "@/i18n";
import type { TranslationKey } from "@/i18n";
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
  nameKey: TranslationKey;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  requireAuth?: boolean;
  adminOnly?: boolean;
  dataViewerAccessible?: boolean;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    nameKey: "nav.home",
    href: "/",
    icon: Home,
  },
  {
    nameKey: "nav.examList",
    href: "/exams",
    icon: BookOpen,
    requireAuth: true,
  },
  {
    nameKey: "nav.dataViewer",
    href: "/data-viewer",
    icon: Eye,
    requireAuth: true,
    dataViewerAccessible: true,
  },
  {
    nameKey: "nav.taskList",
    href: "/tasks",
    icon: ListTodo,
    requireAuth: true,
  },
  {
    nameKey: "nav.adminPanel",
    icon: Settings,
    requireAuth: true,
    adminOnly: true,
    children: [
      {
        nameKey: "nav.adminUsers",
        href: "/admin/users",
        icon: Users,
      },
      {
        nameKey: "nav.adminSchools",
        href: "/admin/schools",
        icon: School,
      },
      {
        nameKey: "nav.adminTeachers",
        href: "/admin/teachers",
        icon: GraduationCap,
      },
      {
        nameKey: "nav.adminStudents",
        href: "/admin/students",
        icon: UserCheck,
      },
      {
        nameKey: "nav.adminExams",
        href: "/admin/exams",
        icon: FileText,
      },
      {
        nameKey: "nav.adminTasks",
        href: "/admin/tasks",
        icon: ListTodo,
      },
    ],
  },
  {
    nameKey: "nav.about",
    href: "/about",
    icon: Info,
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { isOpen, isMobile, close } = useSidebar();
  const { t } = useLanguage();

  // 展开状态（仅内存状态，不持久化）
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // 切换展开状态
  const toggleExpanded = (itemKey: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
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
            if (!prev.has(item.nameKey)) {
              return new Set(prev).add(item.nameKey);
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
            const isExpanded = expandedItems.has(item.nameKey);
            const hasActiveChild = item.children.some(
              (child) => child.href && location.pathname.startsWith(child.href),
            );

            return (
              <Collapsible
                key={item.nameKey}
                open={isExpanded}
                onOpenChange={() => toggleExpanded(item.nameKey)}
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
                      {t(item.nameKey) as string}
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
                        {t(child.nameKey) as string}
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
              {t(item.nameKey) as string}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
