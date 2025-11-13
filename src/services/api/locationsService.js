import apiClient from './apiClient';
import { locations } from './endpoints';

/**
 * Locations Service
 * Service để quản lý Địa điểm (Storage Locations)
 */

export const getLocations = async (params = {}) => {
  try {
    const response = await apiClient.get(locations.list(), { params });
    return response.data;
  } catch (error) {
    console.error('[LocationsService] Error fetching locations:', error);
    throw error;
  }
};

export const getLocation = async (id) => {
  try {
    const response = await apiClient.get(locations.get(id));
    return response.data;
  } catch (error) {
    console.error(`[LocationsService] Error fetching location ${id}:`, error);
    throw error;
  }
};

export const createLocation = async (locationData) => {
  try {
    const response = await apiClient.post(locations.create(), locationData);
    return response.data;
  } catch (error) {
    console.error('[LocationsService] Error creating location:', error);
    throw error;
  }
};

export const updateLocation = async (id, locationData) => {
  try {
    const response = await apiClient.put(locations.update(id), locationData);
    return response.data;
  } catch (error) {
    console.error(`[LocationsService] Error updating location ${id}:`, error);
    throw error;
  }
};

export const deleteLocation = async (id) => {
  try {
    const response = await apiClient.delete(locations.delete(id));
    return response.data;
  } catch (error) {
    console.error(`[LocationsService] Error deleting location ${id}:`, error);
    throw error;
  }
};

export const searchLocations = async (searchParams) => {
  try {
    const response = await apiClient.get(locations.search(), {
      params: searchParams,
    });
    return response.data;
  } catch (error) {
    console.error('[LocationsService] Error searching locations:', error);
    throw error;
  }
};

export default {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  searchLocations,
};
