import {
  Add, Delete, Edit, LocationOn,
  Refresh, Search, ViewList, ViewModule
} from '@mui/icons-material';
import {
  Alert, Box, Button,
  Card,
  CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { proxyLocationsService } from '../../services/map/proxyLocationsService';

const LocationManager = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [locationStats, setLocationStats] = useState(null);

  // Helper functions
  const getLocationTypeLabel = (type) => {
    const typeMap = {
      'warehouse': 'Kho hàng',
      'store': 'Cửa hàng',
      'office': 'Văn phòng',
      'showroom': 'Showroom',
      'center': 'Trung tâm',
      'branch': 'Chi nhánh'
    };
    return typeMap[type] || 'Khác';
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'active': 'Hoạt động',
      'inactive': 'Tạm dừng',
      'maintenance': 'Bảo trì'
    };
    return statusMap[status] || 'Không xác định';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'active': 'success',
      'inactive': 'error',
      'maintenance': 'warning'
    };
    return colorMap[status] || 'default';
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'warehouse',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    contactPerson: '',
    capacity: '',
    operatingHours: '',
    status: 'active'
  });


  // Load dữ liệu
  useEffect(() => {
    loadLocations();
  }, []);

  // Filter locations
  useEffect(() => {
    let filtered = locations || [];

    if (searchTerm) {
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(location => location.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(location => location.status === filterStatus);
    }

    setFilteredLocations(filtered);
  }, [locations, searchTerm, filterType, filterStatus]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await proxyLocationsService.getLocations();
      setLocations(data);

      // Load stats
      const stats = await proxyLocationsService.getLocationStats();
      setLocationStats(stats);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
      setError('Không thể tải dữ liệu địa điểm');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        type: location.type,
        address: location.address,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        phone: location.phone,
        contactPerson: location.contactPerson,
        capacity: location.capacity.toString(),
        operatingHours: location.operatingHours,
        status: location.status
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: '',
        type: 'warehouse',
        address: '',
        latitude: '',
        longitude: '',
        phone: '',
        contactPerson: '',
        capacity: '',
        operatingHours: '',
        status: 'active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLocation(null);
    setFormData({
      name: '',
      type: 'warehouse',
      address: '',
      latitude: '',
      longitude: '',
      phone: '',
      contactPerson: '',
      capacity: '',
      operatingHours: '',
      status: 'active'
    });
  };

  const handleSubmit = async () => {
    try {
      const locationData = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        capacity: parseFloat(formData.capacity) || 0
      };

      if (editingLocation) {
        await proxyLocationsService.updateLocation(editingLocation.locationId, locationData);
      } else {
        await proxyLocationsService.addLocation(locationData);
      }

      await loadLocations();
      handleCloseDialog();
    } catch (err) {
      console.error('Lỗi lưu địa điểm:', err);
      setError('Không thể lưu địa điểm');
    }
  };

  const handleDelete = async (locationId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) {
      try {
        await proxyLocationsService.deleteLocation(locationId);
        await loadLocations();
      } catch (err) {
        console.error('Lỗi xóa địa điểm:', err);
        setError('Không thể xóa địa điểm');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Quản lý Địa điểm Logistics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý kho hàng, nhà vận chuyển và các điểm giao/nhận hàng
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Thêm địa điểm
        </Button>
      </Box>

      {/* Stats */}
      {locationStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">{locationStats.total}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng địa điểm
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {locationStats.active}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đang hoạt động
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary.main">
                  {locationStats.byType.warehouse}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Kho hàng
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="secondary.main">
                  {locationStats.byType.carrier}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nhà vận chuyển
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters and Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Tìm kiếm địa điểm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Loại địa điểm</InputLabel>
          <Select
            value={filterType}
            label="Loại địa điểm"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="warehouse">Kho hàng</MenuItem>
            <MenuItem value="store">Cửa hàng</MenuItem>
            <MenuItem value="office">Văn phòng</MenuItem>
            <MenuItem value="showroom">Showroom</MenuItem>
            <MenuItem value="center">Trung tâm</MenuItem>
            <MenuItem value="branch">Chi nhánh</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={filterStatus}
            label="Trạng thái"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="active">Hoạt động</MenuItem>
            <MenuItem value="inactive">Tạm dừng</MenuItem>
            <MenuItem value="maintenance">Bảo trì</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <Button
            variant={viewMode === 'card' ? 'contained' : 'outlined'}
            startIcon={<ViewModule />}
            onClick={() => setViewMode('card')}
            size="small"
          >
            Thẻ
          </Button>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            startIcon={<ViewList />}
            onClick={() => setViewMode('table')}
            size="small"
          >
            Bảng
          </Button>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadLocations}
        >
          Làm mới
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Locations List */}
      {viewMode === 'card' ? (
        <Grid container spacing={2}>
          {filteredLocations && filteredLocations.map((location, index) => (
            <Grid item xs={12} sm={6} md={4} key={`${location.locationId}-${index}`}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {location.name}
                    </Typography>
                    <Box>
                      <Tooltip title="Sửa">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(location)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(location.locationId)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Chip
                    label={getLocationTypeLabel(location.type)}
                    size="small"
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                  <Chip
                    label={getStatusLabel(location.status)}
                    size="small"
                    color={getStatusColor(location.status)}
                    sx={{ mb: 2, ml: 1 }}
                  />

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <LocationOn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    {location.address}
                  </Typography>

                  {location.phone && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      📞 {location.phone}
                    </Typography>
                  )}

                  {location.contactPerson && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      👤 {location.contactPerson}
                    </Typography>
                  )}

                  {location.capacity > 0 && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      📦 Dung tích: {location.capacity} m³
                    </Typography>
                  )}

                  {location.operatingHours && (
                    <Typography variant="body2" color="text.secondary">
                      ⏰ {location.operatingHours}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên địa điểm</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Địa chỉ</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Người liên hệ</TableCell>
                <TableCell>Dung tích</TableCell>
                <TableCell>Giờ hoạt động</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLocations && filteredLocations.map((location, index) => (
                <TableRow key={`${location.locationId}-${index}`}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {location.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getLocationTypeLabel(location.type)}
                      size="small"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(location.status)}
                      size="small"
                      color={getStatusColor(location.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {location.address}
                    </Typography>
                  </TableCell>
                  <TableCell>{location.phone}</TableCell>
                  <TableCell>{location.contactPerson}</TableCell>
                  <TableCell>{location.capacity} m³</TableCell>
                  <TableCell>{location.operatingHours}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Sửa">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(location)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(location.locationId)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {filteredLocations && filteredLocations.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy địa điểm nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thử thay đổi bộ lọc hoặc thêm địa điểm mới
          </Typography>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLocation ? 'Sửa địa điểm' : 'Thêm địa điểm mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên địa điểm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Loại địa điểm</InputLabel>
                <Select
                  value={formData.type}
                  label="Loại địa điểm"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="warehouse">Kho hàng</MenuItem>
                  <MenuItem value="store">Cửa hàng</MenuItem>
                  <MenuItem value="office">Văn phòng</MenuItem>
                  <MenuItem value="showroom">Showroom</MenuItem>
                  <MenuItem value="center">Trung tâm</MenuItem>
                  <MenuItem value="branch">Chi nhánh</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vĩ độ"
                type="number"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kinh độ"
                type="number"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Người liên hệ"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dung tích (m³)"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giờ hoạt động"
                value={formData.operatingHours}
                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                placeholder="VD: 7:00 - 22:00"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.status}
                  label="Trạng thái"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="inactive">Tạm dừng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingLocation ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LocationManager;
