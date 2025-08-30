// 独立的分析工具函数，避免循环依赖
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

export const trackAnalyticsEvent = (eventName: string, properties?: Record<string, any>) => {
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
    if (config.clarity.enabled && window.clarity) {
      window.clarity('event', eventName);
    }
  } catch (error) {
    console.warn('Event tracking error:', error);
  }
};
