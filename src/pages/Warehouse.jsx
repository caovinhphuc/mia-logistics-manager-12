import {
  Add as AddIcon,
  Inventory,
  TrendingUp,
  Warehouse as WarehouseIcon,
  Warning,
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

const Warehouse = () => {
  const { t } = useTranslation();

  const warehouseStats = [
    {
      label: t("warehouse.inventory"),
      value: "2,847",
      icon: Inventory,
      color: "#2196f3",
    },
    {
      label: "Tổng giá trị",
      value: "₫1.2B",
      icon: TrendingUp,
      color: "#4caf50",
    },
    { label: "Cần bổ sung", value: "23", icon: Warning, color: "#ff9800" },
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
            {t("warehouse.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("warehouse.inventory")}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ px: 3 }}>
          {t("warehouse.new_item")}
        </Button>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {warehouseStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={4} key={index}>
              <Card sx={{ textAlign: "center", p: 2 }}>
                <CardContent>
                  <Icon sx={{ fontSize: 40, mb: 1, color: stat.color }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Warehouse Content Placeholder */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {t("warehouse.item_list")}
        </Typography>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <WarehouseIcon
            sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("common.loading")}...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Danh sách hàng hóa sẽ được hiển thị ở đây
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Warehouse;
