import {
  Assignment,
  Business,
  CheckCircle,
  LocalShipping,
  People,
  Schedule,
  Warehouse,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import GoogleApiStatus from '../components/GoogleApiStatus';
import LoginInfo from '../components/auth/LoginInfo';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { useDashboardStats, useRecentActivities } from '../hooks/useDashboard';

const Dashboard = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useCustomTheme();

  // Fetch data từ API
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
  } = useDashboardStats();

  const {
    data: activitiesData,
    isLoading: activitiesLoading,
    isError: activitiesError,
  } = useRecentActivities({ limit: 10 });

  // Format stats từ API response
  const stats = React.useMemo(() => {
    if (!statsData?.data) {
      // Fallback data nếu chưa có data
      return [
        {
          title: t('dashboard.total_transports'),
          value: '0',
          change: '0%',
          icon: LocalShipping,
          color: '#2196f3',
        },
        {
          title: t('dashboard.active_transports'),
          value: '0',
          change: '0%',
          icon: Schedule,
          color: '#ff9800',
        },
        {
          title: t('dashboard.completed_transports'),
          value: '0',
          change: '0%',
          icon: CheckCircle,
          color: '#4caf50',
        },
        {
          title: t('dashboard.warehouse_items'),
          value: '0',
          change: '0%',
          icon: Warehouse,
          color: '#9c27b0',
        },
      ];
    }

    const statsDataObj = statsData.data;
    return [
      {
        title: t('dashboard.total_transports'),
        value: statsDataObj.totalTransports?.value?.toString() || '0',
        change: statsDataObj.totalTransports?.change || '0%',
        icon: LocalShipping,
        color: '#2196f3',
      },
      {
        title: t('dashboard.active_transports'),
        value: statsDataObj.activeTransports?.value?.toString() || '0',
        change: statsDataObj.activeTransports?.change || '0%',
        icon: Schedule,
        color: '#ff9800',
      },
      {
        title: t('dashboard.completed_transports'),
        value: statsDataObj.completedTransports?.value?.toString() || '0',
        change: statsDataObj.completedTransports?.change || '0%',
        icon: CheckCircle,
        color: '#4caf50',
      },
      {
        title: t('dashboard.warehouse_items'),
        value: statsDataObj.warehouseItems?.value?.toLocaleString() || '0',
        change: statsDataObj.warehouseItems?.change || '0%',
        icon: Warehouse,
        color: '#9c27b0',
      },
    ];
  }, [statsData, t]);

  // Format activities từ API response
  const recentActivities = React.useMemo(() => {
    if (!activitiesData?.data) {
      return [];
    }

    return activitiesData.data.map((activity) => {
      // Format time
      let timeDisplay = activity.time;
      try {
        const timeDate = new Date(activity.time);
        if (!isNaN(timeDate.getTime())) {
          timeDisplay = formatDistanceToNow(timeDate, {
            addSuffix: true,
            locale: vi,
          });
        }
      } catch (e) {
        // Keep original time if parsing fails
      }

      return {
        id: activity.id,
        type: activity.type,
        title: activity.title,
        time: timeDisplay,
        status: activity.status,
      };
    });
  }, [activitiesData]);

  const quickActions = [
    {
      title: t('transport.new_transport'),
      icon: LocalShipping,
      color: '#2196f3',
    },
    { title: t('warehouse.new_item'), icon: Warehouse, color: '#4caf50' },
    { title: t('staff.new_staff'), icon: People, color: '#ff9800' },
    { title: t('partners.new_partner'), icon: Business, color: '#9c27b0' },
  ];

  // Loading state
  if (statsLoading || activitiesLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (statsError || activitiesError) {
    return (
      <Box sx={{ mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {statsError?.message ||
            activitiesError?.message ||
            'Không thể tải dữ liệu Dashboard'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          {t('dashboard.welcome')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('dashboard.overview')} - {new Date().toLocaleDateString('vi-VN')}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: isDarkMode
                    ? '0 4px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: stat.color,
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      <Icon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                      <Chip
                        label={stat.change}
                        size="small"
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {t('dashboard.quick_stats')}
              </Typography>
              <List>
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{ bgcolor: action.color, width: 32, height: 32 }}
                        >
                          <Icon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={action.title}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
            <CardActions>
              <Button size="small" variant="outlined" fullWidth>
                {t('common.view')} {t('common.details')}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {t('dashboard.recent_activities')}
              </Typography>
              <List>
                {recentActivities.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="Chưa có hoạt động nào"
                      secondary="Dữ liệu sẽ được cập nhật khi có hoạt động mới"
                    />
                  </ListItem>
                ) : (
                  recentActivities.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor:
                                activity.status === 'completed'
                                  ? '#4caf50'
                                  : activity.status === 'success'
                                    ? '#4caf50'
                                    : activity.status === 'info'
                                      ? '#2196f3'
                                      : '#ff9800',
                              width: 32,
                              height: 32,
                            }}
                          >
                            <Assignment fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.title}
                          secondary={activity.time}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      {index < recentActivities.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </CardContent>
            <CardActions>
              <Button size="small" variant="outlined" fullWidth>
                {t('common.view')} {t('common.details')}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Google API Status */}
      <Box sx={{ mt: 3 }}>
        <GoogleApiStatus />
        <LoginInfo />
      </Box>
    </Box>
  );
};

export default Dashboard;
