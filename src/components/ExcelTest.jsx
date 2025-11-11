/**
 * MIA Logistics Manager - Excel Test Component
 * Test ExcelJS integration and functionality
 */

import {
  CheckCircle as CheckIcon,
  FileDownload as DownloadIcon,
  FileUpload as UploadIcon,
  TableChart as TableIcon,
} from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import excelService from "../services/excel/excelService";

const ExcelTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Test functions
  const testCreateWorkbook = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Initialize service
      excelService.initialize();

      // Create sample data
      const { headers, sampleData } = excelService.createSampleData();

      // Create workbook
      const workbook = excelService.createWorkbook();

      // Add worksheet
      const worksheet = excelService.addWorksheet("Test Sheet");

      // Set headers
      excelService.setHeaders(headers);

      // Add data
      excelService.addData(sampleData);

      // Auto-fit columns
      excelService.autoFitColumns();

      // Add filters
      excelService.addFilters();

      setResult({
        type: "success",
        message: "Workbook created successfully!",
        details: {
          workbookCreated: true,
          worksheetAdded: true,
          headersSet: headers.length,
          dataRows: sampleData.length,
          columns: headers.length,
        },
      });

      console.log("✅ Excel test completed successfully");
    } catch (err) {
      setError(err.message);
      console.error("❌ Excel test failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const testExportFile = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Create sample data
      const { headers, sampleData } = excelService.createSampleData();

      // Generate report
      await excelService.generateLogisticsReport(
        {
          headers,
          rows: sampleData,
        },
        "test_logistics_report.xlsx",
      );

      setResult({
        type: "success",
        message: "Excel file exported successfully!",
        details: {
          filename: "test_logistics_report.xlsx",
          exported: true,
          downloadStarted: true,
        },
      });

      console.log("✅ Excel export test completed successfully");
    } catch (err) {
      setError(err.message);
      console.error("❌ Excel export test failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const testLoadFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    excelService
      .loadFromFile(file)
      .then(() => {
        const headers = excelService.getHeaders();
        const data = excelService.getWorksheetData();

        setResult({
          type: "success",
          message: "Excel file loaded successfully!",
          details: {
            filename: file.name,
            headers: headers.length,
            dataRows: data.length,
            loaded: true,
          },
        });

        console.log("✅ Excel load test completed successfully");
      })
      .catch((err) => {
        setError(err.message);
        console.error("❌ Excel load test failed:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const resetService = () => {
    excelService.reset();
    setResult(null);
    setError(null);
    setLoading(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        ExcelJS Integration Test
      </Typography>

      {/* Status Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <TableIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                ExcelJS Service
              </Typography>
              <Chip
                label="Ready"
                color="success"
                icon={<CheckIcon />}
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <DownloadIcon
                sx={{ fontSize: 48, color: "success.main", mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                Export Functions
              </Typography>
              <Chip
                label="Available"
                color="success"
                icon={<CheckIcon />}
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <UploadIcon sx={{ fontSize: 48, color: "info.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Import Functions
              </Typography>
              <Chip
                label="Available"
                color="success"
                icon={<CheckIcon />}
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Test Buttons */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Functions
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              onClick={testCreateWorkbook}
              disabled={loading}
              startIcon={<TableIcon />}
            >
              Create Workbook
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              onClick={testExportFile}
              disabled={loading}
              startIcon={<DownloadIcon />}
              color="success"
            >
              Export Excel
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              component="label"
              disabled={loading}
              startIcon={<UploadIcon />}
              color="info"
            >
              Load Excel File
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={testLoadFile}
              />
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={resetService}
              disabled={loading}
              color="secondary"
            >
              Reset Service
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Processing Excel operations...
          </Typography>
        </Box>
      )}

      {/* Results */}
      {result && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>Success!</AlertTitle>
          {result.message}
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2">
            <strong>Details:</strong>
          </Typography>
          <Box component="pre" sx={{ mt: 1, fontSize: "0.875rem" }}>
            {JSON.stringify(result.details, null, 2)}
          </Box>
        </Alert>
      )}

      {/* Errors */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error!</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Information */}
      <Alert severity="info">
        <AlertTitle>ExcelJS Migration Complete!</AlertTitle>
        <Typography variant="body2" component="div">
          <strong>What's new:</strong>
          <ul>
            <li>✅ Secure ExcelJS library instead of vulnerable xlsx</li>
            <li>✅ Better performance and more features</li>
            <li>✅ Professional styling and formatting</li>
            <li>✅ Auto-fit columns and filters</li>
            <li>✅ File import/export functionality</li>
          </ul>
        </Typography>
      </Alert>
    </Box>
  );
};

export default ExcelTest;
