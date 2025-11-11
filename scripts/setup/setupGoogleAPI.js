// Script cấu hình Google API credentials
const fs = require('fs');
const path = require('path');

console.log('🔧 CẤU HÌNH GOOGLE API CREDENTIALS');
console.log('=' .repeat(50));

console.log('📋 BƯỚC 1: TẠO SERVICE ACCOUNT');
console.log('   1. Truy cập Google Cloud Console:');
console.log('      https://console.cloud.google.com/');
console.log('   2. Tạo project mới hoặc chọn project hiện có');
console.log('   3. Bật Google Sheets API');
console.log('   4. Tạo Service Account');
console.log('   5. Tải xuống JSON key file');
console.log('');

console.log('📋 BƯỚC 2: CẤU HÌNH CREDENTIALS');
console.log('   1. Đặt file JSON key vào thư mục scripts/');
console.log('   2. Đổi tên file thành "credentials.json"');
console.log('   3. Cấu trúc file:');
console.log('      {');
console.log('        "type": "service_account",');
console.log('        "project_id": "your-project-id",');
console.log('        "private_key_id": "...",');
console.log('        "private_key": "...",');
console.log('        "client_email": "...",');
console.log('        "client_id": "...",');
console.log('        "auth_uri": "https://accounts.google.com/o/oauth2/auth",');
console.log('        "token_uri": "https://oauth2.googleapis.com/token"');
console.log('      }');
console.log('');

console.log('📋 BƯỚC 3: SHARE GOOGLE SHEET');
console.log('   1. Mở Google Sheet:');
console.log('      https://docs.google.com/spreadsheets/d/18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As');
console.log('   2. Click "Share" (Chia sẻ)');
console.log('   3. Thêm email service account:');
console.log('      [SERVICE_ACCOUNT_EMAIL]@[PROJECT_ID].iam.gserviceaccount.com');
console.log('   4. Cấp quyền "Editor"');
console.log('   5. Click "Send"');
console.log('');

console.log('📋 BƯỚC 4: CÀI ĐẶT DEPENDENCIES');
console.log('   npm install googleapis');
console.log('');

console.log('📋 BƯỚC 5: CHẠY SCRIPT CẬP NHẬT');
console.log('   node scripts/updateSheetWithAPI.js');
console.log('');

console.log('⚠️  LƯU Ý QUAN TRỌNG:');
console.log('   1. KHÔNG commit file credentials.json vào git');
console.log('   2. Thêm credentials.json vào .gitignore');
console.log('   3. Đảm bảo Google Sheet được share với service account');
console.log('   4. Kiểm tra quyền truy cập Google Sheets API');
console.log('');

console.log('🔍 KIỂM TRA CẤU HÌNH:');
const credentialsPath = path.join(__dirname, 'credentials.json');
if (fs.existsSync(credentialsPath)) {
  console.log('   ✅ File credentials.json đã tồn tại');
  try {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    console.log(`   📧 Service Account Email: ${credentials.client_email}`);
    console.log(`   🆔 Project ID: ${credentials.project_id}`);
  } catch (error) {
    console.log('   ❌ File credentials.json không hợp lệ');
  }
} else {
  console.log('   ❌ File credentials.json chưa tồn tại');
  console.log('   💡 Cần tạo file credentials.json theo hướng dẫn trên');
}
console.log('');

console.log('📞 SUPPORT:');
console.log('   - Google Cloud Console: https://console.cloud.google.com/');
console.log('   - Google Sheets API: https://developers.google.com/sheets/api');
console.log('   - Service Account: https://cloud.google.com/iam/docs/service-accounts');
console.log('');

console.log('=' .repeat(50));
console.log('✅ Hướng dẫn cấu hình hoàn thành!');
console.log('🎯 Sau khi cấu hình xong, chạy: node scripts/updateSheetWithAPI.js');
