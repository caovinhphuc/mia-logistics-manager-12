#!/bin/bash

# MIA Logistics Manager - Switch to Real Data Mode
# ================================================

echo "🔄 Chuyển đổi sang chế độ dữ liệu thực tế..."
echo "============================================="

# Backup current .env.local
if [ -f ".env.local" ]; then
    echo "📋 Backup .env.local..."
    cp .env.local .env.local.backup
fi

# Create new .env.local for real data
echo "📝 Tạo cấu hình cho dữ liệu thực tế..."
cat > .env.local << 'EOF'
# MIA LOGISTICS MANAGER - Real Data Mode
# ======================================

# Application Configuration
NODE_ENV=development
REACT_APP_NAME=MIA Logistics Manager
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=development

# Google Cloud Configuration - ENABLED
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_GOOGLE_API_KEY=your-google-api-key
REACT_APP_GOOGLE_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your-drive-folder-id
REACT_APP_GOOGLE_APPS_SCRIPT_ID=your-apps-script-id

# Feature Flags - Sử dụng dữ liệu thực tế
REACT_APP_USE_MOCK_DATA=false
REACT_APP_ENABLE_GOOGLE_SHEETS=true
REACT_APP_ENABLE_GOOGLE_DRIVE=true
REACT_APP_ENABLE_GOOGLE_APPS_SCRIPT=true

# Performance Monitoring
REACT_APP_PERFORMANCE_MONITORING=true
REACT_APP_LOG_LEVEL=info
REACT_APP_LOG_TO_CONSOLE=true
REACT_APP_LOG_TO_GOOGLE_SHEETS=true
REACT_APP_ANALYTICS_ENABLED=true

# Security
REACT_APP_ERROR_REPORTING=true
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

echo "✅ Đã chuyển sang chế độ dữ liệu thực tế!"
echo ""
echo "📋 Cấu hình hiện tại:"
echo "   - Mock Data: DISABLED"
echo "   - Google Sheets: ENABLED"
echo "   - Google Drive: ENABLED"
echo "   - Google Apps Script: ENABLED"
echo ""
echo "⚠️  Lưu ý:"
echo "   - Cần cấu hình Google API credentials thực tế"
echo "   - Cần có dữ liệu trong Google Sheets"
echo "   - Có thể gặp lỗi nếu chưa cấu hình đầy đủ"
echo ""
echo "🚀 Để khởi động:"
echo "   npm start"
echo ""
echo "🔄 Để quay lại mock mode:"
echo "   ./switch-to-mock-data.sh"
