import { Add as AddIcon, Store as StoreIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import React from "react";

const OfflineOrder = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <StoreIcon sx={{ mr: 2, fontSize: 32, color: "primary.main" }} />
        <Typography variant="h4" gutterBottom>
          Đơn hàng offline (POS)
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tạo đơn hàng offline mới
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Tạo đơn hàng từ điểm bán hàng (POS)
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} fullWidth>
                Tạo đơn hàng offline
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Danh sách đơn hàng offline
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Quản lý và theo dõi các đơn hàng offline
              </Typography>
              <Button variant="outlined" fullWidth>
                Xem danh sách
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê đơn hàng offline
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trang quản lý đơn hàng offline đang được phát triển...
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OfflineOrder;
