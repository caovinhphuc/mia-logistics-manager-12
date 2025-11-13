/**
 * Script tạo 2 tài khoản test mới vào Google Sheets
 * Chạy: node create-test-users.js
 */

const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';
const SPREADSHEET_ID =
  process.env.GOOGLE_SPREADSHEET_ID ||
  '18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As';

// Test users data
const testUsers = [
  {
    email: 'test1@mia.vn',
    password: 'test123',
    fullName: 'Test User 1',
    roleId: '3', // user role
  },
  {
    email: 'test2@mia.vn',
    password: 'test456',
    fullName: 'Test User 2',
    roleId: '2', // manager role (cần check roleId trong backend)
  },
];

async function createUser(userData) {
  try {
    console.log(`\n📝 Tạo user: ${userData.email}`);

    // Prepare user data for backend register endpoint
    // Backend expects: email, password, fullName, roleId (optional)
    // Backend sẽ tự động hash password và tạo ID
    const registerData = {
      email: userData.email,
      password: userData.password, // Backend sẽ hash password tự động
      fullName: userData.fullName,
      roleId: userData.roleId || '3', // Default roleId = 3 (user)
    };

    // Call backend API to add user
    console.log(`   Gọi backend API: POST ${BACKEND_URL}/api/auth/register`);
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/register`,
      registerData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      console.log(`   ✅ User ${userData.email} đã được tạo thành công!`);
      console.log(`   User ID: ${response.data.user?.id || userData.id}`);
      return { success: true, user: response.data.user || userRow };
    } else {
      console.error(`   ❌ Lỗi: ${response.data.error || 'Unknown error'}`);
      return { success: false, error: response.data.error };
    }
  } catch (error) {
    console.error(`   ❌ Lỗi tạo user ${userData.email}:`, error.message);
    if (error.response) {
      console.error(`   Response:`, error.response.data);
    }
    return { success: false, error: error.message };
  }
}

async function testLogin(email, password) {
  try {
    console.log(`\n🔐 Test login: ${email}`);
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/login`,
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      console.log(`   ✅ Login thành công!`);
      console.log(`   User: ${response.data.user?.email}`);
      console.log(`   Full Name: ${response.data.user?.fullName}`);
      console.log(`   Role: ${response.data.user?.roleId}`);
      return { success: true, user: response.data.user };
    } else {
      console.error(`   ❌ Login failed: ${response.data.error}`);
      return { success: false, error: response.data.error };
    }
  } catch (error) {
    console.error(`   ❌ Login error:`, error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Tạo test users vào Google Sheets');
  console.log('=====================================\n');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Spreadsheet ID: ${SPREADSHEET_ID}\n`);

  // Check backend health
  try {
    const healthResponse = await axios.get(`${BACKEND_URL}/api/health`);
    console.log('✅ Backend đang chạy');
    console.log(`   Status: ${healthResponse.data.status}\n`);
  } catch (error) {
    console.error('❌ Backend không chạy! Vui lòng start backend trước.');
    console.error(`   Error: ${error.message}\n`);
    process.exit(1);
  }

  // Create users
  const results = [];
  for (const userData of testUsers) {
    const result = await createUser(userData);
    results.push({ ...userData, result });
  }

  // Summary
  console.log('\n=====================================');
  console.log('📊 TÓM TẮT:');
  console.log('=====================================\n');

  const successCount = results.filter((r) => r.result.success).length;
  const failCount = results.filter((r) => !r.result.success).length;

  console.log(`✅ Thành công: ${successCount}/${testUsers.length}`);
  console.log(`❌ Thất bại: ${failCount}/${testUsers.length}\n`);

  // Test login với các user vừa tạo
  if (successCount > 0) {
    console.log('🔐 TEST LOGIN VỚI CÁC USER VỪA TẠO:');
    console.log('=====================================\n');

    for (const userData of testUsers) {
      if (results.find((r) => r.email === userData.email)?.result.success) {
        await testLogin(userData.email, userData.password);
      }
    }
  }

  // Test với admin user
  console.log('\n🔐 TEST LOGIN VỚI ADMIN USER:');
  console.log('=====================================\n');
  await testLogin('admin@mia.vn', 'admin123');

  console.log('\n✅ Hoàn thành!');
  console.log('\n📝 Test users đã được tạo:');
  testUsers.forEach((user) => {
    console.log(`   - ${user.email} / ${user.password} (${user.roleId})`);
  });
  console.log('\n💡 Bây giờ test login trong browser với các user này!');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
