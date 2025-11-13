import apiClient from './apiClient';
import { carriers } from './endpoints';

/**
 * Carriers Service
 * Service để quản lý Nhà vận chuyển (Carriers)
 */

/**
 * Lấy danh sách tất cả carriers
 * @param {Object} params - Query parameters (page, limit, search, etc.)
 * @returns {Promise} List of carriers
 */
export const getCarriers = async (params = {}) => {
  try {
    const response = await apiClient.get(carriers.list(), { params });
    return response.data;
  } catch (error) {
    console.error('[CarriersService] Error fetching carriers:', error);
    throw error;
  }
};

/**
 * Lấy thông tin một carrier theo ID
 * @param {string|number} id - Carrier ID
 * @returns {Promise} Carrier data
 */
export const getCarrier = async (id) => {
  try {
    const response = await apiClient.get(carriers.get(id));
    return response.data;
  } catch (error) {
    console.error(`[CarriersService] Error fetching carrier ${id}:`, error);
    throw error;
  }
};

/**
 * Tạo carrier mới
 * @param {Object} carrierData - Carrier data
 * @returns {Promise} Created carrier
 */
export const createCarrier = async (carrierData) => {
  try {
    const response = await apiClient.post(carriers.create(), carrierData);
    return response.data;
  } catch (error) {
    console.error('[CarriersService] Error creating carrier:', error);
    throw error;
  }
};

/**
 * Cập nhật carrier
 * @param {string|number} id - Carrier ID
 * @param {Object} carrierData - Updated carrier data
 * @returns {Promise} Updated carrier
 */
export const updateCarrier = async (id, carrierData) => {
  try {
    const response = await apiClient.put(carriers.update(id), carrierData);
    return response.data;
  } catch (error) {
    console.error(`[CarriersService] Error updating carrier ${id}:`, error);
    throw error;
  }
};

/**
 * Xóa carrier
 * @param {string|number} id - Carrier ID
 * @returns {Promise} Deletion result
 */
export const deleteCarrier = async (id) => {
  try {
    const response = await apiClient.delete(carriers.delete(id));
    return response.data;
  } catch (error) {
    console.error(`[CarriersService] Error deleting carrier ${id}:`, error);
    throw error;
  }
};

/**
 * Tìm kiếm carriers
 * @param {Object} searchParams - Search parameters (query, filters, etc.)
 * @returns {Promise} Search results
 */
export const searchCarriers = async (searchParams) => {
  try {
    const response = await apiClient.get(carriers.search(), {
      params: searchParams,
    });
    return response.data;
  } catch (error) {
    console.error('[CarriersService] Error searching carriers:', error);
    throw error;
  }
};

export default {
  getCarriers,
  getCarrier,
  createCarrier,
  updateCarrier,
  deleteCarrier,
  searchCarriers,
};
