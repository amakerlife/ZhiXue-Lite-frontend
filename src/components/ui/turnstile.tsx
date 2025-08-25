import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement | string, options: TurnstileOptions) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
    };
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  language?: string;
  appearance?: 'always' | 'execute' | 'interaction-only';
}

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  className?: string;
  enabled?: boolean;
}

// 定义暴露给父组件的方法
export interface TurnstileRef {
  reset: () => void;
  getResponse: () => string;
}

const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(({
  siteKey,
  onVerify,
  onError,
  onExpire,
  theme = 'auto',
  size = 'normal',
  className = '',
  enabled = true,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [key, setKey] = useState(0); // 用于强制重新渲染

  // 如果未启用，直接调用 onVerify 并返回
  useEffect(() => {
    if (!enabled) {
      onVerify('disabled');
      return;
    }
  }, [enabled, onVerify]);

  // 加载 Turnstile 脚本
  useEffect(() => {
    if (!enabled) return;

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [enabled]);

  // 渲染 Turnstile 组件
  useEffect(() => {
    if (!enabled || !isLoaded || !window.turnstile || !containerRef.current) return;

    // 如果已有 widget，先清除
    if (widgetId) {
      window.turnstile.remove(widgetId);
      setWidgetId('');
    }

    const id = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      'error-callback': onError,
      'expired-callback': () => {
        if (onExpire) onExpire();
        // 自动重置
        if (id) {
          window.turnstile?.reset(id);
        }
      },
      theme,
      size,
    });
    setWidgetId(id);
  }, [enabled, isLoaded, siteKey, onVerify, onError, onExpire, theme, size, key]);

  // 清理
  useEffect(() => {
    return () => {
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [widgetId]);

  // 重置方法 - 通过重新渲染实现完全重置
  const reset = () => {
    if (enabled) {
      if (widgetId && window.turnstile) {
        window.turnstile.reset(widgetId);
      }
      // 强制重新渲染
      setKey(prev => prev + 1);
    }
  };

  // 获取响应
  const getResponse = (): string => {
    if (widgetId && window.turnstile) {
      return window.turnstile.getResponse(widgetId);
    }
    return '';
  };

  // 将方法暴露给父组件
  useImperativeHandle(ref, () => ({
    reset,
    getResponse,
  }));

  return (
    <>
      {enabled ? (
        <div
          key={key}
          ref={containerRef}
          className={`turnstile-container ${className}`}
          style={{ minHeight: size === 'compact' ? '65px' : '65px' }}
        />
      ) : (
        <div className={`text-sm text-muted-foreground ${className}`}>
          验证码已禁用
        </div>
      )}
    </>
  );
});

Turnstile.displayName = 'Turnstile';

export default Turnstile;
export type { TurnstileProps };