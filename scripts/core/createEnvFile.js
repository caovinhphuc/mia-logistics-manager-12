// Script tạo file .env
const fs = require('fs');
const path = require('path');

console.log('🔧 TẠO FILE .ENV CHO DỰ ÁN');
console.log('=' .repeat(50));

const envContent = `# Google Sheets Configuration
REACT_APP_GOOGLE_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As

# Google API Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id

# Google Apps Script Configuration
REACT_APP_GOOGLE_APPS_SCRIPT_ID=your-apps-script-id

# Feature Flags
REACT_APP_ENABLE_GOOGLE_SHEETS=true
REACT_APP_ENABLE_GOOGLE_DRIVE=true
REACT_APP_ENABLE_GOOGLE_APPS_SCRIPT=true
REACT_APP_USE_MOCK_DATA=false

# Environment
NODE_ENV=development

# Google Sheets API Key (if using API key instead of OAuth)
REACT_APP_GOOGLE_API_KEY=your-google-api-key

# Google OAuth Configuration
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Google Sheets Service Account (for server-side operations)
REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL=react-integration-service@react-integration-469009.iam.gserviceaccount.com

# Debug Configuration
REACT_APP_DEBUG_GOOGLE_SHEETS=true
REACT_APP_DEBUG_GOOGLE_DRIVE=true
REACT_APP_DEBUG_GOOGLE_APPS_SCRIPT=true`;

const envPath = path.join(__dirname, '..', '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ File .env đã được tạo thành công!');
  console.log(`📁 Đường dẫn: ${envPath}`);
  console.log('');

  console.log('📋 NỘI DUNG FILE .ENV:');
  console.log(envContent);
  console.log('');

  console.log('🚀 BƯỚC TIẾP THEO:');
  console.log('   1. Restart Frontend: npm start');
  console.log('   2. Kiểm tra console browser để debug');
  console.log('   3. Truy cập trang Maps để test');
  console.log('');

  console.log('⚠️  LƯU Ý:');
  console.log('   1. File .env đã được tạo với cấu hình cơ bản');
  console.log('   2. Cần cấu hình Google OAuth nếu cần');
  console.log('   3. Kiểm tra Google Sheets permissions');
  console.log('   4. Xem console browser để debug lỗi');

} catch (error) {
  console.log('❌ Lỗi tạo file .env:', error.message);
  console.log('');
  console.log('💡 HƯỚNG DẪN THỦ CÔNG:');
  console.log('   1. Tạo file .env trong thư mục gốc');
  console.log('   2. Copy nội dung trên vào file .env');
  console.log('   3. Restart Frontend');
}

console.log('=' .repeat(50));
console.log('✅ Hoàn thành tạo file .env!');
