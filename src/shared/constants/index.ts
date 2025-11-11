export const API_ENDPOINTS = {
  GOOGLE_SHEETS: process.env.REACT_APP_GOOGLE_SHEETS_API_KEY,
  GOOGLE_MAPS: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
} as const;

export const ROUTES = {
  DASHBOARD: '/',
  SHIPMENTS: '/shipments',
  ORDERS: '/orders',
  INVENTORY: '/inventory',
  CARRIERS: '/carriers',
  TRACKING: '/tracking',
} as const;

export const PRODUCT_CATEGORIES = {
  VALI: 'vali',
  BALO: 'balo',
  TUI_XACH: 'tui-xach',
} as const;

export const PRODUCT_SIZES = {
  S: 'S',
  M: 'M',
  L: 'L',
  XL: 'XL',
} as const;

export const SHIPMENT_STATUS = {
  PENDING: 'Chuẩn bị',
  IN_TRANSIT: 'Đang giao',
  DELIVERED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
} as const;
