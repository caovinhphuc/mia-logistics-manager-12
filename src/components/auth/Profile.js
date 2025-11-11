import {
  Cancel as CancelIcon, Edit as EditIcon, PhotoCamera as PhotoCameraIcon, Save as SaveIcon
} from '@mui/icons-material';
import {
  Avatar, Box, Button, Card,
  CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, TextField, Typography
} from '@mui/material';
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { t, formatDate } = useLanguage();

  const handleEditStart = () => {
    setEditForm({
      fullName: user.fullName || user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      department: user.department || '',
      position: user.position || '',
    });
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleEditSave = async () => {
    try {
      await updateUser(editForm);
      setIsEditing(false);
      showSuccess('Cập nhật hồ sơ thành công!');
    } catch (error) {
      showError('Cập nhật hồ sơ thất bại');
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      manager: 'warning',
      operator: 'info',
      driver: 'success',
      warehouse_staff: 'secondary',
    };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Quản trị viên',
      manager: 'Quản lý',
      operator: 'Nhân viên điều hành',
      driver: 'Tài xế',
      warehouse_staff: 'Nhân viên kho',
    };
    return labels[role] || role;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('navigation.profile')}
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Info Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="between" alignItems="flex-start" mb={3}>
                <Box display="flex" alignItems="center" gap={3}>
                  <Box position="relative">
                    <Avatar
                      src={user?.avatarUrl}
                      sx={{ width: 80, height: 80 }}
                    >
                      {user?.fullName?.charAt(0) || user?.username?.charAt(0)}
                    </Avatar>
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: -5,
                        right: -5,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                      onClick={() => setAvatarDialogOpen(true)}
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {user?.fullName || user?.username}
                    </Typography>
                    <Chip
                      label={getRoleLabel(user?.role?.code || user?.role)}
                      color={getRoleColor(user?.role?.code || user?.role)}
                      size="small"
                    />
                  </Box>
                </Box>

                <Box>
                  {!isEditing ? (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleEditStart}
                    >
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <Box display="flex" gap={1}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleEditSave}
                        size="small"
                      >
                        Lưu
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleEditCancel}
                        size="small"
                      >
                        Hủy
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    value={isEditing ? editForm.fullName : user?.fullName || user?.username || ''}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'standard'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={isEditing ? editForm.email : user?.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'standard'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    value={isEditing ? editForm.phone : user?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'standard'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phòng ban"
                    value={isEditing ? editForm.department : user?.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'standard'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Chức vụ"
                    value={isEditing ? editForm.position : user?.position || ''}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'standard'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ngày đăng nhập cuối"
                    value={formatDate(user?.lastLogin)}
                    disabled
                    variant="standard"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hoạt động gần đây
              </Typography>

              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Tính năng này sẽ được phát triển để hiển thị các hoạt động gần đây của người dùng.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Avatar Change Dialog */}
      <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)}>
        <DialogTitle>Thay đổi ảnh đại diện</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Tính năng thay đổi ảnh đại diện sẽ được triển khai sau.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
