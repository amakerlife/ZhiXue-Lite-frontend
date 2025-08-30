export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

export interface AnalyticsPageView {
  path: string;
  title?: string;
}

export interface ClarityConfig {
  enabled: boolean;
  projectId: string;
}

export interface GoogleAnalyticsConfig {
  enabled: boolean;
  trackingId: string;
}

export interface UmamiConfig {
  enabled: boolean;
  websiteId: string;
  scriptUrl: string;
}

export interface AnalyticsConfig {
  clarity: ClarityConfig;
  ga: GoogleAnalyticsConfig;
  umami: UmamiConfig;
}

declare global {
  interface Window {
    dataLayer?: any[];
    clarity?: (action: string, ...args: any[]) => void;
    gtag?: (command: string, ...args: any[]) => void;
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
    };
  }
}