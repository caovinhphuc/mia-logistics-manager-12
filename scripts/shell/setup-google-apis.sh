#!/bin/bash

# MIA Logistics Manager - Google APIs Setup Script
# Hướng dẫn setup Google APIs theo GOOGLE_SETUP_GUIDE.md

echo "🚀 MIA Logistics Manager - Google APIs Setup"
echo "============================================="
echo ""

# Kiểm tra file .env
if [ ! -f ".env" ]; then
    echo "📝 Tạo file .env..."
    cat > .env << EOF
# Google APIs Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_actual_client_id_here
REACT_APP_GOOGLE_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As
REACT_APP_GOOGLE_APPS_SCRIPT_ID=your_actual_script_id_here
REACT_APP_APPS_SCRIPT_WEB_APP_URL=your_web_app_url_here

# Feature Flags
REACT_APP_USE_MOCK_DATA=false
REACT_APP_ENABLE_GOOGLE_SHEETS=true
REACT_APP_ENABLE_GOOGLE_APPS_SCRIPT=true
REACT_APP_ENABLE_GOOGLE_DRIVE=true

# Development Configuration
NODE_ENV=development
REACT_APP_ENV=development
EOF
    echo "✅ File .env đã được tạo"
else
    echo "⚠️  File .env đã tồn tại"
fi

echo ""
echo "📋 Hướng dẫn setup Google APIs:"
echo "================================"
echo ""
echo "1. 🌐 Tạo Google Cloud Project:"
echo "   - Truy cập: https://console.cloud.google.com"
echo "   - Tạo project mới: 'MIA Logistics Manager'"
echo ""
echo "2. 🔑 Enable APIs:"
echo "   - Google Sheets API"
echo "   - Google Drive API"
echo "   - Google Apps Script API"
echo "   - Google Maps JavaScript API"
echo ""
echo "3. 🔐 Tạo OAuth 2.0 Credentials:"
echo "   - Vào 'Credentials' > 'Create Credentials' > 'OAuth 2.0 Client ID'"
echo "   - Application type: 'Web application'"
echo "   - Name: 'MIA Logistics Manager'"
echo ""
echo "4. 🌍 Cấu hình Authorized origins:"
echo "   - http://localhost:3000"
echo "   - http://localhost:3001"
echo "   - https://your-domain.com"
echo ""
echo "5. 🔄 Cấu hình Authorized redirect URIs:"
echo "   - http://localhost:3000"
echo "   - http://localhost:3001"
echo "   - https://your-domain.com"
echo ""
echo "6. 📊 Tạo Google Sheets:"
echo "   - Đi tới: https://sheets.google.com"
echo "   - Tạo spreadsheet mới: 'MIA Logistics Data'"
echo "   - Copy Spreadsheet ID từ URL"
echo ""
echo "7. 📝 Cập nhật file .env:"
echo "   - Thay thế 'your_actual_client_id_here' bằng Client ID thực"
echo "   - Thay thế 'your_actual_script_id_here' bằng Apps Script ID"
echo "   - Thay thế 'your_web_app_url_here' bằng Web App URL"
echo ""
echo "8. 🚀 Test Integration:"
echo "   - Chạy: npm start"
echo "   - Truy cập /login để test Google login"
echo "   - Kiểm tra dữ liệu từ Google Sheets"
echo ""
echo "⚠️  Lưu ý quan trọng:"
echo "   - Không commit file .env vào Git"
echo "   - Đảm bảo Google Sheets đã được share với service account"
echo "   - Kiểm tra API quotas và billing"
echo ""
echo "📚 Chi tiết đầy đủ xem: GOOGLE_SETUP_GUIDE.md"
echo ""
echo "✅ Setup script hoàn thành!"
echo "   Tiếp theo: Cấu hình Google Cloud Console và cập nhật file .env"
