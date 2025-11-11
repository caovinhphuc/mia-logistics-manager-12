import {
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import React, { useState } from "react";

const ReportsCenter = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30days");

  const reports = [
    {
      id: 1,
      title: "Báo cáo doanh thu",
      description: "Tổng hợp doanh thu theo tháng",
      type: "revenue",
      icon: <TrendingUpIcon />,
      color: "success",
      lastUpdated: "2 giờ trước",
    },
    {
      id: 2,
      title: "Báo cáo vận chuyển",
      description: "Thống kê đơn hàng và vận chuyển",
      type: "transport",
      icon: <BarChartIcon />,
      color: "primary",
      lastUpdated: "4 giờ trước",
    },
    {
      id: 3,
      title: "Báo cáo kho hàng",
      description: "Tình hình tồn kho và nhập xuất",
      type: "warehouse",
      icon: <AssessmentIcon />,
      color: "warning",
      lastUpdated: "1 ngày trước",
    },
    {
      id: 4,
      title: "Báo cáo nhân viên",
      description: "Hiệu suất làm việc của nhân viên",
      type: "staff",
      icon: <PieChartIcon />,
      color: "info",
      lastUpdated: "2 ngày trước",
    },
  ];

  const handleExport = (reportId, format = "pdf") => {
    console.log(`Exporting report ${reportId} in ${format} format`);
    // Logic export report sẽ được implement sau
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Trung tâm báo cáo
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Kỳ báo cáo</InputLabel>
            <Select
              value={selectedPeriod}
              label="Kỳ báo cáo"
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <MenuItem value="7days">7 ngày qua</MenuItem>
              <MenuItem value="30days">30 ngày qua</MenuItem>
              <MenuItem value="90days">90 ngày qua</MenuItem>
              <MenuItem value="1year">1 năm qua</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {reports.map((report, index) => (
            <Grid item xs={12} sm={6} md={4} key={report.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      elevation: 4,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          backgroundColor: `${report.color}.light`,
                          color: `${report.color}.main`,
                          mr: 2,
                        }}
                      >
                        {report.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {report.title}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {report.description}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Chip
                        label={`Cập nhật: ${report.lastUpdated}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AssessmentIcon />}
                      onClick={() => handleExport(report.id, "view")}
                    >
                      Xem báo cáo
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleExport(report.id, "pdf")}
                      sx={{ ml: 1 }}
                    >
                      Tải xuống
                    </Button>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={2} sx={{ mt: 3, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Báo cáo tùy chỉnh
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tạo báo cáo theo yêu cầu cụ thể của bạn
          </Typography>
          <Button variant="contained" startIcon={<AssessmentIcon />}>
            Tạo báo cáo mới
          </Button>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default ReportsCenter;
