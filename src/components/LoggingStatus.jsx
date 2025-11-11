/**
 * MIA Logistics Manager - Logging Status Component
 * Hiển thị trạng thái logging system và performance metrics
 */

import {
  BugReport as BugReportIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Switch,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { log } from "../services/logging/logger";

const LoggingStatus = () => {
  const [performanceSummary, setPerformanceSummary] = useState(null);
  const [logLevel, setLogLevel] = useState("info");
  const [isDevelopment, setIsDevelopment] = useState(true);
  const [warningFilteringEnabled, setWarningFilteringEnabled] = useState(true);
  const [mockModeMessagesEnabled, setMockModeMessagesEnabled] = useState(false);

  useEffect(() => {
    // Get initial performance summary
    updatePerformanceSummary();

    // Update performance summary every 5 seconds
    const interval = setInterval(updatePerformanceSummary, 5000);

    return () => clearInterval(interval);
  }, []);

  const updatePerformanceSummary = () => {
    const summary = log.getPerformanceSummary();
    setPerformanceSummary(summary);
    setIsDevelopment(process.env.NODE_ENV === "development");
  };

  const handleClearConsole = () => {
    log.clearConsole();
    log.system("Console cleared manually");
    updatePerformanceSummary();
  };

  const handleLogTest = () => {
    log.error("TEST", "This is a test error message", { test: true });
    log.warn("TEST", "This is a test warning message", { test: true });
    log.info("TEST", "This is a test info message", { test: true });
    log.debug("TEST", "This is a test debug message", { test: true });

    // Service-specific logs
    log.googleAuth("Test Google Auth log");
    log.googleSheets("Test Google Sheets log");
    log.googleAppsScript("Test Google Apps Script log");
    log.mockMode("Test Mock Mode log");

    log.system("Test logging completed");
  };

  const handlePerformanceTest = () => {
    log.startTimer("test-operation");

    // Simulate some work
    setTimeout(
      () => {
        log.endTimer("test-operation");
        log.system("Performance test completed");
      },
      Math.random() * 1000 + 500,
    );
  };

  const handleToggleWarningFiltering = () => {
    setWarningFilteringEnabled(!warningFilteringEnabled);
    log.setWarningFiltering(!warningFilteringEnabled);
    log.system("Warning filtering toggled", {
      enabled: !warningFilteringEnabled,
    });
  };

  const handleTestWarningFilter = () => {
    // Test warning filtering by triggering a filtered warning
    console.warn(
      "React Router Future Flag Warning: This should be filtered out",
    );
    log.system("Warning filter test completed");
  };

  const handleToggleMockModeMessages = () => {
    setMockModeMessagesEnabled(!mockModeMessagesEnabled);
    log.setMockModeMessages(!mockModeMessagesEnabled);
    log.system("Mock mode messages toggled", {
      enabled: !mockModeMessagesEnabled,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Logging System Status
      </Typography>

      {/* Current Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <BugReportIcon
                sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                Logging Level
              </Typography>
              <Chip
                label={performanceSummary?.logLevel || "info"}
                color="primary"
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <SpeedIcon sx={{ fontSize: 48, color: "success.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                System Uptime
              </Typography>
              <Chip
                label={performanceSummary?.uptime || "0s"}
                color="success"
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <SettingsIcon sx={{ fontSize: 48, color: "info.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Environment
              </Typography>
              <Chip
                label={isDevelopment ? "Development" : "Production"}
                color={isDevelopment ? "warning" : "success"}
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Performance Metrics
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Uptime:</strong> {performanceSummary?.uptime || "0s"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Active Operations:</strong>{" "}
              {performanceSummary?.activeOperations || 0}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Log Level:</strong>{" "}
              {performanceSummary?.logLevel || "info"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Environment:</strong>{" "}
              {process.env.NODE_ENV || "development"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Logging Features */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Logging Features
        </Typography>

        <List>
          <ListItem>
            <ListItemText
              primary="Centralized Logging"
              secondary="All logs are managed through a single logging service"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Log Levels"
              secondary="ERROR, WARN, INFO, DEBUG with filtering"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Performance Monitoring"
              secondary="Automatic timing for operations taking >100ms"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Service-Specific Logging"
              secondary="Dedicated methods for Google services"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Clean Production Logs"
              secondary="Reduced logging in production environment"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Warning Filtering"
              secondary="Automatic filtering of React Router and Google API warnings from console.warn and console.error"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Test Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Controls
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleLogTest}
              startIcon={<BugReportIcon />}
            >
              Test Logging
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              onClick={handlePerformanceTest}
              startIcon={<SpeedIcon />}
              color="success"
            >
              Test Performance
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleClearConsole}
              startIcon={<ClearIcon />}
              color="secondary"
            >
              Clear Console
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={updatePerformanceSummary}
              startIcon={<InfoIcon />}
              color="info"
            >
              Refresh Status
            </Button>
          </Grid>
        </Grid>

        {/* Warning Filtering Controls */}
        <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Console Filtering
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={warningFilteringEnabled}
                    onChange={handleToggleWarningFiltering}
                    color="primary"
                  />
                }
                label="Filter React Router Warnings"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={mockModeMessagesEnabled}
                    onChange={handleToggleMockModeMessages}
                    color="secondary"
                  />
                }
                label="Show Mock Mode Messages"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                onClick={handleTestWarningFilter}
                color="secondary"
                size="small"
              >
                Test Warning Filter
              </Button>
            </Grid>
          </Grid>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Console filtering helps reduce noise by hiding common development
            warnings, Google API warnings, and mock mode messages.
          </Typography>
        </Box>
      </Paper>

      {/* Environment Variables */}
      <Alert severity="info">
        <AlertTitle>Logging Configuration</AlertTitle>
        <Typography variant="body2" component="div">
          <strong>Environment Variables:</strong>
          <ul>
            <li>
              <code>REACT_APP_LOG_LEVEL</code> - Set logging level (error, warn,
              info, debug)
            </li>
            <li>
              <code>REACT_APP_ENABLE_PERFORMANCE_MONITORING</code> -
              Enable/disable performance monitoring
            </li>
            <li>
              <code>REACT_APP_ENABLE_MOCK_MODE_MESSAGES</code> - Show/hide mock
              mode messages
            </li>
            <li>
              <code>NODE_ENV</code> - Development vs Production mode
            </li>
          </ul>

          <strong>Current Settings:</strong>
          <ul>
            <li>Log Level: {process.env.REACT_APP_LOG_LEVEL || "info"}</li>
            <li>
              Performance Monitoring:{" "}
              {process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING !== "false"
                ? "Enabled"
                : "Disabled"}
            </li>
            <li>
              Mock Mode Messages:{" "}
              {process.env.REACT_APP_ENABLE_MOCK_MODE_MESSAGES === "true"
                ? "Enabled"
                : "Disabled"}
            </li>
            <li>Environment: {process.env.NODE_ENV || "development"}</li>
          </ul>
        </Typography>
      </Alert>
    </Box>
  );
};

export default LoggingStatus;
