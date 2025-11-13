import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  AdminPanelSettings,
  Business,
  LocalShipping,
  Warehouse,
} from '@mui/icons-material';

const LoginInfo = () => {
  const mockUsers = [
    {
      email: 'admin@mia.vn',
      password: 'password',
      role: 'admin',
      name: 'Administrator',
      icon: <AdminPanelSettings />,
      color: 'error',
    },
    {
      email: 'manager@mia-logistics.com',
      password: 'password',
      role: 'manager',
      name: 'Manager User',
      icon: <Business />,
      color: 'warning',
    },
    {
      email: 'employee@mia-logistics.com',
      password: 'password',
      role: 'user',
      name: 'Employee User',
      icon: <Person />,
      color: 'info',
    },
    {
      email: 'driver@mia-logistics.com',
      password: 'password',
      role: 'driver',
      name: 'Driver User',
      icon: <LocalShipping />,
      color: 'success',
    },
    {
      email: 'warehouse@mia-logistics.com',
      password: 'password',
      role: 'warehouse_staff',
      name: 'Warehouse Staff',
      icon: <Warehouse />,
      color: 'secondary',
    },
  ];

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      manager: 'warning',
      user: 'info',
      driver: 'success',
      warehouse_staff: 'secondary',
    };
    return colors[role] || 'default';
  };

  return (
    <Card sx={{ maxWidth: 600, margin: 'auto', mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🔐 Thông tin đăng nhập
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Hướng dẫn đăng nhập</AlertTitle>
          Tất cả tài khoản đều sử dụng mật khẩu: <strong>password</strong>
        </Alert>

        <Typography variant="subtitle1" gutterBottom>
          Danh sách tài khoản có sẵn:
        </Typography>

        <List>
          {mockUsers.map((user, index) => (
            <React.Fragment key={user.email}>
              <ListItem>
                <ListItemIcon>{user.icon}</ListItemIcon>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body1" fontWeight="medium" component="div">
                      {user.name}
                    </Typography>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email
                        sx={{
                          fontSize: 16,
                          mr: 0.5,
                          verticalAlign: 'middle',
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" component="span">
                        {user.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Lock
                        sx={{
                          fontSize: 16,
                          mr: 0.5,
                          verticalAlign: 'middle',
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" component="span">
                        Mật khẩu: {user.password}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
              {index < mockUsers.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        <Alert severity="success" sx={{ mt: 2 }}>
          <AlertTitle>Hệ thống đã được cải thiện</AlertTitle>
          <Typography variant="body2">
            ✅ Xác thực mật khẩu thực tế với bcrypt
            <br />
            ✅ Kiểm tra trạng thái tài khoản
            <br />
            ✅ Phân quyền theo role
            <br />
            ✅ Session management an toàn
            <br />✅ Hỗ trợ cả mock data và real data
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default LoginInfo;
