import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";

type DialogMode = "default" | "confirm" | "alert";
type DialogVariant = "default" | "destructive";

interface ResponsiveDialogProps {
  // 基础属性
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string | React.ReactNode;
  children?: React.ReactNode;
  className?: string;

  // 模式控制
  mode?: DialogMode;
  variant?: DialogVariant;

  // Confirm/Alert 模式配置
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  icon?: React.ReactNode; // 自定义图标（将显示在标题行左侧）

  // 自定义 Footer（优先级高于预设按钮）
  footer?: (isDesktop: boolean) => React.ReactNode;

  // 其他选项
  showDefaultFooter?: boolean;
  closable?: boolean; // 是否可以通过点击外部或 ESC 关闭
  showCloseButton?: boolean; // 是否显示右上角关闭按钮（仅桌面端 Dialog）
}

export const ResponsiveDialog: React.FC<ResponsiveDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  mode = "default",
  variant = "default",
  confirmText = "确认",
  cancelText = "取消",
  onConfirm,
  icon,
  footer,
  showDefaultFooter = false,
  closable = true,
  showCloseButton = false,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
      onOpenChange(false);
    }
  };

  // 处理对话框关闭
  const handleOpenChange = (newOpen: boolean) => {
    if (closable || newOpen) {
      onOpenChange(newOpen);
    }
  };

  // Confirm/Alert 模式使用预设按钮
  const isConfirmMode = mode === "confirm" || mode === "alert";
  const useAlertDialog = isConfirmMode && isDesktop;

  // 渲染 Footer
  const renderFooter = (isDesktop: boolean) => {
    // 自定义 footer 优先
    if (footer) {
      return footer(isDesktop);
    }

    // Confirm 模式预设按钮
    if (mode === "confirm") {
      if (isDesktop) {
        return (
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              className={
                variant === "destructive"
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  : undefined
              }
            >
              {confirmText}
            </Button>
          </>
        );
      } else {
        return (
          <>
            <Button
              onClick={handleConfirm}
              className={
                variant === "destructive"
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  : undefined
              }
            >
              {confirmText}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">{cancelText}</Button>
            </DrawerClose>
          </>
        );
      }
    }

    // Alert 模式单按钮
    if (mode === "alert") {
      return (
        <Button
          onClick={handleConfirm}
          className={
            variant === "destructive"
              ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
              : undefined
          }
        >
          {confirmText}
        </Button>
      );
    }

    // 默认关闭按钮
    if (showDefaultFooter) {
      if (isDesktop) {
        return (
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        );
      } else {
        return (
          <DrawerClose asChild>
            <Button variant="outline">关闭</Button>
          </DrawerClose>
        );
      }
    }

    return null;
  };

  // 桌面端渲染
  if (isDesktop) {
    // Confirm/Alert 模式使用 AlertDialog
    if (useAlertDialog) {
      return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
          <AlertDialogContent className={className}>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                {icon}
                {title}
              </AlertDialogTitle>
              {description && (
                <AlertDialogDescription>{description}</AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <div className="max-h-[70vh] overflow-y-auto">{children}</div>
            <AlertDialogFooter>
              {mode === "alert" ? (
                <AlertDialogAction
                  onClick={handleConfirm}
                  className={
                    variant === "destructive"
                      ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                      : undefined
                  }
                >
                  {confirmText}
                </AlertDialogAction>
              ) : (
                <>
                  <AlertDialogCancel>{cancelText}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirm}
                    className={
                      variant === "destructive"
                        ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        : undefined
                    }
                  >
                    {confirmText}
                  </AlertDialogAction>
                </>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    // 普通 Dialog
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className={className} showCloseButton={showCloseButton}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">{children}</div>
          {(footer || showDefaultFooter || mode !== "default") && (
            <DialogFooter>{renderFooter(true)}</DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // 移动端：统一使用 Drawer
  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-center">
          <DrawerTitle className="flex items-center justify-center gap-2">
            {icon}
            {title}
          </DrawerTitle>
          {description && (
            <DrawerDescription className="text-center">
              {description}
            </DrawerDescription>
          )}
        </DrawerHeader>
        <div className="px-4 max-h-[60vh] overflow-y-auto">{children}</div>
        {(footer || showDefaultFooter || isConfirmMode) && (
          <DrawerFooter className="pt-2">{renderFooter(false)}</DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};
