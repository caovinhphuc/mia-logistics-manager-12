// API Locations Service - Sử dụng API proxy để lấy dữ liệu từ Google Sheets
export class Location {
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

export class ApiLocationsService {
  constructor() {
    this.sheetName = 'Locations';
    this.spreadsheetId = '18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As';
    this.apiBaseUrl = '/api/locations'; // API proxy endpoint
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Khởi tạo ApiLocationsService...');

      // Test API connection
      const response = await fetch(`${this.apiBaseUrl}/test`);
      if (!response.ok) {
        throw new Error(`API không khả dụng: ${response.status}`);
      }

      this.isInitialized = true;
      console.log('✅ ApiLocationsService đã khởi tạo');
    } catch (error) {
      console.error('❌ Lỗi khởi tạo ApiLocationsService:', error);
      // Fallback to direct Google Sheets API
      await this.initializeDirectGoogleSheets();
    }
  }

  async initializeDirectGoogleSheets() {
    try {
      console.log('🔄 Thử kết nối trực tiếp với Google Sheets...');

      // Sử dụng Google Sheets API trực tiếp với API key
      const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error('Không có Google API key');
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}?key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status}`);
      }

      this.isInitialized = true;
      console.log('✅ Kết nối trực tiếp với Google Sheets thành công');
    } catch (error) {
      console.error('❌ Lỗi kết nối trực tiếp với Google Sheets:', error);
      throw error;
    }
  }

  async getLocations() {
    try {
      await this.initialize();

      // Thử API proxy trước
      try {
        const response = await fetch(`${this.apiBaseUrl}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`📊 Lấy dữ liệu từ API proxy: ${data.length} địa điểm`);
          return data.map(location => new Location(location));
        }
      } catch (apiError) {
        console.log('⚠️ API proxy không khả dụng, thử Google Sheets API trực tiếp...');
      }

      // Fallback to direct Google Sheets API
      return await this.getLocationsFromGoogleSheets();

    } catch (error) {
      console.error('❌ Lỗi lấy danh sách địa điểm:', error);
      throw error;
    }
  }

  async getLocationsFromGoogleSheets() {
    try {
      const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error('Không có Google API key');
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.sheetName}?key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status}`);
      }

      const data = await response.json();
      const values = data.values || [];

      if (values.length <= 1) {
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

      console.log(`📊 Lấy dữ liệu từ Google Sheets: ${locations.length} địa điểm`);
      return locations;

    } catch (error) {
      console.error('❌ Lỗi lấy dữ liệu từ Google Sheets:', error);
      throw error;
    }
  }

  async getLocationsByType(type) {
    try {
      const locations = await this.getLocations();
      const filtered = locations.filter(location => location.type === type);
      console.log(`📊 Lấy địa điểm theo loại ${type}: ${filtered.length} địa điểm`);
      return filtered;
    } catch (error) {
      console.error('❌ Lỗi lấy địa điểm theo loại:', error);
      throw error;
    }
  }

  async getLocationById(locationId) {
    try {
      const locations = await this.getLocations();
      const location = locations.find(loc => loc.locationId === locationId);
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
      // Thử API proxy trước
      try {
        const response = await fetch(`${this.apiBaseUrl}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(locationData)
        });

        if (response.ok) {
          const newLocation = await response.json();
          console.log(`✅ Đã thêm địa điểm mới qua API proxy: ${newLocation.name}`);
          return new Location(newLocation);
        }
      } catch (apiError) {
        console.log('⚠️ API proxy không khả dụng, thử Google Sheets API trực tiếp...');
      }

      // Fallback to direct Google Sheets API
      return await this.addLocationToGoogleSheets(locationData);

    } catch (error) {
      console.error('❌ Lỗi thêm địa điểm:', error);
      throw error;
    }
  }

  async addLocationToGoogleSheets(locationData) {
    try {
      const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error('Không có Google API key');
      }

      // Tạo dữ liệu mới
      const newLocation = new Location({
        ...locationData,
        locationId: `location_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Thêm vào Google Sheets
      const values = [
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
      ];

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.sheetName}:append?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [values]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status}`);
      }

      console.log(`✅ Đã thêm địa điểm mới vào Google Sheets: ${newLocation.name}`);
      return newLocation;

    } catch (error) {
      console.error('❌ Lỗi thêm địa điểm vào Google Sheets:', error);
      throw error;
    }
  }

  async updateLocation(locationId, updates) {
    try {
      // Thử API proxy trước
      try {
        const response = await fetch(`${this.apiBaseUrl}/${locationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates)
        });

        if (response.ok) {
          const updatedLocation = await response.json();
          console.log(`✅ Đã cập nhật địa điểm qua API proxy: ${locationId}`);
          return new Location(updatedLocation);
        }
      } catch (apiError) {
        console.log('⚠️ API proxy không khả dụng, thử Google Sheets API trực tiếp...');
      }

      // Fallback to direct Google Sheets API
      return await this.updateLocationInGoogleSheets(locationId, updates);

    } catch (error) {
      console.error('❌ Lỗi cập nhật địa điểm:', error);
      throw error;
    }
  }

  async updateLocationInGoogleSheets(locationId, updates) {
    try {
      const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error('Không có Google API key');
      }

      // Tìm vị trí của địa điểm trong sheet
      const locations = await this.getLocations();
      const locationIndex = locations.findIndex(loc => loc.locationId === locationId);

      if (locationIndex === -1) {
        throw new Error(`Không tìm thấy địa điểm với ID: ${locationId}`);
      }

      // Cập nhật dữ liệu
      const updatedLocation = {
        ...locations[locationIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Cập nhật trong Google Sheets
      const values = [
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
      ];

      const rowIndex = locationIndex + 2; // +2 vì bắt đầu từ hàng 2
      const range = `${this.sheetName}!A${rowIndex}:M${rowIndex}`;

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}?key=${apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [values]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status}`);
      }

      console.log(`✅ Đã cập nhật địa điểm trong Google Sheets: ${locationId}`);
      return new Location(updatedLocation);

    } catch (error) {
      console.error('❌ Lỗi cập nhật địa điểm trong Google Sheets:', error);
      throw error;
    }
  }

  async deleteLocation(locationId) {
    try {
      // Thử API proxy trước
      try {
        const response = await fetch(`${this.apiBaseUrl}/${locationId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          console.log(`✅ Đã xóa địa điểm qua API proxy: ${locationId}`);
          return true;
        }
      } catch (apiError) {
        console.log('⚠️ API proxy không khả dụng, thử Google Sheets API trực tiếp...');
      }

      // Fallback to direct Google Sheets API
      return await this.deleteLocationFromGoogleSheets(locationId);

    } catch (error) {
      console.error('❌ Lỗi xóa địa điểm:', error);
      throw error;
    }
  }

  async deleteLocationFromGoogleSheets(locationId) {
    try {
      const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error('Không có Google API key');
      }

      // Tìm vị trí của địa điểm trong sheet
      const locations = await this.getLocations();
      const locationIndex = locations.findIndex(loc => loc.locationId === locationId);

      if (locationIndex === -1) {
        throw new Error(`Không tìm thấy địa điểm với ID: ${locationId}`);
      }

      // Xóa trong Google Sheets (xóa hàng)
      const rowIndex = locationIndex + 2; // +2 vì bắt đầu từ hàng 2

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.sheetName}!A${rowIndex}:M${rowIndex}?key=${apiKey}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status}`);
      }

      console.log(`✅ Đã xóa địa điểm trong Google Sheets: ${locationId}`);
      return true;

    } catch (error) {
      console.error('❌ Lỗi xóa địa điểm trong Google Sheets:', error);
      throw error;
    }
  }

  async getLocationStats() {
    try {
      const locations = await this.getLocations();
      const stats = {
        total: locations.length,
        byType: {},
        byStatus: {},
        withCoordinates: 0
      };

      locations.forEach(location => {
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
}

export const apiLocationsService = new ApiLocationsService();
