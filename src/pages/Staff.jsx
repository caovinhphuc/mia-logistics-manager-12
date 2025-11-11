import {
  Add as AddIcon,
  AdminPanelSettings,
  DriveEta,
  People,
  Warehouse,
} from "@mui/icons-material";
import {
  Avatar,
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

const Staff = () => {
  const { t } = useTranslation();

  const staffRoles = [
    {
      label: t("staff.roles.admin"),
      count: 3,
      icon: AdminPanelSettings,
      color: "#f44336",
    },
    {
      label: t("staff.roles.manager"),
      count: 8,
      icon: People,
      color: "#2196f3",
    },
    {
      label: t("staff.roles.driver"),
      count: 25,
      icon: DriveEta,
      color: "#ff9800",
    },
    {
      label: t("staff.roles.warehouse_staff"),
      count: 15,
      icon: Warehouse,
      color: "#4caf50",
    },
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
            {t("staff.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("staff.staff_list")}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ px: 3 }}>
          {t("staff.new_staff")}
        </Button>
      </Box>

      {/* Role Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {staffRoles.map((role, index) => {
          const Icon = role.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ textAlign: "center", p: 2 }}>
                <CardContent>
                  <Avatar
                    sx={{
                      bgcolor: role.color,
                      width: 48,
                      height: 48,
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <Icon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {role.count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {role.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Staff List Placeholder */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {t("staff.staff_list")}
        </Typography>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <People sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("common.loading")}...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Danh sách nhân viên sẽ được hiển thị ở đây
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Staff;
