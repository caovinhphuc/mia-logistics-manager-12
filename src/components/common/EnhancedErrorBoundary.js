import React from 'react';
import { Box, Button, Typography, Card, CardContent, Stack } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material';
import { logger } from '../../utils/logger';

/**
 * 🛡️ ENHANCED ERROR BOUNDARY
 * Catches JavaScript errors anywhere in the child component tree
 * Provides user-friendly error UI with recovery options
 */
class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state to show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || 'Unknown',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId
    };

    logger.error('Component Error Boundary Triggered', errorDetails);

    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report to error reporting service
    this.reportError(errorDetails);
  }

  reportError = (errorDetails) => {
    try {
      // Send to error reporting service (Sentry, LogRocket, etc.)
      // For now, we'll just store it locally
      const errors = JSON.parse(localStorage.getItem('mia_errors') || '[]');
      errors.push(errorDetails);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('mia_errors', JSON.stringify(errors));
    } catch (reportError) {
      logger.error('Failed to report error', { reportError: reportError.message });
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 2
          }}
        >
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3} alignItems="center" textAlign="center">
                {/* Error Icon */}
                <ErrorIcon sx={{ fontSize: 64, color: 'error.main' }} />
                
                {/* Error Message */}
                <Stack spacing={1}>
                  <Typography variant="h4" color="error.main" fontWeight="bold">
                    🚨 Có lỗi xảy ra
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Ứng dụng gặp sự cố không mong muốn. Chúng tôi đã ghi nhận lỗi này.
                  </Typography>
                  {this.state.errorId && (
                    <Typography variant="caption" color="text.disabled">
                      Mã lỗi: {this.state.errorId}
                    </Typography>
                  )}
                </Stack>

                {/* Development Error Details */}
                {isDevelopment && this.state.error && (
                  <Box
                    sx={{
                      bgcolor: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    <Typography variant="subtitle2" color="error" gutterBottom>
                      Chi tiết lỗi (Development):
                    </Typography>
                    <Typography variant="caption" component="pre" sx={{ 
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: '0.75rem'
                    }}>
                      {this.state.error.message}
                      {this.state.error.stack && `\n\nStack trace:\n${this.state.error.stack}`}
                    </Typography>
                  </Box>
                )}

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={this.handleRetry}
                    sx={{ minWidth: 120 }}
                  >
                    Thử lại
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={this.handleReload}
                    sx={{ minWidth: 120 }}
                  >
                    Tải lại
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<HomeIcon />}
                    onClick={this.handleGoHome}
                    sx={{ minWidth: 120 }}
                  >
                    Trang chủ
                  </Button>
                </Stack>

                {/* Help Text */}
                <Typography variant="caption" color="text.disabled">
                  Nếu lỗi tiếp tục xảy ra, vui lòng liên hệ bộ phận hỗ trợ kỹ thuật
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

/**
 * 🎯 FUNCTIONAL ERROR BOUNDARY WRAPPER
 * For use with React hooks
 */
export const withErrorBoundary = (WrappedComponent, errorBoundaryName) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <EnhancedErrorBoundary name={errorBoundaryName}>
        <WrappedComponent {...props} />
      </EnhancedErrorBoundary>
    );
  };
};

/**
 * 🔧 ERROR BOUNDARY HOOK
 * For handling errors in functional components
 */
export const useErrorHandler = () => {
  const handleError = React.useCallback((error, errorInfo = {}) => {
    const errorDetails = {
      message: error.message || error,
      stack: error.stack || new Error().stack,
      errorInfo,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    logger.error('Handled Error', errorDetails);
    
    // You can also trigger error boundary by throwing
    // throw error;
  }, []);

  return { handleError };
};

/**
 * 🚨 ASYNC ERROR HANDLER
 * For handling errors in async operations
 */
export const handleAsyncError = (error, context = '') => {
  const errorDetails = {
    message: error.message || error,
    stack: error.stack || new Error().stack,
    context,
    type: 'async',
    url: window.location.href,
    timestamp: new Date().toISOString()
  };

  logger.error('Async Error', errorDetails);
  
  // Don't rethrow async errors to avoid unhandled promise rejections
  return errorDetails;
};

export default EnhancedErrorBoundary;