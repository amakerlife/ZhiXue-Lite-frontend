import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";

export const usePageTracking = () => {
  const location = useLocation();
  const { trackPageView } = useAnalyticsContext();

  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname, trackPageView]);
};
