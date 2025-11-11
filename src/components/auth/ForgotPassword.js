import {
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Error as ErrorIcon,
  Security as SecurityIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';

// Enhanced validation schema
const validationSchema = {
  email: (value) => {
    if (!value) return 'Email là bắt buộc';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email không hợp lệ';
    return null;
  }
};

// Security features
const securityFeatures = [
  {
    title: 'Bảo mật cao',
    description: 'Mã hóa dữ liệu với tiêu chuẩn quốc tế',
    icon: <SecurityIcon />,
  },
  {
    title: 'Khôi phục nhanh',
    description: 'Nhận email khôi phục trong vài phút',
    icon: <CheckCircleIcon />,
  },
  {
    title: 'Đáng tin cậy',
    description: 'Hệ thống đã được kiểm chứng',
    icon: <SecurityIcon />,
  },
];

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    email: '',
  });
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [resetAttempts, setResetAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  const navigate = useNavigate();

  // Safe access to context with fallback
  let resetPassword;
  try {
    const auth = useAuth();
    resetPassword = auth.resetPassword;
  } catch (error) {
    console.warn('GoogleSheetsAuth context not available:', error);
    resetPassword = () => Promise.resolve();
  }

  // Safe access to notification context with fallback
  let showSuccess, showError, showWarning, showInfo;
  try {
    const notification = useNotification();
    showSuccess = notification.showSuccess;
    showError = notification.showError;
    showWarning = notification.showWarning;
    showInfo = notification.showInfo;
  } catch (error) {
    console.warn('Notification context not available:', error);
    showSuccess = (message) => console.log('SUCCESS:', message);
    showError = (message) => console.error('ERROR:', message);
    showWarning = (message) => console.warn('WARNING:', message);
    showInfo = (message) => console.info('INFO:', message);
  }

  // Safe access to language context with fallback
  let t;
  try {
    const language = useLanguage();
    t = language.t;
  } catch (error) {
    console.warn('Language context not available:', error);
    t = (key) => key; // Fallback to key itself
  }

  // Safe access to theme context with fallback
  let theme;
  try {
    theme = useTheme();
  } catch (error) {
    console.warn('Theme context not available:', error);
    theme = {
      palette: {
        primary: { main: '#1976d2', dark: '#1565c0', light: '#42a5f5' },
        secondary: { main: '#ffc107' },
        background: { paper: '#ffffff' },
        text: { primary: '#212121', secondary: '#757575' },
        divider: '#e0e0e0'
      },
      shadows: ['none', '0 2px 4px rgba(0,0,0,0.1)', '0 4px 8px rgba(0,0,0,0.15)']
    };
  }

  // Enhanced validation
  const validateForm = useCallback((values) => {
    const newErrors = {};

    // Email validation
    const emailError = validationSchema.email(values.email);
    if (emailError) newErrors.email = emailError;

    return newErrors;
  }, []);

  // Enhanced form handling
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    // Validate field on blur
    const fieldErrors = validateForm({ [field]: formData[field] });
    if (fieldErrors[field]) {
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
    }
  }, [formData, validateForm]);

  // Enhanced reset password handling
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if account is locked
    if (isLocked && Date.now() < lockoutTime) {
      const remainingTime = Math.ceil((lockoutTime - Date.now()) / 1000);
      showError(`Tài khoản bị khóa trong ${remainingTime} giây`);
      return;
    }

    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ email: true });
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword({
        email: formData.email,
      });

      if (result.success) {
        setIsEmailSent(true);
        showSuccess('Email khôi phục mật khẩu đã được gửi!');
        setResetAttempts(0);
        setIsLocked(false);
      } else {
        const newAttempts = resetAttempts + 1;
        setResetAttempts(newAttempts);

        if (newAttempts >= 3) {
          setIsLocked(true);
          setLockoutTime(Date.now() + 300000); // 5 minutes
          showWarning('Tài khoản bị khóa 5 phút do yêu cầu khôi phục quá nhiều lần');
        } else {
          showError(result.error || 'Khôi phục mật khẩu thất bại');
        }
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showError('Đã xảy ra lỗi khi khôi phục mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  // Lockout timer effect
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setInterval(() => {
        if (Date.now() >= lockoutTime) {
          setIsLocked(false);
          setLockoutTime(0);
          setResetAttempts(0);
          showSuccess('Tài khoản đã được mở khóa');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime, showSuccess]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ maxWidth: 500, mx: 'auto', p: 2 }}>
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              mb: 2,
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Quên mật khẩu?
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Nhập email để nhận link khôi phục mật khẩu
          </Typography>
        </motion.div>

        {/* Reset password form */}
        <motion.div variants={itemVariants}>
          <Card sx={{ p: 3, boxShadow: theme.shadows[8] }}>
            {!isEmailSent ? (
              <form onSubmit={handleSubmit}>
                {/* Email field */}
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  disabled={isLoading || isLocked}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
                      },
                    },
                  }}
                />

                {/* Reset button */}
                <Button
                  color="primary"
                  variant="contained"
                  fullWidth
                  type="submit"
                  disabled={isLoading || isLocked}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    },
                    '&:disabled': {
                      background: theme.palette.action.disabledBackground,
                    },
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <Typography variant="body2">Đang gửi email...</Typography>
                    </Box>
                  ) : isLocked ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon />
                      <Typography variant="body2">Tài khoản bị khóa</Typography>
                    </Box>
                  ) : (
                    'Gửi email khôi phục'
                  )}
                </Button>

                {/* Back to login */}
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    variant="text"
                    onClick={() => navigate('/login')}
                    disabled={isLoading || isLocked}
                    sx={{
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Quay lại đăng nhập
                  </Button>
                </Box>
              </form>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Email đã được gửi!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Chúng tôi đã gửi link khôi phục mật khẩu đến email của bạn.
                  Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    },
                  }}
                >
                  Quay lại đăng nhập
                </Button>
              </Box>
            )}
          </Card>
        </motion.div>

        {/* Security features */}
        <motion.div variants={itemVariants}>
          <Card sx={{ mt: 3, bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom align="center">
                Tính năng bảo mật
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                {securityFeatures.map((feature, index) => (
                  <Box key={index} sx={{ textAlign: 'center', p: 2 }}>
                    <Box sx={{
                      display: 'inline-flex',
                      p: 1,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      mb: 1,
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="subtitle2" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reset attempts warning */}
        {resetAttempts > 0 && !isLocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Alert
              severity="warning"
              sx={{ mt: 2 }}
              icon={<WarningIcon />}
            >
              <Typography variant="body2">
                Bạn đã yêu cầu khôi phục {resetAttempts}/3 lần.
                {resetAttempts >= 2 && ' Tài khoản sẽ bị khóa sau lần yêu cầu tiếp theo.'}
              </Typography>
            </Alert>
          </motion.div>
        )}

        {/* Lockout warning */}
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Alert
              severity="error"
              sx={{ mt: 2 }}
              icon={<ErrorIcon />}
            >
              <Typography variant="body2">
                Tài khoản bị khóa do yêu cầu khôi phục quá nhiều lần.
                Vui lòng thử lại sau 5 phút.
              </Typography>
            </Alert>
          </motion.div>
        )}
      </Box>
    </motion.div>
  );
};

export default ForgotPassword;
