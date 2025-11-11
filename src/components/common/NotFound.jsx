import {
  ArrowBack as ArrowBackIcon, BugReport as BugReportIcon, Chat as ChatIcon, ContactSupport as ContactSupportIcon, Description as DescriptionIcon,
  Email as EmailIcon, Help as HelpIcon, Home as HomeIcon, KeyboardArrowRight as ArrowRightIcon, Phone as PhoneIcon, Refresh as RefreshIcon, Search as SearchIcon, Security as SecurityIcon, Speed as SpeedIcon, TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {
  Alert,
  AlertTitle, Avatar, Box, Button, Card,
  CardContent, Container, Divider, Grid, LinearProgress, List,
  ListItem,
  ListItemIcon,
  ListItemText, Paper, Typography, useMediaQuery, useTheme
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorDetails, setErrorDetails] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Common navigation paths
  const commonPaths = [
    { label: 'Trang chủ', path: '/dashboard', icon: <HomeIcon />, color: 'primary' },
    { label: 'Quản lý vận chuyển', path: '/transport', icon: <SpeedIcon />, color: 'secondary' },
    { label: 'Quản lý kho', path: '/warehouse', icon: <SecurityIcon />, color: 'info' },
    { label: 'Quản lý nhân viên', path: '/staff', icon: <TrendingUpIcon />, color: 'success' },
    { label: 'Quản lý đối tác', path: '/partners', icon: <DescriptionIcon />, color: 'warning' },
    { label: 'Báo cáo', path: '/reports', icon: <TrendingUpIcon />, color: 'error' },
  ];

  // Support contacts
  const supportContacts = [
    {
      type: 'email',
      label: 'Email hỗ trợ',
      value: 'support@mialogistics.com',
      icon: <EmailIcon />,
      action: () => window.open('mailto:support@mialogistics.com'),
    },
    {
      type: 'phone',
      label: 'Hotline',
      value: '1900-123-456',
      icon: <PhoneIcon />,
      action: () => window.open('tel:1900-123-456'),
    },
    {
      type: 'chat',
      label: 'Chat trực tuyến',
      value: 'Trò chuyện với chúng tôi',
      icon: <ChatIcon />,
      action: () => {
        // Open chat widget or redirect to chat page
        console.log('Opening chat widget');
      },
    },
  ];

  // Error suggestions
  const errorSuggestions = [
    'Kiểm tra lại URL trong thanh địa chỉ',
    'Sử dụng menu điều hướng để tìm trang cần thiết',
    'Thử làm mới trang (F5 hoặc Ctrl+R)',
    'Xóa cache trình duyệt và thử lại',
    'Liên hệ hỗ trợ kỹ thuật nếu vấn đề tiếp tục',
  ];

  useEffect(() => {
    // Extract error details from location state
    if (location.state?.error) {
      setErrorDetails(location.state.error);
    }

    // Auto-show suggestions after a delay
    const timer = setTimeout(() => {
      setShowSuggestions(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [location.state]);

  const handleNavigation = (path) => {
    setLoading(true);
    navigate(path);
  };

  const handleRefresh = () => {
    setLoading(true);
    window.location.reload();
  };

  const handleReportError = () => {
    const errorReport = {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      error: errorDetails || '404 Not Found',
    };

    // Send error report (implement your error reporting logic here)
    console.log('Error report:', errorReport);

    // Show success message
    alert('Báo cáo lỗi đã được gửi. Cảm ơn bạn đã phản hồi!');
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      // Implement search functionality
      console.log('Searching for:', query);
      // You can redirect to a search page or show search results
    }
  };

  return (
    <Container maxWidth="lg">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            textAlign: 'center',
            py: 4,
            position: 'relative',
          }}
        >
          {/* Loading indicator */}
          {loading && (
            <Box sx={{ width: '100%', position: 'absolute', top: 0 }}>
              <LinearProgress />
            </Box>
          )}

          {/* Main 404 content */}
          <motion.div variants={itemVariants}>
            <Box
              sx={{
                position: 'relative',
                mb: 4,
              }}
            >
              {/* Floating animation for 404 */}
              <motion.div variants={floatingVariants} animate="float">
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: isMobile ? '6rem' : '8rem',
                    fontWeight: 'bold',
                    color: theme.palette.primary.main,
                    lineHeight: 1,
                    mb: 2,
                    textShadow: `0 0 20px ${theme.palette.primary.main}20`,
                  }}
                >
                  404
                </Typography>
              </motion.div>

              {/* Decorative elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                  zIndex: -1,
                  animation: 'pulse 2s infinite',
                }}
              />
            </Box>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 600,
                mb: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Không tìm thấy trang
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 600, fontSize: '1.1rem' }}
            >
              Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
              Vui lòng kiểm tra lại URL hoặc sử dụng các tùy chọn bên dưới.
            </Typography>
          </motion.div>

          {/* Action buttons */}
          <motion.div variants={itemVariants}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mb: 4 }}>
              <Button
                variant="contained"
                startIcon={<HomeIcon />}
                onClick={() => handleNavigation('/dashboard')}
                size="large"
                sx={{ minWidth: 160 }}
              >
                Về trang chính
              </Button>

              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                size="large"
                sx={{ minWidth: 160 }}
              >
                Quay lại
              </Button>

              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                size="large"
                sx={{ minWidth: 160 }}
              >
                Làm mới
              </Button>
            </Box>
          </motion.div>

          {/* Error details alert */}
          {errorDetails && (
            <motion.div variants={itemVariants}>
              <Alert severity="error" sx={{ mb: 4, maxWidth: 600 }}>
                <AlertTitle>Chi tiết lỗi</AlertTitle>
                {errorDetails}
              </Alert>
            </motion.div>
          )}

          {/* Quick navigation */}
          <motion.div variants={itemVariants}>
            <Card sx={{ mb: 4, maxWidth: 800, width: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SearchIcon color="primary" />
                  Điều hướng nhanh
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Chọn một trong các trang phổ biến để tiếp tục:
                </Typography>

                <Grid container spacing={2}>
                  {commonPaths.map((path, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={path.icon}
                          onClick={() => handleNavigation(path.path)}
                          sx={{
                            height: 60,
                            flexDirection: 'column',
                            gap: 1,
                            '&:hover': {
                              backgroundColor: `${path.color}.main`,
                              color: 'white',
                            },
                          }}
                        >
                          <Typography variant="body2" fontWeight="medium">
                            {path.label}
                          </Typography>
                        </Button>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>

          {/* Error suggestions */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card sx={{ mb: 4, maxWidth: 600, width: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HelpIcon color="info" />
                      Gợi ý khắc phục
                    </Typography>
                    <List dense>
                      {errorSuggestions.map((suggestion, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <ArrowRightIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={suggestion} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Support section */}
          <motion.div variants={itemVariants}>
            <Card sx={{ maxWidth: 800, width: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ContactSupportIcon color="primary" />
                  Cần hỗ trợ?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Liên hệ với bộ phận hỗ trợ kỹ thuật nếu bạn cần trợ giúp:
                </Typography>

                <Grid container spacing={2}>
                  {supportContacts.map((contact, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: 'action.hover',
                              transform: 'translateY(-2px)',
                            },
                          }}
                          onClick={contact.action}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {contact.icon}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {contact.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {contact.value}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<BugReportIcon />}
                    onClick={handleReportError}
                    size="small"
                  >
                    Báo cáo lỗi
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<HelpIcon />}
                    onClick={() => navigate('/help')}
                    size="small"
                  >
                    Trung tâm trợ giúp
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants}>
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                MIA Logistics Manager v1.0.0 | © 2024 All rights reserved
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </motion.div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.3;
          }
        }
      `}</style>
    </Container>
  );
};

export default NotFound;
