import { Map, Route, Timeline, Traffic } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import InteractiveMap from "../components/map/InteractiveMap";
import LocationManager from "../components/map/LocationManager";

const Maps = () => {
  const { t } = useTranslation();
  const [activeFeature, setActiveFeature] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const mapFeatures = [
    {
      id: "interactive_map",
      title: t("maps.title"),
      icon: Map,
      color: "#2196f3",
      description: "Bản đồ tương tác với các địa điểm logistics",
    },
    {
      id: "route_optimization",
      title: t("maps.route_optimization"),
      icon: Route,
      color: "#4caf50",
      description: "Tối ưu hóa tuyến đường vận chuyển",
    },
    {
      id: "real_time_tracking",
      title: t("maps.real_time_tracking"),
      icon: Timeline,
      color: "#ff9800",
      description: "Theo dõi vận chuyển thời gian thực",
    },
    {
      id: "traffic_info",
      title: t("maps.traffic_info"),
      icon: Traffic,
      color: "#9c27b0",
      description: "Thông tin giao thông và tắc đường",
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          {t("maps.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý tuyến đường và theo dõi vận chuyển
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Bản đồ tương tác" />
          <Tab label="Quản lý địa điểm" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
          {/* Map Features */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {mapFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === feature.id;
              return (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      textAlign: "center",
                      p: 2,
                      height: "100%",
                      cursor: "pointer",
                      border: isActive
                        ? `2px solid ${feature.color}`
                        : "1px solid #e0e0e0",
                      "&:hover": {
                        boxShadow: 3,
                        transform: "translateY(-2px)",
                        transition: "all 0.2s ease-in-out",
                      },
                    }}
                    onClick={() =>
                      setActiveFeature(isActive ? null : feature.id)
                    }
                  >
                    <CardContent>
                      <Icon
                        sx={{ fontSize: 40, mb: 1, color: feature.color }}
                      />
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {feature.description}
                      </Typography>
                      <Button
                        variant={isActive ? "contained" : "outlined"}
                        size="small"
                        fullWidth
                        sx={{
                          backgroundColor: isActive
                            ? feature.color
                            : "transparent",
                          "&:hover": {
                            backgroundColor: isActive
                              ? feature.color
                              : feature.color + "20",
                          },
                        }}
                      >
                        {isActive ? "Đang hiển thị" : "Khám phá"}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Interactive Map */}
          {activeFeature === "interactive_map" && (
            <Paper sx={{ p: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Bản đồ tương tác - Địa điểm Logistics
              </Typography>
              <InteractiveMap />
            </Paper>
          )}

          {/* Other Features Placeholder */}
          {activeFeature && activeFeature !== "interactive_map" && (
            <Paper sx={{ p: 3, height: 500 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {mapFeatures.find((f) => f.id === activeFeature)?.title}
              </Typography>
              <Box sx={{ textAlign: "center", py: 8 }}>
                {React.createElement(
                  mapFeatures.find((f) => f.id === activeFeature)?.icon,
                  {
                    sx: { fontSize: 80, color: "text.secondary", mb: 2 },
                  },
                )}
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Tính năng đang phát triển
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {mapFeatures.find((f) => f.id === activeFeature)?.description}
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Default State */}
          {!activeFeature && (
            <Paper sx={{ p: 3, height: 500 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Chọn tính năng bản đồ
              </Typography>
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Map sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Chọn một tính năng từ menu trên
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bản đồ tương tác sẽ được hiển thị khi bạn chọn tính năng
                </Typography>
              </Box>
            </Paper>
          )}
        </>
      )}

      {/* Location Manager Tab */}
      {activeTab === 1 && <LocationManager />}
    </Box>
  );
};

export default Maps;
