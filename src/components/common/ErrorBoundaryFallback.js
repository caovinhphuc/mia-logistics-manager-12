import { Error as ErrorIcon, Home as HomeIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';

/**
 * 🛡️ ERROR BOUNDARY FALLBACK
 * Simple error boundary fallback when EnhancedErrorBoundary fails
 */
const ErrorBoundaryFallback = ({ error, resetErrorBoundary }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 2,
        backgroundColor: '#f5f5f5'
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center', padding: 4 }}>
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />

          <Typography variant="h4" gutterBottom color="error">
            Đã xảy ra lỗi không mong muốn
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Xin lỗi, ứng dụng đã gặp sự cố. Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ.
          </Typography>

          {error && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Chi tiết lỗi: {error.message}
              </Typography>
            </Box>
          )}

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={resetErrorBoundary}
              color="primary"
            >
              Thử lại
            </Button>

            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => window.location.href = '/'}
              color="primary"
            >
              Về trang chủ
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ErrorBoundaryFallback;
