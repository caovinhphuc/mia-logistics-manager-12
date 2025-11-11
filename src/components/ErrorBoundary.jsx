import { Error as ErrorIcon } from "@mui/icons-material";
import { Box, Button, Paper, Typography } from "@mui/material";
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Paper
            sx={{
              maxWidth: "500px",
              padding: "40px",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <ErrorIcon sx={{ fontSize: 60, color: "#d32f2f", mb: 2 }} />

            <Typography variant="h5" color="error" gutterBottom>
              Đã xảy ra lỗi không mong muốn
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Xin lỗi, ứng dụng đã gặp sự cố. Vui lòng thử lại hoặc liên hệ bộ
              phận hỗ trợ.
            </Typography>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <Box sx={{ mb: 3, textAlign: "left" }}>
                <Typography variant="subtitle2" gutterBottom>
                  Chi tiết lỗi (dành cho nhà phát triển):
                </Typography>
                <Paper
                  sx={{
                    backgroundColor: "#f5f5f5",
                    padding: "16px",
                    borderRadius: "4px",
                    overflow: "auto",
                    fontSize: "12px",
                    maxHeight: "200px",
                  }}
                >
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{ whiteSpace: "pre-wrap" }}
                  >
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Paper>
              </Box>
            )}

            <Button
              variant="contained"
              onClick={this.handleRetry}
              sx={{ px: 3 }}
            >
              Thử lại
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
