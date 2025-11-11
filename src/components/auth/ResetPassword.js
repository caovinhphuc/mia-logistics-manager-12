import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  Visibility,
  VisibilityOff,
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
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';

// Enhanced validation schema
const validationSchema = {
  password: (value) => {
    if (!value) return 'Mật khẩu là bắt buộc';
    if (value.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
    return null;
  },
  confirmPassword: (value, password) => {
    if (!value) return 'Xác nhận mật khẩu là bắt buộc';
    if (value !== password) return 'Mật khẩu xác nhận không khớp';
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
    description: 'Đặt lại mật khẩu trong vài phút',
    icon: <CheckCircleIcon />,
  },
  {
    title: 'Đáng tin cậy',
    description: 'Hệ thống đã được kiểm chứng',
    icon: <SecurityIcon />,
  },
];

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

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

    // Password validation
    const passwordError = validationSchema.password(values.password);
    if (passwordError) newErrors.password = passwordError;

    // Confirm password validation
    const confirmPasswordError = validationSchema.confirmPassword(values.confirmPassword, values.password);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

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

    if (!token) {
      showError('Token không hợp lệ');
      return;
    }

    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ password: true, confirmPassword: true });
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword({
        token: token,
        password: formData.password,
      });

      if (result.success) {
        setIsSuccess(true);
        showSuccess('Mật khẩu đã được đặt lại thành công!');
      } else {
        showError(result.error || 'Đặt lại mật khẩu thất bại');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showError('Đã xảy ra lỗi khi đặt lại mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  // Check token validity on mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      showError('Token không hợp lệ');
    }
  }, [token, showError]);

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

  if (!tokenValid) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box sx={{ maxWidth: 500, mx: 'auto', p: 2 }}>
          <Card sx={{ p: 3, boxShadow: theme.shadows[8] }}>
            <Box sx={{ textAlign: 'center' }}>
              <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Token không hợp lệ
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Link khôi phục mật khẩu không hợp lệ hoặc đã hết hạn.
                Vui lòng yêu cầu khôi phục mật khẩu mới.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/forgot-password')}
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  },
                }}
              >
                Yêu cầu khôi phục mới
              </Button>
            </Box>
          </Card>
        </Box>
      </motion.div>
    );
  }

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
            Đặt lại mật khẩu
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Nhập mật khẩu mới của bạn
          </Typography>
        </motion.div>

        {/* Reset password form */}
        <motion.div variants={itemVariants}>
          <Card sx={{ p: 3, boxShadow: theme.shadows[8] }}>
            {!isSuccess ? (
              <form onSubmit={handleSubmit}>
                {/* Password field */}
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Mật khẩu mới"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
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

                {/* Confirm Password field */}
                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Xác nhận mật khẩu mới"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mt: 2,
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
                  disabled={isLoading}
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
                      <Typography variant="body2">Đang đặt lại mật khẩu...</Typography>
                    </Box>
                  ) : (
                    'Đặt lại mật khẩu'
                  )}
                </Button>
              </form>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Mật khẩu đã được đặt lại!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Mật khẩu của bạn đã được đặt lại thành công.
                  Bây giờ bạn có thể đăng nhập với mật khẩu mới.
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
                  Đăng nhập ngay
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
      </Box>
    </motion.div>
  );
};

export default ResetPassword;
