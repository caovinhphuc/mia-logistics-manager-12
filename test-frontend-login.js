/**
 * Test script để kiểm tra frontend login flow
 * Test qua proxy và trực tiếp
 */
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const TEST_EMAIL = 'admin@mia.vn';
const TEST_PASSWORD = 'admin123';

async function testFrontendLogin() {
  console.log('=== TEST FRONTEND LOGIN ===\n');

  // 1. Test frontend có chạy không
  console.log('1. Testing frontend availability...');
  try {
    const frontendResponse = await axios.get(FRONTEND_URL, {
      timeout: 5000,
      validateStatus: () => true, // Accept any status
    });
    console.log('   ✅ Frontend is running');
    console.log('   Status:', frontendResponse.status);
    console.log('');
  } catch (error) {
    console.log('   ❌ Frontend không chạy');
    console.log('   Error:', error.message);
    console.log('   💡 Hãy start frontend: npm start');
    console.log('');
    return;
  }

  // 2. Test proxy health endpoint
  console.log('2. Testing proxy /api/health...');
  try {
    const proxyHealthResponse = await axios.get(`${FRONTEND_URL}/api/health`, {
      timeout: 5000,
    });
    console.log('   ✅ Proxy hoạt động');
    console.log('   Response:', proxyHealthResponse.data.status);
    console.log('');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ❌ Proxy không hoạt động - frontend không chạy');
    } else if (error.response?.status === 404) {
      console.log('   ❌ Proxy trả về 404 - có thể proxy chưa được setup');
      console.log('   💡 Kiểm tra setupProxy.js');
    } else {
      console.log('   ⚠️ Proxy error:', error.message);
    }
    console.log('');
  }

  // 3. Test proxy login endpoint
  console.log('3. Testing proxy /api/auth/login...');
  try {
    const proxyLoginResponse = await axios.post(
      `${FRONTEND_URL}/api/auth/login`,
      {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (proxyLoginResponse.data.success) {
      console.log('   ✅ Proxy login SUCCESS');
      console.log('   User:', proxyLoginResponse.data.user.email);
      console.log('   Full Name:', proxyLoginResponse.data.user.fullName);
      console.log('');
    } else {
      console.log('   ❌ Proxy login FAILED');
      console.log('   Error:', proxyLoginResponse.data.error);
      console.log('');
    }
  } catch (error) {
    if (error.response) {
      console.log('   ❌ Proxy login error:', error.response.status);
      console.log('   Error:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   ❌ Frontend không chạy');
    } else {
      console.log('   ❌ Proxy error:', error.message);
    }
    console.log('');
  }

  // 4. So sánh backend vs frontend
  console.log('4. So sánh Backend vs Frontend...');
  try {
    const backendResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    const frontendResponse = await axios.post(
      `${FRONTEND_URL}/api/auth/login`,
      {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }
    );

    if (backendResponse.data.user.email === frontendResponse.data.user.email) {
      console.log('   ✅ Backend và Frontend trả về cùng kết quả');
      console.log('   User:', backendResponse.data.user.email);
      console.log('');
    } else {
      console.log('   ⚠️ Backend và Frontend trả về kết quả khác nhau');
      console.log('   Backend:', backendResponse.data.user.email);
      console.log('   Frontend:', frontendResponse.data.user.email);
      console.log('');
    }
  } catch (error) {
    console.log('   ⚠️ Không thể so sánh:', error.message);
    console.log('');
  }

  console.log('=== KẾT QUẢ ===');
  console.log('Kiểm tra logs ở trên để xem proxy có hoạt động không.');
  console.log('');
  console.log('💡 Nếu proxy không hoạt động:');
  console.log('   1. Đảm bảo frontend đang chạy (npm start)');
  console.log('   2. Kiểm tra setupProxy.js có đúng không');
  console.log('   3. Kiểm tra http-proxy-middleware đã được install');
}

testFrontendLogin();
