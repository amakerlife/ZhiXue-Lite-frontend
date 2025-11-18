export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean | null | undefined>;
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
    dataLayer?: unknown[];
    clarity?: {
      (action: string, ...args: unknown[]): void;
      q?: unknown[];
      v?: unknown;
      t?: boolean;
    };
    gtag?: (command: string, ...args: unknown[]) => void;
    umami?: {
      track: (
        eventName: string,
        eventData?: Record<string, string | number | boolean | null | undefined>,
      ) => void;
    };
  }
}
