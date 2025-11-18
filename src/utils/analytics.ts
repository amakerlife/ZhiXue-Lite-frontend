// 独立的分析工具函数，避免循环依赖
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

export const trackAnalyticsEvent = (
  eventName: string,
  properties?: Record<string, any>,
) => {
  try {
    // Track with Google Analytics GA4
    if (config.ga.enabled && window.gtag) {
      // GA4 直接支持自定义属性
      window.gtag("event", eventName, properties || {});
    }

    // Track with Umami
    if (config.umami.enabled && window.umami) {
      window.umami.track(eventName, properties);
    }

    // Clarity automatically tracks events, but we can send custom events
    // 确保 clarity 对象存在且有 v 属性再调用
    if (
      config.clarity.enabled &&
      window.clarity &&
      typeof window.clarity === "function"
    ) {
      window.clarity("event", eventName);
    }
  } catch {
    // Silently fail if analytics tracking fails
  }
};
