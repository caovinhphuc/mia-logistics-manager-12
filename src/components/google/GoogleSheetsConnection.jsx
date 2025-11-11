import {
  CloudDone as ConnectedIcon,
  CloudOff as DisconnectedIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import {
  Alert, Box,
  Button,
  Card, CardActions, CardContent, Chip, CircularProgress, TextField, Typography
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GOOGLE_CONFIG } from '../../config/google';
import { useGoogle } from '../../contexts/GoogleContext';

const GoogleSheetsConnection = () => {
  const { t } = useTranslation();
  const {
    isConnected,
    loading,
    error,
    spreadsheetId,
    connectSpreadsheet,
    disconnect,
    clearError
  } = useGoogle();

  const [inputSpreadsheetId, setInputSpreadsheetId] = useState(
    GOOGLE_CONFIG.SPREADSHEET_ID
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const handleConnect = async () => {
    if (!inputSpreadsheetId.trim()) {
      return;
    }

    setIsConnecting(true);
    try {
      await connectSpreadsheet(inputSpreadsheetId.trim());
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const handleClearError = () => {
    clearError();
  };

  const handleShowSetup = async () => {
    try {
      const setup = await setupGoogleSheets(inputSpreadsheetId);
      console.log('Setup instructions:', setup);
      setShowSetup(true);
    } catch (error) {
      console.error('Setup error:', error);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Kết nối Google Sheets
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={handleClearError}
          >
            {error}
          </Alert>
        )}

        {isConnected ? (
          <Box>
            <Box display="flex" alignItems="center" mb={2}>
              <ConnectedIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="body1" color="success.main">
                Đã kết nối Google Sheets
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Spreadsheet ID:
              </Typography>
              <Chip
                label={spreadsheetId}
                variant="outlined"
                size="small"
              />
            </Box>

            <Button
              variant="outlined"
              color="error"
              onClick={handleDisconnect}
              disabled={loading}
            >
              Ngắt kết nối
            </Button>
          </Box>
        ) : (
          <Box>
            <Box display="flex" alignItems="center" mb={2}>
              <DisconnectedIcon sx={{ mr: 1, color: 'error.main' }} />
              <Typography variant="body1" color="error.main">
                Chưa kết nối Google Sheets
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Spreadsheet ID"
              value={inputSpreadsheetId}
              onChange={(e) => setInputSpreadsheetId(e.target.value)}
              placeholder="Nhập ID của Google Spreadsheet"
              sx={{ mb: 2 }}
              helperText="Lấy ID từ URL của Google Spreadsheet"
            />

            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={handleConnect}
                disabled={loading || isConnecting || !inputSpreadsheetId.trim()}
                startIcon={isConnecting ? <CircularProgress size={20} /> : <ConnectedIcon />}
              >
                {isConnecting ? 'Đang kết nối...' : 'Kết nối'}
              </Button>

              <Button
                variant="outlined"
                onClick={handleShowSetup}
                disabled={!inputSpreadsheetId.trim()}
              >
                Hướng dẫn setup
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>

      <CardActions>
        <Typography variant="caption" color="text.secondary">
          Sử dụng Mock Data khi chưa kết nối Google Sheets
        </Typography>
      </CardActions>
    </Card>
  );
};

export default GoogleSheetsConnection;
