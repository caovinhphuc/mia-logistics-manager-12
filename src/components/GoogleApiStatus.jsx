import {
  CheckCircle,
  Cloud,
  Error,
  Google,
  Refresh,
  Storage,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

const GoogleAPIStatus = () => {
  const [status, setStatus] = useState({
    loading: true,
    googleAPI: false,
    googleSheets: false,
    googleDrive: false,
    error: null,
    details: {},
  });

  const testGoogleAPI = async () => {
    setStatus((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Test Google API script loading
      const scriptLoaded = !!document.querySelector(
        'script[src*="apis.google.com"]',
      );

      // Test Google API client
      const clientAvailable = !!(window.gapi && window.gapi.client);

      // Test Google Sheets
      let sheetsAvailable = false;
      if (clientAvailable) {
        try {
          await window.gapi.client.sheets.spreadsheets.get({
            spreadsheetId: process.env.REACT_APP_GOOGLE_SPREADSHEET_ID,
          });
          sheetsAvailable = true;
        } catch (error) {
          console.warn("Google Sheets test failed:", error);
        }
      }

      setStatus({
        loading: false,
        googleAPI: scriptLoaded && clientAvailable,
        googleSheets: sheetsAvailable,
        googleDrive: false, // TODO: Test Google Drive
        error: null,
        details: {
          scriptLoaded,
          clientAvailable,
          sheetsAvailable,
          environmentVariables: {
            clientId: !!process.env.REACT_APP_GOOGLE_CLIENT_ID,
            apiKey: !!process.env.REACT_APP_GOOGLE_API_KEY,
            spreadsheetId: !!process.env.REACT_APP_GOOGLE_SPREADSHEET_ID,
          },
        },
      });
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  useEffect(() => {
    testGoogleAPI();
  }, []);

  const getStatusColor = (isWorking) => {
    return isWorking ? "success" : "error";
  };

  const getStatusIcon = (isWorking) => {
    return isWorking ? <CheckCircle /> : <Error />;
  };

  const getStatusText = (isWorking) => {
    return isWorking ? "Hoạt động" : "Lỗi";
  };

  return (
    <Card sx={{ maxWidth: 600, margin: "auto", mt: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Google sx={{ mr: 1 }} />
          <Typography variant="h6">Trạng thái Google API</Typography>
          <Button
            startIcon={<Refresh />}
            onClick={testGoogleAPI}
            disabled={status.loading}
            sx={{ ml: "auto" }}
            size="small"
          >
            Kiểm tra lại
          </Button>
        </Box>

        {status.loading && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            py={2}
          >
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography>Đang kiểm tra...</Typography>
          </Box>
        )}

        {status.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">{status.error}</Typography>
          </Alert>
        )}

        {!status.loading && (
          <>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Cloud color={getStatusColor(status.googleAPI)} />
                </ListItemIcon>
                <ListItemText
                  primary="Google API"
                  secondary="Kết nối Google API"
                />
                <Chip
                  icon={getStatusIcon(status.googleAPI)}
                  label={getStatusText(status.googleAPI)}
                  color={getStatusColor(status.googleAPI)}
                  size="small"
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Storage color={getStatusColor(status.googleSheets)} />
                </ListItemIcon>
                <ListItemText
                  primary="Google Sheets"
                  secondary="Kết nối Google Sheets"
                />
                <Chip
                  icon={getStatusIcon(status.googleSheets)}
                  label={getStatusText(status.googleSheets)}
                  color={getStatusColor(status.googleSheets)}
                  size="small"
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Storage color={getStatusColor(status.googleDrive)} />
                </ListItemIcon>
                <ListItemText
                  primary="Google Drive"
                  secondary="Kết nối Google Drive"
                />
                <Chip
                  icon={getStatusIcon(status.googleDrive)}
                  label={getStatusText(status.googleDrive)}
                  color={getStatusColor(status.googleDrive)}
                  size="small"
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Chi tiết kỹ thuật:
            </Typography>

            <List dense>
              <ListItem>
                <ListItemText
                  primary="Script Google API"
                  secondary={
                    status.details.scriptLoaded ? "Đã tải" : "Chưa tải"
                  }
                />
                <Chip
                  label={status.details.scriptLoaded ? "OK" : "Lỗi"}
                  color={status.details.scriptLoaded ? "success" : "error"}
                  size="small"
                />
              </ListItem>

              <ListItem>
                <ListItemText
                  primary="Google API Client"
                  secondary={
                    status.details.clientAvailable
                      ? "Sẵn sàng"
                      : "Chưa sẵn sàng"
                  }
                />
                <Chip
                  label={status.details.clientAvailable ? "OK" : "Lỗi"}
                  color={status.details.clientAvailable ? "success" : "error"}
                  size="small"
                />
              </ListItem>

              <ListItem>
                <ListItemText
                  primary="Google Sheets"
                  secondary={
                    status.details.sheetsAvailable
                      ? "Kết nối thành công"
                      : "Kết nối thất bại"
                  }
                />
                <Chip
                  label={status.details.sheetsAvailable ? "OK" : "Lỗi"}
                  color={status.details.sheetsAvailable ? "success" : "error"}
                  size="small"
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Environment Variables:
            </Typography>

            <List dense>
              <ListItem>
                <ListItemText
                  primary="Google Client ID"
                  secondary={
                    status.details.environmentVariables?.clientId
                      ? "Đã cấu hình"
                      : "Chưa cấu hình"
                  }
                />
                <Chip
                  label={
                    status.details.environmentVariables?.clientId ? "OK" : "Lỗi"
                  }
                  color={
                    status.details.environmentVariables?.clientId
                      ? "success"
                      : "error"
                  }
                  size="small"
                />
              </ListItem>

              <ListItem>
                <ListItemText
                  primary="Google API Key"
                  secondary={
                    status.details.environmentVariables?.apiKey
                      ? "Đã cấu hình"
                      : "Chưa cấu hình"
                  }
                />
                <Chip
                  label={
                    status.details.environmentVariables?.apiKey ? "OK" : "Lỗi"
                  }
                  color={
                    status.details.environmentVariables?.apiKey
                      ? "success"
                      : "error"
                  }
                  size="small"
                />
              </ListItem>

              <ListItem>
                <ListItemText
                  primary="Spreadsheet ID"
                  secondary={
                    status.details.environmentVariables?.spreadsheetId
                      ? "Đã cấu hình"
                      : "Chưa cấu hình"
                  }
                />
                <Chip
                  label={
                    status.details.environmentVariables?.spreadsheetId
                      ? "OK"
                      : "Lỗi"
                  }
                  color={
                    status.details.environmentVariables?.spreadsheetId
                      ? "success"
                      : "error"
                  }
                  size="small"
                />
              </ListItem>
            </List>

            {!status.googleAPI && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Chế độ Fallback:</strong> Google API không khả dụng.
                  Ứng dụng đang sử dụng dữ liệu mẫu để đảm bảo hoạt động ổn
                  định.
                </Typography>
              </Alert>
            )}

            {status.googleAPI && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Kết nối thành công:</strong> Google API đang hoạt động
                  bình thường. Dữ liệu sẽ được đồng bộ với Google Sheets.
                </Typography>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleAPIStatus;
