import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon, Close as CloseIcon,
  Info as InfoIcon, Language as LanguageIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon, Star as StarIcon, TrendingUp as TrendingUpIcon, Warning as WarningIcon
} from '@mui/icons-material';
import {
  Alert,
  AlertTitle, Avatar, Box, Card, Chip, Container, Divider, Grid, IconButton, LinearProgress, Paper, Tooltip, Typography, useMediaQuery, useTheme
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme as useThemeContext } from '../../contexts/ThemeContext';

const AuthLayout = ({ children, title, subtitle, showFeatures = true, showAnnouncements = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const { isDarkMode, toggleTheme } = useThemeContext();
  const { language, t, changeLanguage } = useLanguage();

  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Features to showcase
  const features = [
    {
      icon: <SecurityIcon />,
      title: 'Bảo mật cao',
      description: 'Hệ thống bảo mật đa lớp với mã hóa end-to-end',
      color: 'primary',
    },
    {
      icon: <SpeedIcon />,
      title: 'Tốc độ nhanh',
      description: 'Xử lý dữ liệu real-time với hiệu suất cao',
      color: 'secondary',
    },
    {
      icon: <TrendingUpIcon />,
      title: 'Tối ưu hóa',
      description: 'Thuật toán AI tối ưu hóa tuyến đường vận chuyển',
      color: 'success',
    },
  ];

  // Announcements
  const announcements = [
    {
      type: 'info',
      title: 'Cập nhật mới',
      message: 'Phiên bản 2.0 với nhiều tính năng mới đã được phát hành!',
      icon: <InfoIcon />,
    },
    {
      type: 'warning',
      title: 'Bảo trì hệ thống',
      message: 'Hệ thống sẽ bảo trì từ 2:00 - 4:00 ngày mai.',
      icon: <WarningIcon />,
    },
  ];

  // Language options
  const languageOptions = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  useEffect(() => {
    // Auto-rotate features
    if (showFeatures) {
      const interval = setInterval(() => {
        setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showFeatures]);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
  };

  const handleAnnouncementClose = () => {
    setShowAnnouncement(false);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          padding: theme.spacing(2),
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Loading indicator */}
        {loading && (
          <Box sx={{ width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 9999 }}>
            <LinearProgress />
          </Box>
        )}

        {/* Background decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: `radial-gradient(circle, ${theme.palette.primary.main}20 0%, transparent 70%)`,
            animation: 'rotate 20s linear infinite',
            zIndex: 0,
          }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            variants={floatingVariants}
            animate="float"
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              backgroundColor: theme.palette.primary.main,
              borderRadius: '50%',
              left: `${20 + index * 15}%`,
              top: `${30 + index * 10}%`,
              opacity: 0.3,
            }}
          />
        ))}

        <Container maxWidth={isTablet ? "sm" : "md"} sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            {/* Left side - Features showcase (desktop only) */}
            {!isTablet && showFeatures && (
              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <Paper
                    elevation={24}
                    sx={{
                      padding: theme.spacing(4),
                      borderRadius: theme.spacing(3),
                      backdropFilter: 'blur(10px)',
                      backgroundColor: theme.palette.background.paper,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                        Chào mừng đến với
                      </Typography>
                      <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                        sx={{
                          fontWeight: 800,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        MIA Logistics
                      </Typography>
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                        Hệ thống quản lý vận chuyển thông minh
                      </Typography>
                    </Box>

                    {/* Features showcase */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Tính năng nổi bật
                      </Typography>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentFeatureIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Card
                            sx={{
                              p: 3,
                              border: `2px solid ${theme.palette[features[currentFeatureIndex].color].main}`,
                              borderRadius: 2,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Avatar
                                sx={{
                                  bgcolor: `${features[currentFeatureIndex].color}.main`,
                                  width: 48,
                                  height: 48,
                                }}
                              >
                                {features[currentFeatureIndex].icon}
                              </Avatar>
                              <Typography variant="h6" fontWeight="600">
                                {features[currentFeatureIndex].title}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {features[currentFeatureIndex].description}
                            </Typography>
                          </Card>
                        </motion.div>
                      </AnimatePresence>
                    </Box>

                    {/* Feature indicators */}
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {features.map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: index === currentFeatureIndex ? 'primary.main' : 'action.disabled',
                            transition: 'all 0.3s',
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            )}

            {/* Right side - Auth form */}
            <Grid item xs={12} md={isTablet ? 12 : 6}>
              <motion.div variants={itemVariants}>
                <Paper
                  elevation={24}
                  sx={{
                    padding: theme.spacing(4),
                    borderRadius: theme.spacing(3),
                    backdropFilter: 'blur(10px)',
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  {/* Header controls */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: 'primary.main',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '20px',
                          fontWeight: 'bold',
                        }}
                      >
                        MIA
                      </Box>
                      <Box>
                        <Typography variant="h6" component="h1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          {title || 'MIA Logistics Manager'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {subtitle || 'Hệ thống quản lý vận chuyển chuyên nghiệp'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {/* Language selector */}
                      <Tooltip title="Ngôn ngữ">
                        <IconButton onClick={() => handleLanguageChange(language === 'vi' ? 'en' : 'vi')}>
                          <LanguageIcon />
                        </IconButton>
                      </Tooltip>

                      {/* Theme toggle */}
                      <Tooltip title={isDarkMode ? 'Sáng' : 'Tối'}>
                        <IconButton onClick={toggleTheme}>
                          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Announcements */}
                  {showAnnouncements && showAnnouncement && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Alert
                        severity={announcements[0].type}
                        sx={{ mb: 3 }}
                        action={
                          <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={handleAnnouncementClose}
                          >
                            <CloseIcon fontSize="inherit" />
                          </IconButton>
                        }
                      >
                        <AlertTitle>{announcements[0].title}</AlertTitle>
                        {announcements[0].message}
                      </Alert>
                    </motion.div>
                  )}

                  {/* Main content */}
                  <Box sx={{ mb: 3 }}>
                    {children}
                  </Box>

                  {/* Footer */}
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Được phát triển bởi MIA Logistics Team
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<StarIcon />}
                        label="Phiên bản 2.0"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        icon={<SecurityIcon />}
                        label="Bảo mật cao"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        icon={<SpeedIcon />}
                        label="Tốc độ nhanh"
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>

        {/* Custom CSS for animations */}
        <style>{`
          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </Box>
    </motion.div>
  );
};

export default AuthLayout;
