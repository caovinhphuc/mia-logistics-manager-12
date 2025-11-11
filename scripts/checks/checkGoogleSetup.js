// Check Google APIs Setup
// Kiểm tra cấu hình Google APIs theo GOOGLE_SETUP_GUIDE.md

const fs = require('fs');
const path = require('path');

console.log('🔍 Kiểm tra Google APIs Setup');
console.log('=============================');
console.log('');

// Kiểm tra file .env
function checkEnvFile() {
  console.log('📝 Kiểm tra file .env...');

  const envPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    console.log('❌ File .env không tồn tại');
    console.log('   Chạy: ./setup-google-apis.sh để tạo file .env');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');

  // Kiểm tra các biến môi trường cần thiết
  const requiredVars = [
    'REACT_APP_GOOGLE_CLIENT_ID',
    'REACT_APP_GOOGLE_SPREADSHEET_ID',
    'REACT_APP_GOOGLE_APPS_SCRIPT_ID',
    'REACT_APP_APPS_SCRIPT_WEB_APP_URL',
    'REACT_APP_USE_MOCK_DATA',
    'REACT_APP_ENABLE_GOOGLE_SHEETS',
    'REACT_APP_ENABLE_GOOGLE_APPS_SCRIPT',
    'REACT_APP_ENABLE_GOOGLE_DRIVE'
  ];

  let allConfigured = true;

  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      const match = envContent.match(new RegExp(`${varName}=(.*)`));
      if (match && match[1] && !match[1].includes('your_actual_') && !match[1].includes('your-google-')) {
        console.log(`✅ ${varName}: Đã cấu hình`);
      } else {
        console.log(`⚠️  ${varName}: Cần cập nhật giá trị thực`);
        allConfigured = false;
      }
    } else {
      console.log(`❌ ${varName}: Thiếu trong file .env`);
      allConfigured = false;
    }
  });

  return allConfigured;
}

// Kiểm tra Google config
function checkGoogleConfig() {
  console.log('\n🔧 Kiểm tra Google config...');

  const configPath = path.join(__dirname, '..', 'src', 'config', 'google.js');

  if (!fs.existsSync(configPath)) {
    console.log('❌ File google.js không tồn tại');
    return false;
  }

  const configContent = fs.readFileSync(configPath, 'utf8');

  // Kiểm tra các cấu hình cần thiết
  const requiredConfigs = [
    'GOOGLE_CONFIG',
    'APPS_SCRIPT_CONFIG',
    'ENV_CONFIG',
    'DEFAULT_SPREADSHEET_STRUCTURE'
  ];

  requiredConfigs.forEach(config => {
    if (configContent.includes(config)) {
      console.log(`✅ ${config}: Đã cấu hình`);
    } else {
      console.log(`❌ ${config}: Thiếu cấu hình`);
    }
  });

  return true;
}

// Kiểm tra Google services
function checkGoogleServices() {
  console.log('\n🚀 Kiểm tra Google services...');

  const servicesPath = path.join(__dirname, '..', 'src', 'services', 'google');

  if (!fs.existsSync(servicesPath)) {
    console.log('❌ Thư mục google services không tồn tại');
    return false;
  }

  const requiredServices = [
    'googleAuthService.js',
    'googleSheetsService.js',
    'googleAppsScriptService.js',
    'googleDriveService.js'
  ];

  requiredServices.forEach(service => {
    const servicePath = path.join(servicesPath, service);
    if (fs.existsSync(servicePath)) {
      console.log(`✅ ${service}: Đã tồn tại`);
    } else {
      console.log(`❌ ${service}: Thiếu`);
    }
  });

  return true;
}

// Kiểm tra package.json dependencies
function checkDependencies() {
  console.log('\n📦 Kiểm tra dependencies...');

  const packagePath = path.join(__dirname, '..', 'package.json');

  if (!fs.existsSync(packagePath)) {
    console.log('❌ File package.json không tồn tại');
    return false;
  }

  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const dependencies = { ...packageContent.dependencies, ...packageContent.devDependencies };

  const requiredDeps = [
    'google-spreadsheet',
    'react',
    'react-dom',
    'react-scripts'
  ];

  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`✅ ${dep}: ${dependencies[dep]}`);
    } else {
      console.log(`⚠️  ${dep}: Chưa cài đặt`);
    }
  });

  return true;
}

// Hiển thị hướng dẫn setup
function showSetupInstructions() {
  console.log('\n📋 Hướng dẫn setup Google APIs:');
  console.log('===============================');
  console.log('');
  console.log('1. 🌐 Tạo Google Cloud Project:');
  console.log('   - Truy cập: https://console.cloud.google.com');
  console.log('   - Tạo project mới: "MIA Logistics Manager"');
  console.log('');
  console.log('2. 🔑 Enable APIs:');
  console.log('   - Google Sheets API');
  console.log('   - Google Drive API');
  console.log('   - Google Apps Script API');
  console.log('   - Google Maps JavaScript API');
  console.log('');
  console.log('3. 🔐 Tạo OAuth 2.0 Credentials:');
  console.log('   - Vào "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"');
  console.log('   - Application type: "Web application"');
  console.log('   - Name: "MIA Logistics Manager"');
  console.log('');
  console.log('4. 🌍 Cấu hình Authorized origins:');
  console.log('   - http://localhost:3000');
  console.log('   - http://localhost:3001');
  console.log('   - https://your-domain.com');
  console.log('');
  console.log('5. 🔄 Cấu hình Authorized redirect URIs:');
  console.log('   - http://localhost:3000');
  console.log('   - http://localhost:3001');
  console.log('   - https://your-domain.com');
  console.log('');
  console.log('6. 📊 Tạo Google Sheets:');
  console.log('   - Đi tới: https://sheets.google.com');
  console.log('   - Tạo spreadsheet mới: "MIA Logistics Data"');
  console.log('   - Copy Spreadsheet ID từ URL');
  console.log('');
  console.log('7. 📝 Cập nhật file .env:');
  console.log('   - Thay thế "your_actual_client_id_here" bằng Client ID thực');
  console.log('   - Thay thế "your_actual_script_id_here" bằng Apps Script ID');
  console.log('   - Thay thế "your_web_app_url_here" bằng Web App URL');
  console.log('');
  console.log('8. 🚀 Test Integration:');
  console.log('   - Chạy: npm start');
  console.log('   - Truy cập /login để test Google login');
  console.log('   - Kiểm tra dữ liệu từ Google Sheets');
  console.log('');
  console.log('⚠️  Lưu ý quan trọng:');
  console.log('   - Không commit file .env vào Git');
  console.log('   - Đảm bảo Google Sheets đã được share với service account');
  console.log('   - Kiểm tra API quotas và billing');
  console.log('');
  console.log('📚 Chi tiết đầy đủ xem: GOOGLE_SETUP_GUIDE.md');
}

// Main function
function main() {
  const envOk = checkEnvFile();
  const configOk = checkGoogleConfig();
  const servicesOk = checkGoogleServices();
  const depsOk = checkDependencies();

  console.log('\n📊 Tổng kết:');
  console.log('============');
  console.log(`Environment: ${envOk ? '✅' : '❌'}`);
  console.log(`Config: ${configOk ? '✅' : '❌'}`);
  console.log(`Services: ${servicesOk ? '✅' : '❌'}`);
  console.log(`Dependencies: ${depsOk ? '✅' : '❌'}`);

  if (!envOk || !configOk || !servicesOk || !depsOk) {
    console.log('\n⚠️  Cần hoàn thiện setup trước khi sử dụng');
    showSetupInstructions();
  } else {
    console.log('\n🎉 Setup Google APIs hoàn tất!');
    console.log('   Có thể chạy: npm start để test integration');
  }
}

// Chạy kiểm tra
main();
