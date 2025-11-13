import apiClient from './apiClient';
import { transportRequests, transfers } from './endpoints';

/**
 * Transport Service
 * Service để quản lý Vận chuyển (Transport Requests & Transfers)
 */

// ============ Transport Requests ============

/**
 * Lấy danh sách transport requests
 * @param {Object} params - Query parameters
 * @returns {Promise} List of transport requests
 */
export const getTransportRequests = async (params = {}) => {
  try {
    const response = await apiClient.get(transportRequests.list(), { params });
    return response.data;
  } catch (error) {
    console.error(
      '[TransportService] Error fetching transport requests:',
      error
    );
    throw error;
  }
};

/**
 * Lấy thông tin một transport request
 * @param {string|number} id - Request ID
 * @returns {Promise} Transport request data
 */
export const getTransportRequest = async (id) => {
  try {
    const response = await apiClient.get(transportRequests.get(id));
    return response.data;
  } catch (error) {
    console.error(
      `[TransportService] Error fetching transport request ${id}:`,
      error
    );
    throw error;
  }
};

/**
 * Tạo transport request mới
 * @param {Object} requestData - Request data
 * @returns {Promise} Created request
 */
export const createTransportRequest = async (requestData) => {
  try {
    const response = await apiClient.post(
      transportRequests.create(),
      requestData
    );
    return response.data;
  } catch (error) {
    console.error(
      '[TransportService] Error creating transport request:',
      error
    );
    throw error;
  }
};

/**
 * Cập nhật transport request
 * @param {string|number} id - Request ID
 * @param {Object} requestData - Updated request data
 * @returns {Promise} Updated request
 */
export const updateTransportRequest = async (id, requestData) => {
  try {
    const response = await apiClient.put(
      transportRequests.update(id),
      requestData
    );
    return response.data;
  } catch (error) {
    console.error(
      `[TransportService] Error updating transport request ${id}:`,
      error
    );
    throw error;
  }
};

/**
 * Xóa transport request
 * @param {string|number} id - Request ID
 * @returns {Promise} Deletion result
 */
export const deleteTransportRequest = async (id) => {
  try {
    const response = await apiClient.delete(transportRequests.delete(id));
    return response.data;
  } catch (error) {
    console.error(
      `[TransportService] Error deleting transport request ${id}:`,
      error
    );
    throw error;
  }
};

/**
 * Phê duyệt transport request
 * @param {string|number} id - Request ID
 * @returns {Promise} Approval result
 */
export const approveTransportRequest = async (id) => {
  try {
    const response = await apiClient.post(transportRequests.approve(id));
    return response.data;
  } catch (error) {
    console.error(
      `[TransportService] Error approving transport request ${id}:`,
      error
    );
    throw error;
  }
};

/**
 * Từ chối transport request
 * @param {string|number} id - Request ID
 * @param {string} reason - Rejection reason
 * @returns {Promise} Rejection result
 */
export const rejectTransportRequest = async (id, reason) => {
  try {
    const response = await apiClient.post(transportRequests.reject(id), {
      reason,
    });
    return response.data;
  } catch (error) {
    console.error(
      `[TransportService] Error rejecting transport request ${id}:`,
      error
    );
    throw error;
  }
};

// ============ Transfers ============

/**
 * Lấy danh sách transfers
 * @param {Object} params - Query parameters
 * @returns {Promise} List of transfers
 */
export const getTransfers = async (params = {}) => {
  try {
    const response = await apiClient.get(transfers.list(), { params });
    return response.data;
  } catch (error) {
    console.error('[TransportService] Error fetching transfers:', error);
    throw error;
  }
};

/**
 * Lấy danh sách pending transfers
 * @returns {Promise} List of pending transfers
 */
export const getPendingTransfers = async () => {
  try {
    const response = await apiClient.get(transfers.pending());
    return response.data;
  } catch (error) {
    console.error(
      '[TransportService] Error fetching pending transfers:',
      error
    );
    throw error;
  }
};

/**
 * Hoàn thành transfer
 * @param {string|number} id - Transfer ID
 * @returns {Promise} Completion result
 */
export const completeTransfer = async (id) => {
  try {
    const response = await apiClient.post(transfers.complete(id));
    return response.data;
  } catch (error) {
    console.error(`[TransportService] Error completing transfer ${id}:`, error);
    throw error;
  }
};

export default {
  // Transport Requests
  getTransportRequests,
  getTransportRequest,
  createTransportRequest,
  updateTransportRequest,
  deleteTransportRequest,
  approveTransportRequest,
  rejectTransportRequest,
  // Transfers
  getTransfers,
  getPendingTransfers,
  completeTransfer,
};
