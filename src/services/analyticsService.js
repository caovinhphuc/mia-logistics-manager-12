// Custom Analytics Service
class AnalyticsService {
  constructor() {
    this.endpoint = process.env.REACT_APP_ANALYTICS_ENDPOINT;
    this.apiKey = process.env.REACT_APP_ANALYTICS_API_KEY;
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  generateSessionId() {
    return (
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  // Track page views
  trackPageView(pageName, pageUrl) {
    this.sendEvent("page_view", {
      page_name: pageName,
      page_url: pageUrl,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      referrer: document.referrer,
    });
  }

  // Track user actions
  trackEvent(eventName, eventData = {}) {
    this.sendEvent(eventName, {
      ...eventData,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_title: document.title,
    });
  }

  // Track Google API usage
  trackGoogleAPIUsage(
    apiName,
    operation,
    success,
    responseTime,
    errorMessage = null,
  ) {
    this.sendEvent("google_api_usage", {
      api_name: apiName,
      operation: operation,
      success: success,
      response_time: responseTime,
      error_message: errorMessage,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
    });
  }

  // Track business metrics
  trackBusinessMetric(metricName, value, metadata = {}) {
    this.sendEvent("business_metric", {
      metric_name: metricName,
      value: value,
      metadata: metadata,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
    });
  }

  // Track errors
  trackError(error, context = {}) {
    this.sendEvent("error", {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      context: context,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    });
  }

  // Send event to analytics endpoint
  sendEvent(eventType, eventData) {
    if (!this.endpoint) {
      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log("Analytics Event:", eventType, eventData);
      }
      return;
    }

    const payload = {
      event_type: eventType,
      data: eventData,
      api_key: this.apiKey,
    };

    fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch((error) => {
      console.error("Analytics error:", error);
    });
  }

  // Track session end
  trackSessionEnd() {
    const sessionDuration = Date.now() - this.startTime;
    this.trackEvent("session_end", {
      session_duration: sessionDuration,
      session_id: this.sessionId,
    });
  }
}

// Create singleton instance
const analytics = new AnalyticsService();

// Track session end when page unloads
window.addEventListener("beforeunload", () => {
  analytics.trackSessionEnd();
});

export default analytics;
