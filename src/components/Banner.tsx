import React from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type BannerVariant = "warning" | "info" | "success" | "danger" | "alert";

interface BannerAction {
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

interface BannerProps {
  variant?: BannerVariant;
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: BannerAction[];
  onClose?: () => void;
  className?: string;
}

const variantStyles: Record<
  BannerVariant,
  {
    container: string;
    icon: string;
    title: string;
    description: string;
    button: string;
    closeButton: string;
  }
> = {
  warning: {
    container: "bg-amber-50 border-b border-amber-200",
    icon: "text-amber-600",
    title: "text-amber-900",
    description: "text-amber-700",
    button: "text-amber-900 border-amber-300 hover:bg-amber-100",
    closeButton: "text-amber-600 hover:text-amber-900 hover:bg-amber-100",
  },
  info: {
    container: "bg-blue-50 border-b border-blue-200",
    icon: "text-blue-600",
    title: "text-blue-900",
    description: "text-blue-700",
    button: "text-blue-900 border-blue-300 hover:bg-blue-100",
    closeButton: "text-blue-600 hover:text-blue-900 hover:bg-blue-100",
  },
  success: {
    container: "bg-green-50 border-b border-green-200",
    icon: "text-green-600",
    title: "text-green-900",
    description: "text-green-700",
    button: "text-green-900 border-green-300 hover:bg-green-100",
    closeButton: "text-green-600 hover:text-green-900 hover:bg-green-100",
  },
  danger: {
    container: "bg-red-50 border-b border-red-200",
    icon: "text-red-600",
    title: "text-red-900",
    description: "text-red-700",
    button: "text-red-900 border-red-300 hover:bg-red-100",
    closeButton: "text-red-600 hover:text-red-900 hover:bg-red-100",
  },
  alert: {
    container: "bg-orange-50 border-b border-orange-200",
    icon: "text-orange-600",
    title: "text-orange-900",
    description: "text-orange-700",
    button: "text-orange-900 border-orange-300 hover:bg-orange-100",
    closeButton: "text-orange-600 hover:text-orange-900 hover:bg-orange-100",
  },
};

const Banner: React.FC<BannerProps> = ({
  variant = "info",
  icon,
  title,
  description,
  actions = [],
  onClose,
  className = "",
}) => {
  const styles = variantStyles[variant];

  return (
    <div className={`${styles.container} ${className}`}>
      <div className="container mx-auto p-3 max-w-7xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {icon && <div className={`${styles.icon} shrink-0`}>{icon}</div>}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${styles.title}`}>{title}</p>
              {description && (
                <p className={`text-xs ${styles.description}`}>{description}</p>
              )}
            </div>
          </div>

          {(actions.length > 0 || onClose) && (
            <div className="flex items-center space-x-2 shrink-0">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={styles.button}
                >
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  <span>
                    {action.loading ? `${action.label}...` : action.label}
                  </span>
                </Button>
              ))}
              {onClose && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className={styles.closeButton}
                  aria-label="关闭"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Banner;
