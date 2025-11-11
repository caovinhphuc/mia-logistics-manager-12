import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import React from "react";

const NotificationCenter = () => {
  // Mock data cho notifications
  const notifications = [
    {
      id: 1,
      type: "success",
      title: "Đơn hàng đã được giao thành công",
      message: "Đơn hàng #DH001 đã được giao đến khách hàng lúc 14:30",
      time: "2 giờ trước",
      read: false,
    },
    {
      id: 2,
      type: "warning",
      title: "Cảnh báo tồn kho thấp",
      message: "Sản phẩm ABC chỉ còn 5 đơn vị trong kho",
      time: "4 giờ trước",
      read: false,
    },
    {
      id: 3,
      type: "info",
      title: "Cập nhật hệ thống",
      message: "Hệ thống đã được cập nhật lên phiên bản mới nhất",
      time: "1 ngày trước",
      read: true,
    },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon color="success" />;
      case "warning":
        return <WarningIcon color="warning" />;
      case "info":
        return <InfoIcon color="info" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "info":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Trung tâm thông báo
        </Typography>

        <Paper elevation={2} sx={{ borderRadius: 2 }}>
          <List>
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListItem
                  sx={{
                    borderBottom:
                      index < notifications.length - 1
                        ? "1px solid #e0e0e0"
                        : "none",
                    backgroundColor: notification.read
                      ? "transparent"
                      : "#f5f5f5",
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ backgroundColor: "transparent" }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: notification.read ? 400 : 600 }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.type}
                          size="small"
                          color={getNotificationColor(notification.type)}
                          variant="outlined"
                        />
                        {!notification.read && (
                          <Chip
                            label="Mới"
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {notification.time}
                        </Typography>
                      </Box>
                    }
                  />
                  <IconButton
                    size="small"
                    sx={{ opacity: notification.read ? 0.3 : 1 }}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                </ListItem>
              </motion.div>
            ))}
          </List>
        </Paper>

        {notifications.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <NotificationsIcon
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              Chưa có thông báo nào
            </Typography>
          </Box>
        )}
      </Box>
    </motion.div>
  );
};

export default NotificationCenter;
