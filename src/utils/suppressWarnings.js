// Suppress Google API iframe sandbox warnings
// ===========================================

// Suppress iframe sandbox warnings from Google API
const originalConsoleWarn = console.warn;
console.warn = function (...args) {
  const message = args.join(' ');

  // Suppress all Google API related warnings
  if (
    message.includes(
      'iframe which has both allow-scripts and allow-same-origin'
    ) ||
    message.includes('can escape its sandboxing') ||
    message.includes('gapi.loaded_0') ||
    message.includes('gapi.loaded_1') ||
    message.includes('cb=gapi.loaded_0') ||
    message.includes('cb=gapi.loaded_1') ||
    message.includes(
      'An iframe which has both allow-scripts and allow-same-origin'
    ) ||
    message.includes('migration_mod') ||
    message.includes('_.g.MB') ||
    message.includes('Du.MB') ||
    message.includes('_.qv') ||
    message.includes('_.uv') ||
    message.includes('_.Av') ||
    message.includes('qx.JI') ||
    message.includes('qx') ||
    message.includes('_.yx') ||
    message.includes('Ha.u') ||
    message.includes('Ha.J') ||
    message.includes('api.js') ||
    message.includes('callback')
  ) {
    return; // Don't log these Google API warnings
  }

  // Log other warnings normally
  originalConsoleWarn.apply(console, args);
};

// Suppress Google API migration warnings
const originalConsoleLog = console.log;
console.log = function (...args) {
  const message = args.join(' ');

  // Suppress all Google API related logs
  if (
    message.includes('gapi.loaded_0') ||
    message.includes('gapi.loaded_1') ||
    message.includes('cb=gapi.loaded_0') ||
    message.includes('cb=gapi.loaded_1') ||
    message.includes('migration_mod') ||
    message.includes('_.g.MB') ||
    message.includes('Du.MB') ||
    message.includes('_.qv') ||
    message.includes('_.uv') ||
    message.includes('_.Av') ||
    message.includes('qx.JI') ||
    message.includes('qx') ||
    message.includes('_.yx') ||
    message.includes('Ha.u') ||
    message.includes('Ha.J') ||
    message.includes('api.js') ||
    message.includes('callback')
  ) {
    return; // Don't log these Google API messages
  }

  // Log other messages normally
  originalConsoleLog.apply(console, args);
};

// Suppress Google API error messages
const originalConsoleError = console.error;
console.error = function (...args) {
  const message = args.join(' ');

  // Suppress all Google API related errors
  if (
    message.includes(
      'iframe which has both allow-scripts and allow-same-origin'
    ) ||
    message.includes('can escape its sandboxing') ||
    message.includes('cb=gapi.loaded_0') ||
    message.includes('cb=gapi.loaded_1') ||
    message.includes('gapi.loaded_0') ||
    message.includes('gapi.loaded_1') ||
    message.includes('migration_mod') ||
    message.includes('_.g.MB') ||
    message.includes('Du.MB') ||
    message.includes('_.qv') ||
    message.includes('_.uv') ||
    message.includes('_.Av') ||
    message.includes('qx.JI') ||
    message.includes('qx') ||
    message.includes('_.yx') ||
    message.includes('Ha.u') ||
    message.includes('Ha.J') ||
    message.includes('api.js') ||
    message.includes('callback')
  ) {
    return; // Don't log these Google API errors
  }

  // Log other errors normally
  originalConsoleError.apply(console, args);
};

// Additional warning suppression for development
// ===============================================

// Suppress React development warnings
const originalConsoleInfo = console.info;
console.info = function (...args) {
  const message = args.join(' ');

  // Suppress React development warnings
  if (message.includes('ReactDOM.render is no longer supported')) {
    return;
  }

  if (message.includes('componentWillReceiveProps has been renamed')) {
    return;
  }

  // Log other info normally
  originalConsoleInfo.apply(console, args);
};

// Suppress webpack warnings
const originalConsoleDebug = console.debug;
console.debug = function (...args) {
  const message = args.join(' ');

  // Suppress webpack warnings
  if (message.includes('webpack')) {
    return;
  }

  // Log other debug messages normally
  originalConsoleDebug.apply(console, args);
};

// Global warning suppression
window.addEventListener('error', (event) => {
  const message = event.message || '';

  // Suppress Google API iframe sandboxing errors
  if (
    message.includes(
      'iframe which has both allow-scripts and allow-same-origin'
    )
  ) {
    event.preventDefault();
    return false;
  }

  if (message.includes('can escape its sandboxing')) {
    event.preventDefault();
    return false;
  }

  if (
    message.includes('cb=gapi.loaded_0') ||
    message.includes('cb=gapi.loaded_1')
  ) {
    event.preventDefault();
    return false;
  }
});

// Suppress unhandled promise rejections for Google API
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || '';

  // Suppress Google API related promise rejections
  if (message.includes('gapi') || message.includes('Google API')) {
    event.preventDefault();
    return false;
  }
});

export default {};
