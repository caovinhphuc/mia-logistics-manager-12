import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { vi } from 'date-fns/locale';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import initializeWarningSuppression from './utils/consoleConfig'; // Additional warning suppression
import './utils/suppressWarnings'; // Suppress Google API warnings

// Import contexts and providers
import { AuthProvider } from './contexts/AuthContext';
import { GoogleProvider } from './contexts/GoogleContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeContextProvider } from './contexts/ThemeContext';

// Import main App component
import App from './App';

// Import utilities
import EnhancedErrorBoundary from './components/common/EnhancedErrorBoundary';
import { logger } from './utils/logger';

// Import theme
import createMIATheme from './styles/theme';

// Import global styles
import './locales/i18n';
import './styles/global.css';


// Create QueryClient with Vietnamese configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      staleTime: 5 * 60 * 1000, // 5 phút
      cacheTime: 10 * 60 * 1000, // 10 phút
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        maxWidth: '500px',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#d32f2f', marginBottom: '16px' }}>
          Đã xảy ra lỗi không mong muốn
        </h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Xin lỗi, ứng dụng đã gặp sự cố. Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ.
        </p>
        <details style={{ marginBottom: '24px', textAlign: 'left' }}>
          <summary style={{ cursor: 'pointer', color: '#1976d2' }}>
            Chi tiết lỗi (dành cho nhà phát triển)
          </summary>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '16px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px',
            marginTop: '8px'
          }}>
            {error.message}
          </pre>
        </details>
        <button
          onClick={resetErrorBoundary}
          style={{
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Thử lại
        </button>
      </div>
    </div>
  );
};

// Main App Wrapper with all providers
const AppWrapper = () => {
  return (
    <EnhancedErrorBoundary name="RootApp">
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error, errorInfo) => {
          logger.error('Application Root Error', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack
          });
          // Send error to logging service
          if (process.env.REACT_APP_ERROR_REPORTING === 'true') {
            // sendErrorToLoggingService(error, errorInfo);
          }
        }}
      >
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <ThemeContextProvider>
                <ThemeProvider theme={createMIATheme(false)}>
                  <CssBaseline />
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                    <LanguageProvider>
                      <AuthProvider>
                        <GoogleProvider>
                          <NotificationProvider>
                            <App />
                            <Toaster
                              position="top-right"
                              toastOptions={{
                                duration: 5000,
                                style: {
                                  background: '#333',
                                  color: '#fff',
                                },
                                success: {
                                  style: {
                                    background: '#4caf50',
                                  },
                                },
                                error: {
                                  style: {
                                    background: '#f44336',
                                  },
                                },
                              }}
                            />
                          </NotificationProvider>
                        </GoogleProvider>
                      </AuthProvider>
                    </LanguageProvider>
                  </LocalizationProvider>
                </ThemeProvider>
              </ThemeContextProvider>
            </BrowserRouter>
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </QueryClientProvider>
        </HelmetProvider>
      </ErrorBoundary>
    </EnhancedErrorBoundary>
  );
};

// Initialize warning suppression
initializeWarningSuppression();

// Render app
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
);
