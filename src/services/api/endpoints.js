/**
 * API Endpoints Configuration
 * Định nghĩa tất cả API endpoints của MIA Logistics Manager
 */

const API_BASE = '/api';

// Health & System
export const health = {
  check: () => `${API_BASE}/health`,
};

// Authentication
export const auth = {
  login: () => `${API_BASE}/auth/login`,
  logout: () => `${API_BASE}/auth/logout`,
  register: () => `${API_BASE}/auth/register`,
  refresh: () => `${API_BASE}/auth/refresh`,
  me: () => `${API_BASE}/auth/me`,
  changePassword: () => `${API_BASE}/auth/change-password`,
};

// Dashboard
export const dashboard = {
  stats: () => `${API_BASE}/dashboard/stats`,
  activities: () => `${API_BASE}/dashboard/activities`,
  transportSummary: () => `${API_BASE}/dashboard/transport-summary`,
  warehouseSummary: () => `${API_BASE}/dashboard/warehouse-summary`,
};

// Carriers (Nhà vận chuyển)
export const carriers = {
  list: () => `${API_BASE}/carriers`,
  get: (id) => `${API_BASE}/carriers/${id}`,
  create: () => `${API_BASE}/carriers`,
  update: (id) => `${API_BASE}/carriers/${id}`,
  delete: (id) => `${API_BASE}/carriers/${id}`,
  search: () => `${API_BASE}/carriers/search`,
};

// Transfers (Chuyển giao)
export const transfers = {
  list: () => `${API_BASE}/transfers`,
  get: (id) => `${API_BASE}/transfers/${id}`,
  create: () => `${API_BASE}/transfers`,
  update: (id) => `${API_BASE}/transfers/${id}`,
  delete: (id) => `${API_BASE}/transfers/${id}`,
  pending: () => `${API_BASE}/transfers/pending`,
  complete: (id) => `${API_BASE}/transfers/${id}/complete`,
};

// Locations (Địa điểm)
export const locations = {
  list: () => `${API_BASE}/locations`,
  get: (id) => `${API_BASE}/locations/${id}`,
  create: () => `${API_BASE}/locations`,
  update: (id) => `${API_BASE}/locations/${id}`,
  delete: (id) => `${API_BASE}/locations/${id}`,
  search: () => `${API_BASE}/locations/search`,
};

// Transport Requests (Đề nghị vận chuyển)
export const transportRequests = {
  list: () => `${API_BASE}/transport-requests`,
  get: (id) => `${API_BASE}/transport-requests/${id}`,
  create: () => `${API_BASE}/transport-requests`,
  update: (id) => `${API_BASE}/transport-requests/${id}`,
  delete: (id) => `${API_BASE}/transport-requests/${id}`,
  approve: (id) => `${API_BASE}/transport-requests/${id}/approve`,
  reject: (id) => `${API_BASE}/transport-requests/${id}/reject`,
};

// Employees (Nhân viên)
export const employees = {
  list: () => `${API_BASE}/employees`,
  get: (id) => `${API_BASE}/employees/${id}`,
  create: () => `${API_BASE}/employees`,
  update: (id) => `${API_BASE}/employees/${id}`,
  delete: (id) => `${API_BASE}/employees/${id}`,
  search: () => `${API_BASE}/employees/search`,
};

// Roles (Vai trò)
export const roles = {
  list: () => `${API_BASE}/roles`,
  get: (id) => `${API_BASE}/roles/${id}`,
  create: () => `${API_BASE}/roles`,
  update: (id) => `${API_BASE}/roles/${id}`,
  delete: (id) => `${API_BASE}/roles/${id}`,
};

// Role Permissions (Quyền)
export const rolePermissions = {
  list: () => `${API_BASE}/role-permissions`,
  get: (id) => `${API_BASE}/role-permissions/${id}`,
  update: (id) => `${API_BASE}/role-permissions/${id}`,
};

// Settings (Cài đặt)
export const settings = {
  get: () => `${API_BASE}/settings`,
  update: () => `${API_BASE}/settings`,
  volumeRules: () => `${API_BASE}/settings/volume-rules`,
};

// Inbound Domestic (Nhập kho nội địa)
export const inboundDomestic = {
  list: () => `${API_BASE}/inbound/domestic`,
  get: (id) => `${API_BASE}/inbound/domestic/${id}`,
  create: () => `${API_BASE}/inbound/domestic`,
  update: (id) => `${API_BASE}/inbound/domestic/${id}`,
  delete: (id) => `${API_BASE}/inbound/domestic/${id}`,
};

// Inbound International (Nhập kho quốc tế)
export const inboundInternational = {
  list: () => `${API_BASE}/inbound/international`,
  get: (id) => `${API_BASE}/inbound/international/${id}`,
  create: () => `${API_BASE}/inbound/international`,
  update: (id) => `${API_BASE}/inbound/international/${id}`,
  delete: (id) => `${API_BASE}/inbound/international/${id}`,
};

// Telegram
export const telegram = {
  test: () => `${API_BASE}/telegram/test`,
  send: () => `${API_BASE}/telegram/send`,
  env: () => `${API_BASE}/telegram/env`,
};

// Google Sheets
export const googleSheets = {
  list: () => `${API_BASE}/sheets`,
  get: (id) => `${API_BASE}/sheets/${id}`,
  sync: () => `${API_BASE}/sheets/sync`,
};

// Google Sheets Auth
export const googleSheetsAuth = {
  authorize: () => `${API_BASE}/google-sheets-auth/authorize`,
  callback: () => `${API_BASE}/google-sheets-auth/callback`,
  revoke: () => `${API_BASE}/google-sheets-auth/revoke`,
};

// Admin
export const admin = {
  stats: () => `${API_BASE}/admin/stats`,
  users: () => `${API_BASE}/admin/users`,
  logs: () => `${API_BASE}/admin/logs`,
};

// Export all endpoints
export default {
  health,
  auth,
  dashboard,
  carriers,
  transfers,
  locations,
  transportRequests,
  employees,
  roles,
  rolePermissions,
  settings,
  inboundDomestic,
  inboundInternational,
  telegram,
  googleSheets,
  googleSheetsAuth,
  admin,
};
