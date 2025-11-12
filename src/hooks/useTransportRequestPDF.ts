import { useState, useCallback } from 'react';
import {
  TransportRequestPDFService,
  TransportRequestPDFData,
} from '@/services/pdf/transportRequestPDFService';
import type { TransportRequest } from '@/features/shipments/components/TransportRequestsSheet';

export const useTransportRequestPDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm tạo dữ liệu các điểm dừng - chỉ tạo dòng cho các điểm có dữ liệu
  // Hàm rút gọn địa chỉ - loại bỏ "Thành phố/Tỉnh"
  const shortenAddress = useCallback((address: string): string => {
    if (!address) return '';

    // Loại bỏ các từ cuối như "Thành phố Hồ Chí Minh", "Tỉnh Bình Dương", etc.
    const cityPatterns = [
      /,\s*Thành phố\s+[^,]+$/i,
      /,\s*Tỉnh\s+[^,]+$/i,
      /,\s*TP\s+[^,]+$/i,
      /,\s*Tp\s+[^,]+$/i,
    ];

    let shortenedAddress = address;
    for (const pattern of cityPatterns) {
      shortenedAddress = shortenedAddress.replace(pattern, '');
    }

    return shortenedAddress.trim();
  }, []);

  const generateStopsData = useCallback(
    (transportRequest: TransportRequest) => {
      console.log('=== generateStopsData called ===');
      console.log('transportRequest:', transportRequest);

      // Debug: Kiểm tra dữ liệu MN từ sheet
      console.log('🔍 MN Data from sheet:');
      for (let i = 1; i <= 10; i++) {
        const mnKey = `stop${i}MN` as keyof TransportRequest;
        const mnValue = transportRequest[mnKey];
        console.log(
          `  ${mnKey}: "${mnValue || 'null/undefined'}" (type: ${typeof mnValue})`
        );
      }

      // Debug: Kiểm tra dữ liệu điểm dừng từ sheet
      console.log('🔍 Stop Data from sheet:');
      for (let i = 1; i <= 10; i++) {
        const addressKey = `stop${i}Address` as keyof TransportRequest;
        const productsKey = `stop${i}Products` as keyof TransportRequest;
        const packagesKey = `stop${i}Packages` as keyof TransportRequest;
        const volumeKey = `stop${i}VolumeM3` as keyof TransportRequest;

        console.log(`  Stop ${i}:`, {
          address: transportRequest[addressKey] || 'null/undefined',
          products: transportRequest[productsKey] || 'null/undefined',
          packages: transportRequest[packagesKey] || 'null/undefined',
          volume: transportRequest[volumeKey] || 'null/undefined',
        });
      }
      const stops = [];
      const stopData = [
        {
          mn: transportRequest.stop1MN || '',
          address: transportRequest.stop1Address,
          orderCount: transportRequest.stop1OrderCount || 0,
          packages: transportRequest.stop1Packages,
          volume: transportRequest.stop1VolumeM3,
        },
        {
          mn: transportRequest.stop2MN || '',
          address: transportRequest.stop2Address,
          orderCount: transportRequest.stop2OrderCount || 0,
          packages: transportRequest.stop2Packages,
          volume: transportRequest.stop2VolumeM3,
        },
        {
          mn: transportRequest.stop3MN || '',
          address: transportRequest.stop3Address,
          orderCount: transportRequest.stop3OrderCount || 0,
          packages: transportRequest.stop3Packages,
          volume: transportRequest.stop3VolumeM3,
        },
        {
          mn: transportRequest.stop4MN || '',
          address: transportRequest.stop4Address,
          orderCount: transportRequest.stop4OrderCount || 0,
          packages: transportRequest.stop4Packages,
          volume: transportRequest.stop4VolumeM3,
        },
        {
          mn: transportRequest.stop5MN || '',
          address: transportRequest.stop5Address,
          orderCount: transportRequest.stop5OrderCount || 0,
          packages: transportRequest.stop5Packages,
          volume: transportRequest.stop5VolumeM3,
        },
        {
          mn: transportRequest.stop6MN || '',
          address: transportRequest.stop6Address,
          orderCount: transportRequest.stop6OrderCount || 0,
          packages: transportRequest.stop6Packages,
          volume: transportRequest.stop6VolumeM3,
        },
        {
          mn: transportRequest.stop7MN || '',
          address: transportRequest.stop7Address,
          orderCount: transportRequest.stop7OrderCount || 0,
          packages: transportRequest.stop7Packages,
          volume: transportRequest.stop7VolumeM3,
        },
        {
          mn: transportRequest.stop8MN || '',
          address: transportRequest.stop8Address,
          orderCount: transportRequest.stop8OrderCount || 0,
          packages: transportRequest.stop8Packages,
          volume: transportRequest.stop8VolumeM3,
        },
        {
          mn: transportRequest.stop9MN || '',
          address: transportRequest.stop9Address,
          orderCount: transportRequest.stop9OrderCount || 0,
          packages: transportRequest.stop9Packages,
          volume: transportRequest.stop9VolumeM3,
        },
        {
          mn: transportRequest.stop10MN || '',
          address: transportRequest.stop10Address,
          orderCount: transportRequest.stop10OrderCount || 0,
          packages: transportRequest.stop10Packages,
          volume: transportRequest.stop10VolumeM3,
        },
      ];

      let stt = 1;
      for (const stop of stopData) {
        // Debug: Log dữ liệu để kiểm tra
        console.log('Checking stop:', stop.mn, {
          address: stop.address,
          orderCount: stop.orderCount,
          packages: stop.packages,
          volume: stop.volume,
        });

        // Chỉ tạo dòng nếu có ít nhất 1 trong các trường: address, orderCount, packages, volume
        // MN có thể rỗng (hiển thị dấu gạch ngang)
        if (stop.address || stop.orderCount || stop.packages || stop.volume) {
          console.log('Adding stop:', stop.mn, 'with STT:', stt);
          stops.push({
            stt: stt++,
            mn: stop.mn || '-', // Hiển thị dấu gạch ngang nếu MN rỗng
            address: shortenAddress(stop.address || ''),
            pck: stop.orderCount || 0, // Sử dụng orderCount thay vì products
            packages: stop.packages || 0,
            volume: stop.volume || 0,
            confirmed: false,
          });
        }
      }

      console.log('Total stops generated:', stops.length);

      // Debug: Kiểm tra kết quả cuối cùng
      console.log('🔍 Final stops data:');
      stops.forEach((stop, index) => {
        console.log(
          `  Stop ${index + 1}: STT=${stop.stt}, MN=${stop.mn}, Address=${stop.address}`
        );
      });

      return stops;
    },
    [shortenAddress]
  );

  const generatePDF = useCallback(
    async (transportRequest: TransportRequest) => {
      console.log('=== generatePDF called ===');
      console.log('transportRequest received:', transportRequest);
      setIsGenerating(true);
      setError(null);

      try {
        const pdfService = new TransportRequestPDFService();

        // Chuyển đổi dữ liệu từ TransportRequest sang TransportRequestPDFData
        // Tạo base64 cho logo - sử dụng import trực tiếp
        let logoBase64 = '';
        try {
          // Import hình ảnh trực tiếp từ thư mục public
          const response = await fetch('/images/image1.png');
          const blob = await response.blob();
          const reader = new FileReader();
          logoBase64 = await new Promise((resolve) => {
            reader.onload = () => {
              // Chỉ lấy phần base64, không cần data:image/png;base64,
              const result = reader.result as string;
              const base64Part = result.split(',')[1]; // Lấy phần sau dấu phẩy
              resolve(base64Part);
            };
            reader.readAsDataURL(blob);
          });
        } catch {
          console.warn('Không thể load logo, sử dụng placeholder');
          logoBase64 =
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        }

        // Tạo mã requestCode với format MSC-...
        const requestCode = transportRequest.requestCode || `MSC-${Date.now()}`;

        // Tạo dữ liệu các điểm dừng trước
        const stopsData = generateStopsData(transportRequest);
        console.log('🔍 Generated stops data:', stopsData);

        const pdfData: TransportRequestPDFData = {
          requestId: transportRequest.requestId || '',
          requestCode: requestCode,
          createdAt: transportRequest.createdAt || new Date().toISOString(),
          vehicleType: transportRequest.vehicleType || '',
          pickupAddress: transportRequest.pickupAddress || '',
          totalVolumeM3: transportRequest.totalVolumeM3 || 0,
          totalPackages: transportRequest.totalPackages || 0,
          totalOrders: transportRequest.totalOrderCount || 0,
          logoBase64: logoBase64,

          // Tạo dữ liệu các điểm dừng - chỉ tạo dòng cho các điểm có dữ liệu
          stops: stopsData,

          // Thông tin nhân viên
          employeeName: transportRequest.department || 'Minh Trí', // Lấy từ department hoặc default
          carrierName: transportRequest.carrierName || 'Minh Trí', // Lấy từ carrierName hoặc default
          warehouseManager: 'Lưu Danh Thiên Tử', // Giữ nguyên như template gốc
        };

        console.log('🔍 Final PDF data:', pdfData);

        const html = await pdfService.generatePDF(pdfData);

        // Tạo một cửa sổ mới với HTML và mở print dialog
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();

          // Đợi một chút để HTML load xong rồi mở print dialog
          setTimeout(() => {
            printWindow.print();
            // Đóng cửa sổ sau khi in
            setTimeout(() => {
              printWindow.close();
            }, 1000);
          }, 500);
        } else {
          throw new Error('Không thể mở cửa sổ in');
        }

        return html;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Lỗi không xác định khi tạo PDF';
        setError(errorMessage);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [generateStopsData]
  );

  return {
    generatePDF,
    isGenerating,
    error,
    clearError: () => setError(null),
  };
};
