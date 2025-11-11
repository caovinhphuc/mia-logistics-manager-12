import {
  AccountCircle, Language, Logout,
  Notifications, Settings
} from '@mui/icons-material';
import {
  Avatar, Box, Divider, IconButton, ListItemIcon,
  ListItemText, Menu,
  MenuItem, Typography
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import ConnectionStatusIndicator from '../common/ConnectionStatusIndicator';

const Header = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useCustomTheme();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [langAnchorEl, setLangAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageMenu = (event) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLangAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
      // Redirect will be handled by ProtectedRoute in App.js
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    handleLanguageClose();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      {/* Logo/Title */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          MIA Logistics
        </Typography>
      </Box>

      {/* Right side actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Connection Status Indicator */}
        <ConnectionStatusIndicator compact={true} showLabels={false} />

        {/* Language Selector */}
        <IconButton
          size="large"
          aria-label="change language"
          aria-controls="language-menu"
          aria-haspopup="true"
          onClick={handleLanguageMenu}
          color="inherit"
        >
          <Language />
        </IconButton>
        <Menu
          id="language-menu"
          anchorEl={langAnchorEl}
          open={Boolean(langAnchorEl)}
          onClose={handleLanguageClose}
        >
          <MenuItem onClick={() => handleLanguageChange('vi')}>
            🇻🇳 Tiếng Việt
          </MenuItem>
          <MenuItem onClick={() => handleLanguageChange('en')}>
            🇺🇸 English
          </MenuItem>
        </Menu>

        {/* Notifications */}
        <IconButton
          size="large"
          aria-label="notifications"
          color="inherit"
        >
          <Notifications />
        </IconButton>

        {/* User Menu */}
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
            {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </Avatar>
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem disabled>
            <ListItemText
              primary={user?.fullName || user?.username || 'User'}
              secondary={user?.role?.name || user?.role?.code || 'User'}
            />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('navigation.profile')} />
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('navigation.settings')} />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('auth.logout')} />
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;
