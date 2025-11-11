// Console Configuration
// ======================
// Cấu hình console để ẩn các warning không quan trọng trong development

// Suppress Google API warnings
const suppressGoogleAPIWarnings = () => {
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  // Override console.warn
  console.warn = function (...args) {
    const message = args.join(" ");

    // Suppress Google API warnings
    if (
      message.includes(
        "iframe which has both allow-scripts and allow-same-origin",
      ) ||
      message.includes("can escape its sandboxing") ||
      message.includes("gapi.loaded_0") ||
      message.includes("gapi.loaded_1") ||
      message.includes("cb=gapi.loaded_0") ||
      message.includes("cb=gapi.loaded_1") ||
      message.includes(
        "An iframe which has both allow-scripts and allow-same-origin",
      )
    ) {
      return; // Don't log these warnings
    }

    originalConsoleWarn.apply(console, args);
  };

  // Override console.error
  console.error = function (...args) {
    const message = args.join(" ");

    // Suppress Google API errors
    if (
      message.includes(
        "iframe which has both allow-scripts and allow-same-origin",
      ) ||
      message.includes("can escape its sandboxing") ||
      message.includes("gapi.loaded_0") ||
      message.includes("gapi.loaded_1") ||
      message.includes("cb=gapi.loaded_0") ||
      message.includes("cb=gapi.loaded_1")
    ) {
      return; // Don't log these errors
    }

    originalConsoleError.apply(console, args);
  };

  // Override console.log
  console.log = function (...args) {
    const message = args.join(" ");

    // Suppress Google API logs
    if (
      message.includes("gapi.loaded_0") ||
      message.includes("gapi.loaded_1") ||
      message.includes("cb=gapi.loaded_0") ||
      message.includes("cb=gapi.loaded_1")
    ) {
      return; // Don't log these messages
    }

    originalConsoleLog.apply(console, args);
  };
};

// Suppress React development warnings
const suppressReactWarnings = () => {
  const originalConsoleWarn = console.warn;

  console.warn = function (...args) {
    const message = args.join(" ");

    // Suppress React development warnings
    if (
      message.includes("ReactDOM.render is no longer supported") ||
      message.includes("componentWillReceiveProps has been renamed") ||
      message.includes("componentWillMount has been renamed") ||
      message.includes("componentWillUpdate has been renamed")
    ) {
      return; // Don't log these warnings
    }

    originalConsoleWarn.apply(console, args);
  };
};

// Suppress webpack warnings
const suppressWebpackWarnings = () => {
  const originalConsoleWarn = console.warn;

  console.warn = function (...args) {
    const message = args.join(" ");

    // Suppress webpack warnings
    if (
      message.includes("webpack") ||
      message.includes("DeprecationWarning") ||
      message.includes("onAfterSetupMiddleware") ||
      message.includes("onBeforeSetupMiddleware")
    ) {
      return; // Don't log these warnings
    }

    originalConsoleWarn.apply(console, args);
  };
};

// Initialize all warning suppressions
const initializeWarningSuppression = () => {
  suppressGoogleAPIWarnings();
  suppressReactWarnings();
  suppressWebpackWarnings();

  console.log("🔇 Console warnings suppression initialized");
};

export default initializeWarningSuppression;
