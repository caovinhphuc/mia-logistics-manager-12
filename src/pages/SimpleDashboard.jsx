import {
  Business as PartnersIcon,
  CheckCircle as CheckCircleIcon,
  Dashboard as DashboardIcon,
  Info as InfoIcon,
  LocalShipping as TransportIcon,
  Notifications as NotificationsIcon,
  People as StaffIcon,
  Warehouse as WarehouseIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";

const SimpleDashboard = () => {
  const stats = [
    {
      title: "Tổng đơn hàng",
      value: "1,234",
      icon: <TransportIcon />,
      color: "primary",
    },
    {
      title: "Tồn kho",
      value: "5,678",
      icon: <WarehouseIcon />,
      color: "secondary",
    },
    { title: "Nhân viên", value: "89", icon: <StaffIcon />, color: "success" },
    { title: "Đối tác", value: "45", icon: <PartnersIcon />, color: "warning" },
  ];

  const recentActivities = [
    {
      id: 1,
      action: "Đơn hàng mới được tạo",
      time: "5 phút trước",
      type: "success",
    },
    { id: 2, action: "Cập nhật tồn kho", time: "15 phút trước", type: "info" },
    {
      id: 3,
      action: "Cảnh báo: Sắp hết hàng",
      time: "30 phút trước",
      type: "warning",
    },
    {
      id: 4,
      action: "Nhân viên mới được thêm",
      time: "1 giờ trước",
      type: "success",
    },
  ];

  const getIconByType = (type) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon color="success" />;
      case "warning":
        return <WarningIcon color="warning" />;
      case "info":
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        <DashboardIcon sx={{ mr: 2, verticalAlign: "middle" }} />
        Bảng điều khiển
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="h6"
                    >
                      {stat.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{ fontWeight: "bold" }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: `${stat.color}.main` }}>{stat.icon}</Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" color={stat.color}>
                  Xem chi tiết
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}
            >
              <NotificationsIcon sx={{ mr: 1 }} />
              Hoạt động gần đây
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} sx={{ px: 0 }}>
                  <ListItemIcon>{getIconByType(activity.type)}</ListItemIcon>
                  <ListItemText
                    primary={activity.action}
                    secondary={activity.time}
                  />
                  <Chip
                    label={activity.type}
                    size="small"
                    color={activity.type}
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Thao tác nhanh
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<TransportIcon />}
                fullWidth
              >
                Tạo đơn hàng mới
              </Button>
              <Button
                variant="outlined"
                startIcon={<WarehouseIcon />}
                fullWidth
              >
                Quản lý kho
              </Button>
              <Button variant="outlined" startIcon={<StaffIcon />} fullWidth>
                Quản lý nhân viên
              </Button>
              <Button variant="outlined" startIcon={<PartnersIcon />} fullWidth>
                Quản lý đối tác
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Welcome Message */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mt: 3,
          bgcolor: "primary.light",
          color: "primary.contrastText",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Chào mừng đến với MIA Logistics Manager! 🎉
        </Typography>
        <Typography variant="body1">
          Hệ thống đang chạy với dữ liệu mẫu. Bạn có thể khám phá tất cả các
          tính năng mà không cần cấu hình Google API.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SimpleDashboard;
