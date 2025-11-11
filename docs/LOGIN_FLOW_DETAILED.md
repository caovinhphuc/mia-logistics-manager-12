# 🔐 Luồng đăng nhập (Login Flow) - MIA Logistics Manager

## 📋 Tổng quan

Dự án sử dụng hệ thống xác thực dựa trên **Google Sheets** làm cơ sở dữ liệu người dùng, kết hợp với **JWT tokens** và **session management** để quản lý phiên đăng nhập.

## 🏗️ Kiến trúc xác thực

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Google Sheets │
│   (React)       │    │   (Express)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Login Request      │                       │
         ├──────────────────────►│                       │
         │                       │ 2. Validate User      │
         │                       ├──────────────────────►│
         │                       │ 3. User Data          │
         │                       │◄──────────────────────┤
         │ 4. JWT Token + User   │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 5. Store in Context   │                       │
         │    & LocalStorage     │                       │
         │                       │                       │
```

## 🔄 Luồng đăng nhập chi tiết

### 1. Frontend - Login Component

**File**: `src/components/auth/Login.js`

#### 1.1 State Management

```javascript
const [formData, setFormData] = useState({
  email: '',
  password: '',
  rememberMe: false,
});
const [loginAttempts, setLoginAttempts] = useState(0);
const [isLocked, setIsLocked] = useState(false);
const [lockoutTime, setLockoutTime] = useState(0);
```

#### 1.2 Validation

```javascript
const validationSchema = {
  email: (value) => {
    if (!value) return 'Email là bắt buộc';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email không hợp lệ';
    return null;
  },
  password: (value) => {
    if (!value) return 'Mật khẩu là bắt buộc';
    if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    return null;
  },
};
```

#### 1.3 Security Features

- **Rate Limiting**: Tối đa 3 lần đăng nhập sai
- **Account Lockout**: Khóa tài khoản 5 phút sau 3 lần sai
- **Input Validation**: Kiểm tra email và password
- **XSS Protection**: Sanitize input data

### 2. Frontend - Auth Context

**File**: `src/contexts/AuthContext.js`

#### 2.1 State Structure

```javascript
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  permissions: [],
  sessionId: null,
};
```

#### 2.2 Role-based Permissions

```javascript
const ROLE_PERMISSIONS = {
  admin: [
    "read:all", "write:all", "delete:all",
    "manage:users", "manage:settings",
    "view:reports", "manage:transport",
    "manage:warehouse", "manage:staff", "manage:partners"
  ],
  manager: [
    "read:all", "write:transport", "write:warehouse",
    "write:staff", "view:reports",
    "manage:transport", "manage:warehouse", "manage:staff"
  ],
  operator: [
    "read:transport", "read:warehouse", "read:partners",
    "write:transport", "write:warehouse"
  ],
  driver: ["read:transport", "write:transport:own"],
  warehouse_staff: ["read:warehouse", "write:warehouse", "read:transport"]
};
```

#### 2.3 Login Function

```javascript
const login = async (credentials) => {
  try {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

    let user;
    if (credentials.googleToken) {
      // Google OAuth login
      user = await googleAuthService.loginWithGoogle(credentials.googleToken);
    } else {
      // Regular login
      user = await googleAuthService.login(credentials.email, credentials.password);
    }

    // Create session
    const session = sessionService.createSession(user);
    const permissions = getPermissionsByRole(user.role);

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

### 3. Frontend - Google Auth Service

**File**: `src/services/google/googleAuthService.js`

#### 3.1 Login Implementation

```javascript
const login = async (email, password) => {
  try {
    // 1. Validate credentials
    const user = await validateUserCredentials(email, password);

    // 2. Check if user exists in Google Sheets
    const userData = await googleSheetsService.getUserByEmail(email);

    if (!userData) {
      throw new Error('User not found');
    }

    // 3. Verify password (hashed)
    const isValidPassword = await bcrypt.compare(password, userData.password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // 4. Check if user is active
    if (!userData.isActive) {
      throw new Error('Account is deactivated');
    }

    // 5. Generate JWT token
    const token = jwt.sign(
      {
        userId: userData.id,
        email: userData.email,
        role: userData.role
      },
      process.env.REACT_APP_JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Return user data
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      token: token
    };
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
};
```

### 4. Backend - Auth Routes

**File**: `server/src/routes/authRoutes.js`

#### 4.1 Route Structure

```javascript
// Public routes
router.post('/register', authRateLimit, validateRegister, register);
router.post('/login', authRateLimit, validateLogin, login);
router.post('/forgot-password', authRateLimit, validateForgotPassword, forgotPassword);
router.patch('/reset-password/:token', authRateLimit, validateResetPassword, resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/refresh', refreshToken);

// Protected routes
router.use(authenticate); // All routes below are protected
router.post('/logout', logout);
router.get('/me', getMe);
router.patch('/me', validateUpdateMe, updateMe);
router.patch('/update-password', validateUpdatePassword, updatePassword);
router.post('/resend-verification', resendVerification);
router.get('/permissions', getPermissions);
```

#### 4.2 Rate Limiting

```javascript
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  }
});
```

### 5. Backend - Auth Controller

**File**: `server/src/controllers/authController.js`

#### 5.1 Current Status

```javascript
const login = (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Login moved to Google Sheets auth system',
  });
};
```

**⚠️ Lưu ý**: Backend auth controller hiện tại đang trả về 501 (Not Implemented) vì hệ thống đã chuyển sang sử dụng Google Sheets auth system.

### 6. Session Management

**File**: `src/services/auth/sessionService.js`

#### 6.1 Session Creation

```javascript
const createSession = (user) => {
  const sessionId = generateUniqueId();
  const session = {
    id: sessionId,
    user: user,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  };

  // Store in localStorage
  localStorage.setItem('session', JSON.stringify(session));

  return session;
};
```

#### 6.2 Session Validation

```javascript
const isValidSession = (session) => {
  if (!session) return false;

  const now = new Date();
  const expiresAt = new Date(session.expiresAt);

  return now < expiresAt;
};
```

## 🔐 Security Features

### 1. Frontend Security

- **Input Validation**: Email format, password length
- **XSS Protection**: DOMPurify sanitization
- **Rate Limiting**: 3 attempts before lockout
- **Account Lockout**: 5-minute lockout after 3 failed attempts
- **Session Timeout**: Auto-logout after 1 hour of inactivity

### 2. Backend Security

- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: 5 requests per 15 minutes per IP
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **Input Sanitization**: XSS protection

### 3. Data Security

- **Password Hashing**: bcrypt with salt rounds
- **JWT Secret**: Environment variable
- **HTTPS**: Required in production
- **Session Storage**: Secure localStorage usage

## 📊 Login Flow Diagram

```
User enters credentials
         │
         ▼
┌─────────────────┐
│  Frontend       │
│  Validation     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  AuthContext    │
│  login()        │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Google Auth    │
│  Service        │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Google Sheets  │
│  User Lookup    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Password       │
│  Verification   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  JWT Token      │
│  Generation     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Session        │
│  Creation       │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  State Update   │
│  & Redirect     │
└─────────────────┘
```

## 🚨 Error Handling

### 1. Frontend Errors

```javascript
// Validation errors
if (Object.keys(validationErrors).length > 0) {
  setErrors(validationErrors);
  return;
}

// Account lockout
if (isLocked && Date.now() < lockoutTime) {
  showError(`Tài khoản bị khóa trong ${remainingTime} giây`);
  return;
}

// Login failure
if (newAttempts >= 3) {
  setIsLocked(true);
  setLockoutTime(Date.now() + 300000); // 5 minutes
  showWarning('Tài khoản bị khóa 5 phút do đăng nhập sai nhiều lần');
}
```

### 2. Backend Errors

```javascript
// Rate limiting
if (rateLimitExceeded) {
  return res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.'
  });
}

// Authentication errors
if (!isValidCredentials) {
  return res.status(401).json({
    success: false,
    message: 'Invalid email or password'
  });
}
```

## 🔧 Configuration

### 1. Environment Variables

```env
# Frontend
REACT_APP_JWT_SECRET=your-jwt-secret
REACT_APP_SESSION_TIMEOUT=3600000
REACT_APP_API_BASE_URL=http://localhost:5000/api/v1

# Backend
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX_REQUESTS=5
```

### 2. Google Sheets Configuration

```javascript
const GOOGLE_SHEETS_CONFIG = {
  sheetId: process.env.GOOGLE_SHEETS_SHEET_ID,
  clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  privateKey: process.env.GOOGLE_SHEETS_PRIVATE_KEY,
  usersSheetName: 'Users'
};
```

## 📝 API Endpoints

### 1. Login Endpoint

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Success:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin",
      "permissions": ["read:all", "write:all"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "sessionId": "session_123"
  }
}
```

**Response Error:**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 2. Get Current User

```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "role": "admin",
      "permissions": ["read:all", "write:all"],
      "isActive": true,
      "isEmailVerified": true
    }
  }
}
```

## 🚀 Future Improvements

### 1. Planned Features

- [ ] **Google OAuth Integration**: Đăng nhập bằng Google
- [ ] **Two-Factor Authentication**: Xác thực 2 yếu tố
- [ ] **Password Reset**: Quên mật khẩu qua email
- [ ] **Account Lockout**: Khóa tài khoản tạm thời
- [ ] **Audit Logging**: Ghi log các hoạt động đăng nhập

### 2. Security Enhancements

- [ ] **Password Policy**: Chính sách mật khẩu mạnh
- [ ] **Login Attempts Tracking**: Theo dõi số lần đăng nhập sai
- [ ] **IP Whitelisting**: Chỉ cho phép IP nhất định
- [ ] **Device Management**: Quản lý thiết bị đăng nhập

## 📚 Related Files

### Frontend

- `src/components/auth/Login.js` - Login component
- `src/contexts/AuthContext.js` - Auth context
- `src/services/google/googleAuthService.js` - Google auth service
- `src/services/auth/sessionService.js` - Session management

### Backend

- `server/src/routes/authRoutes.js` - Auth routes
- `server/src/controllers/authController.js` - Auth controller
- `server/src/middleware/validation.js` - Input validation
- `server/src/middleware/googleSheetsAuth.js` - Auth middleware

---

**Tài liệu này mô tả chi tiết luồng đăng nhập trong hệ thống MIA Logistics Manager.**
