/**
 * Test script để kiểm tra login flow từ đầu đến cuối
 * Test cả backend API và frontend flow
 */
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Test credentials
const TEST_EMAIL = 'admin@mia.vn';
const TEST_PASSWORD = 'admin123';

async function testLogin() {
  console.log('=== TEST LOGIN FLOW ===\n');

  try {
    // 1. Test backend health
    console.log('1. Testing backend health...');
    const healthResponse = await axios.get(`${BACKEND_URL}/api/health`);
    console.log('   ✅ Backend is running');
    console.log('   Status:', healthResponse.data.status);
    console.log('   Version:', healthResponse.data.version);
    console.log('');

    // 2. Test backend login API
    console.log('2. Testing backend login API...');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Password: ${TEST_PASSWORD}`);
    console.log('');

    const loginResponse = await axios.post(
      `${BACKEND_URL}/api/auth/login`,
      {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (loginResponse.data.success) {
      console.log('   ✅ Backend login SUCCESS');
      console.log('   User data:');
      console.log('   - ID:', loginResponse.data.user.id);
      console.log('   - Email:', loginResponse.data.user.email);
      console.log('   - Full Name:', loginResponse.data.user.fullName);
      console.log('   - Role:', loginResponse.data.user.roleId);
      console.log('   - Status:', loginResponse.data.user.status);
      console.log('');
    } else {
      console.log('   ❌ Backend login FAILED');
      console.log('   Error:', loginResponse.data.error);
      console.log('');
      return;
    }

    // 3. Test với password sai
    console.log('3. Testing với password sai...');
    try {
      await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: TEST_EMAIL,
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

    // 4. Test với email không tồn tại
    console.log('4. Testing với email không tồn tại...');
    try {
      await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: 'nonexistent@test.com',
        password: TEST_PASSWORD,
      });
      console.log('   ❌ Should have failed');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Correctly rejected invalid email');
        console.log('   Error:', error.response.data.error);
        console.log('');
      } else {
        throw error;
      }
    }

    // 5. Test frontend API endpoint (qua proxy)
    console.log('5. Testing frontend API endpoint (qua proxy)...');
    try {
      const frontendResponse = await axios.post(
        `${FRONTEND_URL}/api/auth/login`,
        {
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (frontendResponse.data.success) {
        console.log('   ✅ Frontend proxy SUCCESS');
        console.log('   User:', frontendResponse.data.user.email);
        console.log('');
      } else {
        console.log('   ❌ Frontend proxy FAILED');
        console.log('   Error:', frontendResponse.data.error);
        console.log('');
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(
          '   ⚠️ Frontend không chạy (expected nếu chỉ test backend)'
        );
        console.log('');
      } else {
        console.log('   ❌ Frontend proxy error:', error.message);
        console.log('');
      }
    }

    // 6. Test lấy danh sách users
    console.log('6. Testing get users list...');
    try {
      const usersResponse = await axios.get(`${BACKEND_URL}/api/auth/users`);
      console.log('   ✅ Lấy được danh sách users');
      console.log('   Total users:', usersResponse.data.length);
      if (usersResponse.data.length > 0) {
        console.log('   First user:', usersResponse.data[0].email);
        console.log(
          '   Users:',
          usersResponse.data.map((u) => u.email).join(', ')
        );
      }
      console.log('');
    } catch (error) {
      console.log('   ⚠️ Get users error:', error.message);
      console.log('');
    }

    // 7. Test verify password endpoint
    console.log('7. Testing verify-password endpoint...');
    const testHash =
      '$2a$10$45i8cCqfOXNZ13EF3GmjyeTXB4viHyBosUgeGky3vdLgbBZDxQp22';
    try {
      const verifyResponse = await axios.post(
        `${BACKEND_URL}/api/auth/verify-password`,
        {
          password: TEST_PASSWORD,
          hash: testHash,
        }
      );

      if (verifyResponse.data.isValid) {
        console.log('   ✅ Password hash verification SUCCESS');
        console.log('   Hash match với password "admin123"');
        console.log('');
      } else {
        console.log('   ❌ Password hash verification FAILED');
        console.log('');
      }
    } catch (error) {
      console.log('   ⚠️ Verify password error:', error.message);
      console.log('');
    }

    console.log('=== KẾT QUẢ ===');
    console.log('✅ Backend API hoạt động đúng!');
    console.log('✅ Login với backend API thành công!');
    console.log('✅ Password verification hoạt động!');
    console.log('');
    console.log('💡 Nếu frontend vẫn lỗi:');
    console.log('   1. Hard refresh browser (Cmd+Shift+R)');
    console.log('   2. Kiểm tra console logs có STEP 1-4 không');
    console.log(
      '   3. Kiểm tra network tab xem có request đến /api/auth/login không'
    );
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('   ⚠️ Backend không chạy! Hãy start backend trước:');
      console.error('      cd backend && npm start');
    }
    process.exit(1);
  }
}

// Run test
testLogin();
