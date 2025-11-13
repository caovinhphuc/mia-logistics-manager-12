import { useQuery } from '@tanstack/react-query';
import {
  getDashboardStats,
  getRecentActivities,
  getTransportSummary,
  getWarehouseSummary,
} from '../services/api/dashboardService';

/**
 * React Query hooks cho Dashboard
 */

/**
 * Hook để lấy thống kê tổng quan
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

/**
 * Hook để lấy hoạt động gần đây
 * @param {Object} options - Query options (limit, offset)
 */
export const useRecentActivities = (options = {}) => {
  const { limit = 10, offset = 0 } = options;

  return useQuery({
    queryKey: ['dashboard', 'activities', limit, offset],
    queryFn: () => getRecentActivities({ limit, offset }),
    staleTime: 2 * 60 * 1000, // 2 phút
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

/**
 * Hook để lấy tóm tắt vận chuyển
 */
export const useTransportSummary = () => {
  return useQuery({
    queryKey: ['dashboard', 'transport-summary'],
    queryFn: getTransportSummary,
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

/**
 * Hook để lấy tóm tắt kho
 */
export const useWarehouseSummary = () => {
  return useQuery({
    queryKey: ['dashboard', 'warehouse-summary'],
    queryFn: getWarehouseSummary,
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

/**
 * Hook tổng hợp - lấy tất cả dữ liệu Dashboard cùng lúc
 */
export const useDashboard = () => {
  const stats = useDashboardStats();
  const activities = useRecentActivities({ limit: 10 });
  const transportSummary = useTransportSummary();
  const warehouseSummary = useWarehouseSummary();

  return {
    stats,
    activities,
    transportSummary,
    warehouseSummary,
    isLoading:
      stats.isLoading ||
      activities.isLoading ||
      transportSummary.isLoading ||
      warehouseSummary.isLoading,
    isError:
      stats.isError ||
      activities.isError ||
      transportSummary.isError ||
      warehouseSummary.isError,
    error:
      stats.error ||
      activities.error ||
      transportSummary.error ||
      warehouseSummary.error,
  };
};

export default useDashboard;
