/**
 * Test script để kiểm tra password hash
 */
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';

async function testPasswordHash() {
  console.log('=== TEST PASSWORD HASH ===\n');

  // Test với các password phổ biến
  const testPasswords = [
    { email: 'admin@mia.vn', password: 'admin123' },
    { email: 'admin@mia.vn', password: 'password' },
    { email: 'admin@mia.vn', password: 'admin' },
  ];

  // 1. Test login với backend để xem password nào đúng
  console.log('1. Testing login với backend...\n');
  for (const test of testPasswords) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: test.email,
        password: test.password,
      });

      if (response.data.success) {
        console.log(`   ✅ Password "${test.password}" - LOGIN THÀNH CÔNG`);
        console.log(`      User: ${response.data.user.fullName}`);
        console.log('');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`   ❌ Password "${test.password}" - Invalid credentials`);
      } else {
        console.log(
          `   ⚠️ Password "${test.password}" - Error: ${error.message}`
        );
      }
    }
  }

  // 2. Lấy user từ backend để xem password hash
  console.log('\n2. Lấy user data từ backend...\n');
  try {
    const usersResponse = await axios.get(`${BACKEND_URL}/api/auth/users`);
    const adminUser = usersResponse.data.find(
      (u) => u.email === 'admin@mia.vn'
    );

    if (adminUser) {
      console.log('   User data từ Google Sheets:');
      console.log('   - Email:', adminUser.email);
      console.log('   - Full Name:', adminUser.fullName);
      console.log('   - Role:', adminUser.roleId);
      console.log('   - Status:', adminUser.status);
      // Password hash không được trả về (đã bị xóa ở backend)
      console.log('   - Password Hash: (hidden for security)');
      console.log('');
    }
  } catch (error) {
    console.log('   ⚠️ Không thể lấy user list:', error.message);
    console.log('');
  }

  // 3. Test verify password endpoint
  console.log('3. Testing verify-password endpoint...\n');
  const testHash =
    '$2a$10$45i8cCqfOXNZ13EF3GmjyeTXB4viHyBosUgeGky3vdLgbBZDxQp22';
  const testPassword = 'admin123';

  try {
    const verifyResponse = await axios.post(
      `${BACKEND_URL}/api/auth/verify-password`,
      {
        password: testPassword,
        hash: testHash,
      }
    );

    console.log('   Verify result:', verifyResponse.data);
    if (verifyResponse.data.isValid) {
      console.log(
        `   ✅ Hash "${testHash.substring(0, 20)}..." match với password "${testPassword}"`
      );
    } else {
      console.log(`   ❌ Hash không match với password "${testPassword}"`);
    }
    console.log('');
  } catch (error) {
    console.log('   ⚠️ Verify endpoint error:', error.message);
    console.log('');
  }

  // 4. Test với các hash khác nhau
  console.log('4. Testing với các hash khác nhau...\n');
  const hashes = [
    {
      hash: '$2a$10$45i8cCqfOXNZ13EF3GmjyeTXB4viHyBosUgeGky3vdLgbBZDxQp22',
      expectedPassword: 'admin123',
    },
    {
      hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      expectedPassword: 'password',
    },
  ];

  for (const hashTest of hashes) {
    try {
      const verifyResponse = await axios.post(
        `${BACKEND_URL}/api/auth/verify-password`,
        {
          password: hashTest.expectedPassword,
          hash: hashTest.hash,
        }
      );

      if (verifyResponse.data.isValid) {
        console.log(
          `   ✅ Hash match với password "${hashTest.expectedPassword}"`
        );
      } else {
        console.log(
          `   ❌ Hash không match với password "${hashTest.expectedPassword}"`
        );
      }
    } catch (error) {
      console.log(`   ⚠️ Error testing hash: ${error.message}`);
    }
  }

  console.log('\n=== KẾT QUẢ ===');
  console.log('Kiểm tra console logs ở trên để xem password nào đúng.');
}

testPasswordHash();
