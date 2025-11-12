import { DataTable, GridView, type GridViewItem } from '../../../components/ui';
import {
  AddCircle,
  Clear,
  Delete,
  Edit,
  FilterList,
  Sync,
  ViewList,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import CreateLocationDialog from './CreateLocationDialog';

interface Location {
  id: string;
  code: string;
  avatar: string;
  category: string;
  subcategory: string;
  address: string;
  status: 'active' | 'inactive';
  ward: string;
  district: string;
  province: string;
  note: string;
}

const mockLocations: Location[] = [
  {
    id: '1',
    code: 'LOC001',
    avatar: '🏢',
    category: 'Kho hàng',
    subcategory: 'Kho trung tâm',
    address: '123 Đường ABC, Phường 1',
    status: 'active',
    ward: 'Phường 1',
    district: 'Quận 1',
    province: 'TP. Hồ Chí Minh',
    note: 'Kho chính của công ty',
  },
  {
    id: '2',
    code: 'LOC002',
    avatar: '🏪',
    category: 'Cửa hàng',
    subcategory: 'Showroom',
    address: '456 Đường XYZ, Phường 2',
    status: 'active',
    ward: 'Phường 2',
    district: 'Quận 3',
    province: 'TP. Hồ Chí Minh',
    note: 'Showroom trưng bày sản phẩm',
  },
  {
    id: '3',
    code: 'LOC003',
    avatar: '🏭',
    category: 'Nhà máy',
    subcategory: 'Sản xuất',
    address: '789 Đường DEF, Phường 3',
    status: 'inactive',
    ward: 'Phường 3',
    district: 'Quận 7',
    province: 'TP. Hồ Chí Minh',
    note: 'Nhà máy sản xuất',
  },
  {
    id: '4',
    code: 'LOC004',
    avatar: '🏪',
    category: 'Cửa hàng',
    subcategory: 'Showroom',
    address: '456 Đường XYZ, Phường 12',
    status: 'active',
    ward: 'Phường 12',
    district: 'Quận 3',
    province: 'TP. Hồ Chí Minh',
    note: 'Showroom trưng bày sản phẩm',
  },
  {
    id: '5',
    code: 'LOC005',
    avatar: '🏢',
    category: 'Văn phòng',
    subcategory: 'Trụ sở chính',
    address: '321 Đường GHI, Phường 4',
    status: 'active',
    ward: 'Phường 4',
    district: 'Quận 1',
    province: 'TP. Hồ Chí Minh',
    note: 'Trụ sở chính công ty',
  },
  {
    id: '6',
    code: 'LOC006',
    avatar: '🏬',
    category: 'Trung tâm thương mại',
    subcategory: 'Mall',
    address: '654 Đường JKL, Phường 5',
    status: 'active',
    ward: 'Phường 5',
    district: 'Quận 10',
    province: 'TP. Hồ Chí Minh',
    note: 'Trung tâm thương mại lớn',
  },
  {
    id: '7',
    code: 'LOC007',
    avatar: '🏗️',
    category: 'Công trường',
    subcategory: 'Xây dựng',
    address: '987 Đường MNO, Phường 6',
    status: 'inactive',
    ward: 'Phường 6',
    district: 'Quận 2',
    province: 'TP. Hồ Chí Minh',
    note: 'Công trường xây dựng',
  },
  {
    id: '8',
    code: 'LOC008',
    avatar: '🚚',
    category: 'Kho vận',
    subcategory: 'Logistics',
    address: '147 Đường PQR, Phường 7',
    status: 'active',
    ward: 'Phường 7',
    district: 'Quận 8',
    province: 'TP. Hồ Chí Minh',
    note: 'Kho logistics',
  },
  {
    id: '9',
    code: 'LOC009',
    avatar: '🏠',
    category: 'Nhà ở',
    subcategory: 'Căn hộ',
    address: '258 Đường STU, Phường 8',
    status: 'active',
    ward: 'Phường 8',
    district: 'Quận 9',
    province: 'TP. Hồ Chí Minh',
    note: 'Căn hộ cao cấp',
  },
  {
    id: '10',
    code: 'LOC010',
    avatar: '🏢',
    category: 'Văn phòng',
    subcategory: 'Chi nhánh',
    address: '369 Đường VWX, Phường 9',
    status: 'active',
    ward: 'Phường 9',
    district: 'Quận 11',
    province: 'TP. Hồ Chí Minh',
    note: 'Chi nhánh miền Nam',
  },
];

const SHEET_ID = '18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As';

const getStringFrom = (obj: Record<string, unknown>, key: string): string => {
  return String(obj[key] || '');
};

const LocationsList: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  // Biến để chuyển đổi Location sang định dạng GridViewItem
  const mapLocationsToGridItems = (locations: Location[]) => {
    return locations.map((location) => ({
      id: location.id,
      title: location.code,
      subtitle: location.subcategory,
      avatarText: location.avatar,
      status: {
        active: location.status === 'active',
        label: location.status === 'active' ? 'Hoạt động' : 'Tạm dừng',
        // Use allowed union colors only (omit color when inactive)
        color: location.status === 'active' ? 'success' : undefined,
      },
      details: [
        {
          label: 'Danh mục',
          value: location.category,
          color: '#4a90e2',
        },
        {
          label: 'Địa chỉ',
          value: location.address,
          color: '#50b46e',
        },
        {
          label: 'Khu vực',
          value: `${location.ward}, ${location.district}, ${location.province}`,
          color: '#ff9966',
        },
      ],
      actions: [
        {
          label: 'Chỉnh sửa',
          icon: <Edit fontSize="small" />,
          onClick: (item: GridViewItem) => {
            setEditing(locations.find((loc) => loc.id === item.id) || null);
            setOpen(true);
          },
          color: 'primary',
        },
        {
          label: 'Xóa',
          icon: <Delete fontSize="small" />,
          onClick: (item: GridViewItem) => {
            handleDelete(locations.find((loc) => loc.id === item.id)!);
          },
          color: 'error',
        },
      ],
    }));
  };
  const [showAllGrid, setShowAllGrid] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    province: '',
    district: '',
    ward: '',
    category: '',
    status: '',
    search: '',
  });

  // Load từ Google Sheets
  useEffect(() => {
    const loadLocations = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/locations?spreadsheetId=${encodeURIComponent(SHEET_ID)}`
        );
        if (res.ok) {
          const data = await res.json();
          const mapped: Location[] = (
            data as Array<Record<string, unknown>>
          ).map((r) => ({
            id: getStringFrom(r, 'id'),
            code: getStringFrom(r, 'code'),
            avatar: getStringFrom(r, 'avatar'),
            category: getStringFrom(r, 'category'),
            subcategory: getStringFrom(r, 'subcategory'),
            address: getStringFrom(r, 'address'),
            status: getStringFrom(r, 'status') as 'active' | 'inactive',
            ward: getStringFrom(r, 'ward'),
            district: getStringFrom(r, 'district'),
            province: getStringFrom(r, 'province'),
            note: getStringFrom(r, 'note'),
          }));
          setLocations(mapped);
        } else {
          setLocations(mockLocations);
        }
      } catch {
        setError('Lỗi tải danh sách địa điểm');
        setLocations(mockLocations);
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  // Sắp xếp theo Thành phố → Quận → Phường
  const sortedLocations =
    locations?.sort((a, b) => {
      // Sắp xếp theo province trước
      if (a.province !== b.province) {
        return a.province.localeCompare(b.province);
      }
      // Nếu cùng province, sắp xếp theo district
      if (a.district !== b.district) {
        return a.district.localeCompare(b.district);
      }
      // Nếu cùng district, sắp xếp theo ward
      return a.ward.localeCompare(b.ward);
    }) || [];

  // Lọc dữ liệu
  const filteredLocations = sortedLocations.filter((location) => {
    const matchesProvince =
      !filters.province || location.province.includes(filters.province);
    const matchesDistrict =
      !filters.district || location.district.includes(filters.district);
    const matchesWard = !filters.ward || location.ward.includes(filters.ward);
    const matchesCategory =
      !filters.category || location.category.includes(filters.category);
    const matchesStatus = !filters.status || location.status === filters.status;
    const matchesSearch =
      !filters.search ||
      location.code.toLowerCase().includes(filters.search.toLowerCase()) ||
      location.subcategory
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      location.address.toLowerCase().includes(filters.search.toLowerCase());

    return (
      matchesProvince &&
      matchesDistrict &&
      matchesWard &&
      matchesCategory &&
      matchesStatus &&
      matchesSearch
    );
  });

  // Columns for DataTable
  const tableColumns = [
    {
      id: 'code',
      label: 'Địa điểm',
      width: '25%',
      render: (_v: unknown, location: Location) => {
        const isActive = location.status === 'active';
        return (
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: isActive ? 'primary.main' : 'grey.400',
                fontSize: '1rem',
              }}
            >
              {location.avatar}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2">{location.code}</Typography>
              <Typography variant="caption" color="text.secondary">
                {location.subcategory}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    { id: 'category', label: 'Danh mục', width: '15%' },
    {
      id: 'address',
      label: 'Địa chỉ',
      width: '35%',
      render: (_v: unknown, location: Location) => (
        <Box>
          <Typography
            variant="body2"
            sx={{
              maxWidth: 150,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {location.address || '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {location.ward}, {location.district}, {location.province}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Trạng thái',
      width: '12%',
      align: 'center',
      render: (_v: unknown, location: Location) => (
        <Chip
          label={location.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
          color={location.status === 'active' ? 'success' : 'default'}
          size="small"
          onClick={() => handleToggleStatus(location)}
          disabled={togglingId === location.id}
        />
      ),
    },
    {
      id: 'id',
      label: 'Thao tác',
      width: '13%',
      align: 'center',
      render: (_v: unknown, location: Location) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => {
              setEditing(location);
              setOpen(true);
            }}
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(location)}
            disabled={deletingId === location.id}
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleToggleStatus = async (location: Location) => {
    setTogglingId(location.id);
    try {
      const newStatus = location.status === 'active' ? 'inactive' : 'active';
      const updatedLocation = {
        ...location,
        status: newStatus as 'active' | 'inactive',
      };

      const res = await fetch(
        `/api/locations/${location.id}?spreadsheetId=${encodeURIComponent(SHEET_ID)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedLocation),
        }
      );

      if (res.ok) {
        setLocations((prev) =>
          prev.map((loc) => (loc.id === location.id ? updatedLocation : loc))
        );
      }
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
    } finally {
      setTogglingId(null);
    }
  };

  // Xử lý chuyển đổi trạng thái trong GridView
  const handleGridStatusToggle = (item: GridViewItem) => {
    const location = locations.find((loc) => loc.id === item.id);
    if (location) {
      handleToggleStatus(location);
    }
  };

  const handleDelete = async (location: Location) => {
    if (!window.confirm(`Bạn có chắc muốn xóa địa điểm "${location.code}"?`)) {
      return;
    }

    setDeletingId(location.id);
    try {
      const res = await fetch(
        `/api/locations/${location.id}?spreadsheetId=${encodeURIComponent(SHEET_ID)}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        setLocations((prev) => prev.filter((loc) => loc.id !== location.id));
      }
    } catch (err) {
      console.error('Lỗi xóa địa điểm:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(
        `/api/locations?spreadsheetId=${encodeURIComponent(SHEET_ID)}`
      );
      if (res.ok) {
        const data = await res.json();
        const mapped: Location[] = (data as Array<Record<string, unknown>>).map(
          (r) => ({
            id: getStringFrom(r, 'id'),
            code: getStringFrom(r, 'code'),
            avatar: getStringFrom(r, 'avatar'),
            category: getStringFrom(r, 'category'),
            subcategory: getStringFrom(r, 'subcategory'),
            address: getStringFrom(r, 'address'),
            status: getStringFrom(r, 'status') as 'active' | 'inactive',
            ward: getStringFrom(r, 'ward'),
            district: getStringFrom(r, 'district'),
            province: getStringFrom(r, 'province'),
            note: getStringFrom(r, 'note'),
          })
        );
        setLocations(mapped);
      }
    } catch (err) {
      console.error('Lỗi làm mới:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">
          Địa điểm lưu ({filteredLocations.length})
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => setShowFilters(!showFilters)}
            startIcon={<FilterList />}
            sx={{ mr: 1 }}
          >
            Bộ lọc
          </Button>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            startIcon={refreshing ? <CircularProgress size={20} /> : <Sync />}
            disabled={refreshing}
            sx={{ mr: 1 }}
          >
            Làm mới
          </Button>
          <Button
            variant="outlined"
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            startIcon={viewMode === 'table' ? <GridView /> : <ViewList />}
            sx={{ mr: 1 }}
          >
            {viewMode === 'table' ? 'Lưới' : 'Bảng'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddCircle />}
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Thêm địa điểm
          </Button>
        </Box>
      </Box>

      {/* Bộ lọc */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Bộ lọc</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                setFilters({
                  province: '',
                  district: '',
                  ward: '',
                  category: '',
                  status: '',
                  search: '',
                })
              }
              startIcon={<Clear />}
            >
              Xóa bộ lọc
            </Button>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Tìm kiếm"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                placeholder="Mã, tên, địa chỉ..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Tỉnh/Thành phố</InputLabel>
                <Select
                  value={filters.province}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      province: e.target.value,
                    }))
                  }
                  label="Tỉnh/Thành phố"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {Array.from(
                    new Set(locations?.map((l) => l.province) || [])
                  ).map((province) => (
                    <MenuItem key={province} value={province}>
                      {province}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Quận/Huyện</InputLabel>
                <Select
                  value={filters.district}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      district: e.target.value,
                    }))
                  }
                  label="Quận/Huyện"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {Array.from(
                    new Set(locations?.map((l) => l.district) || [])
                  ).map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Phường/Xã</InputLabel>
                <Select
                  value={filters.ward}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, ward: e.target.value }))
                  }
                  label="Phường/Xã"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {Array.from(new Set(locations?.map((l) => l.ward) || [])).map(
                    (ward) => (
                      <MenuItem key={ward} value={ward}>
                        {ward}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  label="Danh mục"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {Array.from(
                    new Set(locations?.map((l) => l.category) || [])
                  ).map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  label="Trạng thái"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="inactive">Tạm dừng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={200}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : locations && locations.length > 0 ? (
        viewMode === 'table' ? (
          <DataTable
            columns={tableColumns}
            data={filteredLocations}
            rowsPerPageOptions={[5, 10, 25, 50]}
            defaultRowsPerPage={10}
            emptyMessage="Chưa có địa điểm nào"
            getRowId={(row) => row.id}
            title={`Danh sách địa điểm (${filteredLocations.length})`}
          />
        ) : (
          <>
            {/* Grid View - Sử dụng component GridView chung */}
            <Box>
              <GridView
                items={mapLocationsToGridItems(
                  showAllGrid
                    ? filteredLocations
                    : filteredLocations.slice(0, 8)
                )}
                gridSpacing={3}
                maxItemsPerRow={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }}
                onStatusToggle={handleGridStatusToggle}
                emptyMessage="Chưa có địa điểm nào"
                emptyAction={{
                  label: 'Thêm địa điểm',
                  onClick: () => {
                    setEditing(null);
                    setOpen(true);
                  },
                  icon: <AddCircle />,
                }}
                showExpandableDetails={true}
              />
            </Box>

            {/* Xem thêm section */}
            {filteredLocations.length > 8 && !showAllGrid && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 4,
                  pb: 2,
                }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setShowAllGrid(true)}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.50',
                      borderColor: 'primary.dark',
                    },
                  }}
                >
                  Xem thêm ({filteredLocations.length - 8} địa điểm)
                </Button>
              </Box>
            )}

            {/* Thu gọn section */}
            {showAllGrid && filteredLocations.length > 8 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 4,
                  pb: 2,
                }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setShowAllGrid(false)}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: 'grey.500',
                    color: 'grey.700',
                    '&:hover': {
                      backgroundColor: 'grey.50',
                      borderColor: 'grey.600',
                    },
                  }}
                >
                  Thu gọn
                </Button>
              </Box>
            )}
          </>
        )
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            Chưa có địa điểm nào
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircle />}
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Thêm địa điểm đầu tiên
          </Button>
        </Paper>
      )}

      <CreateLocationDialog
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        onSuccess={() => {
          setOpen(false);
          handleRefresh();
        }}
      />
    </Box>
  );
};

export default LocationsList;
