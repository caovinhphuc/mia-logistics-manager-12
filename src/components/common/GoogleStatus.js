import React from 'react';
import { Box, Card, CardContent, Typography, Chip, Alert, AlertTitle } from '@mui/material';
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material';
import { useGoogle } from '../../contexts/GoogleContext';

const GoogleStatus = () => {
  const { isInitialized, isConnected, loading, error, sheets, drive, appsScript } = useGoogle();

  const getStatusIcon = (connected, loading) => {
    if (loading) return <Info color="info" />;
    if (connected) return <CheckCircle color="success" />;
    return <Error color="error" />;
  };

  const getStatusColor = (connected, loading) => {
    if (loading) return 'info';
    if (connected) return 'success';
    return 'error';
  };

  const getStatusText = (connected, loading) => {
    if (loading) return 'Đang kết nối...';
    if (connected) return 'Đã kết nối';
    return 'Chưa kết nối';
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🔗 Trạng thái kết nối Google Services
        </Typography>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Cảnh báo</AlertTitle>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Google Sheets Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 120 }}>
              📊 Google Sheets:
            </Typography>
            <Chip
              icon={getStatusIcon(sheets.connected, loading)}
              label={getStatusText(sheets.connected, loading)}
              color={getStatusColor(sheets.connected, loading)}
              size="small"
            />
            {sheets.spreadsheetId && (
              <Typography variant="caption" color="text.secondary">
                ID: {sheets.spreadsheetId}
              </Typography>
            )}
          </Box>

          {/* Google Drive Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 120 }}>
              💾 Google Drive:
            </Typography>
            <Chip
              icon={getStatusIcon(drive.connected, loading)}
              label={getStatusText(drive.connected, loading)}
              color={getStatusColor(drive.connected, loading)}
              size="small"
            />
            {drive.folderId && (
              <Typography variant="caption" color="text.secondary">
                Folder ID: {drive.folderId}
              </Typography>
            )}
          </Box>

          {/* Google Apps Script Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 120 }}>
              ⚙️ Apps Script:
            </Typography>
            <Chip
              icon={getStatusIcon(appsScript.connected, loading)}
              label={getStatusText(appsScript.connected, loading)}
              color={getStatusColor(appsScript.connected, loading)}
              size="small"
            />
            {appsScript.scriptId && (
              <Typography variant="caption" color="text.secondary">
                Script ID: {appsScript.scriptId}
              </Typography>
            )}
          </Box>

          {/* Overall Status */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Trạng thái tổng thể:</strong>{' '}
              {isInitialized ? 'Đã khởi tạo' : 'Đang khởi tạo...'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Chế độ:</strong>{' '}
              {process.env.REACT_APP_USE_MOCK_DATA === 'true' ? 'Mock Data' : 'Live Data'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GoogleStatus;
