import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { formatNumber } from '../utils/format';

type CostCalculationFormData = {
  pricingMethod?: string;
  baseRate?: number;
  pricePerKm?: number;
  pricePerTrip?: number;
  pricePerM3?: number;
  stopFee?: number;
  fuelSurcharge?: number;
  tollFee?: number;
  insuranceFee?: number;
  totalDistance?: number;
  totalStops?: number;
  totalVolume?: number;
  totalPackages?: number;
};

type CostCalculationDetailsProps = {
  formData: CostCalculationFormData;
};

const currency = (value?: number) =>
  typeof value === 'number' ? `${formatNumber(value)} VNĐ` : '—';

const CostCalculationDetails: React.FC<CostCalculationDetailsProps> = ({
  formData,
}) => {
  const rows = [
    { label: 'Phương thức định giá', value: formData.pricingMethod || '—' },
    { label: 'Phí cơ bản', value: currency(formData.baseRate) },
    { label: 'Đơn giá / km', value: currency(formData.pricePerKm) },
    { label: 'Đơn giá / chuyến', value: currency(formData.pricePerTrip) },
    { label: 'Đơn giá / m³', value: currency(formData.pricePerM3) },
    { label: 'Phụ phí điểm dừng', value: currency(formData.stopFee) },
    { label: 'Phụ phí nhiên liệu', value: currency(formData.fuelSurcharge) },
    { label: 'Phí cầu đường', value: currency(formData.tollFee) },
    { label: 'Phí bảo hiểm', value: currency(formData.insuranceFee) },
    {
      label: 'Tổng quãng đường',
      value:
        typeof formData.totalDistance === 'number'
          ? `${formatNumber(formData.totalDistance, 1)} km`
          : '—',
    },
    {
      label: 'Số điểm dừng',
      value:
        typeof formData.totalStops === 'number'
          ? formatNumber(formData.totalStops)
          : '—',
    },
    {
      label: 'Tổng khối lượng',
      value:
        typeof formData.totalVolume === 'number'
          ? `${formatNumber(formData.totalVolume, 2)} m³`
          : '—',
    },
    {
      label: 'Tổng số kiện',
      value:
        typeof formData.totalPackages === 'number'
          ? formatNumber(formData.totalPackages)
          : '—',
    },
  ];

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Chi tiết tính toán chi phí
      </Typography>
      <Grid container spacing={2}>
        {rows.map((row) => (
          <Grid item xs={12} sm={6} md={4} key={row.label}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {row.label}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {row.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export { CostCalculationDetails };
