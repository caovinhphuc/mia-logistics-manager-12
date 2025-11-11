#!/bin/bash

# MIA Logistics Manager - Switch to Mock Data Mode
# ================================================

echo "🔄 Chuyển đổi sang chế độ dữ liệu mock..."
echo "========================================="

# Backup current .env.local
if [ -f ".env.local" ]; then
    echo "📋 Backup .env.local..."
    cp .env.local .env.local.backup
fi

# Create new .env.local for mock data
echo "📝 Tạo cấu hình cho dữ liệu mock..."
cat > .env.local << 'EOF'
# MIA LOGISTICS MANAGER - Mock Data Mode
# ======================================

# Application Configuration
NODE_ENV=development
REACT_APP_NAME=MIA Logistics Manager
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=development

# Google Cloud Configuration - DISABLED
REACT_APP_GOOGLE_CLIENT_ID=disabled
REACT_APP_GOOGLE_API_KEY=disabled
REACT_APP_GOOGLE_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=disabled
REACT_APP_GOOGLE_APPS_SCRIPT_ID=disabled

# Feature Flags - Sử dụng dữ liệu mock
REACT_APP_USE_MOCK_DATA=true
REACT_APP_ENABLE_GOOGLE_SHEETS=false
REACT_APP_ENABLE_GOOGLE_DRIVE=false
REACT_APP_ENABLE_GOOGLE_APPS_SCRIPT=false

# Performance Monitoring
REACT_APP_PERFORMANCE_MONITORING=true
REACT_APP_LOG_LEVEL=info
REACT_APP_LOG_TO_CONSOLE=true
REACT_APP_LOG_TO_GOOGLE_SHEETS=false
REACT_APP_ANALYTICS_ENABLED=false

# Security
REACT_APP_ERROR_REPORTING=false
REACT_APP_SESSION_TIMEOUT=3600000

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_API_TIMEOUT=30000
REACT_APP_RETRY_ATTEMPTS=3

# CORS Configuration
REACT_APP_CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Build Configuration
GENERATE_SOURCEMAP=true
REACT_APP_BUILD_DATE=2024-01-20
EOF

echo "✅ Đã chuyển sang chế độ dữ liệu mock!"
echo ""
echo "📋 Cấu hình hiện tại:"
echo "   - Mock Data: ENABLED"
echo "   - Google Sheets: DISABLED"
echo "   - Google Drive: DISABLED"
echo "   - Google Apps Script: DISABLED"
echo ""
echo "🔐 Tài khoản đăng nhập:"
echo "   - admin@mia.vn / password (Admin)"
echo "   - manager@mia-logistics.com / password (Manager)"
echo "   - employee@mia-logistics.com / password (User)"
echo "   - driver@mia-logistics.com / password (Driver)"
echo "   - warehouse@mia-logistics.com / password (Warehouse Staff)"
echo ""
echo "🚀 Để khởi động:"
echo "   npm start"
echo ""
echo "🔄 Để chuyển sang real data:"
echo "   ./switch-to-real-data.sh"
