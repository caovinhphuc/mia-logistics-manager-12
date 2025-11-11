// MIA Logistics Manager - Warning Suppression & Error Handling
(function() {
    'use strict';

    // Suppress specific Google API warnings
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = function(...args) {
        const message = args.join(' ');

        // Suppress Google API specific warnings
        if (message.includes('Google API initialization failed') ||
            message.includes('using fallback mode') ||
            message.includes('iframe which has both allow-scripts and allow-same-origin') ||
            message.includes('Content Security Policy directive')) {
            return;
        }

        // Log other warnings normally
        originalWarn.apply(console, args);
    };

    console.error = function(...args) {
        const message = args.join(' ');

        // Suppress Google API specific errors
        if (message.includes('Google API') ||
            message.includes('gapi') ||
            message.includes('accounts.google.com') ||
            message.includes('CSP report')) {
            return;
        }

        // Log other errors normally
        originalError.apply(console, args);
    };

    // Handle Google API fallback mode
    window.addEventListener('googleApiFallback', function(event) {
        console.log('🔄 Google API fallback mode activated');

        // Set global fallback flag
        window.googleApiFallback = true;

        // Notify React app if available
        if (window.React && window.React.version) {
            // React app is loaded, dispatch custom event
            window.dispatchEvent(new CustomEvent('googleApiReady', {
                detail: { fallback: true }
            }));
        }
    });

    // Enhanced error handling for Google APIs
    window.addEventListener('error', function(event) {
        if (event.filename && event.filename.includes('google')) {
            console.log('🔧 Google API error handled gracefully');
            event.preventDefault();
            return false;
        }
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        if (event.reason && event.reason.toString().includes('google')) {
            console.log('🔧 Google API promise rejection handled gracefully');
            event.preventDefault();
            return false;
        }
    });

    // Initialize Google API with better error handling
    function initGoogleAPI() {
        if (typeof gapi !== 'undefined') {
            try {
                gapi.load('client', {
                    callback: function() {
                        console.log('✅ Google API initialized successfully');
                        window.googleApiReady = true;
                        window.dispatchEvent(new CustomEvent('googleApiReady', {
                            detail: { fallback: false }
                        }));
                    },
                    onerror: function(error) {
                        console.log('⚠️ Google API fallback mode');
                        window.googleApiFallback = true;
                        window.dispatchEvent(new CustomEvent('googleApiReady', {
                            detail: { fallback: true }
                        }));
                    }
                });
            } catch (error) {
                console.log('⚠️ Google API fallback mode');
                window.googleApiFallback = true;
                window.dispatchEvent(new CustomEvent('googleApiReady', {
                    detail: { fallback: true }
                }));
            }
        } else {
            // GAPI not available, use fallback
            setTimeout(function() {
                console.log('⚠️ Google API not available - using fallback mode');
                window.googleApiFallback = true;
                window.dispatchEvent(new CustomEvent('googleApiReady', {
                    detail: { fallback: true }
                }));
            }, 1000);
        }
    }

    // Wait for DOM and initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGoogleAPI);
    } else {
        initGoogleAPI();
    }

    // Export utilities
    window.MIALogisticsUtils = {
        isGoogleApiReady: function() {
            return window.googleApiReady === true;
        },
        isGoogleApiFallback: function() {
            return window.googleApiFallback === true;
        },
        getGoogleApiStatus: function() {
            return {
                ready: window.googleApiReady === true,
                fallback: window.googleApiFallback === true
            };
        }
    };

})();
