# 🔧 Hướng Dẫn Cấu Hình Môi Trường - MIA Logistics Manager

## 📋 Tổng Quan

Tài liệu này hướng dẫn cấu hình môi trường phát triển và production cho hệ thống MIA Logistics Manager.

## 🎯 Yêu Cầu Hệ Thống

### Phần Mềm Cần Thiết
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **Git**: Để quản lý mã nguồn
- **Trình duyệt**: Chrome/Firefox/Safari (phiên bản mới nhất)

### Tài Khoản & API Keys
- **Google Cloud Platform**: Service Account với quyền truy cập Google Sheets API
- **Google Sheets**: Quyền truy cập vào các sheets dữ liệu

## ⚙️ Cài Đặt Nhanh

### 1. Clone Project

```bash
git clone <repository-url>
cd mia-logistics-manager
```

### 2. Khởi Tạo Git Repository (nếu chưa có)

```bash
git init
```

### 3. Cài Đặt Dependencies

```bash
# Cài đặt frontend dependencies
npm install

# Cài đặt backend dependencies
cd server
npm install
cd ..
```

### 4. Cấu Hình Environment Variables

#### Frontend (.env)

Tạo file `.env` ở thư mục gốc:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5050
REACT_APP_BACKEND_URL=http://localhost:5050

# Google Sheets Configuration
REACT_APP_GOOGLE_SHEETS_API_KEY=your_api_key_here
REACT_APP_SPREADSHEET_ID=your_spreadsheet_id_here

# Environment
NODE_ENV=development
REACT_APP_ENV=development

# Port Configuration
PORT=3000
FRONTEND_PORT=3000
```

#### Backend (server/.env)

Tạo file `server/.env`:

```bash
# Server Configuration
PORT=5050
BACKEND_PORT=5050
NODE_ENV=development

# Google Sheets API
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
SPREADSHEET_ID=your_spreadsheet_id_here

# Security
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5050
```

### 5. Cấu Hình Google Service Account

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo Service Account mới
3. Cấp quyền "Google Sheets API"
4. Tải xuống JSON key file
5. Đổi tên thành `service-account-key.json`
6. Copy vào thư mục `server/`

### 6. Cấu Hình Google Sheets

1. Tạo hoặc mở Google Sheets
2. Chia sẻ với email của Service Account (với quyền Editor)
3. Copy Spreadsheet ID từ URL
4. Cập nhật vào file `.env`

## 🚀 Khởi Động Ứng Dụng

### Development Mode

#### Cách 1: Sử dụng Script Tự Động

```bash
# Khởi động cả frontend và backend
./start-project.sh
```

#### Cách 2: Khởi Động Thủ Công

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm start
```

### Production Mode

```bash
# Build frontend
npm run build

# Serve production build
npm run serve

# Hoặc deploy lên Netlify/Vercel
./deploy.sh
```

## 🔍 Kiểm Tra Cấu Hình

### Chạy System Check

```bash
./system-check.sh
```

Script này sẽ kiểm tra:
- ✅ Node.js và npm version
- ✅ Dependencies đã cài đặt
- ✅ Environment variables
- ✅ Google API configuration
- ✅ Port availability
- ✅ File structure

### Test API Endpoints

```bash
./test-api-endpoints.sh
```

### Test Google Sheets Connection

```bash
node test-sheets-connection.js
```

## 📦 Cấu Trúc Thư Mục

```
mia-logistics-manager/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── utils/             # Utility functions
├── server/                # Backend source code
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Express middleware
│   └── service-account-key.json
├── public/                # Static files
├── build/                 # Production build
├── .env                   # Frontend environment variables
└── server/.env            # Backend environment variables
```

## 🔒 Bảo Mật

### Best Practices

1. **KHÔNG commit** file `.env` hoặc `service-account-key.json`
2. Sử dụng `.gitignore` để loại trừ sensitive files
3. Rotate JWT secrets định kỳ
4. Giới hạn CORS origins trong production
5. Sử dụng HTTPS trong production

### Environment Variables Bảo Mật

```bash
# Tạo JWT secret ngẫu nhiên
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Cập nhật vào .env
JWT_SECRET=<generated_secret>
```

## 🐛 Troubleshooting

### Lỗi Thường Gặp

#### 1. Husky không tìm thấy .git

```bash
# Khởi tạo Git repository
git init

# Cài đặt lại
npm install
```

#### 2. Port đã được sử dụng

```bash
# Kiểm tra process đang dùng port
lsof -i :3000
lsof -i :5050

# Kill process
kill -9 <PID>
```

#### 3. Google Sheets API lỗi 403

- Kiểm tra Service Account đã được share quyền truy cập
- Verify SPREADSHEET_ID đúng
- Kiểm tra Google Sheets API đã được enable

#### 4. Module not found

```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoring & Logs

### Development Logs

```bash
# Frontend logs
npm start  # Logs hiển thị trong terminal

# Backend logs
cd server && npm start  # Logs trong server terminal
```

### Production Logs

```bash
# Check logs trong thư mục logs/
tail -f logs/app.log
tail -f logs/error.log
```

## 🔄 Cập Nhật & Maintenance

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update packages
npm update

# Update to latest (cẩn thận với breaking changes)
npm install <package>@latest
```

### Database Migration (Google Sheets)

Khi thay đổi cấu trúc sheets:
1. Backup sheet hiện tại
2. Cập nhật column mappings trong code
3. Test với data mẫu
4. Deploy changes

## 📞 Hỗ Trợ

### Resources

- **README.md**: Hướng dẫn tổng quan
- **DEPLOYMENT_GUIDE.md**: Hướng dẫn deployment chi tiết
- **Scripts**: Các automation scripts trong thư mục gốc

### Liên Hệ

- Team: MIA Logistics Team
- Email: support@mia-logistics.com

---

**Lưu ý**: Tài liệu này được thiết kế theo nguyên tắc 80/20 - tập trung vào các thông tin cốt lõi và thường dùng nhất.

