import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export type AlertVariant = "error" | "success" | "info" | "warning";

interface StatusAlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  className?: string;
}

const alertConfig = {
  error: {
    icon: AlertCircle,
    defaultTitle: "错误",
  },
  success: {
    icon: CheckCircle,
    defaultTitle: "成功",
  },
  info: {
    icon: Info,
    defaultTitle: "信息",
  },
  warning: {
    icon: AlertTriangle,
    defaultTitle: "警告",
  },
};

export const StatusAlert: React.FC<StatusAlertProps> = ({
  variant,
  title,
  message,
  className,
}) => {
  const config = alertConfig[variant];
  const Icon = config.icon;

  return (
    <Alert variant={variant} className={className}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
