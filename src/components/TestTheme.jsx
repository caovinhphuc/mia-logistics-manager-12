import { Box, Button, Card, Typography, useTheme } from "@mui/material";
import React from "react";
import createMIATheme from "../styles/theme";

const TestTheme = () => {
  const theme = useTheme();
  const lightTheme = createMIATheme(false);
  const darkTheme = createMIATheme(true);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Theme Test Component
      </Typography>

      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Current Theme Info
        </Typography>
        <Typography variant="body2">Mode: {theme.palette.mode}</Typography>
        <Typography variant="body2">
          Primary Color: {theme.palette.primary.main}
        </Typography>
        <Typography variant="body2">
          Secondary Color: {theme.palette.secondary.main}
        </Typography>
      </Card>

      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Light Theme Colors
        </Typography>
        <Typography variant="body2">
          Primary: {lightTheme.palette.primary.main}
        </Typography>
        <Typography variant="body2">
          Secondary: {lightTheme.palette.secondary.main}
        </Typography>
        <Typography variant="body2">
          Background: {lightTheme.palette.background.default}
        </Typography>
      </Card>

      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Dark Theme Colors
        </Typography>
        <Typography variant="body2">
          Primary: {darkTheme.palette.primary.main}
        </Typography>
        <Typography variant="body2">
          Secondary: {darkTheme.palette.secondary.main}
        </Typography>
        <Typography variant="body2">
          Background: {darkTheme.palette.background.default}
        </Typography>
      </Card>

      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Logistics Colors
        </Typography>
        <Typography variant="body2">
          Transport: {theme.palette.logistics?.transport?.main || "N/A"}
        </Typography>
        <Typography variant="body2">
          Warehouse: {theme.palette.logistics?.warehouse?.main || "N/A"}
        </Typography>
        <Typography variant="body2">
          Staff: {theme.palette.logistics?.staff?.main || "N/A"}
        </Typography>
        <Typography variant="body2">
          Partner: {theme.palette.logistics?.partner?.main || "N/A"}
        </Typography>
      </Card>

      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Vietnamese Colors
        </Typography>
        <Typography variant="body2">
          Red: {theme.palette.vietnamese?.red || "N/A"}
        </Typography>
        <Typography variant="body2">
          Gold: {theme.palette.vietnamese?.gold || "N/A"}
        </Typography>
        <Typography variant="body2">
          Green: {theme.palette.vietnamese?.green || "N/A"}
        </Typography>
        <Typography variant="body2">
          Blue: {theme.palette.vietnamese?.blue || "N/A"}
        </Typography>
      </Card>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button variant="contained" color="primary">
          Primary Button
        </Button>
        <Button variant="contained" color="secondary">
          Secondary Button
        </Button>
        <Button variant="outlined" color="primary">
          Outlined Primary
        </Button>
        <Button variant="text" color="primary">
          Text Primary
        </Button>
      </Box>
    </Box>
  );
};

export default TestTheme;
