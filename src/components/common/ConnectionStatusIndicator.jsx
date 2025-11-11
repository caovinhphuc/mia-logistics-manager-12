/**
 * Connection Status Indicator
 * Shows real-time connection status for backend and Google Sheets
 */

import {
  CheckCircle,
  Error, Refresh, Warning, Wifi,
  WifiOff
} from '@mui/icons-material';
import {
  Box, Chip, CircularProgress, IconButton, Tooltip, Typography
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import connectionStatusService from '../../services/api/connectionStatusService';

const ConnectionStatusIndicator = ({ compact = false, showLabels = true }) => {
  const [status, setStatus] = useState(connectionStatusService.getStatus());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Add listener for status changes
    const handleStatusChange = (newStatus) => {
      setStatus(newStatus);
    };

    connectionStatusService.addListener(handleStatusChange);

    // Start monitoring
    connectionStatusService.startMonitoring();

    // Cleanup
    return () => {
      connectionStatusService.removeListener(handleStatusChange);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await connectionStatusService.checkConnections();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusIcon = (connected, isChecking) => {
    if (isChecking) {
      return <CircularProgress size={16} color="inherit" />;
    }

    if (connected) {
      return (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <CheckCircle color="success" />
        </motion.div>
      );
    }

    return <Error color="error" />;
  };

  const getStatusColor = (connected) => {
    return connected ? 'success' : 'error';
  };

  const getStatusText = (connected) => {
    return connected ? 'Connected' : 'Disconnected';
  };

  const statusSummary = connectionStatusService.getStatusSummary();

  if (compact) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Tooltip title={`Backend: ${statusSummary.backend.status}`}>
          <IconButton size="small" onClick={handleRefresh} disabled={isRefreshing}>
            {getStatusIcon(status.backend, isRefreshing)}
          </IconButton>
        </Tooltip>

        <Tooltip title={`Google Sheets: ${statusSummary.googleSheets.status}`}>
          <IconButton size="small" onClick={handleRefresh} disabled={isRefreshing}>
            {getStatusIcon(status.googleSheets, isRefreshing)}
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap={2}>
      {/* Backend Status */}
      <Tooltip title={`Backend API: ${statusSummary.backend.status}`}>
        <Chip
          icon={getStatusIcon(status.backend, status.isChecking)}
          label={showLabels ? 'Backend' : ''}
          color={getStatusColor(status.backend)}
          variant={status.backend ? 'filled' : 'outlined'}
          size="small"
          onClick={handleRefresh}
          disabled={isRefreshing}
        />
      </Tooltip>

      {/* Google Sheets Status */}
      <Tooltip title={`Google Sheets: ${statusSummary.googleSheets.status}`}>
        <Chip
          icon={getStatusIcon(status.googleSheets, status.isChecking)}
          label={showLabels ? 'Google Sheets' : ''}
          color={getStatusColor(status.googleSheets)}
          variant={status.googleSheets ? 'filled' : 'outlined'}
          size="small"
          onClick={handleRefresh}
          disabled={isRefreshing}
        />
      </Tooltip>

      {/* Overall Status */}
      <Tooltip title={`Overall: ${statusSummary.overall.status}`}>
        <Chip
          icon={
            statusSummary.overall.connected ? (
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Wifi />
              </motion.div>
            ) : (
              <WifiOff />
            )
          }
          label={showLabels ? 'All Services' : ''}
          color={statusSummary.overall.connected ? 'success' : 'warning'}
          variant={statusSummary.overall.connected ? 'filled' : 'outlined'}
          size="small"
        />
      </Tooltip>

      {/* Last Check Time */}
      {status.lastCheck && (
        <Typography variant="caption" color="text.secondary">
          Last check: {status.lastCheck.toLocaleTimeString()}
        </Typography>
      )}

      {/* Refresh Button */}
      <Tooltip title="Refresh connections">
        <IconButton
          size="small"
          onClick={handleRefresh}
          disabled={isRefreshing}
          color="primary"
        >
          <Refresh className={isRefreshing ? 'rotating' : ''} />
        </IconButton>
      </Tooltip>

      {/* Status Messages */}
      <AnimatePresence>
        {!statusSummary.overall.connected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Chip
              icon={<Warning />}
              label="Some services disconnected"
              color="warning"
              variant="outlined"
              size="small"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS for rotating animation */}
      <style jsx>{`
        .rotating {
          animation: rotate 1s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
};

export default ConnectionStatusIndicator;
