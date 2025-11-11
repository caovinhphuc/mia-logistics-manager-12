import {
  Assessment, Business, Dashboard, Description, ExpandLess, ExpandMore, LocalShipping as CarriersIcon, LocalShipping, Map,
  Notifications, People, Settings, ShoppingCart, Store, SupportAgent, SwapHoriz, Warehouse
} from '@mui/icons-material';
import {
  Box, Collapse, Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText, Typography,
  useTheme
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

const menuItems = [
  { text: 'navigation.dashboard', icon: Dashboard, path: '/' },
  { text: 'navigation.transport', icon: LocalShipping, path: '/transport' },
  { text: 'navigation.warehouse', icon: Warehouse, path: '/warehouse' },
  { text: 'navigation.staff', icon: People, path: '/staff' },
  { text: 'navigation.partners', icon: Business, path: '/partners' },
  { text: 'navigation.carriers', icon: CarriersIcon, path: '/carriers' },
  {
    text: 'navigation.system_forms',
    icon: Description,
    path: '/system-forms',
    hasSubmenu: true,
    submenu: [
      { text: 'navigation.purchase_order', icon: ShoppingCart, path: '/purchase-order' },
      { text: 'navigation.transfer_slip', icon: SwapHoriz, path: '/transfer-slip' },
      { text: 'navigation.online_order', icon: Store, path: '/online-order' },
      { text: 'navigation.offline_order', icon: Store, path: '/offline-order' },
      { text: 'navigation.warranty_slip', icon: SupportAgent, path: '/warranty-slip' },
    ]
  },
  { text: 'navigation.maps', icon: Map, path: '/maps' },
  { text: 'navigation.notifications', icon: Notifications, path: '/notifications' },
  { text: 'navigation.reports', icon: Assessment, path: '/reports' },
  { text: 'navigation.settings', icon: Settings, path: '/settings' },
];

const Sidebar = ({ onClose }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isDarkMode } = useCustomTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState({});

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) {
      onClose();
    }
  };

  const handleToggleSubmenu = (itemText) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemText]: !prev[itemText]
    }));
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: isDarkMode ? '#fff' : '#1976d2',
            textAlign: 'center',
          }}
        >
          MIA Logistics
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isExpanded = expandedItems[item.text];
          const hasSubmenu = item.hasSubmenu;

          return (
            <React.Fragment key={item.text}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (hasSubmenu) {
                      handleToggleSubmenu(item.text);
                    } else {
                      handleNavigation(item.path);
                    }
                  }}
                  sx={{
                    mx: 1,
                    mb: 0.5,
                    borderRadius: 1,
                    backgroundColor: isActive
                      ? (isDarkMode ? '#333' : '#e3f2fd')
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive
                        ? (isDarkMode ? '#fff' : '#1976d2')
                        : (isDarkMode ? '#aaa' : '#666'),
                      minWidth: 40,
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={t(item.text)}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: isActive
                          ? (isDarkMode ? '#fff' : '#1976d2')
                          : (isDarkMode ? '#aaa' : '#333'),
                        fontWeight: isActive ? 600 : 400,
                      },
                    }}
                  />
                  {hasSubmenu && (
                    <Box sx={{ ml: 1 }}>
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>

              {/* Submenu */}
              {hasSubmenu && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = location.pathname === subItem.path;

                      return (
                        <ListItem key={subItem.text} disablePadding>
                          <ListItemButton
                            onClick={() => handleNavigation(subItem.path)}
                            sx={{
                              mx: 1,
                              ml: 4,
                              mb: 0.5,
                              borderRadius: 1,
                              backgroundColor: isSubActive
                                ? (isDarkMode ? '#333' : '#e3f2fd')
                                : 'transparent',
                              '&:hover': {
                                backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                color: isSubActive
                                  ? (isDarkMode ? '#fff' : '#1976d2')
                                  : (isDarkMode ? '#aaa' : '#666'),
                                minWidth: 40,
                              }}
                            >
                              <SubIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={t(subItem.text)}
                              sx={{
                                '& .MuiListItemText-primary': {
                                  color: isSubActive
                                    ? (isDarkMode ? '#fff' : '#1976d2')
                                    : (isDarkMode ? '#aaa' : '#333'),
                                  fontWeight: isSubActive ? 600 : 400,
                                  fontSize: '0.9rem',
                                },
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}` }}>
        <Typography
          variant="caption"
          sx={{
            color: isDarkMode ? '#666' : '#999',
            textAlign: 'center',
            display: 'block',
          }}
        >
          MIA Logistics Manager v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
          borderRight: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
