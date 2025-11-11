// Carriers Service - Quản lý nhà vận chuyển
import { googleSheetsService } from './googleSheetsService';

// Định nghĩa Carrier type
export class Carrier {
  constructor(data = {}) {
    this.carrierId = data.carrierId || '';
    this.name = data.name || '';
    this.contact = data.contact || '';
    this.serviceAreas = data.serviceAreas || '';
    this.status = data.status || 'active';
    this.avatarUrl = data.avatarUrl || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}

export class CarriersService {
  constructor() {
    this.sheetName = 'Carriers';
    this.spreadsheetId = '18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As'; // ID của Google Sheet
  }

  // Khởi tạo service
  async initialize() {
    try {
      await googleSheetsService.initializeAPI();
      await googleSheetsService.connect(this.spreadsheetId);
      return true;
    } catch (error) {
      console.error('Lỗi khởi tạo CarriersService:', error);
      throw error;
    }
  }

  // Lấy tất cả carriers
  async getCarriers() {
    try {
      await this.initialize();
      const values = await googleSheetsService.getData(this.sheetName);

      if (!values || values.length <= 1) {
        return [];
      }

      const headers = values[0];
      const carriers = values.slice(1).map((row, index) => {
        const carrierData = {};
        headers.forEach((header, colIndex) => {
          carrierData[header] = row[colIndex] || '';
        });

        return new Carrier({
          carrierId: carrierData.carrierId || `carrier_${index + 1}`,
          name: carrierData.name || '',
          contact: carrierData.contact || '',
          serviceAreas: carrierData.serviceAreas || '',
          status: carrierData.status || 'active',
          avatarUrl: carrierData.avatarUrl || '',
          createdAt: carrierData.createdAt || new Date().toISOString(),
          updatedAt: carrierData.updatedAt || new Date().toISOString()
        });
      });

      return carriers;
    } catch (error) {
      console.error('Lỗi lấy danh sách carriers:', error);
      throw error;
    }
  }

  // Lấy carriers đang hoạt động
  async getActiveCarriers() {
    try {
      const carriers = await this.getCarriers();
      return carriers.filter(carrier => carrier.status === 'active');
    } catch (error) {
      console.error('Lỗi lấy carriers đang hoạt động:', error);
      throw error;
    }
  }

  // Lấy carrier theo ID
  async getCarrierById(carrierId) {
    try {
      const carriers = await this.getCarriers();
      return carriers.find(carrier => carrier.carrierId === carrierId);
    } catch (error) {
      console.error('Lỗi lấy carrier theo ID:', error);
      throw error;
    }
  }

  // Thêm carrier mới
  async addCarrier(carrierData) {
    try {
      await this.initialize();

      const newCarrier = new Carrier({
        ...carrierData,
        carrierId: `carrier_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const values = [
        [
          newCarrier.carrierId,
          newCarrier.name,
          newCarrier.contact,
          newCarrier.serviceAreas,
          newCarrier.status,
          newCarrier.avatarUrl,
          newCarrier.createdAt,
          newCarrier.updatedAt
        ]
      ];

      await googleSheetsService.appendData(this.sheetName, values);
      return newCarrier;
    } catch (error) {
      console.error('Lỗi thêm carrier:', error);
      throw error;
    }
  }

  // Cập nhật carrier
  async updateCarrier(carrierId, updates) {
    try {
      await this.initialize();

      const carriers = await this.getCarriers();
      const carrierIndex = carriers.findIndex(c => c.carrierId === carrierId);

      if (carrierIndex === -1) {
        throw new Error('Carrier không tồn tại');
      }

      const updatedCarrier = {
        ...carriers[carrierIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Cập nhật trong Google Sheets
      const rowIndex = carrierIndex + 2; // +2 vì có header và index bắt đầu từ 1
      const values = [
        [
          updatedCarrier.carrierId,
          updatedCarrier.name,
          updatedCarrier.contact,
          updatedCarrier.serviceAreas,
          updatedCarrier.status,
          updatedCarrier.avatarUrl,
          updatedCarrier.createdAt,
          updatedCarrier.updatedAt
        ]
      ];

      await googleSheetsService.updateValues(
        this.sheetName,
        `A${rowIndex}:H${rowIndex}`,
        values
      );

      return updatedCarrier;
    } catch (error) {
      console.error('Lỗi cập nhật carrier:', error);
      throw error;
    }
  }

  // Xóa carrier
  async deleteCarrier(carrierId) {
    try {
      await this.initialize();

      const carriers = await this.getCarriers();
      const carrierIndex = carriers.findIndex(c => c.carrierId === carrierId);

      if (carrierIndex === -1) {
        throw new Error('Carrier không tồn tại');
      }

      // Xóa trong Google Sheets
      const rowIndex = carrierIndex + 2; // +2 vì có header và index bắt đầu từ 1
      await googleSheetsService.deleteData(
        this.sheetName,
        `A${rowIndex}:H${rowIndex}`
      );

      return true;
    } catch (error) {
      console.error('Lỗi xóa carrier:', error);
      throw error;
    }
  }

  // Tính phí vận chuyển
  calculateShippingCost(carrier, distance, volume, weight) {
    // Logic tính phí vận chuyển cơ bản
    const baseRate = 10000; // Phí cơ bản
    const distanceRate = distance * 1000; // Phí theo khoảng cách
    const volumeRate = volume * 5000; // Phí theo khối lượng
    const weightRate = weight * 2000; // Phí theo trọng lượng

    const totalCost = baseRate + distanceRate + volumeRate + weightRate;

    return {
      baseRate,
      distanceRate,
      volumeRate,
      weightRate,
      totalCost,
      carrier: carrier.name
    };
  }
}

export default CarriersService;
