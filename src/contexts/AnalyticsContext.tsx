import React, { createContext, useContext, type ReactNode } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

interface AnalyticsContextType {
  trackEvent: (
    eventName: string,
    properties?: Record<string, string | number | boolean | null | undefined>,
  ) => void;
  trackPageView: (path: string, title?: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined,
);

// eslint-disable-next-line react-refresh/only-export-components
export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error(
      "useAnalyticsContext must be used within an AnalyticsProvider",
    );
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
}) => {
  const { trackEvent, trackPageView } = useAnalytics();

  return (
    <AnalyticsContext.Provider value={{ trackEvent, trackPageView }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
