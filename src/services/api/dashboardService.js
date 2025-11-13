import apiClient from './apiClient';
import { dashboard } from './endpoints';

/**
 * Dashboard Service
 * Service để fetch dữ liệu cho Dashboard
 */

/**
 * Lấy thống kê tổng quan cho Dashboard
 * @returns {Promise} Dashboard stats
 */
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get(dashboard.stats());
    return response.data;
  } catch (error) {
    console.error('[DashboardService] Error fetching stats:', error);
    throw error;
  }
};

/**
 * Lấy danh sách hoạt động gần đây
 * @param {Object} params - Query parameters (limit, offset)
 * @returns {Promise} Recent activities
 */
export const getRecentActivities = async (params = {}) => {
  try {
    const response = await apiClient.get(dashboard.activities(), { params });
    return response.data;
  } catch (error) {
    console.error('[DashboardService] Error fetching activities:', error);
    throw error;
  }
};

/**
 * Lấy tóm tắt vận chuyển
 * @returns {Promise} Transport summary
 */
export const getTransportSummary = async () => {
  try {
    const response = await apiClient.get(dashboard.transportSummary());
    return response.data;
  } catch (error) {
    console.error(
      '[DashboardService] Error fetching transport summary:',
      error
    );
    throw error;
  }
};

/**
 * Lấy tóm tắt kho
 * @returns {Promise} Warehouse summary
 */
export const getWarehouseSummary = async () => {
  try {
    const response = await apiClient.get(dashboard.warehouseSummary());
    return response.data;
  } catch (error) {
    console.error(
      '[DashboardService] Error fetching warehouse summary:',
      error
    );
    throw error;
  }
};

export default {
  getDashboardStats,
  getRecentActivities,
  getTransportSummary,
  getWarehouseSummary,
};
