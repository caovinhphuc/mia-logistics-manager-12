import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import {
  GridView,
  type GridViewItem,
  DataTable,
  type DataTableColumn,
  ActionButton,
  ActionIcons,
  ViewIcons,
  Icon,
} from '../../../components/ui';
import React, { useMemo, useState } from 'react';
import { useCarriers, useDeleteCarrier } from '../hooks/useCarriers';
import { Carrier } from '../../googleSheets/carriersService';
import CreateCarrierDialog from './CreateCarrierDialog';

const CarriersList: React.FC = () => {
  const {
    data: carriers,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useCarriers();

  const deleteCarrier = useDeleteCarrier();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Carrier | null>(null);
  const [deletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  const gridItems: GridViewItem[] = useMemo(() => {
    if (!carriers) return [];
    return carriers.map((c: Carrier) => ({
      id: c.carrierId,
      title: c.name || 'Chưa có tên',
      subtitle: c.serviceAreas || 'Chưa có khu vực',
      avatar: c.avatarUrl || undefined,
      avatarText: !c.avatarUrl && c.name ? c.name[0].toUpperCase() : 'C',
      status: {
        active: c.isActive,
        label: c.isActive ? 'Hoạt động' : 'Tạm dừng',
        color: c.isActive ? 'success' : 'default',
      },
      details: [
        { label: 'Liên hệ', value: c.contactPerson || 'Chưa có' },
        { label: 'Điện thoại', value: c.phone || 'Chưa có' },
        { label: 'Phương thức', value: c.pricingMethod || 'Chưa có' },
      ],
      sections: [
        {
          title: 'Định giá',
          items: [
            {
              label: 'Phí cơ bản',
              value: c.baseRate
                ? `${Number(c.baseRate).toLocaleString('vi-VN')} VNĐ`
                : 'Chưa có',
            },
            {
              label: 'Phí/km',
              value: c.perKmRate
                ? `${Number(c.perKmRate).toLocaleString('vi-VN')} VNĐ/km`
                : 'Chưa có',
            },
          ],
        },
      ],
      actions: [
        {
          label: 'Sửa',
          icon: 'edit',
          onClick: () => {
            setEditing(c);
            setOpen(true);
          },
          color: 'primary',
        },
        {
          label: 'Xóa',
          icon: 'delete',
          onClick: () => {
            if (!confirm(`Xóa nhà vận chuyển ${c.name}?`)) return;
            deleteCarrier.mutateAsync(c.carrierId);
          },
          color: 'error',
        },
      ],
    }));
  }, [carriers, deleteCarrier]);

  const tableColumns: DataTableColumn<Carrier>[] = useMemo(
    () => [
      {
        id: 'carrierId',
        label: 'MÃ',
        width: 140,
        render: (carrier) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={carrier.avatarUrl}
              sx={{
                width: 36,
                height: 36,
                bgcolor: carrier.isActive ? 'primary.main' : 'grey.400',
                fontSize: '0.9rem',
                fontWeight: 600,
                border: '2px solid',
                borderColor: carrier.isActive ? 'primary.light' : 'grey.300',
              }}
            >
              {carrier.name ? carrier.name[0].toUpperCase() : 'C'}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                {carrier.carrierId}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.55rem',
                  fontWeight: 500,
                }}
              >
                ID
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        id: 'name',
        label: 'TÊN NHÀ VẬN CHUYỂN',
        width: 220,
        render: (carrier) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                color: 'text.primary',
                lineHeight: 1.3,
              }}
            >
              {carrier.name || 'Chưa có tên'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: carrier.isActive ? 'success.main' : 'grey.400',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.55rem',
                  fontWeight: 500,
                  fontStyle: 'italic',
                }}
              >
                {carrier.serviceAreas || 'Chưa có khu vực'}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        id: 'isActive',
        label: 'TRẠNG THÁI',
        width: 120,
        render: (carrier) => {
          const isActive = carrier.isActive;
          const color = isActive ? 'success.main' : 'text.secondary';
          const bgColor = isActive ? 'success.50' : 'grey.50';
          const borderColor = isActive ? 'success.main' : 'grey.400';

          return (
            <Typography
              sx={{
                fontSize: '0.65rem',
                fontWeight: 500,
                color: color,
                backgroundColor: bgColor,
                border: '1px solid',
                borderColor: borderColor,
                borderRadius: 1,
                px: 0.5,
                py: 0.25,
                textAlign: 'center',
                display: 'inline-block',
                minWidth: 'fit-content',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {isActive ? 'Hoạt động' : 'Tạm dừng'}
            </Typography>
          );
        },
      },
      {
        id: 'contactPerson',
        label: 'NGƯỜI LIÊN HỆ',
        width: 160,
        render: (carrier) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '0.65rem',
                color: 'text.primary',
              }}
            >
              {carrier.contactPerson || 'Chưa có'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.55rem',
                fontWeight: 500,
              }}
            >
              Liên hệ
            </Typography>
          </Box>
        ),
      },
      {
        id: 'phone',
        label: 'ĐIỆN THOẠI',
        width: 140,
        render: (carrier) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontWeight: 600,
                fontSize: '0.65rem',
                color: 'primary.main',
                letterSpacing: '0.5px',
              }}
            >
              {carrier.phone || 'Chưa có'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.55rem',
                fontWeight: 500,
              }}
            >
              Số điện thoại
            </Typography>
          </Box>
        ),
      },
      {
        id: 'pricingMethod',
        label: 'PHƯƠNG THỨC',
        width: 140,
        render: (carrier) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.65rem',
                color: 'info.main',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {carrier.pricingMethod || 'Chưa có'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.55rem',
                fontWeight: 500,
              }}
            >
              Định giá
            </Typography>
          </Box>
        ),
      },
      {
        id: 'baseRate',
        label: 'PHÍ CƠ BẢN (VNĐ)',
        width: 150,
        render: (carrier) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.65rem',
                color:
                  carrier.baseRate && Number(carrier.baseRate) > 0
                    ? 'success.main'
                    : 'text.secondary',
              }}
            >
              {carrier.baseRate && Number(carrier.baseRate) > 0
                ? `${Number(carrier.baseRate).toLocaleString('vi-VN')}`
                : 'Chưa có'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.55rem',
                fontWeight: 500,
              }}
            >
              Phí cơ bản
            </Typography>
          </Box>
        ),
      },
      {
        id: 'perKmRate',
        label: 'PHÍ/KM (VNĐ)',
        width: 130,
        render: (carrier) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.65rem',
                color:
                  carrier.perKmRate && Number(carrier.perKmRate) > 0
                    ? 'warning.main'
                    : 'text.secondary',
              }}
            >
              {carrier.perKmRate && Number(carrier.perKmRate) > 0
                ? `${Number(carrier.perKmRate).toLocaleString('vi-VN')}`
                : 'Chưa có'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.55rem',
                fontWeight: 500,
              }}
            >
              Phí/km
            </Typography>
          </Box>
        ),
      },
      {
        id: 'perM3Rate',
        label: 'PHÍ/M³ (VNĐ)',
        width: 130,
        render: (carrier) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.65rem',
                color:
                  carrier.perM3Rate && Number(carrier.perM3Rate) > 0
                    ? 'error.main'
                    : 'text.secondary',
              }}
            >
              {carrier.perM3Rate && Number(carrier.perM3Rate) > 0
                ? `${Number(carrier.perM3Rate).toLocaleString('vi-VN')}`
                : 'Chưa có'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.55rem',
                fontWeight: 500,
              }}
            >
              Phí/m³
            </Typography>
          </Box>
        ),
      },
      {
        id: 'name',
        label: 'THAO TÁC',
        width: 100,
        render: (carrier) => (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            <IconButton
              size="small"
              onClick={() => {
                setEditing(carrier);
                setOpen(true);
              }}
              sx={{
                color: 'primary.main',
                bgcolor: 'primary.50',
                '&:hover': {
                  bgcolor: 'primary.100',
                },
                width: 32,
                height: 32,
              }}
            >
              <ActionIcons.edit />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => {
                if (!confirm(`Xóa nhà vận chuyển ${carrier.name}?`)) return;
                deleteCarrier.mutateAsync(carrier.carrierId);
              }}
              disabled={deletingId === carrier.carrierId}
              sx={{
                color: 'error.main',
                bgcolor: 'error.50',
                '&:hover': {
                  bgcolor: 'error.100',
                },
                width: 32,
                height: 32,
              }}
            >
              <ActionIcons.delete />
            </IconButton>
          </Box>
        ),
      },
    ],
    [deleteCarrier]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          gap: 2,
        }}
      >
        <Typography color="error" variant="h6">
          Lỗi khi tải dữ liệu
        </Typography>
        <ActionButton
          variant="primary"
          startIcon={<Icon name="refresh" />}
          onClick={handleRefresh}
        >
          Thử lại
        </ActionButton>
      </Box>
    );
  }

  console.log('Carriers data:', carriers);
  console.log('View mode:', viewMode);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Quản lý nhà vận chuyển
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* View Mode Toggle */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ActionButton
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              size="small"
              startIcon={<ViewIcons.grid />}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </ActionButton>
            <ActionButton
              variant={viewMode === 'table' ? 'primary' : 'secondary'}
              size="small"
              startIcon={<ViewIcons.list />}
              onClick={() => setViewMode('table')}
            >
              Bảng
            </ActionButton>
          </Box>

          {/* Action Buttons */}
          <ActionButton
            variant="primary"
            startIcon={<ActionIcons.add />}
            onClick={() => setOpen(true)}
          >
            Thêm nhà vận chuyển
          </ActionButton>

          <ActionButton
            variant="secondary"
            startIcon={<Icon name="refresh" />}
            onClick={handleRefresh}
            disabled={refreshing || isRefetching}
          >
            Làm mới
          </ActionButton>
        </Box>
      </Box>

      {/* Content */}
      {carriers ? (
        viewMode === 'table' ? (
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
                p: 1.5,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                Tổng cộng: <strong>{carriers?.length || 0}</strong> nhà vận
                chuyển
              </Typography>
            </Box>
            <DataTable
              data={carriers || []}
              columns={tableColumns}
              loading={isLoading}
              emptyMessage="Chưa có nhà vận chuyển nào"
            />
          </Box>
        ) : (
          <Box
            sx={{
              height: 'calc(100vh - 280px)',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: 8,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c1c1c1',
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: '#a8a8a8',
                },
              },
            }}
          >
            <GridView
              items={gridItems}
              gridSpacing={3}
              maxItemsPerRow={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }}
            />
          </Box>
        )
      ) : (
        <Paper
          sx={{
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <Box p={4} textAlign="center">
            <Typography color="text.secondary">
              Chưa có nhà vận chuyển nào. Thêm nhà vận chuyển đầu tiên?
            </Typography>
            <ActionButton
              variant="primary"
              startIcon={<ActionIcons.add />}
              onClick={() => setOpen(true)}
              sx={{ mt: 2 }}
            >
              Thêm nhà vận chuyển
            </ActionButton>
          </Box>
        </Paper>
      )}

      <CreateCarrierDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        carrier={editing || undefined}
        onSuccess={() => {
          // Refresh data after successful operation
          refetch();
        }}
      />
    </Box>
  );
};

export default CarriersList;
