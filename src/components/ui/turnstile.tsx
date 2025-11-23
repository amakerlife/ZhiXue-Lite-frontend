import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement | string,
        options: TurnstileOptions,
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
    };
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  language?: string;
  appearance?: "always" | "execute" | "interaction-only";
}

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  className?: string;
  enabled?: boolean;
}

// 定义暴露给父组件的方法
export interface TurnstileRef {
  reset: () => void;
  getResponse: () => string;
}

const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
  (
    {
      siteKey,
      onVerify,
      onError,
      onExpire,
      theme = "auto",
      size = "normal",
      className = "",
      enabled = true,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string>("");
    const [isLoaded, setIsLoaded] = useState(false);

    // 如果未启用，直接调用 onVerify
    useEffect(() => {
      if (!enabled) {
        onVerify("disabled");
      }
    }, [enabled, onVerify]);

    // 加载 Turnstile 脚本
    useEffect(() => {
      if (!enabled) return;

      // 检查脚本是否已存在且 API 可用
      const existingScript = document.querySelector(
        'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
      );

      if (existingScript && window.turnstile) {
        setIsLoaded(true);
        return;
      }

      // 如果脚本存在但 API 不可用，可能之前加载失败了，需要重新加载
      if (existingScript && !window.turnstile) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setIsLoaded(true);
      };

      script.onerror = () => {
        console.error("Failed to load Turnstile script");
        if (onError) {
          onError();
        }
      };

      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }, [enabled, onError]);

    // 清理 widget 的辅助函数
    const removeWidget = useCallback(() => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.warn("Failed to remove Turnstile widget:", error);
        }
        widgetIdRef.current = "";
      }
    }, []);

    // 渲染 Turnstile 组件
    useEffect(() => {
      if (!enabled || !isLoaded || !window.turnstile || !containerRef.current)
        return;

      // 清除旧的 widget
      removeWidget();

      // 渲染新的 widget
      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          "error-callback": onError,
          "expired-callback": () => {
            if (onExpire) onExpire();
            // 自动重置
            if (widgetIdRef.current && window.turnstile) {
              window.turnstile.reset(widgetIdRef.current);
            }
          },
          theme,
          size,
        });
        widgetIdRef.current = id;
      } catch (error) {
        console.error("Failed to render Turnstile widget:", error);
        if (onError) onError();
      }

      // 清理函数
      return () => {
        removeWidget();
      };
    }, [enabled, isLoaded, siteKey, onVerify, onError, onExpire, theme, size, removeWidget]);

    // 重置方法
    const reset = useCallback(() => {
      if (enabled && widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (error) {
          console.warn("Failed to reset Turnstile widget:", error);
        }
      }
    }, [enabled]);

    // 获取响应
    const getResponse = useCallback((): string => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          return window.turnstile.getResponse(widgetIdRef.current);
        } catch (error) {
          console.warn("Failed to get Turnstile response:", error);
          return "";
        }
      }
      return "";
    }, []);

    // 将方法暴露给父组件
    useImperativeHandle(
      ref,
      () => ({
        reset,
        getResponse,
      }),
      [reset, getResponse],
    );

    return (
      <>
        {enabled ? (
          <div
            ref={containerRef}
            className={`turnstile-container ${className}`}
            style={{ minHeight: size === "compact" ? "65px" : "65px" }}
          />
        ) : (
          <div className={`text-sm text-muted-foreground ${className}`}>
            验证码已禁用
          </div>
        )}
      </>
    );
  },
);

Turnstile.displayName = "Turnstile";

export default Turnstile;
export type { TurnstileProps };
