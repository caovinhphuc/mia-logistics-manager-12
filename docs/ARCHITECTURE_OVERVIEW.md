# 📋 Cấu trúc thư mục và luồng xử lý - MIA Logistics Manager

## 🏗️ Cấu trúc tổng quan dự án

```
mia-logistics-manager/
│
├── 📁 src/                          # Frontend Application (React)
│   ├── 📁 components/               # React Components
│   │   ├── auth/                    # Authentication components
│   │   ├── common/                  # Common components (Layout, ErrorBoundary)
│   │   ├── layout/                  # Layout components (Header, Sidebar)
│   │   ├── map/                     # Map components
│   │   └── google/                  # Google integration components
│   │
│   ├── 📁 pages/                     # Page components
│   │   ├── Dashboard.jsx
│   │   ├── LoginPage.jsx
│   │   ├── Partners.jsx
│   │   ├── Staff.jsx
│   │   ├── Transport.jsx
│   │   ├── Warehouse.jsx
│   │   └── ...
│   │
│   ├── 📁 features/                  # Feature modules
│   │   ├── dashboard/
│   │   ├── partners/
│   │   ├── staff/
│   │   ├── transport/
│   │   └── warehouse/
│   │
│   ├── 📁 contexts/                 # React Contexts
│   │   ├── AuthContext.js
│   │   ├── GoogleContext.js
│   │   ├── LanguageContext.js
│   │   ├── NotificationContext.js
│   │   └── ThemeContext.js
│   │
│   ├── 📁 services/                  # Frontend Services
│   │   ├── auth/                    # Authentication services
│   │   ├── google/                  # Google APIs services
│   │   ├── api/                     # API communication
│   │   ├── map/                     # Map services
│   │   └── user/                    # User services
│   │
│   ├── 📁 shared/                    # Shared components
│   │   └── components/ui/          # UI components (DataTable, GridView)
│   │
│   ├── 📁 utils/                     # Utility functions
│   ├── 📁 hooks/                     # Custom React hooks
│   ├── 📁 config/                    # Configuration files
│   ├── 📁 styles/                    # Global styles
│   ├── 📁 locales/                   # i18n translations
│   ├── App.jsx                       # Main App component
│   ├── index.js                      # Entry point
│   └── main.jsx                      # React entry point
│
├── 📁 server/                        # Backend Server (Node.js/Express)
│   ├── 📁 src/                       # Server source code
│   │   ├── 📁 routes/                # API Routes
│   │   │   ├── authRoutes.js
│   │   │   ├── carriersRoutes.js
│   │   │   ├── employeesRoutes.js
│   │   │   ├── locationsRoutes.js
│   │   │   ├── googleSheetsRoutes.js
│   │   │   └── ...
│   │   │
│   │   ├── 📁 middleware/            # Express Middleware
│   │   │   ├── errorHandler.js       # Global error handling
│   │   │   ├── requestLogger.js      # Request logging
│   │   │   ├── securityHeaders.js    # Security headers
│   │   │   ├── validation.js         # Input validation
│   │   │   ├── auth.js               # Authentication middleware
│   │   │   └── ...
│   │   │
│   │   ├── 📁 controllers/            # Route Controllers
│   │   │   └── authController.js
│   │   │
│   │   ├── 📁 services/               # Business Logic Services
│   │   │   ├── googleSheetsService.js
│   │   │   ├── googleDriveService.js
│   │   │   ├── emailService.js
│   │   │   ├── notificationManager.js
│   │   │   ├── realtimeService.js    # Socket.IO
│   │   │   └── telegramService.js
│   │   │
│   │   ├── 📁 utils/                 # Utility functions
│   │   │   ├── appError.js
│   │   │   ├── catchAsync.js
│   │   │   └── ...
│   │   │
│   │   ├── 📁 config/                 # Configuration
│   │   │   └── server.js
│   │   │
│   │   ├── 📁 views/                  # Email templates (Pug)
│   │   │   └── email/
│   │   │
│   │   ├── app.js                     # Express app setup
│   │   └── server.js                  # HTTP server startup
│   │
│   ├── 📁 services/                   # Legacy services (đang được migrate)
│   ├── 📁 config/                     # Legacy config
│   ├── index.js                        # Legacy server entry (cũ)
│   ├── start-server.js                 # New server entry point
│   ├── package.json
│   └── README.md
│
├── 📁 backend/                        # Backend build (Vite)
│   └── src/                          # TypeScript sources
│
├── 📁 public/                         # Static files
├── 📁 docs/                           # Documentation
├── 📁 scripts/                        # Scripts và utilities
├── 📁 security/                       # Security configs
├── 📁 logs/                           # Application logs
├── 📁 uploads/                         # File uploads
├── 📁 dist/                           # Build output
│
├── package.json                       # Root package.json
├── tsconfig.json                      # TypeScript config
├── vite.config.js                     # Vite config
└── README.md
```

## 🔄 Luồng xử lý chính

### 1. Frontend Flow (React Application)

```
User Browser
    ↓
React App (src/index.js)
    ↓
App.jsx (Main Router)
    ↓
┌─────────────────────────────────┐
│  Context Providers:              │
│  - AuthContext                    │
│  - GoogleContext                  │
│  - LanguageContext                │
│  - ThemeContext                   │
│  - NotificationContext            │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Route Components:               │
│  - / → Dashboard                 │
│  - /login → LoginPage            │
│  - /partners → Partners          │
│  - /staff → Staff                │
│  - /transport → Transport        │
│  - /warehouse → Warehouse        │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Components:                     │
│  - Layout (Header, Sidebar)      │
│  - Feature Components            │
│  - Shared UI Components          │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Services Layer:                 │
│  - api/ → API calls              │
│  - auth/ → Auth logic            │
│  - google/ → Google APIs         │
│  - user/ → User management       │
└─────────────────────────────────┘
    ↓
HTTP Request to Backend API
```

### 2. Backend Flow (Express Server)

```
Client Request
    ↓
┌─────────────────────────────────┐
│  HTTP Server (server/src/server.js) │
│  - Creates HTTP server           │
│  - Initializes services          │
│  - Starts listening on PORT      │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Express App (server/src/app.js) │
│  - Middleware stack setup        │
│  - Routes registration           │
│  - Error handlers                │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Security Middleware:            │
│  - Helmet (Security headers)     │
│  - CORS                          │
│  - Rate Limiting                 │
│  - XSS Protection                │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Request Middleware:             │
│  - Body Parser                   │
│  - Request Logger                │
│  - Sanitization                  │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Routes (server/src/routes/)     │
│  - /api/v1/auth                  │
│  - /api/v1/carriers              │
│  - /api/v1/employees             │
│  - /api/v1/locations             │
│  - /api/v1/google-sheets         │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Route Middleware:               │
│  - Authentication (JWT)         │
│  - Authorization (Permissions)   │
│  - Validation                    │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Controllers / Route Handlers     │
│  - Process request               │
│  - Call services                 │
│  - Return response               │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Services Layer:                 │
│  - googleSheetsService           │
│  - googleDriveService            │
│  - emailService                  │
│  - notificationManager           │
│  - realtimeService (Socket.IO)    │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  External APIs:                  │
│  - Google Sheets API             │
│  - Google Drive API              │
│  - SendGrid (Email)              │
│  - Telegram Bot API              │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Error Handler:                  │
│  - Catch errors                  │
│  - Log errors                    │
│  - Format error response         │
└─────────────────────────────────┘
    ↓
HTTP Response to Client
```

### 3. Authentication Flow

```
User Login
    ↓
Frontend: LoginPage.jsx
    ↓
POST /api/v1/auth/login
    ↓
Backend: authRoutes.js
    ↓
Middleware: authenticate (JWT verification)
    ↓
Controller: authController.js
    ↓
Service: authenticationService.js
    ↓
┌─────────────────────────────────┐
│  Validate credentials             │
│  - Check email/password           │
│  - Verify against Google Sheets   │
│  - Generate JWT token             │
└─────────────────────────────────┘
    ↓
Return JWT Token + User Data
    ↓
Frontend: Store token in localStorage
    ↓
Set Authorization header for future requests
```

### 4. Data Flow (Carriers Example)

```
Frontend: CarriersList Component
    ↓
GET /api/v1/carriers
    ↓
Backend: carriersRoutes.js
    ↓
Middleware: authenticate + requirePermission('carriers:view')
    ↓
Route Handler: Get all carriers
    ↓
Service: googleSheetsService.getAllRecords('Carriers')
    ↓
┌─────────────────────────────────┐
│  Google Sheets API:               │
│  1. Authenticate with service    │
│     account                       │
│  2. Read data from sheet         │
│  3. Parse and format data         │
└─────────────────────────────────┘
    ↓
Return formatted data
    ↓
Frontend: Display in DataTable/GridView
```

### 5. Real-time Updates Flow

```
Backend: Socket.IO Server
    ↓
Event: Data changed in Google Sheets
    ↓
Service: Trigger update
    ↓
Socket.IO: Emit event to connected clients
    ↓
Frontend: Socket.IO Client receives event
    ↓
React: Update state via Context
    ↓
UI: Automatic re-render with new data
```

## 🔐 Security Flow

```
Request
    ↓
┌─────────────────────────────────┐
│  1. Helmet Security Headers      │
│     - CSP, X-Frame-Options, etc  │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  2. CORS Check                   │
│     - Validate origin            │
│     - Allow/deny based on config │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  3. Rate Limiting                │
│     - Check request count         │
│     - Block if exceeded           │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  4. Input Sanitization           │
│     - XSS Protection              │
│     - SQL Injection prevention    │
│     - DOMPurify                   │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  5. Authentication                │
│     - JWT Token verification      │
│     - Extract user info           │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  6. Authorization                │
│     - Check permissions           │
│     - Role-based access control   │
└─────────────────────────────────┘
    ↓
Route Handler
```

## 📊 Data Storage Flow

```
Frontend Component
    ↓
API Request
    ↓
Backend Route
    ↓
Service Layer
    ↓
┌─────────────────────────────────┐
│  Google Sheets (Primary DB)      │
│  - Carriers                      │
│  - Employees                     │
│  - Locations                     │
│  - Transfers                     │
│  - Users                         │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Google Drive (File Storage)     │
│  - Documents                     │
│  - Reports                       │
│  - Images                       │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Local Storage (Browser)         │
│  - User preferences              │
│  - Cache data                    │
│  - Session tokens                │
└─────────────────────────────────┘
```

## 🚀 Deployment Flow

```
Developer
    ↓
┌─────────────────────────────────┐
│  Development                    │
│  - npm run dev (Frontend)        │
│  - npm run dev (Backend)         │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Build                          │
│  - npm run build (Frontend)      │
│  - Creates dist/ folder          │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Testing                        │
│  - npm test                      │
│  - Integration tests             │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Deployment Scripts              │
│  - deploy.sh                     │
│  - deployGCP.sh                  │
│  - deployFirebase.sh             │
│  - deployVercel.sh               │
└─────────────────────────────────┘
    ↓
Production Server
```

## 🔧 Key Technologies

### Frontend

- **React 18** - UI Framework
- **Material-UI** - Component Library
- **React Router** - Routing
- **Socket.IO Client** - Real-time updates
- **Axios** - HTTP client
- **Context API** - State management

### Backend

- **Node.js** - Runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Google APIs** - Data storage
- **SendGrid** - Email service
- **Telegram Bot API** - Notifications

### Storage

- **Google Sheets** - Primary database
- **Google Drive** - File storage
- **LocalStorage** - Client-side cache

## 📝 Notes quan trọng

1. **Dual Entry Points**:
   - Frontend: `src/index.js` → `src/App.jsx`
   - Backend: `server/start-server.js` → `server/src/server.js`

2. **Module System**:
   - Frontend: ES Modules (import/export)
   - Backend: CommonJS (require/module.exports)

3. **API Versioning**:
   - Base URL: `/api/v1/`

4. **Error Handling**:
   - Frontend: ErrorBoundary components
   - Backend: Global error handler middleware

5. **Logging**:
   - Frontend: Console logs (development)
   - Backend: File-based logging (production)

6. **Real-time**:
   - Socket.IO for live updates
   - WebSocket connections maintained

---

**Tài liệu này được tạo tự động để giúp hiểu rõ cấu trúc và luồng xử lý của dự án.**
