// Script test API service trực tiếp
const https = require('https');

console.log('🧪 TEST API SERVICE TRỰC TIẾP');
console.log('=' .repeat(50));

const SPREADSHEET_ID = '18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As';
const API_KEY = 'AIzaSyA3AQTus3Qh0djFnhQnNakUGysqXz74BLA';

async function testGoogleSheetsAPI() {
  try {
    console.log('📊 THÔNG TIN TEST:');
    console.log(`   Spreadsheet ID: ${SPREADSHEET_ID}`);
    console.log(`   API Key: ${API_KEY.substring(0, 20)}...`);
    console.log('');

    // Test 1: Lấy thông tin spreadsheet
    console.log('🔍 TEST 1: Lấy thông tin spreadsheet...');
    const spreadsheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`;

    const response1 = await fetch(spreadsheetUrl);
    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`✅ Spreadsheet: ${data1.properties.title}`);
      console.log(`📊 Số sheet: ${data1.sheets.length}`);
    } else {
      console.log(`❌ Lỗi: ${response1.status} - ${response1.statusText}`);
      return;
    }
    console.log('');

    // Test 2: Lấy dữ liệu từ sheet Locations
    console.log('🔍 TEST 2: Lấy dữ liệu từ sheet Locations...');
    const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Locations?key=${API_KEY}`;

    const response2 = await fetch(valuesUrl);
    if (response2.ok) {
      const data2 = await response2.json();
      const values = data2.values || [];
      console.log(`✅ Đã lấy được dữ liệu: ${values.length} hàng`);

      if (values.length > 0) {
        const headers = values[0];
        console.log(`📋 Headers: ${headers.length} cột`);
        console.log('📋 Headers chi tiết:');
        headers.forEach((header, index) => {
          const column = String.fromCharCode(65 + index);
          console.log(`   ${column}: ${header}`);
        });
        console.log('');

        // Kiểm tra dữ liệu mẫu
        if (values.length > 1) {
          console.log('📊 DỮ LIỆU MẪU (3 hàng đầu):');
          values.slice(1, 4).forEach((row, index) => {
            console.log(`   Hàng ${index + 2}: ${row.slice(0, 5).join(' | ')}...`);
          });
        }

        // Kiểm tra tọa độ
        const latIndex = headers.indexOf('latitude');
        const lngIndex = headers.indexOf('longitude');

        if (latIndex !== -1 && lngIndex !== -1) {
          const validCoords = values.slice(1).filter(row =>
            row[latIndex] && row[lngIndex] &&
            !isNaN(parseFloat(row[latIndex])) &&
            !isNaN(parseFloat(row[lngIndex]))
          );

          console.log(`🗺️ Có ${validCoords.length} địa điểm có tọa độ hợp lệ`);

          if (validCoords.length > 0) {
            console.log('📍 Tọa độ mẫu:');
            validCoords.slice(0, 3).forEach((row, index) => {
              const nameIndex = headers.indexOf('code');
              console.log(`   ${row[nameIndex]}: ${row[latIndex]}, ${row[lngIndex]}`);
            });
          }
        }
      }
    } else {
      console.log(`❌ Lỗi: ${response2.status} - ${response2.statusText}`);
      return;
    }
    console.log('');

    console.log('✅ GOOGLE SHEETS API HOẠT ĐỘNG BÌNH THƯỜNG!');
    console.log('');
    console.log('🚀 BƯỚC TIẾP THEO:');
    console.log('   1. Restart Frontend: npm start');
    console.log('   2. Truy cập trang Maps');
    console.log('   3. Kiểm tra console browser');
    console.log('   4. Xem network tab để debug API calls');
    console.log('');
    console.log('🎯 KẾT QUẢ MONG ĐỢI:');
    console.log('   - Bản đồ hiển thị markers với tọa độ thực');
    console.log('   - Danh sách địa điểm với thông tin đầy đủ');
    console.log('   - Có thể thêm/sửa/xóa địa điểm');
    console.log('   - Tương tác với markers trên bản đồ');

  } catch (error) {
    console.error('❌ Lỗi test API:', error.message);
    console.log('');
    console.log('💡 CÁC LỖI THƯỜNG GẶP:');
    console.log('   1. API key không hợp lệ');
    console.log('   2. Google Sheets API chưa được bật');
    console.log('   3. Spreadsheet không được share');
    console.log('   4. Quota exceeded');
    console.log('');
    console.log('📞 SUPPORT:');
    console.log('   - Google Cloud Console: https://console.cloud.google.com/');
    console.log('   - Google Sheets API: https://developers.google.com/sheets/api');
    console.log('   - API Key: https://console.cloud.google.com/apis/credentials');
  }
}

// Chạy test
if (require.main === module) {
  testGoogleSheetsAPI();
}

module.exports = { testGoogleSheetsAPI };
