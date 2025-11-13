/**
 * Script test xem frontend có đang lấy dữ liệu trực tiếp từ Google Sheets
 * Chạy: node test-frontend-backend.js
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5050';
const FRONTEND_URL = 'http://localhost:3000';

const testUsers = [
  { email: 'test1@mia.vn', password: 'test123' },
  { email: 'test2@mia.vn', password: 'test456' },
  { email: 'admin@mia.vn', password: 'admin123' },
];

async function testBackendLogin(email, password) {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/login`,
      { email, password },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return {
      success: response.data.success,
      user: response.data.user,
      error: response.data.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
}

async function testFrontendProxy(email, password) {
  try {
    const response = await axios.post(
      `${FRONTEND_URL}/api/auth/login`,
      { email, password },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return {
      success: response.data.success,
      user: response.data.user,
      error: response.data.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      status: error.response?.status,
    };
  }
}

async function main() {
  console.log('🔍 TEST FRONTEND VS BACKEND');
  console.log('=====================================\n');

  // Check services
  try {
    await axios.get(`${BACKEND_URL}/api/health`);
    console.log('✅ Backend đang chạy');
  } catch (error) {
    console.error('❌ Backend không chạy!');
    return;
  }

  try {
    await axios.get(`${FRONTEND_URL}`);
    console.log('✅ Frontend đang chạy\n');
  } catch (error) {
    console.error('❌ Frontend không chạy!');
    return;
  }

  // Test each user
  for (const user of testUsers) {
    console.log(`\n📝 Test user: ${user.email}`);
    console.log('-------------------------------------');

    // Test backend directly
    console.log('1. Backend trực tiếp:');
    const backendResult = await testBackendLogin(user.email, user.password);
    if (backendResult.success) {
      console.log(`   ✅ SUCCESS - User: ${backendResult.user?.fullName}`);
      console.log(`   Role: ${backendResult.user?.roleId}`);
    } else {
      console.log(`   ❌ FAILED - ${backendResult.error}`);
    }

    // Test frontend proxy
    console.log('2. Frontend proxy:');
    const frontendResult = await testFrontendProxy(user.email, user.password);
    if (frontendResult.success) {
      console.log(`   ✅ SUCCESS - User: ${frontendResult.user?.fullName}`);
      console.log(`   Role: ${frontendResult.user?.roleId}`);
    } else {
      console.log(`   ❌ FAILED - ${frontendResult.error}`);
      console.log(`   Status: ${frontendResult.status}`);
    }

    // Compare
    if (backendResult.success && frontendResult.success) {
      if (
        backendResult.user?.email === frontendResult.user?.email &&
        backendResult.user?.id === frontendResult.user?.id
      ) {
        console.log('   ✅ Backend và Frontend trả về cùng kết quả');
      } else {
        console.log('   ⚠️ Backend và Frontend trả về kết quả khác nhau');
      }
    } else if (!backendResult.success && !frontendResult.success) {
      console.log('   ⚠️ Cả Backend và Frontend đều fail');
    } else {
      console.log('   ⚠️ Backend và Frontend có kết quả khác nhau');
    }
  }

  console.log('\n=====================================');
  console.log('📊 KẾT LUẬN:');
  console.log('=====================================\n');
  console.log('💡 Nếu Backend SUCCESS nhưng Frontend FAIL:');
  console.log(
    '   → Proxy có vấn đề hoặc frontend đang lấy trực tiếp từ Google Sheets'
  );
  console.log('\n💡 Nếu cả 2 đều SUCCESS:');
  console.log('   → Frontend đang dùng backend API đúng cách ✅');
  console.log('\n💡 Nếu cả 2 đều FAIL:');
  console.log('   → Có vấn đề với Google Sheets hoặc backend');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
