# MIA Logistics Manager

🚚 **Hệ thống quản lý vận chuyển chuyên nghiệp cho Việt Nam**

## 📋 Tổng quan

MIA Logistics Manager là một ứng dụng web hiện đại được xây dựng bằng React, tích hợp với Google Workspace (Sheets, Drive, Apps Script) để quản lý toàn diện hoạt động vận chuyển và logistics.

### ✨ Tính năng chính

- 📊 **Dashboard tổng quan** - Thống kê và báo cáo real-time
- 🚛 **Quản lý vận chuyển** - Theo dõi đơn hàng, tuyến đường, tài xế
  - Đề nghị vận chuyển
  - Địa điểm lưu (Locations)
  - Chờ chuyển giao
  - Bảng tính khối
  - Quy tắc tính khối
- 📦 **Quản lý kho** - Tồn kho, nhập/xuất hàng, định vị
- 📥 **Nhập hàng** - Inbound domestic & international với calendar view
  - Nhập hàng Quốc nội
  - Nhập hàng Quốc tế (70+ cột)
  - Lịch trình nhập hàng
  - Báo cáo nhập hàng
- 🚚 **Nhà vận chuyển** - Quản lý carriers, service areas, pricing
- 👥 **Quản lý nhân sự** - Employees CRUD với Grid/Table view
- 🔐 **Phân quyền hệ thống** - RBAC hoàn chỉnh
  - Vai trò (Roles)
  - Quyền hạn (Permissions)
  - Người dùng (Users)
- 🔄 **Chuyển kho** - Transfers management với volume calculator
- 🗺️ **Tính khoảng cách** - Google Apps Script integration
- 🔔 **Thông báo đa kênh** - Telegram notifications, Email alerts
- 📈 **Báo cáo** - System logs, monitoring
- 🌐 **Đa ngôn ngữ** - Tiếng Việt (default)
- 🔐 **Bảo mật** - RBAC, authentication, session management
- 📱 **Responsive** - Mobile & desktop optimized

### 🏗️ Kiến trúc công nghệ

- **Frontend**: React 18, Material-UI, React Router
- **State Management**: Context API, React Query
- **Backend Integration**: Google Sheets API, Google Drive API
- **Maps**: Google Maps API, Leaflet
- **Authentication**: Google OAuth 2.0, JWT
- **Localization**: i18next
- **Build Tools**: Create React App, Webpack

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống

- Node.js 18+
- npm 9+
- Google Cloud Platform account
- Service Account credentials

### 1. Clone dự án

```bash
git clone https://github.com/your-username/mia-logistics-manager.git
cd mia-logistics-manager
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

File `.env` đã được cấu hình với các giá trị thực tế:

```bash
# Google Sheets Configuration
REACT_APP_GOOGLE_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As

# Google Drive Configuration
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=1_Zy9Q31vPEHOSIT077kMolek3F3-yxZE

# Google Apps Script Configuration
REACT_APP_GOOGLE_APPS_SCRIPT_ID=1fNrUwCusl_47rpxKcEFXZITIYUmBVGNgpJWDKLwSW8oF5h--Q3AbxoBv
REACT_APP_APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/AKfycbysU9ncMhDg_1CATGPIdewwLqUq2AM6I1RUlsl6nMR9nHDYL_BFFbKMtlIxdg_LU5VJRQ/exec

# Telegram Configuration
REACT_APP_TELEGRAM_BOT_TOKEN=8434038911:AAEsXilwvPkpCNxt0pAZybgXag7xJnNpmN0
REACT_APP_TELEGRAM_CHAT_ID=-4818209867

# Email Configuration (SendGrid)
SENDGRID_API_KEY=6TJF5SH4EEAD5RTTWF4RUUUS
EMAIL_FROM=kho.1@mia.vn
```

### 4. Chạy ứng dụng

#### Quick Start (Recommended)

```bash
# Khởi động full-stack với Telegram notification
./start-project.sh

# Hoặc start đơn giản
./start.sh
```

#### Development Mode

```bash
# Option 1: Quick Start (Recommended)
./start-project.sh              # Development với Telegram notifications
./start.sh                      # Simple start

# Option 2: Manual Start

# Terminal 1: Start Backend
cd backend
npm install
npm start                       # Backend chạy tại http://localhost:5050

# Terminal 2: Start Frontend
npm install
npm start                       # Frontend chạy tại http://localhost:3000

# Terminal 3: AI Service (Optional)
cd ai-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main_simple:app --host 0.0.0.0 --port 8000 --reload
```

#### Access URLs

- **Backend**: <http://localhost:5050>
- **Frontend**: <http://localhost:3000>
- **Telegram**: Configured (sẽ nhận notifications khi startup)

#### Production

```bash
# Build
npm run build

# Serve locally
npx serve -s build
```

## ⚙️ Cấu hình Google Cloud

### 1. Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com)
2. Tạo project mới: "MIA Logistics Manager"
3. Enable các APIs cần thiết:
   - Google Sheets API
   - Google Drive API
   - Google Apps Script API
   - Google Maps JavaScript API
   - Google Places API

### 2. Tạo OAuth 2.0 Credentials

1. Vào **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client ID**
3. Chọn **Web application**
4. Thêm authorized redirect URIs:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
5. Copy Client ID và Client Secret vào file `.env`

### 3. Tạo Service Account (tùy chọn)

1. Vào **APIs & Services > Credentials**
2. Click **Create Credentials > Service Account**
3. Tải về JSON key file
4. Đặt file trong thư mục `credentials/`

## 📊 Cấu hình Google Sheets

### Spreadsheet hiện tại

**Spreadsheet ID**: `18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As`

**Tên**: mia-logistics-final

**Tổng số sheets**: 25 tabs

#### Danh sách các sheets

1. **HOME** - Trang chủ
2. **Orders** - Đơn hàng
3. **Carriers** - Nhà vận chuyển
4. **Locations** - Vị trí kho
5. **Transfers** - Chuyển kho
6. **Settings** - Cài đặt
7. **Inventory** - Tồn kho
8. **Reports** - Báo cáo
9. **Sales** - Bán hàng
10. **VolumeRules** - Quy tắc khối lượng
11. **InboundInternational** - Nhập hàng quốc tế
12. **InboundDomestic** - Nhập hàng quốc nội
13. **TransportRequests** - Yêu cầu vận chuyển
14. **Users** - Người dùng
15. **Roles** - Vai trò
16. **RolePermissions** - Phân quyền
17. **Employees** - Nhân viên
18. **Logs** - Nhật ký
19. **TransportProposals** - Đề xuất vận chuyển
20. **Dashboard** - Dashboard
21. **VerificationTokens** - Mã xác thực
22. **MIA_Logistics_Data** - Dữ liệu chính
23. **Dashboard_Summary** - Tóm tắt dashboard
24. **System_Logs** - Log hệ thống
25. **Trips** - Chuyến đi

### Service Accounts (Đã kết nối)

#### 1. mia-vn-google-integration

**Email**: `mia-vn-google-integration@sinuous-aviary-474820-e3.iam.gserviceaccount.com`

**File**: `server/sinuous-aviary-474820-e3-c442968a0e87.json`

**Status**: ✅ Connected (25 sheets accessible)

#### 2. nuq74

**Email**: `nuq74@[PROJECT_ID].iam.gserviceaccount.com`

**Status**: ✅ Connected

## 🗂️ Cấu hình Google Drive

### Folder hiện tại

**Folder ID**: `1_Zy9Q31vPEHOSIT077kMolek3F3-yxZE`

**Link**: <https://drive.google.com/drive/folders/1_Zy9Q31vPEHOSIT077kMolek3F3-yxZE>

**Status**: ⚠️ Cần share folder với các service account emails:

```text
mia-vn-google-integration@sinuous-aviary-474820-e3.iam.gserviceaccount.com
nuq74@[PROJECT_ID].iam.gserviceaccount.com
```

**Thư mục gợi ý**:

- Transport Documents/
- Warehouse Images/
- Staff Documents/
- Partner Contracts/
- System Backups/

## 📱 Google Apps Script

### Apps Script hiện tại

**Project ID**: `1fNrUwCusl_47rpxKcEFXZITIYUmBVGNgpJWDKLwSW8oF5h--Q3AbxoBv`

**Editor**: <https://script.google.com/u/0/home/projects/1fNrUwCusl_47rpxKcEFXZITIYUmBVGNgpJWDKLwSW8oF5h--Q3AbxoBv/edit>

**Web App URL**: <https://script.google.com/macros/s/AKfycbysU9ncMhDg_1CATGPIdewwLqUq2AM6I1RUlsl6nMR9nHDYL_BFFbKMtlIxdg_LU5VJRQ/exec>

**Chức năng**: Tính khoảng cách giữa 2 điểm (Distance Calculator)

**Status**: ✅ Working

**Usage**:

```bash
# GET request với origin & destination
curl "https://script.google.com/macros/s/AKfycbysU9ncMhDg_1CATGPIdewwLqUq2AM6I1RUlsl6nMR9nHDYL_BFFbKMtlIxdg_LU5VJRQ/exec?origin=Hanoi&destination=Ho+Chi+Minh+City"
```

## 🎨 Customization

### Theme và Styling

- **Primary Color**: Có thể thay đổi trong `src/styles/theme.js`
- **Vietnamese Colors**: Palette màu sắc Việt Nam tích hợp sẵn
- **Dark Mode**: Hỗ trợ tự động theo hệ thống
- **Responsive**: Breakpoints tối ưu cho mobile

### Ngôn ngữ

- **Default**: Tiếng Việt
- **Supported**: Vi, En
- **Add Language**: Thêm file JSON trong `src/locales/`

### Components

- **Material-UI**: Sử dụng components có sẵn
- **Custom Components**: Trong `src/components/`
- **Layouts**: MainLayout, AuthLayout
- **Utilities**: Validation, Format, Performance

## 📚 Cấu trúc dự án

```text
mia-logistics-manager/
├── public/                      # Static files
├── src/                         # Frontend React (377 source files)
│   ├── components/              # React components
│   │   ├── auth/               # Authentication, Login, Profile
│   │   ├── inbound/            # Nhập hàng (Inbound)
│   │   ├── carriers/           # Nhà vận chuyển
│   │   ├── locations/          # Địa điểm lưu
│   │   ├── transfers/          # Chuyển kho
│   │   ├── maps/               # Maps integration
│   │   ├── notifications/      # Notifications
│   │   ├── settings/           # Settings components
│   │   └── layout/             # MainLayout, AuthLayout
│   ├── pages/                  # Page components
│   │   ├── Employees/          # Quản lý nhân sự
│   │   ├── Settings/           # Settings pages (Roles, Permissions, Users)
│   │   ├── Transport/          # Transport management
│   │   ├── Warehouse/          # Warehouse management
│   │   ├── Partners/           # Partners management
│   │   ├── Reports/            # Reports pages
│   │   └── Locations/           # Locations pages
│   ├── features/               # Feature modules
│   │   ├── carriers/
│   │   ├── employees/
│   │   ├── transfers/
│   │   └── inbound/
│   ├── contexts/               # React contexts (Auth, Theme, Language)
│   ├── services/               # API services
│   │   ├── googleSheets/       # Google Sheets services
│   │   └── maps/               # Maps services
│   ├── hooks/                  # Custom hooks
│   ├── stores/                 # Zustand stores
│   ├── shared/                 # Shared components & utilities
│   │   ├── components/         # UI components (GridView, DataTable, etc.)
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   ├── locales/                # Translations (Vietnamese default)
│   └── styles/                 # Styling
├── backend/                    # Backend Node.js/Express
│   ├── src/
│   │   ├── routes/            # 16 route modules (100% complete)
│   │   │   ├── router.js      # Main router (aggregates all routes)
│   │   │   ├── authRoutes.js  # Authentication & Users (9 endpoints)
│   │   │   ├── carriersRoutes.js
│   │   │   ├── transfersRoutes.js
│   │   │   ├── locationsRoutes.js
│   │   │   ├── transportRequestsRoutes.js
│   │   │   ├── settingsRoutes.js
│   │   │   ├── inboundDomesticRoutes.js
│   │   │   ├── inboundInternationalRoutes.js
│   │   │   ├── rolesRoutes.js
│   │   │   ├── employeesRoutes.js
│   │   │   ├── rolePermissionsRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── telegramRoutes.js
│   │   │   ├── googleSheetsRoutes.js
│   │   │   └── googleSheetsAuthRoutes.js
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utilities
│   │   └── app.js             # Express app configuration
│   ├── server.cjs             # Server entry point
│   ├── package.json           # Backend dependencies
│   └── sinuous-aviary-474820-e3-c442968a0e87.json  # Service account
├── ai-service/                # AI Service (Python/FastAPI) - Optional
│   ├── main_simple.py         # FastAPI app
│   ├── models/                # ML models
│   └── requirements.txt       # Python dependencies
├── scripts/                    # Shell scripts
│   ├── start-project.sh        # Main startup script
│   ├── test-startup.sh         # Test services
│   └── test-log-real-time.sh   # Test logging
├── logs/                       # Log files (auto-generated)
├── .env                        # Environment variables
├── start-project.sh            # Quick start (recommended)
├── start.sh                    # Simple start
├── package.json                # Frontend dependencies
└── README.md                   # This file
```

## 👥 Phân quyền (RBAC)

### Roles

1. **Admin** - Toàn quyền hệ thống
2. **Manager** - Quản lý vận hành
3. **Operator** - Điều hành hàng ngày
4. **Driver** - Tài xế vận chuyển
5. **Warehouse Staff** - Nhân viên kho

### Permissions

- `read:all` - Đọc tất cả dữ liệu
- `write:transport` - Ghi dữ liệu vận chuyển
- `write:warehouse` - Ghi dữ liệu kho
- `manage:users` - Quản lý người dùng
- `view:reports` - Xem báo cáo

## 🔐 Bảo mật

### Authentication

- SHA-256 password hashing (implemented)
- Session management với localStorage
- Auto logout khi session hết hạn
- Session timeout warning (5 phút trước khi hết hạn)
- Security guards và route protection

### Authorization

- Role-based access control (RBAC)
- Permission-based UI rendering
- API endpoint protection

### Data Protection

- AES encryption for sensitive data
- HTTPS enforcement
- Input validation
- XSS protection

## 📊 Logging và Monitoring

### Log Files

Logs được ghi tự động vào thư mục `logs/`:

- `logs/backend-startup.log` - Backend startup logs
- `logs/backend.log` - Backend runtime logs
- `logs/frontend-startup.log` - Frontend compile logs

### Log Levels

- **ERROR**: Lỗi hệ thống
- **WARN**: Cảnh báo
- **INFO**: Thông tin general
- **DEBUG**: Chi tiết debug

### Log Storage

- Local files (`logs/` directory)
- Google Sheets (unlimited)
- Console output (development)

### Monitoring Scripts

```bash
# Test startup services
./scripts/test-startup.sh

# Test real-time logging
./scripts/test-log-real-time.sh

# View recent logs
tail -f logs/backend-startup.log
```

### Telegram Notifications

Hệ thống tự động gửi notification qua Telegram khi:

- Services startup
- Errors xảy ra
- System health check
- Daily reports

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests (nếu có)
npm run test:e2e
```

## 🚀 Deployment

### Local Development

```bash
# Recommended: Full startup với notifications
./start-project.sh

# Hoặc simple startup
./start.sh

# Test services trước khi start
./scripts/test-startup.sh
```

### Production Build

```bash
npm run build

# Serve build locally
npx serve -s build
```

### Deploy Options

#### Vercel (Recommended)

```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Netlify

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

#### GitHub Pages

```bash
npm install -g gh-pages
npm run deploy
```

### Backend Deployment

Backend server (`backend/index.js`) cần deploy riêng:

```bash
# Deploy to Heroku
heroku create mia-logistics-backend
cd backend
git push heroku main

# Hoặc deploy to Railway
cd backend
railway up

# Hoặc deploy to Render.com
# 1. Connect GitHub repository
# 2. Set root directory: backend
# 3. Build command: npm install
# 4. Start command: node index.js
# 5. Port: 5050
```

## 🔧 Troubleshooting

### Backend không start được

```bash
# Kiểm tra port có bị chiếm
lsof -ti:5050 | xargs kill -9

# Kiểm tra service account
ls -la server/sinuous-aviary-474820-e3-c442968a0e87.json

# Check logs
tail -f logs/backend-startup.log
```

### Frontend compile errors

```bash
# Clean và reinstall
rm -rf node_modules package-lock.json
npm install

# Check linter errors
npm run lint
```

### Google Sheets không kết nối được

1. Kiểm tra service account email có được share không
2. Kiểm tra spreadsheet ID trong `backend/.env`
3. Test connection:

   ```bash
   curl http://localhost:5050/api/google-sheets-auth/status
   curl http://localhost:5050/api/sheets/info
   ```

4. Verify service account file:

   ```bash
   ls -la backend/sinous-aviary-474820-e3-c442968a0e87.json
   ```

### Telegram không gửi được

1. Kiểm tra bot token trong `.env`
2. Kiểm tra chat ID
3. Test: `curl -X POST http://localhost:5050/api/alerts/test-telegram -d '{"message":"test"}'`

## 📞 Hỗ trợ

### Tài khoản Demo

- **Admin**: <admin@mialogistics.com> / admin123

### Liên hệ

- **Email**: <kho.1@mia.vn>
- **GitHub**: <https://github.com/your-username/mia-logistics-manager>

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🤝 Contributing

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 🔧 Backend API

### API Routes (16 modules - 100% Complete)

#### Health & Status

- `GET /api/health` - Health check
- `GET /api/google-sheets-auth/status` - Google Sheets connection status
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/sheets` - All sheets information

#### Authentication (authRoutes.js)

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `PUT /api/auth/change-password` - Đổi mật khẩu
- `GET /api/auth/users` - Danh sách users (Admin)
- `GET /api/auth/users/:id` - Chi tiết user
- `PUT /api/auth/users/:id` - Cập nhật user
- `POST /api/auth/init` - Khởi tạo auth sheets

#### Core Business

- `GET/POST/PUT/DELETE /api/carriers` - Carriers CRUD
- `GET/POST/PUT/DELETE /api/transfers` - Transfers CRUD
- `GET/POST/PUT/DELETE /api/locations` - Locations CRUD
- `GET/POST/PUT/DELETE /api/transport-requests` - Transport Requests CRUD

#### Settings & Inbound

- `GET/POST /api/settings/volume-rules` - Volume rules
- `GET/POST/PUT/DELETE /api/inbound/domestic` - Inbound Domestic CRUD
- `GET/POST/PUT/DELETE /api/inbound/international` - Inbound International CRUD (70+ cột)

#### RBAC System

- `GET/POST/PUT/DELETE /api/roles` - Roles CRUD
- `GET/POST/PUT/DELETE /api/employees` - Employees CRUD
- `GET/POST/DELETE /api/role-permissions` - Role Permissions

#### Utilities

- `GET /api/sheets/info` - Google Sheets info
- `POST /api/telegram/test` - Test Telegram notification
- `POST /api/telegram/send` - Send Telegram message

**Total:** 50+ API endpoints từ 16 route modules

## 📝 Changelog

### v2.1.0 (2025-10-31)

- ✅ **Backend API Routes - 100% Complete**: 16 route modules đã triển khai đầy đủ
  - Authentication & User Management (9 endpoints): login, register, logout, users CRUD, change-password, init
  - Core Business: Carriers, Transfers, Locations, Transport Requests (full CRUD)
  - Settings & Volume Rules: Volume calculation rules management
  - Inbound: Domestic & International (full CRUD với 54+ cột cho International)
  - RBAC System: Roles, Employees, Role Permissions (full CRUD)
  - Admin Operations: Stats, Sheets info
  - Utilities: Google Sheets, Telegram notifications, Google Sheets Auth status
- ✅ **50+ API Endpoints**: Tất cả endpoints đã được implement và test
- ✅ **Frontend Pages - Hoàn thiện**:
  - Employees Management (`/employees`) - CRUD với Grid/Table view
  - Authorization System (`/settings/roles`, `/settings/permissions`, `/settings/users`)
  - Locations (`/transport/locations-saved`) - Địa điểm lưu
  - Tất cả routes đã được bảo vệ với RBAC
- ✅ **Google Sheets**: 25 tabs connected và working
- ✅ **Backend Server**: Express.js on port 5050
- ✅ **Telegram**: Notifications configured và working
- ✅ **Google Drive**: Folder configured
- ✅ **Apps Script**: Distance calculator working
- ✅ **Production Ready**: Deployment configuration đầy đủ
- ✅ **Session Management**: Timeout warning, smart extension, activity monitoring
- ⚠️ **Email**: SendGrid API key cần update
- 🎨 **Sidebar**: Collapse/expand functionality với đầy đủ menu items
- 📊 **Logs**: Auto-logging to `logs/` directory
- 🔄 **Scripts**: Startup scripts với Telegram notification

### v1.0.0 (2024-01-15)

- ✨ Initial release
- 🚀 Core logistics management features
- 🔐 Google Workspace integration
- 🌐 Vietnamese localization
- 📱 Responsive design
- 🔒 RBAC security system

---

**Note**: Version hiện tại của dự án là **v2.1.0** (theo backend router.js và app.js). Package.json version (1.0.0) là version của frontend package, không phải version của toàn bộ hệ thống.

## 🔧 Services Status

| Service | Status | Note |
|---------|--------|------|
| Google Sheets | ✅ Connected | 25 tabs accessible |
| Telegram | ✅ Connected | Bot token configured |
| Google Drive | ⚠️ Configured | Need to share folder |
| Apps Script | ✅ Working | Distance calculator |
| Email | ⚠️ Configured | SendGrid key needs update |
| Backend API | ✅ Running | Port 5050, 16 route modules |
| Backend Routes | ✅ Complete | 50+ endpoints (100%) |
| Frontend | ✅ Running | Port 3000 |
| AI Service | ⚠️ Optional | Port 8000 (nếu deploy) |

---

## 🎉 Credits

Made with ❤️ for Vietnamese logistics industry
