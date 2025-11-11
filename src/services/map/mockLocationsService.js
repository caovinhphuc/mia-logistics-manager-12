// Mock Locations Service - Sử dụng dữ liệu mẫu thay vì Google Sheets API

export class MockLocation {
  constructor(data = {}) {
    this.locationId = data.locationId || '';
    this.name = data.name || '';
    this.type = data.type || 'warehouse';
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

export class MockLocationsService {
  constructor() {
    this.sheetName = 'Locations';
    this.spreadsheetId = '18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As';
    this.locations = [];
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Khởi tạo MockLocationsService...');

      // Tạo dữ liệu mẫu
      this.locations = this.generateMockLocations();
      this.isInitialized = true;

      console.log(`✅ MockLocationsService đã khởi tạo với ${this.locations.length} địa điểm`);
    } catch (error) {
      console.error('❌ Lỗi khởi tạo MockLocationsService:', error);
      throw error;
    }
  }

  generateMockLocations() {
    const mockLocations = [
      {
        locationId: '3',
        name: 'MIA 1',
        type: 'warehouse',
        address: '185H Cống Quỳnh, Phường Nguyễn Cư Trinh, Quận 1, Thành phố Hồ Chí Minh',
        latitude: 10.7769,
        longitude: 106.7009,
        phone: '028-1234-5678',
        contactPerson: 'Nguyễn Văn A',
        capacity: 5000,
        operatingHours: '8:00 - 22:00',
        status: 'active',
        createdAt: '2025-08-20T10:58:21.429Z',
        updatedAt: '2025-08-20T11:46:39.289Z'
      },
      {
        locationId: '4',
        name: 'MIA 2',
        type: 'warehouse',
        address: '287A Nguyễn Văn Trỗi, Phường 10, Quận Phú Nhuận, Thành phố Hồ Chí Minh',
        latitude: 10.7769,
        longitude: 106.7009,
        phone: '028-1234-5678',
        contactPerson: 'Nguyễn Văn A',
        capacity: 5000,
        operatingHours: '8:00 - 22:00',
        status: 'inactive',
        createdAt: '2025-08-20T10:58:21.429Z',
        updatedAt: '2025-08-20T11:46:41.729Z'
      },
      {
        locationId: '5',
        name: 'MIA 3',
        type: 'warehouse',
        address: '123 Nguyễn Huệ, Quận 1, Thành phố Hồ Chí Minh',
        latitude: 10.7769,
        longitude: 106.7009,
        phone: '028-1234-5678',
        contactPerson: 'Nguyễn Văn A',
        capacity: 5000,
        operatingHours: '8:00 - 22:00',
        status: 'active',
        createdAt: '2025-08-20T10:58:21.429Z',
        updatedAt: '2025-08-20T11:46:41.729Z'
      },
      {
        locationId: '6',
        name: 'MIA 4',
        type: 'carrier',
        address: '456 Lê Lợi, Quận 1, Thành phố Hồ Chí Minh',
        latitude: 10.7769,
        longitude: 106.7009,
        phone: '028-1234-5678',
        contactPerson: 'Nguyễn Văn A',
        capacity: 3000,
        operatingHours: '8:00 - 22:00',
        status: 'active',
        createdAt: '2025-08-20T10:58:21.429Z',
        updatedAt: '2025-08-20T11:46:41.729Z'
      },
      {
        locationId: '7',
        name: 'MIA 5',
        type: 'delivery_point',
        address: '789 Điện Biên Phủ, Quận Bình Thạnh, Thành phố Hồ Chí Minh',
        latitude: 10.7769,
        longitude: 106.7009,
        phone: '028-1234-5678',
        contactPerson: 'Nguyễn Văn A',
        capacity: 2000,
        operatingHours: '8:00 - 22:00',
        status: 'active',
        createdAt: '2025-08-20T10:58:21.429Z',
        updatedAt: '2025-08-20T11:46:41.729Z'
      }
    ];

    return mockLocations.map(location => new MockLocation(location));
  }

  async getLocations() {
    try {
      await this.initialize();
      console.log(`📊 Lấy danh sách địa điểm: ${this.locations.length} địa điểm`);
      return this.locations;
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách địa điểm:', error);
      throw error;
    }
  }

  async getLocationsByType(type) {
    try {
      await this.initialize();
      const filtered = this.locations.filter(location => location.type === type);
      console.log(`📊 Lấy địa điểm theo loại ${type}: ${filtered.length} địa điểm`);
      return filtered;
    } catch (error) {
      console.error('❌ Lỗi lấy địa điểm theo loại:', error);
      throw error;
    }
  }

  async getLocationById(locationId) {
    try {
      await this.initialize();
      const location = this.locations.find(loc => loc.locationId === locationId);
      if (!location) {
        throw new Error(`Không tìm thấy địa điểm với ID: ${locationId}`);
      }
      console.log(`📊 Lấy địa điểm theo ID: ${locationId}`);
      return location;
    } catch (error) {
      console.error('❌ Lỗi lấy địa điểm theo ID:', error);
      throw error;
    }
  }

  async addLocation(locationData) {
    try {
      await this.initialize();
      const newLocation = new MockLocation({
        ...locationData,
        locationId: `location_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      this.locations.push(newLocation);
      console.log(`✅ Đã thêm địa điểm mới: ${newLocation.name}`);
      return newLocation;
    } catch (error) {
      console.error('❌ Lỗi thêm địa điểm:', error);
      throw error;
    }
  }

  async updateLocation(locationId, updates) {
    try {
      await this.initialize();
      const index = this.locations.findIndex(loc => loc.locationId === locationId);
      if (index === -1) {
        throw new Error(`Không tìm thấy địa điểm với ID: ${locationId}`);
      }

      this.locations[index] = {
        ...this.locations[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      console.log(`✅ Đã cập nhật địa điểm: ${locationId}`);
      return this.locations[index];
    } catch (error) {
      console.error('❌ Lỗi cập nhật địa điểm:', error);
      throw error;
    }
  }

  async deleteLocation(locationId) {
    try {
      await this.initialize();
      const index = this.locations.findIndex(loc => loc.locationId === locationId);
      if (index === -1) {
        throw new Error(`Không tìm thấy địa điểm với ID: ${locationId}`);
      }

      const deletedLocation = this.locations.splice(index, 1)[0];
      console.log(`✅ Đã xóa địa điểm: ${deletedLocation.name}`);
      return deletedLocation;
    } catch (error) {
      console.error('❌ Lỗi xóa địa điểm:', error);
      throw error;
    }
  }

  async getLocationStats() {
    try {
      await this.initialize();
      const stats = {
        total: this.locations.length,
        byType: {},
        byStatus: {},
        withCoordinates: 0
      };

      this.locations.forEach(location => {
        // Thống kê theo loại
        stats.byType[location.type] = (stats.byType[location.type] || 0) + 1;

        // Thống kê theo trạng thái
        stats.byStatus[location.status] = (stats.byStatus[location.status] || 0) + 1;

        // Thống kê có tọa độ
        if (location.latitude && location.longitude) {
          stats.withCoordinates++;
        }
      });

      console.log('📊 Thống kê địa điểm:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Lỗi lấy thống kê địa điểm:', error);
      throw error;
    }
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

export const mockLocationsService = new MockLocationsService();
