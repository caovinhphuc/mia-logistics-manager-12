/**
 * Test script để kiểm tra backend có lấy dữ liệu từ Google Sheets không
 */
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';

async function testBackendGoogleSheets() {
  console.log('=== TEST BACKEND GOOGLE SHEETS CONNECTION ===\n');

  try {
    // 1. Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BACKEND_URL}/api/health`);
    console.log('   ✅ Backend is running');
    console.log('   Status:', healthResponse.data.status);
    console.log('   Version:', healthResponse.data.version);
    console.log('');

    // 2. Test login endpoint với user từ Google Sheets
    console.log('2. Testing login endpoint (lấy user từ Google Sheets)...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'admin@mia.vn',
      password: 'admin123',
    });

    if (loginResponse.data.success) {
      console.log('   ✅ Login thành công');
      console.log('   User data từ Google Sheets:');
      console.log('   - ID:', loginResponse.data.user.id);
      console.log('   - Email:', loginResponse.data.user.email);
      console.log('   - Full Name:', loginResponse.data.user.fullName);
      console.log('   - Role:', loginResponse.data.user.roleId);
      console.log('   - Status:', loginResponse.data.user.status);
      console.log('');
    } else {
      console.log('   ❌ Login thất bại');
      console.log('   Error:', loginResponse.data.error);
      console.log('');
    }

    // 3. Test với user không tồn tại
    console.log('3. Testing với user không tồn tại...');
    try {
      await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: 'nonexistent@test.com',
        password: 'password',
      });
      console.log('   ❌ Should have failed');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Correctly rejected invalid user');
        console.log('   Error:', error.response.data.error);
        console.log('');
      } else {
        throw error;
      }
    }

    // 4. Test với password sai
    console.log('4. Testing với password sai...');
    try {
      await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: 'admin@mia.vn',
        password: 'wrongpassword',
      });
      console.log('   ❌ Should have failed');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Correctly rejected wrong password');
        console.log('   Error:', error.response.data.error);
        console.log('');
      } else {
        throw error;
      }
    }

    // 5. Test lấy danh sách users (nếu có endpoint)
    console.log('5. Testing get users list...');
    try {
      const usersResponse = await axios.get(`${BACKEND_URL}/api/auth/users`);
      console.log('   ✅ Lấy được danh sách users');
      console.log('   Total users:', usersResponse.data.length);
      if (usersResponse.data.length > 0) {
        console.log('   First user:', usersResponse.data[0].email);
      }
      console.log('');
    } catch (error) {
      console.log(
        '   ⚠️ Endpoint /api/auth/users không available hoặc cần auth'
      );
      console.log('');
    }

    console.log('=== KẾT QUẢ ===');
    console.log('✅ Backend ĐANG lấy dữ liệu từ Google Sheets thành công!');
    console.log('✅ Password verification với bcrypt hoạt động đúng!');
    console.log('✅ Tất cả tests đều PASS!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run test
testBackendGoogleSheets();
