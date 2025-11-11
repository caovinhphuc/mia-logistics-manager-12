import {
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Error as ErrorIcon,
  Lock as LockIcon,
  Person as PersonIcon,
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
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
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
  username: (value) => {
    if (!value) return 'Tên người dùng là bắt buộc';
    if (value.length < 3) return 'Tên người dùng phải có ít nhất 3 ký tự';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới';
    return null;
  },
  email: (value) => {
    if (!value) return 'Email là bắt buộc';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email không hợp lệ';
    return null;
  },
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
  },
  fullName: (value) => {
    if (!value) return 'Họ tên là bắt buộc';
    if (value.length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
    return null;
  },
  phone: (value) => {
    if (!value) return 'Số điện thoại là bắt buộc';
    if (!/^[0-9+\-\s()]+$/.test(value)) return 'Số điện thoại không hợp lệ';
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
    title: 'Dễ sử dụng',
    description: 'Giao diện thân thiện và trực quan',
    icon: <CheckCircleIcon />,
  },
  {
    title: 'Đáng tin cậy',
    description: 'Hệ thống đã được kiểm chứng',
    icon: <PersonIcon />,
  },
];

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    agreeToTerms: false,
  });

  const navigate = useNavigate();

  // Safe access to context with fallback
  let register;
  try {
    const auth = useAuth();
    register = auth.register;
  } catch (error) {
    console.warn('GoogleSheetsAuth context not available:', error);
    register = () => Promise.resolve();
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

    // Username validation
    const usernameError = validationSchema.username(values.username);
    if (usernameError) newErrors.username = usernameError;

    // Email validation
    const emailError = validationSchema.email(values.email);
    if (emailError) newErrors.email = emailError;

    // Password validation
    const passwordError = validationSchema.password(values.password);
    if (passwordError) newErrors.password = passwordError;

    // Confirm password validation
    const confirmPasswordError = validationSchema.confirmPassword(values.confirmPassword, values.password);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    // Full name validation
    const fullNameError = validationSchema.fullName(values.fullName);
    if (fullNameError) newErrors.fullName = fullNameError;

    // Phone validation
    const phoneError = validationSchema.phone(values.phone);
    if (phoneError) newErrors.phone = phoneError;

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

  // Enhanced register handling
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({
        username: true,
        email: true,
        password: true,
        confirmPassword: true,
        fullName: true,
        phone: true
      });
      return;
    }

    if (!formData.agreeToTerms) {
      showError('Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
      });

      if (result.success) {
        showSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        showError(result.error || 'Đăng ký thất bại');
      }
    } catch (error) {
      console.error('Register error:', error);
      showError('Đã xảy ra lỗi khi đăng ký');
    } finally {
      setIsLoading(false);
    }
  };

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
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
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
            Tạo tài khoản mới
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Đăng ký để sử dụng hệ thống
          </Typography>
        </motion.div>

        {/* Register form */}
        <motion.div variants={itemVariants}>
          <Card sx={{ p: 3, boxShadow: theme.shadows[8] }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                {/* Username */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="username"
                    name="username"
                    label="Tên người dùng"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    onBlur={() => handleBlur('username')}
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
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
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Full Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="fullName"
                    name="fullName"
                    label="Họ và tên"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    error={touched.fullName && Boolean(errors.fullName)}
                    helperText={touched.fullName && errors.fullName}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Phone */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Số điện thoại"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Password */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Mật khẩu"
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
                  />
                </Grid>

                {/* Confirm Password */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
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
                  />
                </Grid>
              </Grid>

              {/* Terms and conditions */}
              <FormControlLabel
                control={
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label={
                  <Typography variant="body2">
                    Tôi đồng ý với{' '}
                    <Link href="#" color="primary">
                      Điều khoản sử dụng
                    </Link>{' '}
                    và{' '}
                    <Link href="#" color="primary">
                      Chính sách bảo mật
                    </Link>
                  </Typography>
                }
                sx={{ mt: 2, mb: 2 }}
              />

              {/* Register button */}
              <Button
                color="primary"
                variant="contained"
                fullWidth
                type="submit"
                disabled={isLoading}
                sx={{
                  mt: 2,
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
                    <Typography variant="body2">Đang đăng ký...</Typography>
                  </Box>
                ) : (
                  'Đăng ký'
                )}
              </Button>

              {/* Divider */}
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  hoặc
                </Typography>
              </Divider>

              {/* Login link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Đã có tài khoản?{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/login')}
                    disabled={isLoading}
                    sx={{
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Đăng nhập ngay
                  </Link>
                </Typography>
              </Box>
            </form>
          </Card>
        </motion.div>

        {/* Security features */}
        <motion.div variants={itemVariants}>
          <Card sx={{ mt: 3, bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom align="center">
                Tính năng bảo mật
              </Typography>
              <Grid container spacing={2}>
                {securityFeatures.map((feature, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
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
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default Register;
