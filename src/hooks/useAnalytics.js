// Custom hook for analytics
import { useEffect } from "react";
import { MONITORING_CONFIG } from "../config/monitoring";
import analytics from "../services/analyticsService";

export const useAnalytics = () => {
  useEffect(() => {
    if (MONITORING_CONFIG.CUSTOM_ANALYTICS.ENABLED) {
      analytics.trackPageView(document.title, window.location.href);
    }
  }, []);

  const trackEvent = (eventName, eventData) => {
    if (MONITORING_CONFIG.CUSTOM_ANALYTICS.ENABLED) {
      analytics.trackEvent(eventName, eventData);
    }
  };

  const trackGoogleAPIUsage = (
    apiName,
    operation,
    success,
    responseTime,
    errorMessage,
  ) => {
    if (MONITORING_CONFIG.BUSINESS_METRICS.ENABLED) {
      analytics.trackGoogleAPIUsage(
        apiName,
        operation,
        success,
        responseTime,
        errorMessage,
      );
    }
  };

  const trackBusinessMetric = (metricName, value, metadata) => {
    if (MONITORING_CONFIG.BUSINESS_METRICS.ENABLED) {
      analytics.trackBusinessMetric(metricName, value, metadata);
    }
  };

  const trackError = (error, context) => {
    if (MONITORING_CONFIG.BUSINESS_METRICS.ENABLED) {
      analytics.trackError(error, context);
    }
  };

  return {
    trackEvent,
    trackGoogleAPIUsage,
    trackBusinessMetric,
    trackError,
  };
};
