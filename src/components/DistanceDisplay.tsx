import React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { formatNumber } from '../utils/format';

type DistanceDisplayProps = {
  distances: Record<string, number>;
  selectedStopPoints: Set<string>;
  stopPoints: Record<string, { name?: string }>;
  locations: Record<string, { label?: string }>;
  pickupLocation?: string;
  isCalculating?: boolean;
  error?: string | null;
  formatDecimal?: (value: number, fractionDigits?: number) => string;
  onRecalculate?: () => void;
  onTestConnectivity?: () => void;
};

const DistanceDisplay: React.FC<DistanceDisplayProps> = ({
  distances,
  selectedStopPoints,
  stopPoints,
  locations,
  pickupLocation,
  isCalculating = false,
  error,
  formatDecimal,
  onRecalculate,
  onTestConnectivity,
}) => {
  const formattedValue = (value?: number) => {
    if (typeof value !== 'number') return '—';
    return formatDecimal ? formatDecimal(value, 2) : formatNumber(value, 2);
  };

  const hasData = selectedStopPoints.size > 0;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Khoảng cách giữa các điểm dừng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Điểm lấy hàng: {pickupLocation || 'Chưa xác định'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {onRecalculate && (
            <Button
              variant="outlined"
              size="small"
              onClick={onRecalculate}
              disabled={isCalculating}
            >
              Tính lại
            </Button>
          )}
          {onTestConnectivity && (
            <Button
              variant="outlined"
              size="small"
              onClick={onTestConnectivity}
            >
              Kiểm tra kết nối
            </Button>
          )}
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {!hasData && !isCalculating && (
        <Typography mt={3} color="text.secondary">
          Chưa chọn điểm dừng để tính khoảng cách.
        </Typography>
      )}

      {isCalculating && (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 3 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Đang tính toán khoảng cách...
          </Typography>
        </Stack>
      )}

      {hasData && !isCalculating && (
        <Stack spacing={1.5} sx={{ mt: 3 }}>
          {Array.from(selectedStopPoints).map((stopKey) => {
            const stopPoint = stopPoints[stopKey];
            const distance = distances[stopKey];
            const locationLabel =
              locations[stopPoint?.locationId as string]?.label ||
              stopPoint?.name ||
              stopKey;

            return (
              <Box
                key={stopKey}
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {locationLabel}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formattedValue(distance)} km
                </Typography>
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
};

export { DistanceDisplay };
