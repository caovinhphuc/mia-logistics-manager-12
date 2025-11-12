import { Box, CircularProgress, Typography } from '@mui/material';
import React, { Suspense, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

// Import contexts
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';

// Import layout components
import AuthLayout from './components/common/AuthLayout';
import MainLayout from './components/common/MainLayout';

// Import lazy-loaded pages
import { lazyWithRetry } from './utils/lazyWithRetry';

const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const WarehouseManagement = lazyWithRetry(() => import('./pages/Warehouse'));
const StaffManagement = lazyWithRetry(() => import('./pages/Staff'));
const PartnerManagement = lazyWithRetry(() => import('./pages/Partners'));
const MapView = lazyWithRetry(() => import('./pages/Maps'));
const NotificationCenter = lazyWithRetry(
  () => import('./pages/NotificationCenter')
);
const ReportsCenter = lazyWithRetry(() => import('./pages/ReportsCenter'));
const Profile = lazyWithRetry(() => import('./components/auth/Profile'));
const Settings = lazyWithRetry(() => import('./pages/Settings'));
const NotFound = lazyWithRetry(() => import('./components/common/NotFound'));

const loadTransportPage = (selector) =>
  lazyWithRetry(() =>
    import('./pages/Transport').then((module) => ({
      default: selector(module),
    }))
  );

const TransportOverview = loadTransportPage(
  (module) => module.TransportOverviewPage || module.default
);
const TransportStorageLocations = loadTransportPage(
  (module) => module.TransportStorageLocationsPage
);
const TransportVolumeCalculator = loadTransportPage(
  (module) => module.TransportVolumeCalculatorPage
);
const TransportCarriers = loadTransportPage(
  (module) => module.TransportCarriersPage
);
const TransportRequests = loadTransportPage(
  (module) => module.TransportRequestsPage
);
const TransportPendingTransfers = loadTransportPage(
  (module) => module.TransportPendingTransfersPage
);

const Login = lazyWithRetry(() => import('./components/auth/Login'));

// Loading component
const LoadingScreen = ({ message = 'Đang tải...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2, color: 'text.primary' }}>
        {message}
      </Typography>
    </Box>
  );
};

// Protected Route component
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Đang xác thực..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions
  if (requiredRoles.length > 0 && user?.role) {
    const hasRequiredRole = requiredRoles.some(
      (role) => user.role === role || user.role === 'admin'
    );

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

// Public Route component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Đang kiểm tra đăng nhập..." />;
  }

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
};

// Main App Component
const App = () => {
  const { isDarkMode } = useTheme();
  const { language, t } = useLanguage();
  const location = useLocation();

  // Update document title based on route
  useEffect(() => {
    const titles = {
      '/': 'Trang chủ',
      '/dashboard': 'Bảng điều khiển',
      '/transport': 'Quản lý vận chuyển',
      '/transport/storage-locations': 'Địa điểm lưu',
      '/transport/volume-calculator': 'Bảng tính khối',
      '/transport/carriers': 'Nhà vận chuyển',
      '/transport/requests': 'Đề nghị vận chuyển',
      '/transport/pending-transfers': 'Chờ chuyển giao',
      '/warehouse': 'Quản lý kho',
      '/staff': 'Quản lý nhân viên',
      '/partners': 'Quản lý đối tác',
      '/maps': 'Bản đồ',
      '/notifications': 'Thông báo',
      '/reports': 'Báo cáo',
      '/profile': 'Hồ sơ cá nhân',
      '/settings': 'Cài đặt',
      '/login': 'Đăng nhập',
    };

    const currentTitle = titles[location.pathname] || 'MIA Logistics Manager';
    document.title = `${currentTitle} - MIA Logistics Manager`;
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <html lang={language} />
        <meta name="theme-color" content={isDarkMode ? '#121212' : '#1976d2'} />
        <meta
          name="description"
          content="MIA Logistics Manager - Hệ thống quản lý vận chuyển chuyên nghiệp"
        />
      </Helmet>

      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <AuthLayout>
                  <Login />
                </AuthLayout>
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Navigate to="/dashboard" replace />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transport"
            element={
              <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
                <MainLayout>
                  <TransportOverview />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transport/storage-locations"
            element={
              <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
                <MainLayout>
                  <TransportStorageLocations />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transport/volume-calculator"
            element={
              <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
                <MainLayout>
                  <TransportVolumeCalculator />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transport/carriers"
            element={
              <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
                <MainLayout>
                  <TransportCarriers />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transport/requests"
            element={
              <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
                <MainLayout>
                  <TransportRequests />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transport/pending-transfers"
            element={
              <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
                <MainLayout>
                  <TransportPendingTransfers />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse/*"
            element={
              <ProtectedRoute
                requiredRoles={['admin', 'manager', 'warehouse_staff']}
              >
                <MainLayout>
                  <WarehouseManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/*"
            element={
              <ProtectedRoute requiredRoles={['admin', 'manager']}>
                <MainLayout>
                  <StaffManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/partners/*"
            element={
              <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
                <MainLayout>
                  <PartnerManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/maps"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MapView />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NotificationCenter />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/*"
            element={
              <ProtectedRoute requiredRoles={['admin', 'manager']}>
                <MainLayout>
                  <ReportsCenter />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Error Routes */}
          <Route
            path="/unauthorized"
            element={
              <AuthLayout>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  minHeight="100vh"
                >
                  <h2>Không có quyền truy cập</h2>
                  <p>Bạn không có quyền truy cập vào trang này.</p>
                </Box>
              </AuthLayout>
            }
          />

          <Route
            path="*"
            element={
              <MainLayout>
                <NotFound />
              </MainLayout>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
