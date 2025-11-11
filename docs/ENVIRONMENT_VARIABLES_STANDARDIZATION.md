# Chuẩn Hóa Biến Môi Trường - MIA Logistics Manager

## Tổng Quan

Tài liệu này mô tả việc chuẩn hóa các biến môi trường trong dự án MIA Logistics Manager để tránh trùng lặp và đảm bảo tính nhất quán.

## Vấn Đề Hiện Tại

Trước khi chuẩn hóa, dự án có các vấn đề:

- Cùng một loại cấu hình nhưng có nhiều tên biến khác nhau
- Khó quản lý và bảo trì
- Dễ gây nhầm lẫn khi phát triển
- Không có cấu trúc rõ ràng

## Cấu Trúc Chuẩn Hóa

### 1. Google Services

#### Google API Keys (Dùng Chung)

```bash
# API Key chung cho tất cả Google services
REACT_APP_GOOGLE_API_KEY=your-google-api-key-here
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
```

#### Google Sheets

```bash
# Cấu hình Google Sheets
REACT_APP_ENABLE_GOOGLE_SHEETS=true
REACT_APP_GOOGLE_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_PROJECT_ID=your-project-id
```

#### Google Drive

```bash
# Cấu hình Google Drive
REACT_APP_ENABLE_GOOGLE_DRIVE=true
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
GOOGLE_DRIVE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

#### Google Apps Script

```bash
# Cấu hình Google Apps Script
REACT_APP_ENABLE_GOOGLE_APPS_SCRIPT=true
REACT_APP_GOOGLE_APPS_SCRIPT_ID=your-apps-script-id
REACT_APP_APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### 2. Authentication & Security

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Session & Encryption
REACT_APP_ENCRYPTION_KEY=your-encryption-key-here
REACT_APP_SESSION_TIMEOUT=3600000
SESSION_TIMEOUT=3600000

# Password Security
BCRYPT_ROUNDS=12
```

### 3. Email Services

```bash
# SendGrid (Primary)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@mia-logistics.com
SENDGRID_FROM_NAME=MIA Logistics Manager

# SMTP (Fallback)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Telegram Bot

```bash
# Telegram Configuration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/webhook/telegram
```

### 5. Rate Limiting & Security

```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_ATTEMPTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
CORS_ORIGIN=http://localhost:3000

# API Keys
API_KEYS=your-api-key-1,your-api-key-2
```

### 6. Logging & Monitoring

```bash
# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
REACT_APP_LOG_LEVEL=info
REACT_APP_LOG_TO_CONSOLE=true
REACT_APP_LOG_TO_GOOGLE_SHEETS=false
REACT_APP_LOG_TO_LOCAL_STORAGE=true

# Performance Monitoring
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
REACT_APP_ENABLE_MOCK_MODE_MESSAGES=true

# Analytics & Monitoring
REACT_APP_GA_MEASUREMENT_ID=GA_MEASUREMENT_ID
REACT_APP_ENABLE_GA=false
REACT_APP_SENTRY_DSN=YOUR_SENTRY_DSN_HERE
REACT_APP_ENABLE_SENTRY=false
```

## Mapping Các Biến Cũ

### Google Sheets

| Biến Cũ | Biến Mới Chuẩn |
|---------|----------------|
| `SHEET_ID` | `REACT_APP_GOOGLE_SPREADSHEET_ID` |
| `GOOGLE_SHEETS_SHEET_ID` | `REACT_APP_GOOGLE_SPREADSHEET_ID` |
| `SERVICE_ACCOUNT_KEY` | `GOOGLE_SHEETS_PRIVATE_KEY` |
| `GOOGLE_SHEETS_SERVICE_ACCOUNT` | `GOOGLE_SHEETS_CLIENT_EMAIL` |

### Google Drive

| Biến Cũ | Biến Mới Chuẩn |
|---------|----------------|
| `GOOGLE_DRIVE_FOLDER` | `REACT_APP_GOOGLE_DRIVE_FOLDER_ID` |
| `DRIVE_FOLDER_ID` | `REACT_APP_GOOGLE_DRIVE_FOLDER_ID` |

### Google Apps Script

| Biến Cũ | Biến Mới Chuẩn |
|---------|----------------|
| `APPS_SCRIPT_ID` | `REACT_APP_GOOGLE_APPS_SCRIPT_ID` |
| `GOOGLE_SCRIPT_ID` | `REACT_APP_GOOGLE_APPS_SCRIPT_ID` |

### Email

| Biến Cũ | Biến Mới Chuẩn |
|---------|----------------|
| `EMAIL_FROM` | `SENDGRID_FROM_EMAIL` |
| `FROM_EMAIL_ADDRESS` | `SENDGRID_FROM_EMAIL` |
| `EMAIL_FROM_NAME` | `SENDGRID_FROM_NAME` |
| `FROM_NAME` | `SENDGRID_FROM_NAME` |

### Telegram

| Biến Cũ | Biến Mới Chuẩn |
|---------|----------------|
| `TELEGRAM_TOKEN` | `TELEGRAM_BOT_TOKEN` |
| `BOT_TOKEN` | `TELEGRAM_BOT_TOKEN` |
| `TELEGRAM_CHAT` | `TELEGRAM_CHAT_ID` |
| `BOT_CHAT_ID` | `TELEGRAM_CHAT_ID` |

### JWT & Security

| Biến Cũ | Biến Mới Chuẩn |
|---------|----------------|
| `JWT_KEY` | `JWT_SECRET` |
| `SECRET_KEY` | `JWT_SECRET` |
| `AUTH_SECRET` | `JWT_SECRET` |
| `SESSION_KEY` | `REACT_APP_ENCRYPTION_KEY` |
| `ENCRYPTION_SECRET` | `REACT_APP_ENCRYPTION_KEY` |

## Quy Tắc Đặt Tên

### 1. Prefix Rules

- `REACT_APP_*`: Biến được expose cho frontend
- Không có prefix: Biến chỉ có trong backend
- `GOOGLE_*`: Biến cấu hình Google services
- `SENDGRID_*`: Biến cấu hình SendGrid
- `SMTP_*`: Biến cấu hình SMTP
- `TELEGRAM_*`: Biến cấu hình Telegram

### 2. Naming Convention

- Sử dụng UPPER_CASE với underscore
- Tên biến phải mô tả rõ ràng mục đích
- Tránh viết tắt không rõ ràng
- Nhóm các biến liên quan với prefix chung

### 3. Structure Rules

- Các biến cấu hình service phải có `ENABLE_*` để bật/tắt
- Các biến API key phải có `*_API_KEY`
- Các biến email phải có `*_FROM_EMAIL` và `*_FROM_NAME`
- Các biến timeout phải có `*_TIMEOUT`

## Script Migration

Sử dụng script `scripts/standardize-env-vars.js` để tự động chuẩn hóa:

```bash
# Chạy script chuẩn hóa
node scripts/standardize-env-vars.js
```

Script sẽ:

1. Tìm tất cả file `.js`, `.jsx`, `.ts`, `.tsx`
2. Thay thế các biến cũ bằng biến mới
3. Tạo báo cáo thay đổi
4. Tạo file `.env.standardized` mẫu

## File Cấu Hình

### 1. `.env.standardized`

File mẫu chứa tất cả biến môi trường chuẩn hóa

### 2. `server/src/config/services.js`

File cấu hình services sử dụng biến chuẩn hóa

### 3. `env.standardized`

File tham khảo cho development

## Lợi Ích

### 1. Tính Nhất Quán

- Tất cả biến môi trường có cấu trúc rõ ràng
- Dễ dàng tìm kiếm và quản lý
- Tránh trùng lặp và xung đột

### 2. Dễ Bảo Trì

- Cấu trúc logic và có tổ chức
- Dễ dàng thêm/sửa/xóa biến
- Script tự động hóa việc migration

### 3. Developer Experience

- Tài liệu rõ ràng và đầy đủ
- Naming convention nhất quán
- Dễ dàng hiểu và sử dụng

## Best Practices

### 1. Development

- Sử dụng `.env.local` cho development
- Không commit file `.env` vào git
- Sử dụng `.env.example` làm template

### 2. Production

- Sử dụng `.env.production` cho production
- Cấu hình biến môi trường trên server
- Sử dụng secret management tools

### 3. Security

- Không expose sensitive data cho frontend
- Sử dụng `REACT_APP_*` prefix cẩn thận
- Validate tất cả biến môi trường

## Troubleshooting

### 1. Biến Không Được Nhận Diện

- Kiểm tra tên biến có đúng không
- Kiểm tra file `.env` có được load không
- Restart server sau khi thay đổi

### 2. Biến Bị Trùng Lặp

- Sử dụng script chuẩn hóa
- Kiểm tra file cấu hình
- Xóa biến cũ không cần thiết

### 3. Frontend Không Nhận Biến

- Đảm bảo biến có prefix `REACT_APP_`
- Restart development server
- Kiểm tra build process

## Kết Luận

Việc chuẩn hóa biến môi trường giúp:

- Tăng tính nhất quán và dễ bảo trì
- Cải thiện developer experience
- Giảm lỗi và xung đột
- Dễ dàng scale và mở rộng

Sử dụng script migration và tuân thủ naming convention để đảm bảo tính nhất quán trong toàn bộ dự án.
