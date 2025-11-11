import {
  Add as AddIcon,
  SwapHoriz as SwapHorizIcon,
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

const TransferSlip = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <SwapHorizIcon sx={{ mr: 2, fontSize: 32, color: "primary.main" }} />
        <Typography variant="h4" gutterBottom>
          Phiếu chuyển kho (CK)
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tạo phiếu chuyển kho mới
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Tạo phiếu chuyển kho giữa các kho
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} fullWidth>
                Tạo phiếu chuyển kho
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Danh sách phiếu chuyển kho
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Quản lý và theo dõi các phiếu chuyển kho
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
                Thống kê phiếu chuyển kho
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trang quản lý phiếu chuyển kho đang được phát triển...
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransferSlip;
