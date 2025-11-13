import apiClient from './apiClient';
import { employees } from './endpoints';

/**
 * Employees Service
 * Service để quản lý Nhân viên
 */

export const getEmployees = async (params = {}) => {
  try {
    const response = await apiClient.get(employees.list(), { params });
    return response.data;
  } catch (error) {
    console.error('[EmployeesService] Error fetching employees:', error);
    throw error;
  }
};

export const getEmployee = async (id) => {
  try {
    const response = await apiClient.get(employees.get(id));
    return response.data;
  } catch (error) {
    console.error(`[EmployeesService] Error fetching employee ${id}:`, error);
    throw error;
  }
};

export const createEmployee = async (employeeData) => {
  try {
    const response = await apiClient.post(employees.create(), employeeData);
    return response.data;
  } catch (error) {
    console.error('[EmployeesService] Error creating employee:', error);
    throw error;
  }
};

export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await apiClient.put(employees.update(id), employeeData);
    return response.data;
  } catch (error) {
    console.error(`[EmployeesService] Error updating employee ${id}:`, error);
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await apiClient.delete(employees.delete(id));
    return response.data;
  } catch (error) {
    console.error(`[EmployeesService] Error deleting employee ${id}:`, error);
    throw error;
  }
};

export const searchEmployees = async (searchParams) => {
  try {
    const response = await apiClient.get(employees.search(), {
      params: searchParams,
    });
    return response.data;
  } catch (error) {
    console.error('[EmployeesService] Error searching employees:', error);
    throw error;
  }
};

export default {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  searchEmployees,
};
