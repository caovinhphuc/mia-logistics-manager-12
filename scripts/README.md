# Scripts Directory

## 📁 Cấu Trúc Thư Mục

### core/

Core utilities và services chính:

- `standardize-env-vars.js` - Chuẩn hóa biến môi trường
- `health-check.js` - Kiểm tra sức khỏe hệ thống
- `email-notifier.js` - Gửi email thông báo
- `telegram-notifier.js` - Gửi Telegram thông báo
- `system-analysis.js` - Phân tích hệ thống
- `securityHardening.js` - Bảo mật hệ thống

### tests/

Test scripts cho các services:

- `test-services.js` - Test tất cả services
- `testApiService.js` - Test API service
- `testAuthentication.js` - Test authentication
- `testEmailService.js` - Test email service
- `testGoogleConnection.js` - Test Google connection
- `testTelegramConnection.js` - Test Telegram connection

### deploy/

Deployment scripts:

- `deploy.js` - Deploy chính
- `deployProduction.js` - Deploy production

### setup/

Setup và configuration scripts:

- `setup.js` - Setup chính
- `setupGoogleAPI.js` - Setup Google API
- `setupMonitoring.js` - Setup monitoring
- `setupCICD.js` - Setup CI/CD
- `setupGCP.js` - Setup Google Cloud Platform

### checks/

Validation và check scripts:

- `check-system-status.js` - Check trạng thái hệ thống
- `checkAllConfigs.js` - Check tất cả configs
- `checkGoogleSetup.js` - Check Google setup
- `connection-checker.js` - Check connections

### shell/

Shell scripts:

- Các file .sh được gộp vào đây

## 🚀 Sử Dụng

```bash
# Chạy health check
node core/health-check.js

# Test services
node tests/test-services.js

# Deploy
node deploy/deploy.js

# Setup
node setup/setup.js
```

## 📝 Ghi Chú

- Tất cả files tạm thời, debug, và trùng lặp đã được xóa
- Files được tổ chức theo chức năng
- Shell scripts được gộp vào thư mục shell/
