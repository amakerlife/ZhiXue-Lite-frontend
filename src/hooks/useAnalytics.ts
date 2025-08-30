import { useEffect } from 'react';
import type { AnalyticsConfig } from '@/types/analytics';

const config: AnalyticsConfig = {
  clarity: {
    enabled: import.meta.env.VITE_CLARITY_ENABLED === 'true',
    projectId: import.meta.env.VITE_CLARITY_PROJECT_ID || '',
  },
  ga: {
    enabled: import.meta.env.VITE_GA_ENABLED === 'true',
    trackingId: import.meta.env.VITE_GA_TRACKING_ID || '',
  },
  umami: {
    enabled: import.meta.env.VITE_UMAMI_ENABLED === 'true',
    websiteId: import.meta.env.VITE_UMAMI_WEBSITE_ID || '',
    scriptUrl: import.meta.env.VITE_UMAMI_SCRIPT_URL || '',
  },
};

export const useAnalytics = () => {
  useEffect(() => {
    const loadScript = (src: string, id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
      });
    };

    const initializeAnalytics = async () => {
      try {
        // Initialize Microsoft Clarity
        if (config.clarity.enabled && config.clarity.projectId) {
          // 初始化 window.clarity 对象以避免 undefined 错误
          if (!window.clarity) {
            window.clarity = function(action: string, ...args: any[]) {
              // 创建一个队列来存储在实际脚本加载前的调用
              if (window.clarity) {
                window.clarity.q = window.clarity.q || [];
                window.clarity.q.push([action, ...args]);
              }
            } as any;
            if (window.clarity) {
              window.clarity.q = [];
            }
          }

          // 使用同步方式加载 Clarity 脚本以确保正确的执行顺序
          const script = document.createElement('script');
          script.id = 'clarity-script';
          script.src = `https://www.clarity.ms/tag/${config.clarity.projectId}`;
          script.async = false; // 使用同步加载而不是异步
          document.head.appendChild(script);
        }

        // Initialize Google Analytics
        if (config.ga.enabled && config.ga.trackingId) {
          await loadScript(
            `https://www.googletagmanager.com/gtag/js?id=${config.ga.trackingId}`,
            'ga-script'
          );

          window.dataLayer = window.dataLayer || [];
          function gtag(...args: any[]) {
            window.dataLayer!.push(args);
          }
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', config.ga.trackingId);
        }

        // Initialize Umami
        if (config.umami.enabled && config.umami.scriptUrl && config.umami.websiteId) {
          const script = document.createElement('script');
          script.id = 'umami-script';
          script.src = config.umami.scriptUrl;
          script.async = true;
          script.setAttribute('data-website-id', config.umami.websiteId);
          document.head.appendChild(script);
        }
      } catch (error) {
        console.warn('Analytics initialization error:', error);
      }
    };

    initializeAnalytics();
  }, []);

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    try {
      // Track with Google Analytics
      if (config.ga.enabled && window.gtag) {
        window.gtag('event', eventName, properties);
      }

      // Track with Umami
      if (config.umami.enabled && window.umami) {
        window.umami.track(eventName, properties);
      }

      // Clarity automatically tracks events, but we can send custom events
      // 确保 clarity 对象存在且有效再调用
      if (config.clarity.enabled && window.clarity && typeof window.clarity === 'function') {
        window.clarity('event', eventName);
      }
    } catch (error) {
      console.warn('Event tracking error:', error);
    }
  };

  const trackPageView = (path: string, title?: string) => {
    try {
      // Track with Google Analytics
      if (config.ga.enabled && window.gtag) {
        window.gtag('config', config.ga.trackingId, {
          page_path: path,
          page_title: title,
        });
      }

      // Umami automatically tracks page views
    } catch (error) {
      console.warn('Page view tracking error:', error);
    }
  };

  return {
    trackEvent,
    trackPageView,
    config,
  };
};