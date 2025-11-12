// Google Sheets Setup Script
// Chạy script này để tạo cấu trúc Google Sheet với headers đúng

export const setupGoogleSheets = async (spreadsheetId) => {
  try {
    // Headers cho sheet Carriers
    const carriersHeaders = [
      'carrierId',
      'name',
      'avatarUrl',
      'contactPerson',
      'email',
      'phone',
      'address',
      'serviceAreas',
      'pricingMethod',
      'baseRate',
      'perKmRate',
      'perM3Rate',
      'perTripRate',
      'stopFee',
      'fuelSurcharge',
      'remoteAreaFee',
      'insuranceRate',
      'vehicleTypes',
      'maxWeight',
      'maxVolume',
      'operatingHours',
      'rating',
      'isActive',
      'createdAt',
      'updatedAt',
    ];

    // Sample data để test
    const sampleData = [
      [
        'CAR_001',
        'Công ty Vận tải ABC',
        '',
        'Nguyễn Văn A',
        'contact@abc-transport.com',
        '0901234567',
        '123 Đường ABC, Quận 1, TP.HCM',
        'TP.HCM, Bình Dương, Đồng Nai',
        'PER_KM',
        50000,
        15000,
        0,
        0,
        20000,
        5,
        30000,
        2,
        'Xe tải nhỏ',
        5000,
        20,
        '8:00 - 17:00',
        4.5,
        'TRUE',
        '2024-01-01T00:00:00.000Z',
        '2024-01-01T00:00:00.000Z',
      ],
      [
        'CAR_002',
        'Xe tải XYZ',
        '',
        'Trần Thị B',
        'info@xyz-truck.com',
        '0907654321',
        '456 Đường XYZ, Quận 2, TP.HCM',
        'TP.HCM, Long An, Tiền Giang',
        'PER_M3',
        100000,
        0,
        50000,
        0,
        30000,
        8,
        50000,
        3,
        'Xe tải vừa',
        10000,
        40,
        '7:00 - 18:00',
        4.2,
        'TRUE',
        '2024-01-02T00:00:00.000Z',
        '2024-01-02T00:00:00.000Z',
      ],
      [
        'CAR_003',
        'Logistics DEF',
        '',
        'Lê Văn C',
        'support@def-logistics.com',
        '0909876543',
        '789 Đường DEF, Quận 3, TP.HCM',
        'Toàn quốc',
        'PER_TRIP',
        200000,
        0,
        0,
        500000,
        50000,
        10,
        100000,
        5,
        'Xe tải lớn',
        20000,
        80,
        '24/7',
        3.8,
        'FALSE',
        '2024-01-03T00:00:00.000Z',
        '2024-01-03T00:00:00.000Z',
      ],
    ];

    console.log('Google Sheets Setup Instructions:');
    console.log('================================');
    console.log('1. Mở Google Sheet với ID:', spreadsheetId);
    console.log('2. Tạo sheet tên "Carriers"');
    console.log('3. Thêm headers vào dòng 1:');
    console.log(carriersHeaders.join('\t'));
    console.log('');
    console.log('4. Thêm sample data vào dòng 2-4:');
    sampleData.forEach((row, index) => {
      console.log(`Dòng ${index + 2}:`, row.join('\t'));
    });
    console.log('');
    console.log('5. Lưu và chia sẻ quyền truy cập cho ứng dụng');
    console.log('');
    console.log('✅ Setup hoàn tất!');

    return {
      headers: carriersHeaders,
      sampleData,
      instructions: [
        'Mở Google Sheet với ID: ' + spreadsheetId,
        'Tạo sheet tên "Carriers"',
        'Thêm headers vào dòng 1',
        'Thêm sample data vào dòng 2-4',
        'Lưu và chia sẻ quyền truy cập',
      ],
    };
  } catch (error) {
    console.error('Setup error:', error);
    throw error;
  }
};

export default setupGoogleSheets;
