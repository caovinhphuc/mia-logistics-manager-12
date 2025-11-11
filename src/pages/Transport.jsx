import {
  Add as AddIcon,
  Cancel,
  CheckCircle,
  LocalShipping,
  Schedule,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

const Transport = () => {
  const { t } = useTranslation();

  const transportStatuses = [
    { label: t("transport.status.pending"), color: "warning", icon: Schedule },
    {
      label: t("transport.status.confirmed"),
      color: "info",
      icon: LocalShipping,
    },
    {
      label: t("transport.status.in_transit"),
      color: "primary",
      icon: LocalShipping,
    },
    {
      label: t("transport.status.delivered"),
      color: "success",
      icon: CheckCircle,
    },
    { label: t("transport.status.cancelled"), color: "error", icon: Cancel },
  ];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            {t("transport.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("transport.transport_list")}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ px: 3 }}>
          {t("transport.new_transport")}
        </Button>
      </Box>

      {/* Status Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {transportStatuses.map((status, index) => {
          const Icon = status.icon;
          return (
            <Grid item xs={12} sm={6} md={2.4} key={index}>
              <Card sx={{ textAlign: "center", p: 2 }}>
                <CardContent>
                  <Icon
                    sx={{ fontSize: 40, mb: 1, color: `${status.color}.main` }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {Math.floor(Math.random() * 50) + 10}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {status.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Transport List Placeholder */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {t("transport.transport_list")}
        </Typography>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <LocalShipping
            sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("common.loading")}...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Danh sách vận chuyển sẽ được hiển thị ở đây
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Transport;
