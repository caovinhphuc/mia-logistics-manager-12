import {
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import React from "react";

const PurchaseOrder = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <ShoppingCartIcon sx={{ mr: 2, fontSize: 32, color: "primary.main" }} />
        <Typography variant="h4" gutterBottom>
          Phiếu mua hàng (PO)
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tạo phiếu mua hàng mới
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Tạo phiếu mua hàng cho nhà cung cấp
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} fullWidth>
                Tạo phiếu mua hàng
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Danh sách phiếu mua hàng
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Quản lý và theo dõi các phiếu mua hàng
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
                Thống kê phiếu mua hàng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trang quản lý phiếu mua hàng đang được phát triển...
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PurchaseOrder;
