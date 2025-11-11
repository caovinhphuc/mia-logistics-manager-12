# 🔐 Cách Login Hoạt Động - MIA Logistics Manager (Thực Tế)

## 📋 Tổng quan

Dự án hiện tại sử dụng hệ thống login **100% Frontend-based** với Google Sheets làm database. **KHÔNG có backend API** cho authentication - tất cả xử lý đều ở phía client.

## 🏗️ Kiến trúc thực tế

```
┌─────────────────────────────────────────────────┐
│           Frontend (React)                      │
│                                                 │
│  ┌──────────────┐    ┌──────────────┐         │
│  │ Login Form   │───►│ AuthContext  │         │
│  └──────────────┘    └──────────────┘         │
│                          │                     │
│                          ▼                     │
│                 ┌─────────────────┐            │
│                 │ googleAuthService│            │
│                 │    .login()     │            │
│                 └─────────────────┘            │
│                          │                     │
│                          ▼                     │
│                 ┌─────────────────┐            │
│                 │  userService     │            │
│                 │ getUserByEmail() │            │
│                 └─────────────────┘            │
│                          │                     │
│                          ▼                     │
│                 ┌─────────────────┐            │
│                 │googleSheetsService│            │
│                 │    getData()     │            │
│                 └─────────────────┘            │
│                          │                     │
└──────────────────────────┼─────────────────────┘
                           │
                           ▼
                   ┌─────────────────┐
                   │  Google Sheets   │
                   │   (Database)     │
                   │   Sheet: Users   │
                   └─────────────────┘
```

## 🔄 Luồng Login Chi Tiết

### 1. User nhập thông tin đăng nhập

**File**: `src/components/auth/Login.js`

```javascript
// User nhập email và password
<form onSubmit={handleSubmit}>
  <TextField name="email" />
  <TextField name="password" type="password" />
  <Button type="submit">Đăng nhập</Button>
</form>
```

### 2. Login Component gọi AuthContext

**File**: `src/components/auth/Login.js` (dòng 181-186)

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  const result = await login({
    email: formData.email,
    password: formData.password,
  });

  // result = { success: true/false, user: {...}, error: "..." }
};
```

### 3. AuthContext xử lý login

**File**: `src/contexts/AuthContext.js` (dòng 176-222)

```javascript
const login = async (credentials) => {
  try {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

    let user;

    if (credentials.googleToken) {
      // Google OAuth login (hiện tại chưa hoạt động)
      user = await googleAuthService.loginWithGoogle(credentials.googleToken);
    } else {
      // Regular login với email/password
      user = await googleAuthService.login(
        credentials.email,
        credentials.password
      );
    }

    // Tạo session
    const session = sessionService.createSession(user);
    const permissions = getPermissionsByRole(user.role);

    // Cập nhật state
    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: { user, permissions, sessionId: session.id }
    });

    return { success: true, user };
  } catch (error) {
    dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: error.message });
    return { success: false, error: error.message };
  }
};
```

### 4. GoogleAuthService xử lý authentication

**File**: `src/services/google/googleAuthService.js` (dòng 92-143)

```javascript
async login(email, password) {
  try {
    console.log('🔐 Bắt đầu quá trình đăng nhập...');

    // Import userService dynamically
    const { userService } = await import('../user/userService');

    // 1. Tìm user trong Google Sheets
    const user = await userService.getUserByEmail(email);

    if (!user) {
      throw new Error('Không tìm thấy người dùng với email này');
    }

    // 2. Kiểm tra trạng thái tài khoản
    if (!user.isActive) {
      throw new Error('Tài khoản đã bị vô hiệu hóa');
    }

    // 3. Validate password với bcrypt
    const bcrypt = await import('bcryptjs');
    const isValidPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new Error('Mật khẩu không đúng');
    }

    // 4. Cập nhật last login (tạm thời disabled)
    const loginTime = new Date().toISOString();
    await userService.updateLastLogin(user.id); // Không cập nhật thực tế

    // 5. Tạo user object cho session
    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role || 'user',
      picture: user.avatarUrl,
      loginMethod: 'email',
      lastLogin: loginTime,
      isActive: user.isActive,
    };

    this.currentUser = sessionUser;
    return sessionUser;
  } catch (error) {
    throw error;
  }
}
```

### 5. UserService lấy user từ Google Sheets

**File**: `src/services/user/userService.js` (dòng 137-145)

```javascript
async getUserByEmail(email) {
  try {
    // Lấy tất cả users từ Google Sheets
    const users = await this.getUsers();

    // Tìm user theo email
    return users.find((user) => user.email === email);
  } catch (error) {
    console.error('❌ Lỗi lấy user theo email:', error);
    throw error;
  }
}

async getUsers() {
  try {
    // Nếu mock mode, trả về mock data
    if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      return this.getMockUsers();
    }

    // Kết nối Google Sheets
    await this.initialize();
    if (!googleSheetsService.isConnected) {
      await googleSheetsService.connect(this.spreadsheetId);
    }

    // Lấy dữ liệu từ sheet "Users"
    const data = await googleSheetsService.getData(this.sheetName);

    // Parse và map dữ liệu
    const headers = data[0];
    const users = data.slice(1).map((row) => {
      const userData = {};
      headers.forEach((header, colIndex) => {
        userData[header] = row[colIndex] || '';
      });

      return new User({
        id: userData.id,
        email: userData.email,
        passwordHash: userData.passwordHash || userData.password_hash,
        fullName: userData.fullName || userData.name,
        role: userData.roleId || userData.role || 'user',
        isActive: userData.is_active === 'true' || userData.is_active === true,
        // ... other fields
      });
    });

    return users;
  } catch (error) {
    // Fallback về mock data nếu có lỗi
    return this.getMockUsers();
  }
}
```

### 6. SessionService tạo session

**File**: `src/services/auth/sessionService.js` (dòng 10-44)

```javascript
createSession(user) {
  try {
    const sessionData = {
      id: this.generateSessionId(), // sess_1234567890_abc123
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture,
        loginMethod: user.loginMethod,
      },
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.sessionTimeout).toISOString(), // 1 hour
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      isActive: true,
    };

    // Mã hóa session data với AES
    const encryptedSession = this.encryptData(sessionData);

    // Lưu vào localStorage
    localStorage.setItem('mia-session', encryptedSession);
    sessionStorage.setItem('mia-session-id', sessionData.id);

    return sessionData;
  } catch (error) {
    throw error;
  }
}
```

## 📊 Cấu trúc dữ liệu

### Google Sheets - Sheet "Users"

| id | email | password_hash | full_name | role | is_active | last_login | created_at | updated_at |
|----|-------|---------------|-----------|------|-----------|------------|------------|------------|
| u-admin | <admin@mia.vn> | $2b$10$... | Administrator | admin | true | | 2024-01-01 | 2024-01-01 |
| 2 | <manager@mia-logistics.com> | $2b$10$... | Manager User | manager | true | | 2024-01-01 | 2024-01-01 |

### Mock Users (nếu không kết nối được Google Sheets)

```javascript
getMockUsers() {
  return [
    {
      id: 'u-admin',
      email: 'admin@mia.vn',
      password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      // Password: "password"
      fullName: 'Administrator',
      role: 'admin',
      isActive: true,
    },
    // ... more users
  ];
}
```

## 🔐 Security Features

### 1. Password Hashing

- **Bcrypt**: Passwords được hash với bcryptjs
- **Salt Rounds**: 10 rounds
- **So sánh**: `bcrypt.compare(password, passwordHash)`

### 2. Session Encryption

- **AES Encryption**: Session data được mã hóa với CryptoJS
- **Key**: `process.env.REACT_APP_ENCRYPTION_KEY`
- **Storage**: localStorage (encrypted)

### 3. Account Lockout

- **Frontend**: 3 lần sai → khóa 5 phút
- **Rate Limiting**: Không có ở backend (vì không có backend API)

### 4. Session Management

- **Timeout**: 1 hour (3600000ms)
- **Auto-refresh**: Khi có activity
- **Multi-tab sync**: Window storage event listener

## ⚠️ Hạn chế hiện tại

### 1. **KHÔNG có Backend API**

- Backend auth controller trả về `501 Not Implemented`
- Tất cả authentication xử lý ở frontend
- **Security Risk**: Password validation ở client-side

### 2. **Google OAuth chưa hoạt động**

```javascript
// File: googleAuthService.js (dòng 28-33)
// Temporarily disable Google API to avoid iframe sandboxing errors
console.log('🔧 Google API temporarily disabled');
this.isInitialized = true;
this.authInstance = null;
```

### 3. **Last Login không được cập nhật**

```javascript
// File: userService.js (dòng 308-322)
async updateLastLogin(userId) {
  // Tạm thời disable cập nhật Google Sheets vì lỗi API
  console.log(`ℹ️ Bỏ qua cập nhật last_login`);
  return true;
}
```

### 4. **Fallback về Mock Data**

- Nếu Google Sheets lỗi → tự động dùng mock data
- Có thể gây nhầm lẫn trong production

## 🚀 Luồng hoạt động thực tế

```
1. User nhập email/password
   ↓
2. Login.js → handleSubmit()
   ↓
3. AuthContext → login()
   ↓
4. googleAuthService.login(email, password)
   ↓
5. userService.getUserByEmail(email)
   ↓
6. userService.getUsers()
   ├─► Nếu mock mode → getMockUsers()
   └─► Nếu real mode → googleSheetsService.getData('Users')
      ↓
7. Parse và map dữ liệu từ Google Sheets
   ↓
8. Tìm user theo email
   ↓
9. bcrypt.compare(password, user.passwordHash)
   ↓
10. Nếu đúng → Tạo sessionUser object
    ↓
11. sessionService.createSession(user)
    ├─► Mã hóa với AES
    └─► Lưu vào localStorage
    ↓
12. AuthContext dispatch LOGIN_SUCCESS
    ↓
13. Update state: isAuthenticated = true
    ↓
14. Redirect to /dashboard
```

## 📝 Environment Variables

```env
# Google Sheets
REACT_APP_GOOGLE_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As

# Mock Mode
REACT_APP_USE_MOCK_DATA=false

# Session
REACT_APP_SESSION_TIMEOUT=3600000
REACT_APP_ENCRYPTION_KEY=mia-logistics-default-key-2024

# Google API (disabled)
REACT_APP_ENABLE_GOOGLE_SHEETS=false
REACT_APP_GOOGLE_CLIENT_ID=disabled
```

## 🔍 Debugging

### Kiểm tra login flow

```javascript
// 1. Console logs
console.log('🔐 Bắt đầu quá trình đăng nhập...');
console.log('✅ Đăng nhập thành công:', sessionUser.email);

// 2. Kiểm tra session
const session = sessionService.getSession();
console.log('Session:', session);

// 3. Kiểm tra user trong Google Sheets
const users = await userService.getUsers();
console.log('Users:', users);

// 4. Kiểm tra auth state
console.log('Auth State:', authContext.state);
```

## 📚 Files liên quan

### Frontend Authentication

- `src/components/auth/Login.js` - Login UI component
- `src/contexts/AuthContext.js` - Auth state management
- `src/services/google/googleAuthService.js` - Authentication logic
- `src/services/user/userService.js` - User data từ Google Sheets
- `src/services/auth/sessionService.js` - Session management

### Backend (Not Used)

- `server/src/routes/authRoutes.js` - Routes (501 Not Implemented)
- `server/src/controllers/authController.js` - Controllers (501 Not Implemented)

## 🎯 Kết luận

**Dự án hiện tại sử dụng:**

- ✅ **Frontend-only authentication** với Google Sheets
- ✅ **Bcrypt password hashing**
- ✅ **Encrypted session storage**
- ✅ **Role-based permissions**
- ❌ **Không có backend API** cho authentication
- ❌ **Google OAuth disabled**
- ⚠️ **Security concerns** vì validation ở client-side

---

**Tài liệu này mô tả cách login thực tế hoạt động trong dự án hiện tại.**
