import {
  Add as AddIcon,
  Cancel,
  CheckCircle,
  LocalShipping,
  PendingActions,
  Schedule,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import CarriersList from '../features/shipments/components/CarriersList';
import LocationsList from '../features/shipments/components/LocationsList';
import TransportRequests from '../features/shipments/components/TransportRequests';
import VolumeCalculator from '../features/shipments/components/VolumeCalculator';

const PageContainer = ({ title, subtitle, action, children }) => (
  <Box>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        mb: 4,
      }}
    >
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
    {children}
  </Box>
);

export const TransportOverviewPage = () => {
  const { t } = useTranslation();

  const transportStatuses = [
    { label: t('transport.status.pending'), color: 'warning', icon: Schedule },
    {
      label: t('transport.status.confirmed'),
      color: 'info',
      icon: LocalShipping,
    },
    {
      label: t('transport.status.in_transit'),
      color: 'primary',
      icon: LocalShipping,
    },
    {
      label: t('transport.status.delivered'),
      color: 'success',
      icon: CheckCircle,
    },
    { label: t('transport.status.cancelled'), color: 'error', icon: Cancel },
  ];

  return (
    <PageContainer
      title={t('transport.title')}
      subtitle={t('transport.transport_list')}
      action={
        <Button variant="contained" startIcon={<AddIcon />} sx={{ px: 3 }}>
          {t('transport.new_transport')}
        </Button>
      }
    >
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {transportStatuses.map((status, index) => {
          const Icon = status.icon;
          return (
            <Grid item xs={12} sm={6} md={2.4} key={index}>
              <Card sx={{ textAlign: 'center', px: 2, py: 3 }}>
                <CardContent>
                  <Icon
                    sx={{
                      fontSize: 40,
                      mb: 1.5,
                      color: `${status.color}.main`,
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {Math.floor(Math.random() * 50) + 10}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {status.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {t('transport.transport_list')}
        </Typography>
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <LocalShipping sx={{ fontSize: 80, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary">
            {t('common.loading')}...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Danh sách vận chuyển sẽ được hiển thị ở đây
          </Typography>
        </Box>
      </Paper>
    </PageContainer>
  );
};

export const TransportStorageLocationsPage = () => {
  const { t } = useTranslation();

  return (
    <PageContainer
      title={t('navigation.transport_storage_locations')}
      subtitle="Quản lý địa điểm lưu trữ và điểm giao nhận chiến lược"
    >
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <LocationsList />
      </Paper>
    </PageContainer>
  );
};

export const TransportVolumeCalculatorPage = () => {
  const { t } = useTranslation();

  return (
    <PageContainer
      title={t('navigation.transport_volume_calculator')}
      subtitle="Quy đổi khối lượng vận chuyển chuẩn hoá theo quy tắc MIA"
    >
      <VolumeCalculator />
    </PageContainer>
  );
};

export const TransportCarriersPage = () => {
  const { t } = useTranslation();

  return (
    <PageContainer
      title={t('navigation.transport_carriers')}
      subtitle="Danh sách nhà vận chuyển đối tác và theo dõi hiệu suất"
    >
      <CarriersList />
    </PageContainer>
  );
};

export const TransportRequestsPage = () => {
  const { t } = useTranslation();

  return (
    <PageContainer
      title={t('navigation.transport_requests')}
      subtitle="Tổng hợp đề nghị vận chuyển theo thời gian thực"
    >
      <TransportRequests />
    </PageContainer>
  );
};

export const TransportPendingTransfersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PageContainer
      title={t('navigation.transport_pending_transfer')}
      subtitle="Theo dõi các lô hàng đang chờ chuyển giao giữa các điểm"
    >
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          alignItems: { xs: 'flex-start', md: 'center' },
          textAlign: { xs: 'left', md: 'center' },
        }}
      >
        <PendingActions sx={{ fontSize: 64, color: 'warning.main' }} />
        <Stack spacing={2} sx={{ maxWidth: 520 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Chức năng đang được hoàn thiện
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Module Chờ chuyển giao sẽ hiển thị danh sách chứng từ cần bàn giao,
            thời gian dự kiến và người chịu trách nhiệm. Vui lòng quay lại sau
            khi cập nhật hoàn tất.
          </Typography>
          <Alert severity="info" sx={{ alignItems: 'flex-start' }}>
            Bạn có thể theo dõi tạm thời tại mục{' '}
            <Typography component="span" fontWeight={600}>
              {t('navigation.transport_requests')}
            </Typography>{' '}
            để nắm tiến độ xử lý đề nghị.
          </Alert>
        </Stack>
        <Button
          variant="contained"
          onClick={() => navigate('/transport/requests')}
        >
          Đến danh sách đề nghị
        </Button>
      </Paper>
    </PageContainer>
  );
};

export default TransportOverviewPage;
