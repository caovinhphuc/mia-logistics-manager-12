import {
  Add as AddIcon,
  SupportAgent as SupportAgentIcon,
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

const WarrantySlip = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <SupportAgentIcon sx={{ mr: 2, fontSize: 32, color: "primary.main" }} />
        <Typography variant="h4" gutterBottom>
          Phiếu bảo hành (BH)
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tạo phiếu bảo hành mới
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Tạo phiếu bảo hành cho sản phẩm
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} fullWidth>
                Tạo phiếu bảo hành
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Danh sách phiếu bảo hành
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Quản lý và theo dõi các phiếu bảo hành
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
                Thống kê phiếu bảo hành
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trang quản lý phiếu bảo hành đang được phát triển...
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WarrantySlip;
