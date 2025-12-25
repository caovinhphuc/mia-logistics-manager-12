import {
  AccountCircle,
  Assessment as ReportsIcon,
  Brightness4,
  Brightness7,
  Business as PartnersIcon,
  Dashboard as DashboardIcon,
  ExpandLess,
  ExpandMore,
  Help as HelpIcon,
  Home as HomeIcon,
  KeyboardArrowRight as ArrowRightIcon,
  LocalShipping as TransportIcon,
  Logout,
  Map as MapIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  People as StaffIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  Warehouse as WarehouseIcon,
} from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  AppBar,
  Avatar,
  Backdrop,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Fab,
  Grid,
  IconButton,
  LinearProgress,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  Zoom,
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useTheme as useThemeContext } from '../../contexts/ThemeContext';

const drawerWidth = 280;
const drawerWidthCollapsed = 80;

const menuItems = [
  {
    text: 'dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    roles: ['admin', 'manager', 'operator', 'driver', 'warehouse_staff'],
    color: 'primary',
  },
  {
    text: 'transport',
    icon: <TransportIcon />,
    path: '/transport',
    roles: ['admin', 'manager', 'operator'],
    color: 'secondary',
    children: [
      {
        text: 'requests',
        path: '/transport/requests',
        roles: ['admin', 'manager', 'operator'],
      },
      {
        text: 'routes',
        path: '/transport/routes',
        roles: ['admin', 'manager'],
      },
      {
        text: 'vehicles',
        path: '/transport/vehicles',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    text: 'warehouse',
    icon: <WarehouseIcon />,
    path: '/warehouse',
    roles: ['admin', 'manager', 'warehouse_staff'],
    color: 'info',
    children: [
      {
        text: 'inventory',
        path: '/warehouse/inventory',
        roles: ['admin', 'manager', 'warehouse_staff'],
      },
      {
        text: 'orders',
        path: '/warehouse/orders',
        roles: ['admin', 'manager'],
      },
      {
        text: 'locations',
        path: '/warehouse/locations',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    text: 'staff',
    icon: <StaffIcon />,
    path: '/staff',
    roles: ['admin', 'manager'],
    color: 'success',
    children: [
      {
        text: 'employees',
        path: '/staff/employees',
        roles: ['admin', 'manager'],
      },
      {
        text: 'schedules',
        path: '/staff/schedules',
        roles: ['admin', 'manager'],
      },
      {
        text: 'performance',
        path: '/staff/performance',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    text: 'partners',
    icon: <PartnersIcon />,
    path: '/partners',
    roles: ['admin', 'manager', 'operator'],
    color: 'warning',
    children: [
      {
        text: 'suppliers',
        path: '/partners/suppliers',
        roles: ['admin', 'manager'],
      },
      {
        text: 'customers',
        path: '/partners/customers',
        roles: ['admin', 'manager', 'operator'],
      },
      {
        text: 'contracts',
        path: '/partners/contracts',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    text: 'maps',
    icon: <MapIcon />,
    path: '/maps',
    roles: ['admin', 'manager', 'operator', 'driver'],
    color: 'error',
  },
  {
    text: 'reports',
    icon: <ReportsIcon />,
    path: '/reports',
    roles: ['admin', 'manager'],
    color: 'primary',
    children: [
      {
        text: 'analytics',
        path: '/reports/analytics',
        roles: ['admin', 'manager'],
      },
      {
        text: 'financial',
        path: '/reports/financial',
        roles: ['admin', 'manager'],
      },
      {
        text: 'performance',
        path: '/reports/performance',
        roles: ['admin', 'manager'],
      },
    ],
  },
];

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeContext();
  const { language, changeLanguage, t } = useLanguage();
  const { unreadCount, notifications, markAsRead } = useNotification();

  // Animation variants
  const drawerVariants = {
    open: { width: drawerWidth },
    closed: { width: drawerWidthCollapsed },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  // Quick actions
  const quickActions = [
    {
      label: 'Tạo đơn vận chuyển',
      icon: <TransportIcon />,
      path: '/transport/new',
    },
    {
      label: 'Thêm hàng tồn kho',
      icon: <WarehouseIcon />,
      path: '/warehouse/add',
    },
    { label: 'Báo cáo nhanh', icon: <ReportsIcon />, path: '/reports/quick' },
    {
      label: 'Tìm kiếm',
      icon: <SearchIcon />,
      action: () => setSearchOpen(true),
    },
  ];

  // System status
  const systemStatus = {
    status: 'healthy',
    message: 'Tất cả hệ thống hoạt động bình thường',
    uptime: '99.9%',
    lastUpdate: new Date().toISOString(),
  };

  useEffect(() => {
    // Auto-collapse drawer on tablet
    if (isTablet) {
      setCollapsed(true);
    }
  }, [isTablet]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    setLoading(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path) => {
    setLoading(true);
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
    setTimeout(() => setLoading(false), 500);
  };

  const handleExpandItem = (itemText) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemText]: !prev[itemText],
    }));
  };

  const handleQuickAction = (action) => {
    if (action.path) {
      handleNavigation(action.path);
    } else if (action.action) {
      action.action();
    }
    setShowQuickActions(false);
  };

  const renderMenuItem = (item, level = 0) => {
    // Validate item
    if (!item || !item.text || !item.path) {
      return null;
    }

    const isActive = location.pathname.startsWith(item.path);
    const hasAccess = item.roles.some((role) => hasRole(role));
    const isExpanded = expandedItems[item.text];

    if (!hasAccess) return null;

    const hasChildren = item.children && item.children.length > 0;

    return (
      <motion.div
        key={item.text}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: level * 0.1 }}
      >
        <ListItem disablePadding>
          <ListItemButton
            selected={isActive}
            onClick={() => {
              if (hasChildren) {
                handleExpandItem(item.text);
              } else {
                handleNavigation(item.path);
              }
            }}
            sx={{
              minHeight: 48,
              px: 2.5,
              pl: 2.5 + level * 2,
              '&.Mui-selected': {
                bgcolor: `${item.color}.main`,
                color: `${item.color}.contrastText`,
                '&:hover': {
                  bgcolor: `${item.color}.dark`,
                },
                '& .MuiListItemIcon-root': {
                  color: `${item.color}.contrastText`,
                },
              },
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: 3 }}>{item.icon}</ListItemIcon>
            {!collapsed && (
              <>
                <ListItemText
                  primary={
                    item.text
                      ? t(`navigation.${item.text}`, {
                          defaultValue: item.text,
                        })
                      : ''
                  }
                />
                {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {hasChildren && !collapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children
                .filter((child) => child && child.text)
                .map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </motion.div>
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Toolbar sx={{ minHeight: 64 }}>
        <Box display="flex" alignItems="center" gap={2} sx={{ width: '100%' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              flexShrink: 0,
            }}
          >
            MIA
          </Box>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
                Logistics
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Manager v2.0
              </Typography>
            </motion.div>
          )}
        </Box>
      </Toolbar>

      <Divider />

      {/* System Status */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Box sx={{ p: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              <AlertTitle>Hệ thống hoạt động tốt</AlertTitle>
              <Typography variant="caption">
                Uptime: {systemStatus.uptime}
              </Typography>
            </Alert>
          </Box>
        </motion.div>
      )}

      <Divider />

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>{menuItems.map((item) => renderMenuItem(item))}</List>
      </Box>

      {/* Footer */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Box sx={{ p: 2 }}>
            <Card sx={{ bgcolor: 'background.paper' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Cần hỗ trợ?
                </Typography>
                <Button
                  size="small"
                  startIcon={<HelpIcon />}
                  onClick={() => setShowHelpDialog(true)}
                  fullWidth
                >
                  Trợ giúp
                </Button>
              </CardContent>
            </Card>
          </Box>
        </motion.div>
      )}
    </Box>
  );

  const currentPath = location.pathname;
  const pathSegments = currentPath.split('/').filter(Boolean);
  const breadcrumbs = pathSegments
    .map((segment, index) => {
      if (!segment) return null;
      const translationKey = `navigation.${segment}`;
      const translated = t(translationKey, { defaultValue: segment });
      return {
        label: translated !== translationKey ? translated : segment,
        path: '/' + pathSegments.slice(0, index + 1).join('/'),
      };
    })
    .filter(Boolean);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Loading indicator */}
      {loading && (
        <Box
          sx={{
            width: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999,
          }}
        >
          <LinearProgress />
        </Box>
      )}

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: {
            md: `calc(100% - ${collapsed ? drawerWidthCollapsed : drawerWidth}px)`,
          },
          ml: { md: `${collapsed ? drawerWidthCollapsed : drawerWidth}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Breadcrumbs */}
          <Breadcrumbs
            separator={<ArrowRightIcon fontSize="small" />}
            sx={{ flexGrow: 1, color: 'inherit' }}
          >
            <Link
              color="inherit"
              underline="hover"
              onClick={() => handleNavigation('/dashboard')}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <HomeIcon fontSize="small" />
              Trang chủ
            </Link>
            {breadcrumbs.map((breadcrumb, index) => (
              <Link
                key={index}
                color="inherit"
                underline="hover"
                onClick={() => handleNavigation(breadcrumb.path)}
                sx={{ cursor: 'pointer' }}
              >
                {breadcrumb.label}
              </Link>
            ))}
          </Breadcrumbs>

          {/* Quick Actions */}
          <Tooltip title="Hành động nhanh">
            <IconButton
              color="inherit"
              onClick={() => setShowQuickActions(!showQuickActions)}
            >
              <SpeedIcon />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Thông báo">
            <IconButton
              color="inherit"
              onClick={() => handleNavigation('/notifications')}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Theme toggle */}
          <Tooltip title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          {/* User menu */}
          <Tooltip title={user?.name || user?.email}>
            <IconButton color="inherit" onClick={handleUserMenuOpen}>
              {user?.picture ? (
                <Avatar src={user.picture} sx={{ width: 32, height: 32 }} />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{
          width: { md: collapsed ? drawerWidthCollapsed : drawerWidth },
          flexShrink: { md: 0 },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: collapsed ? drawerWidthCollapsed : drawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: {
            md: `calc(100% - ${collapsed ? drawerWidthCollapsed : drawerWidth}px)`,
          },
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>

      {/* User menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            handleUserMenuClose();
            handleNavigation('/profile');
          }}
        >
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Hồ sơ cá nhân" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUserMenuClose();
            handleNavigation('/settings');
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Cài đặt" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Đăng xuất" />
        </MenuItem>
      </Menu>

      {/* Quick Actions Dialog */}
      <Dialog
        open={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Hành động nhanh</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => handleQuickAction(action)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    {action.icon}
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {action.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog
        open={showHelpDialog}
        onClose={() => setShowHelpDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Trung tâm trợ giúp</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Chào mừng bạn đến với MIA Logistics Manager!
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Đây là hướng dẫn sử dụng cơ bản cho hệ thống.
          </Typography>
          {/* Add help content here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHelpDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Quick Actions FAB */}
      <Zoom in={!showQuickActions}>
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
          onClick={() => setShowQuickActions(true)}
        >
          <SpeedIcon />
        </Fab>
      </Zoom>

      {/* Loading backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default MainLayout;
