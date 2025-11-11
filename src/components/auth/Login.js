import {
  CheckCircle as CheckCircleIcon, Email as EmailIcon, Error as ErrorIcon, Google as GoogleIcon, Lock as LockIcon, Security as SecurityIcon,
  Speed as SpeedIcon, Visibility,
  VisibilityOff, Warning as WarningIcon
} from '@mui/icons-material';
import {
  Alert, Box, Button, Card,
  CardContent, Checkbox, CircularProgress, Divider, FormControlLabel, Grid, IconButton, InputAdornment, Link, TextField, Typography
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
  },
  password: (value) => {
    if (!value) return 'Mật khẩu là bắt buộc';
    if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    return null;
  },
};


// Enhanced security features
const securityFeatures = [
  {
    title: 'Bảo mật cao',
    description: 'Mã hóa dữ liệu với tiêu chuẩn quốc tế',
    icon: <SecurityIcon />,
  },
  {
    title: 'Hiệu suất tốt',
    description: 'Tốc độ xử lý nhanh và ổn định',
    icon: <SpeedIcon />,
  },
  {
    title: 'Đáng tin cậy',
    description: 'Hệ thống đã được kiểm chứng',
    icon: <CheckCircleIcon />,
  },
];

const Login = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Safe access to context with fallback
  let login, isAuthenticated;
  try {
    const auth = useAuth();
    login = auth.login;
    isAuthenticated = auth.isAuthenticated;
  } catch (error) {
    console.warn('Auth context not available:', error);
    login = () => Promise.resolve({ success: false, error: 'Context not available' });
    isAuthenticated = false;
  }

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  // Safe access to additional notification methods
  let showWarning, showInfo;
  try {
    const notification = useNotification();
    showWarning = notification.showWarning;
    showInfo = notification.showInfo;
  } catch (error) {
    console.warn('Additional notification methods not available:', error);
    showWarning = (message) => console.warn('WARNING:', message);
    showInfo = (message) => console.info('INFO:', message);
  }

  // Language context is already available from useLanguage() hook above

  // Safe access to theme context with fallback
  let theme;
  try {
    theme = useTheme();
    // Ensure theme has required properties
    if (!theme || !theme.palette || !theme.palette.primary) {
      throw new Error('Invalid theme structure');
    }
  } catch (error) {
    console.warn('Theme context not available:', error);
    theme = {
      palette: {
        mode: 'light',
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

    // Password validation
    const passwordError = validationSchema.password(values.password);
    if (passwordError) newErrors.password = passwordError;

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

  // Enhanced login handling
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
      setTouched({ email: true, password: true });
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result && result.success) {
        showSuccess('Đăng nhập thành công!');
        setLoginAttempts(0);
        setIsLocked(false);

        // Log successful login
        console.log('✅ Login successful:', formData.email);

        // Navigate to dashboard after successful login
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000); // Small delay to show success message
      } else {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= 3) {
          setIsLocked(true);
          setLockoutTime(Date.now() + 300000); // 5 minutes
          showWarning('Tài khoản bị khóa 5 phút do đăng nhập sai nhiều lần');
        } else {
          showError((result && result.error) || 'Đăng nhập thất bại');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Đã xảy ra lỗi khi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced Google login
  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      // Google OAuth login implementation would go here
      showInfo('Đăng nhập Google sẽ được triển khai sau');
    } catch (error) {
      showError('Đăng nhập Google thất bại');
    } finally {
      setIsLoading(false);
    }
  };


  // Enhanced forgot password
  const handleForgotPassword = () => {
    showInfo('Tính năng quên mật khẩu sẽ được triển khai sau');
  };

  // Lockout timer effect
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setInterval(() => {
        if (Date.now() >= lockoutTime) {
          setIsLocked(false);
          setLockoutTime(0);
          setLoginAttempts(0);
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
            Chào mừng trở lại!
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Đăng nhập để tiếp tục
          </Typography>
        </motion.div>


        {/* Login form */}
        <motion.div variants={itemVariants}>
          <Card sx={{ p: 3, boxShadow: theme.shadows[8] }}>
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
                margin="normal"
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

              {/* Password field */}
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
                margin="normal"
                disabled={isLoading || isLocked}
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
                        disabled={isLoading || isLocked}
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
                      boxShadow: `0 0 0 2px ${theme?.palette?.primary?.main || '#1976d2'}20`,
                    },
                  },
                }}
              />

              {/* Remember me checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.rememberMe}
                    onChange={(e) => handleChange('rememberMe', e.target.checked)}
                    name="rememberMe"
                    color="primary"
                    disabled={isLoading || isLocked}
                  />
                }
                label="Ghi nhớ đăng nhập"
                sx={{ mt: 1, mb: 2 }}
              />

              {/* Login button */}
              <Button
                color="primary"
                variant="contained"
                fullWidth
                type="submit"
                disabled={isLoading || isLocked}
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
                    <Typography variant="body2">Đang đăng nhập...</Typography>
                  </Box>
                ) : isLocked ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon />
                    <Typography variant="body2">Tài khoản bị khóa</Typography>
                  </Box>
                ) : (
                  'Đăng nhập'
                )}
              </Button>

              {/* Divider */}
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  hoặc
                </Typography>
              </Divider>

              {/* Google login button */}
              <Button
                variant="outlined"
                fullWidth
                onClick={handleGoogleLogin}
                disabled={isLoading || isLocked}
                startIcon={<GoogleIcon />}
                sx={{
                  py: 1.5,
                  borderColor: theme.palette.grey[300],
                  color: theme.palette.text.primary,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.main + '10',
                  },
                }}
              >
                Đăng nhập với Google
              </Button>

              {/* Forgot password */}
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={handleForgotPassword}
                  disabled={isLoading || isLocked}
                  sx={{
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Quên mật khẩu?
                </Link>
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

        {/* Login attempts warning */}
        {loginAttempts > 0 && !isLocked && (
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
                Bạn đã đăng nhập sai {loginAttempts}/3 lần.
                {loginAttempts >= 2 && ' Tài khoản sẽ bị khóa sau lần đăng nhập sai tiếp theo.'}
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
                Tài khoản bị khóa do đăng nhập sai quá nhiều lần.
                Vui lòng thử lại sau 5 phút.
              </Typography>
            </Alert>
          </motion.div>
        )}
      </Box>
    </motion.div>
  );
};

export default Login;
