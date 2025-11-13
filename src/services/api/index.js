/**
 * API Services Index
 * Export tất cả services để dễ import
 */

// Core
export { default as apiClient } from './apiClient';
export { default as endpoints } from './endpoints';

// Services
export { default as authService } from './authService';
export { default as dashboardService } from './dashboardService';
export { default as carriersService } from './carriersService';
export { default as transportService } from './transportService';
export { default as locationsService } from './locationsService';
export { default as employeesService } from './employeesService';

// Re-export individual functions for convenience
export * from './authService';
export * from './dashboardService';
export * from './carriersService';
export * from './transportService';
export * from './locationsService';
export * from './employeesService';
