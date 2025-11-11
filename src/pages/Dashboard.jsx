import {
  Assignment,
  Business,
  CheckCircle,
  LocalShipping,
  People,
  Schedule,
  Warehouse,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import GoogleApiStatus from "../components/GoogleApiStatus";
import LoginInfo from "../components/auth/LoginInfo";
import { useTheme as useCustomTheme } from "../contexts/ThemeContext";

const Dashboard = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useCustomTheme();

  // Mock data - sẽ được thay thế bằng real data
  const stats = [
    {
      title: t("dashboard.total_transports"),
      value: "156",
      change: "+12%",
      icon: LocalShipping,
      color: "#2196f3",
    },
    {
      title: t("dashboard.active_transports"),
      value: "23",
      change: "+5%",
      icon: Schedule,
      color: "#ff9800",
    },
    {
      title: t("dashboard.completed_transports"),
      value: "133",
      change: "+8%",
      icon: CheckCircle,
      color: "#4caf50",
    },
    {
      title: t("dashboard.warehouse_items"),
      value: "2,847",
      change: "+3%",
      icon: Warehouse,
      color: "#9c27b0",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "transport",
      title: "Vận chuyển #TR001 đã hoàn thành",
      time: "2 giờ trước",
      status: "completed",
    },
    {
      id: 2,
      type: "warehouse",
      title: "Nhập kho 50 thùng hàng từ ABC Corp",
      time: "4 giờ trước",
      status: "success",
    },
    {
      id: 3,
      type: "staff",
      title: "Nhân viên mới: Nguyễn Văn A",
      time: "1 ngày trước",
      status: "info",
    },
    {
      id: 4,
      type: "partner",
      title: "Ký hợp đồng với XYZ Logistics",
      time: "2 ngày trước",
      status: "success",
    },
  ];

  const quickActions = [
    {
      title: t("transport.new_transport"),
      icon: LocalShipping,
      color: "#2196f3",
    },
    { title: t("warehouse.new_item"), icon: Warehouse, color: "#4caf50" },
    { title: t("staff.new_staff"), icon: People, color: "#ff9800" },
    { title: t("partners.new_partner"), icon: Business, color: "#9c27b0" },
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          {t("dashboard.welcome")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("dashboard.overview")} - {new Date().toLocaleDateString("vi-VN")}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  background: isDarkMode
                    ? "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)"
                    : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  boxShadow: isDarkMode
                    ? "0 4px 8px rgba(0,0,0,0.3)"
                    : "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: stat.color,
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      <Icon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                      <Chip
                        label={stat.change}
                        size="small"
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {t("dashboard.quick_stats")}
              </Typography>
              <List>
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{ bgcolor: action.color, width: 32, height: 32 }}
                        >
                          <Icon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={action.title}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
            <CardActions>
              <Button size="small" variant="outlined" fullWidth>
                {t("common.view")} {t("common.details")}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {t("dashboard.recent_activities")}
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor:
                              activity.status === "completed"
                                ? "#4caf50"
                                : activity.status === "success"
                                  ? "#4caf50"
                                  : activity.status === "info"
                                    ? "#2196f3"
                                    : "#ff9800",
                            width: 32,
                            height: 32,
                          }}
                        >
                          <Assignment fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={activity.time}
                        primaryTypographyProps={{ variant: "body2" }}
                        secondaryTypographyProps={{ variant: "caption" }}
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
            <CardActions>
              <Button size="small" variant="outlined" fullWidth>
                {t("common.view")} {t("common.details")}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Google API Status */}
      <Box sx={{ mt: 3 }}>
        <GoogleApiStatus />
        <LoginInfo />
      </Box>
    </Box>
  );
};

export default Dashboard;
