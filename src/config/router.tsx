/**
 * Router configuration for the application
 * @returns {React.ReactNode} The router configuration
 */
import { createBrowserRouter } from 'react-router-dom';
import Profile from '../components/auth/Profile';
import NotFound from '../components/common/NotFound';
import Maps from '../pages/Maps';
import NotificationCenter from '../pages/NotificationCenter';
import ReportsCenter from '../pages/ReportsCenter';
import Settings from '../pages/Settings';
export const router = createBrowserRouter([
  {
    path: '/maps',
    element: <Maps />,
  },
  {
    path: '/notifications',
    element: <NotificationCenter />,
  },
  {
    path: '/reports',
    element: <ReportsCenter />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
