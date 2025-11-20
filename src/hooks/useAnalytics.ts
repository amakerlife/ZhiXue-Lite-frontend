import { useEffect } from "react";
import type { AnalyticsConfig } from "@/types/analytics";

const config: AnalyticsConfig = {
  clarity: {
    enabled: import.meta.env.VITE_CLARITY_ENABLED === "true",
    projectId: import.meta.env.VITE_CLARITY_PROJECT_ID || "",
  },
  ga: {
    enabled: import.meta.env.VITE_GA_ENABLED === "true",
    trackingId: import.meta.env.VITE_GA_TRACKING_ID || "",
  },
  umami: {
    enabled: import.meta.env.VITE_UMAMI_ENABLED === "true",
    websiteId: import.meta.env.VITE_UMAMI_WEBSITE_ID || "",
    scriptUrl: import.meta.env.VITE_UMAMI_SCRIPT_URL || "",
  },
};

export const useAnalytics = () => {
  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        // Clarity 和 Google Analytics 已通过 vite-plugin-radar 在 index.html 中注入

        // Initialize Umami
        if (
          config.umami.enabled &&
          config.umami.scriptUrl &&
          config.umami.websiteId
        ) {
          const script = document.createElement("script");
          script.id = "umami-script";
          script.src = config.umami.scriptUrl;
          script.async = true;
          script.setAttribute("data-website-id", config.umami.websiteId);
          document.head.appendChild(script);
        }
      } catch {
        // Silently fail if analytics initialization fails
      }
    };

    initializeAnalytics();
  }, []);

  const trackEvent = (
    eventName: string,
    properties?: Record<string, string | number | boolean | null | undefined>,
  ) => {
    try {
      // Track with Google Analytics
      if (config.ga.enabled && window.gtag) {
        window.gtag("event", eventName, properties);
      }

      // Track with Umami
      if (config.umami.enabled && window.umami) {
        window.umami.track(eventName, properties);
      }

      // Clarity automatically tracks events, but we can send custom events
      // 确保 clarity 对象存在且有效再调用
      if (
        config.clarity.enabled &&
        window.clarity &&
        typeof window.clarity === "function"
      ) {
        window.clarity("event", eventName);
      }
    } catch {
      // Silently fail if event tracking fails
    }
  };

  const trackPageView = (path: string, title?: string) => {
    try {
      // Track with Google Analytics
      if (config.ga.enabled && window.gtag) {
        window.gtag("config", config.ga.trackingId, {
          page_path: path,
          page_title: title,
        });
      }

      // Umami automatically tracks page views
    } catch {
      // Silently fail if page view tracking fails
    }
  };

  return {
    trackEvent,
    trackPageView,
    config,
  };
};
