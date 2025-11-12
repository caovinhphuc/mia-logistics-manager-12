import { useCallback } from 'react';

interface TransportFormData {
  pricingMethod: 'perKm' | 'perTrip' | 'perM3';
  baseRate: number;
  pricePerKm: number;
  pricePerTrip: number;
  pricePerM3: number;
  stopFee: number;
  fuelSurcharge: number;
  tollFee: number;
  insuranceFee: number;
  totalDistance: number; // Tổng chiều dài quãng đường
  totalStops: number; // Tổng điểm dừng
  totalVolume: number; // Tổng số khối thực tế
}

interface CostBreakdown {
  baseCost: number;
  distanceCost: number;
  stopCost: number;
  surchargeCost: number;
  totalCost: number;
  formula: string;
}

export const useTransportCostCalculation = () => {
  const calculateCost = useCallback(
    (formData: TransportFormData): CostBreakdown => {
      const {
        pricingMethod,
        baseRate = 0,
        pricePerKm = 0,
        pricePerTrip = 0,
        pricePerM3 = 0,
        stopFee = 0,
        fuelSurcharge = 0,
        tollFee = 0,
        insuranceFee = 0,
        totalDistance = 0,
        totalStops = 0,
        totalVolume = 0,
      } = formData;

      let baseCost = 0;
      let distanceCost = 0;
      let stopCost = 0;
      let surchargeCost = 0;
      let totalCost = 0;
      let formula = '';

      // Tính phụ phí (chung cho tất cả phương thức)
      surchargeCost = fuelSurcharge + tollFee + insuranceFee;

      // Tính chi phí điểm dừng (chung cho tất cả phương thức)
      stopCost = stopFee * totalStops;

      // Debug logs
      console.log('🔍 DEBUG - Hook calculateCost inputs:');
      console.log('  - pricingMethod:', pricingMethod);
      console.log('  - totalDistance:', totalDistance);
      console.log('  - pricePerKm:', pricePerKm);
      console.log('  - baseRate:', baseRate);
      console.log('  - totalStops:', totalStops);
      console.log('  - stopFee:', stopFee);

      switch (pricingMethod) {
        case 'perKm':
          if (totalDistance <= 4) {
            // Nếu ≤ 4km: Base rate + Chi phí điểm dừng + Phụ phí
            baseCost = baseRate;
            distanceCost = 0;
            formula = `Base rate (${baseRate.toLocaleString('vi-VN')}) + Chi phí điểm dừng (${stopCost.toLocaleString('vi-VN')}) + Phụ phí (${surchargeCost.toLocaleString('vi-VN')})`;
          } else {
            // Nếu > 4km: Base rate + (Khoảng cách - 4km) * Giá/km + Chi phí điểm dừng + Phụ phí
            baseCost = baseRate;
            distanceCost = (totalDistance - 4) * pricePerKm;

            console.log('🔍 DEBUG - perKm calculation (distance > 4km):');
            console.log('  - baseCost:', baseCost);
            console.log(
              '  - distanceCost calculation:',
              `(${totalDistance} - 4) × ${pricePerKm} = ${distanceCost}`
            );
            console.log('  - stopCost:', stopCost);
            console.log('  - surchargeCost:', surchargeCost);
            const remainingDistance = (totalDistance - 4).toLocaleString(
              'vi-VN',
              { minimumFractionDigits: 1, maximumFractionDigits: 1 }
            );
            formula = `Base rate (${baseRate.toLocaleString('vi-VN')}) + (${remainingDistance}km × ${pricePerKm.toLocaleString('vi-VN')}/km) + Chi phí điểm dừng (${stopCost.toLocaleString('vi-VN')}) + Phụ phí (${surchargeCost.toLocaleString('vi-VN')})`;
          }
          break;

        case 'perTrip':
          // Chi phí chuyến + Chi phí điểm dừng + Phụ phí
          baseCost = pricePerTrip;
          distanceCost = 0;
          formula = `Chi phí chuyến (${pricePerTrip.toLocaleString('vi-VN')}) + Chi phí điểm dừng (${stopCost.toLocaleString('vi-VN')}) + Phụ phí (${surchargeCost.toLocaleString('vi-VN')})`;
          break;

        case 'perM3': {
          // (Tổng khối × Giá/khối) + Chi phí điểm dừng + Phụ phí
          baseCost = 0;
          distanceCost = totalVolume * pricePerM3;
          const volumeFormatted = totalVolume.toLocaleString('vi-VN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          formula = `(${volumeFormatted}m³ × ${pricePerM3.toLocaleString('vi-VN')}/m³) + Chi phí điểm dừng (${stopCost.toLocaleString('vi-VN')}) + Phụ phí (${surchargeCost.toLocaleString('vi-VN')})`;
          break;
        }

        default:
          formula = 'Phương thức tính tiền không hợp lệ';
          break;
      }

      totalCost = baseCost + distanceCost + stopCost + surchargeCost;

      console.log('🔍 DEBUG - Final cost breakdown:');
      console.log('  - baseCost:', baseCost);
      console.log('  - distanceCost:', distanceCost);
      console.log('  - stopCost:', stopCost);
      console.log('  - surchargeCost:', surchargeCost);
      console.log('  - totalCost:', totalCost);

      return {
        baseCost,
        distanceCost,
        stopCost,
        surchargeCost,
        totalCost,
        formula,
      };
    },
    []
  );

  const getFormulaDescription = useCallback((pricingMethod: string): string => {
    switch (pricingMethod) {
      case 'perKm':
        return 'Tính theo km: Base rate + (Khoảng cách - 4km) × Giá/km + Chi phí điểm dừng + Phụ phí (nếu có)';
      case 'perTrip':
        return 'Tính theo chuyến: Chi phí chuyến + Chi phí điểm dừng + Phụ phí (nếu có)';
      case 'perM3':
        return 'Tính theo khối: (Tổng khối × Giá/khối) + Chi phí điểm dừng + Phụ phí (nếu có)';
      default:
        return 'Phương thức tính tiền không hợp lệ';
    }
  }, []);

  return {
    calculateCost,
    getFormulaDescription,
  };
};
