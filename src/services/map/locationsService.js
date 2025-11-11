// Locations Service - Quản lý địa điểm logistics
import { googleSheetsService } from '../google/googleSheetsService';

// Định nghĩa Location type
export class Location {
  constructor(data = {}) {
    this.locationId = data.locationId || '';
    this.name = data.name || '';
    this.type = data.type || 'warehouse'; // warehouse, carrier, delivery_point, pickup_point
    this.address = data.address || '';
    this.latitude = data.latitude || 0;
    this.longitude = data.longitude || 0;
    this.phone = data.phone || '';
    this.contactPerson = data.contactPerson || '';
    this.capacity = data.capacity || 0;
    this.operatingHours = data.operatingHours || '';
    this.status = data.status || 'active';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}

export class LocationsService {
  constructor() {
    this.sheetName = 'Locations';
    this.spreadsheetId = '18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As';
  }

  // Khởi tạo service
  async initialize() {
    try {
      await googleSheetsService.initializeAPI();
      await googleSheetsService.connect(this.spreadsheetId);
      return true;
    } catch (error) {
      console.error('Lỗi khởi tạo LocationsService:', error);
      throw error;
    }
  }

  // Lấy tất cả địa điểm
  async getLocations() {
    try {
      await this.initialize();
      const values = await googleSheetsService.getData(this.sheetName);

      if (!values || values.length <= 1) {
        return [];
      }

      const headers = values[0];
      const locations = values.slice(1).map((row, index) => {
        const locationData = {};
        headers.forEach((header, colIndex) => {
          locationData[header] = row[colIndex] || '';
        });

        return new Location({
          locationId: locationData.id || `location_${index + 1}`,
          name: locationData.code || '',
          type: this.mapCategoryToType(locationData.category),
          address: this.buildFullAddress(locationData),
          latitude: parseFloat(locationData.latitude) || 0,
          longitude: parseFloat(locationData.longitude) || 0,
          phone: locationData.phone || '',
          contactPerson: locationData.contactPerson || '',
          capacity: parseFloat(locationData.capacity) || 0,
          operatingHours: locationData.operatingHours || '',
          status: locationData.status || 'active',
          createdAt: locationData.createdAt || new Date().toISOString(),
          updatedAt: locationData.updatedAt || new Date().toISOString()
        });
      });

      return locations;
    } catch (error) {
      console.error('Lỗi lấy danh sách địa điểm:', error);
      throw error;
    }
  }

  // Lấy địa điểm theo loại
  async getLocationsByType(type) {
    try {
      const locations = await this.getLocations();
      return locations.filter(location => location.type === type);
    } catch (error) {
      console.error('Lỗi lấy địa điểm theo loại:', error);
      throw error;
    }
  }

  // Lấy kho hàng
  async getWarehouses() {
    return await this.getLocationsByType('warehouse');
  }

  // Lấy nhà vận chuyển
  async getCarriers() {
    return await this.getLocationsByType('carrier');
  }

  // Lấy điểm giao hàng
  async getDeliveryPoints() {
    return await this.getLocationsByType('delivery_point');
  }

  // Lấy điểm lấy hàng
  async getPickupPoints() {
    return await this.getLocationsByType('pickup_point');
  }

  // Lấy địa điểm đang hoạt động
  async getActiveLocations() {
    try {
      const locations = await this.getLocations();
      return locations.filter(location => location.status === 'active');
    } catch (error) {
      console.error('Lỗi lấy địa điểm đang hoạt động:', error);
      throw error;
    }
  }

  // Lấy địa điểm theo ID
  async getLocationById(locationId) {
    try {
      const locations = await this.getLocations();
      return locations.find(location => location.locationId === locationId);
    } catch (error) {
      console.error('Lỗi lấy địa điểm theo ID:', error);
      throw error;
    }
  }

  // Thêm địa điểm mới
  async addLocation(locationData) {
    try {
      await this.initialize();

      const newLocation = new Location({
        ...locationData,
        locationId: `location_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const values = [
        [
          newLocation.locationId,
          newLocation.name,
          newLocation.type,
          newLocation.address,
          newLocation.latitude,
          newLocation.longitude,
          newLocation.phone,
          newLocation.contactPerson,
          newLocation.capacity,
          newLocation.operatingHours,
          newLocation.status,
          newLocation.createdAt,
          newLocation.updatedAt
        ]
      ];

      await googleSheetsService.appendData(this.sheetName, values);
      return newLocation;
    } catch (error) {
      console.error('Lỗi thêm địa điểm:', error);
      throw error;
    }
  }

  // Cập nhật địa điểm
  async updateLocation(locationId, updates) {
    try {
      await this.initialize();

      const locations = await this.getLocations();
      const locationIndex = locations.findIndex(l => l.locationId === locationId);

      if (locationIndex === -1) {
        throw new Error('Địa điểm không tồn tại');
      }

      const updatedLocation = {
        ...locations[locationIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Cập nhật trong Google Sheets
      const rowIndex = locationIndex + 2; // +2 vì có header và index bắt đầu từ 1
      const values = [
        [
          updatedLocation.locationId,
          updatedLocation.name,
          updatedLocation.type,
          updatedLocation.address,
          updatedLocation.latitude,
          updatedLocation.longitude,
          updatedLocation.phone,
          updatedLocation.contactPerson,
          updatedLocation.capacity,
          updatedLocation.operatingHours,
          updatedLocation.status,
          updatedLocation.createdAt,
          updatedLocation.updatedAt
        ]
      ];

      await googleSheetsService.updateValues(
        this.sheetName,
        `A${rowIndex}:M${rowIndex}`,
        values
      );

      return updatedLocation;
    } catch (error) {
      console.error('Lỗi cập nhật địa điểm:', error);
      throw error;
    }
  }

  // Xóa địa điểm
  async deleteLocation(locationId) {
    try {
      await this.initialize();

      const locations = await this.getLocations();
      const locationIndex = locations.findIndex(l => l.locationId === locationId);

      if (locationIndex === -1) {
        throw new Error('Địa điểm không tồn tại');
      }

      // Xóa trong Google Sheets
      const rowIndex = locationIndex + 2; // +2 vì có header và index bắt đầu từ 1
      await googleSheetsService.deleteData(
        this.sheetName,
        `A${rowIndex}:M${rowIndex}`
      );

      return true;
    } catch (error) {
      console.error('Lỗi xóa địa điểm:', error);
      throw error;
    }
  }

  // Tìm địa điểm gần nhất
  async findNearestLocation(latitude, longitude, type = null) {
    try {
      const locations = type
        ? await this.getLocationsByType(type)
        : await this.getActiveLocations();

      if (locations.length === 0) return null;

      let nearestLocation = null;
      let minDistance = Infinity;

      locations.forEach(location => {
        const distance = this.calculateDistance(
          latitude, longitude,
          location.latitude, location.longitude
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestLocation = { ...location, distance };
        }
      });

      return nearestLocation;
    } catch (error) {
      console.error('Lỗi tìm địa điểm gần nhất:', error);
      throw error;
    }
  }

  // Tính khoảng cách giữa 2 điểm (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  // Map category từ Google Sheet sang type cho Frontend
  mapCategoryToType(category) {
    const categoryMapping = {
      'Cửa hàng': 'warehouse',
      'Kho hàng': 'warehouse',
      'Nhà vận chuyển': 'carrier',
      'Điểm giao hàng': 'delivery_point',
      'Điểm lấy hàng': 'pickup_point',
      'Showroom': 'warehouse',
      'Văn phòng': 'warehouse',
      'Trung tâm phân phối': 'warehouse'
    };

    return categoryMapping[category] || 'warehouse';
  }

  // Xây dựng địa chỉ đầy đủ từ các trường riêng lẻ
  buildFullAddress(locationData) {
    const parts = [
      locationData.address,
      locationData.ward,
      locationData.district,
      locationData.province
    ].filter(part => part && part.trim());

    return parts.join(', ');
  }

  // Lấy thống kê địa điểm
  async getLocationStats() {
    try {
      const locations = await this.getLocations();
      const activeLocations = locations.filter(l => l.status === 'active');

      const stats = {
        total: locations.length,
        active: activeLocations.length,
        inactive: locations.length - activeLocations.length,
        byType: {
          warehouse: locations.filter(l => l.type === 'warehouse').length,
          carrier: locations.filter(l => l.type === 'carrier').length,
          delivery_point: locations.filter(l => l.type === 'delivery_point').length,
          pickup_point: locations.filter(l => l.type === 'pickup_point').length
        }
      };

      return stats;
    } catch (error) {
      console.error('Lỗi lấy thống kê địa điểm:', error);
      throw error;
    }
  }
}

export default LocationsService;
