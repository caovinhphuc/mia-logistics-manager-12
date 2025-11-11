// Mock Data Service for Development
import {
  DEFAULT_CARRIER,
  PRICING_METHODS,
  VEHICLE_TYPES,
} from "../features/carriers/types";

class MockDataService {
  constructor() {
    this.carriers = this.generateMockCarriers();
  }

  // Generate mock carriers data
  generateMockCarriers() {
    return [
      {
        ...DEFAULT_CARRIER,
        carrierId: "CAR_001",
        name: "Công ty Vận tải ABC",
        contactPerson: "Nguyễn Văn A",
        email: "contact@abc-transport.com",
        phone: "0901234567",
        address: "123 Đường ABC, Quận 1, TP.HCM",
        serviceAreas: "TP.HCM, Bình Dương, Đồng Nai",
        pricingMethod: PRICING_METHODS.PER_KM,
        baseRate: 50000,
        perKmRate: 15000,
        stopFee: 20000,
        fuelSurcharge: 5,
        remoteAreaFee: 30000,
        insuranceRate: 2,
        vehicleTypes: VEHICLE_TYPES[0],
        maxWeight: 5000,
        maxVolume: 20,
        operatingHours: "8:00 - 17:00",
        rating: 4.5,
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      {
        ...DEFAULT_CARRIER,
        carrierId: "CAR_002",
        name: "Xe tải XYZ",
        contactPerson: "Trần Thị B",
        email: "info@xyz-truck.com",
        phone: "0907654321",
        address: "456 Đường XYZ, Quận 2, TP.HCM",
        serviceAreas: "TP.HCM, Long An, Tiền Giang",
        pricingMethod: PRICING_METHODS.PER_M3,
        baseRate: 100000,
        perM3Rate: 50000,
        stopFee: 30000,
        fuelSurcharge: 8,
        remoteAreaFee: 50000,
        insuranceRate: 3,
        vehicleTypes: VEHICLE_TYPES[1],
        maxWeight: 10000,
        maxVolume: 40,
        operatingHours: "7:00 - 18:00",
        rating: 4.2,
        isActive: true,
        createdAt: "2024-01-02T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      },
      {
        ...DEFAULT_CARRIER,
        carrierId: "CAR_003",
        name: "Logistics DEF",
        contactPerson: "Lê Văn C",
        email: "support@def-logistics.com",
        phone: "0909876543",
        address: "789 Đường DEF, Quận 3, TP.HCM",
        serviceAreas: "Toàn quốc",
        pricingMethod: PRICING_METHODS.PER_TRIP,
        baseRate: 200000,
        perTripRate: 500000,
        stopFee: 50000,
        fuelSurcharge: 10,
        remoteAreaFee: 100000,
        insuranceRate: 5,
        vehicleTypes: VEHICLE_TYPES[2],
        maxWeight: 20000,
        maxVolume: 80,
        operatingHours: "24/7",
        rating: 3.8,
        isActive: false,
        createdAt: "2024-01-03T00:00:00.000Z",
        updatedAt: "2024-01-03T00:00:00.000Z",
      },
    ];
  }

  // Get all carriers
  async getCarriers() {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...this.carriers];
  }

  // Get active carriers
  async getActiveCarriers() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.carriers.filter((carrier) => carrier.isActive);
  }

  // Get carrier by ID
  async getCarrierById(carrierId) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.carriers.find((carrier) => carrier.carrierId === carrierId);
  }

  // Create new carrier
  async createCarrier(carrierData) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newCarrier = {
      ...DEFAULT_CARRIER,
      ...carrierData,
      carrierId: `CAR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.carriers.push(newCarrier);
    return newCarrier;
  }

  // Update carrier
  async updateCarrier(carrierId, carrierData) {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const index = this.carriers.findIndex((c) => c.carrierId === carrierId);
    if (index === -1) {
      throw new Error("Không tìm thấy nhà vận chuyển");
    }

    const updatedCarrier = {
      ...this.carriers[index],
      ...carrierData,
      carrierId, // Keep original ID
      updatedAt: new Date().toISOString(),
    };

    this.carriers[index] = updatedCarrier;
    return updatedCarrier;
  }

  // Delete carrier
  async deleteCarrier(carrierId) {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const index = this.carriers.findIndex((c) => c.carrierId === carrierId);
    if (index === -1) {
      throw new Error("Không tìm thấy nhà vận chuyển");
    }

    this.carriers.splice(index, 1);
    return true;
  }

  // Toggle carrier status
  async toggleCarrierStatus(carrierId) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const carrier = this.carriers.find((c) => c.carrierId === carrierId);
    if (!carrier) {
      throw new Error("Không tìm thấy nhà vận chuyển");
    }

    return await this.updateCarrier(carrierId, {
      isActive: !carrier.isActive,
    });
  }

  // Search carriers
  async searchCarriers(query) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!query) return this.carriers;

    const searchTerm = query.toLowerCase();
    return this.carriers.filter(
      (carrier) =>
        carrier.name.toLowerCase().includes(searchTerm) ||
        carrier.contactPerson.toLowerCase().includes(searchTerm) ||
        carrier.serviceAreas.toLowerCase().includes(searchTerm) ||
        carrier.email.toLowerCase().includes(searchTerm),
    );
  }

  // Get carriers statistics
  async getCarriersStats() {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      total: this.carriers.length,
      active: this.carriers.filter((c) => c.isActive).length,
      inactive: this.carriers.filter((c) => !c.isActive).length,
      byPricingMethod: {
        PER_KM: this.carriers.filter(
          (c) => c.pricingMethod === PRICING_METHODS.PER_KM,
        ).length,
        PER_M3: this.carriers.filter(
          (c) => c.pricingMethod === PRICING_METHODS.PER_M3,
        ).length,
        PER_TRIP: this.carriers.filter(
          (c) => c.pricingMethod === PRICING_METHODS.PER_TRIP,
        ).length,
      },
    };
  }

  // Reset to initial data
  reset() {
    this.carriers = this.generateMockCarriers();
  }
}

// Export singleton instance
export const mockDataService = new MockDataService();
export default mockDataService;
