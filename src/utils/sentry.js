// Sentry Configuration
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

// Initialize Sentry only if DSN is provided
if (
  process.env.REACT_APP_SENTRY_DSN &&
  process.env.REACT_APP_SENTRY_DSN !== "YOUR_SENTRY_DSN_HERE"
) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    beforeSend(event) {
      // Filter out development errors
      if (process.env.NODE_ENV === "development") {
        return null;
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      // Filter out sensitive data
      if (breadcrumb.category === "console" && breadcrumb.level === "error") {
        return null;
      }
      return breadcrumb;
    },
  });
} else {
  console.log("Sentry disabled: No valid DSN provided");
}

export default Sentry;
