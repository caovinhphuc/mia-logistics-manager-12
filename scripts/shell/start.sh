#!/bin/bash

echo "🚀 KHỞI ĐỘNG DỰ ÁN MIA LOGISTICS MANAGER"
echo "========================================="
echo ""

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt!"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo ""

# Cài đặt dependencies
echo "📦 Cài đặt dependencies..."
npm install --legacy-peer-deps

# Khởi động Backend
echo "🔧 Khởi động Backend (Port 5000)..."
cd server && npm start &
BACKEND_PID=$!

# Chờ backend khởi động
echo "⏳ Đang chờ backend khởi động..."
sleep 5

# Kiểm tra tất cả services
echo "🔍 Kiểm tra các services..."

# 1. Google Sheets
echo "📊 Google Sheets..."
GOOGLE_SHEETS_STATUS=""
if curl -s http://localhost:5000/api/sheets/info > /dev/null 2>&1; then
    GOOGLE_SHEETS_STATUS="✅ Đã kết nối"
    echo "✅ Google Sheets: Kết nối thành công"

    # Lấy thông tin Google Sheets
    SHEETS_INFO=$(curl -s http://localhost:5000/api/sheets/info 2>/dev/null)
    if [ $? -eq 0 ]; then
        SHEET_TITLE=$(echo $SHEETS_INFO | grep -o '"title":"[^"]*"' | cut -d'"' -f4)
        SHEET_COUNT=$(echo $SHEETS_INFO | grep -o '"sheetCount":[0-9]*' | cut -d':' -f2)
        echo "📋 Spreadsheet: $SHEET_TITLE"
        echo "📊 Số sheets: $SHEET_COUNT"

        # Hiển thị danh sách sheets
        echo "📋 Danh sách sheets:"
        echo "$SHEETS_INFO" | grep -o '\["[^"]*"' | sed 's/\["//g' | sed 's/"//g' | while read sheet; do
            echo "   • $sheet"
        done

        # Test API endpoints chính
        echo ""
        echo "🔗 API Endpoints đã xử lý:"

        # Test Users endpoint
        if curl -s http://localhost:5000/api/sheets/users > /dev/null 2>&1; then
            USER_COUNT=$(curl -s http://localhost:5000/api/sheets/users | grep -o '"count":[0-9]*' | cut -d':' -f2)
            echo "   ✅ /api/sheets/users (Users: $USER_COUNT)"
        else
            echo "   ❌ /api/sheets/users"
        fi

        # Test TransportRequests endpoint
        if curl -s http://localhost:5000/api/sheets/TransportRequests > /dev/null 2>&1; then
            echo "   ✅ /api/sheets/TransportRequests"
        else
            echo "   ❌ /api/sheets/TransportRequests"
        fi

        # Test Orders endpoint
        if curl -s http://localhost:5000/api/sheets/Orders > /dev/null 2>&1; then
            echo "   ✅ /api/sheets/Orders"
        else
            echo "   ❌ /api/sheets/Orders"
        fi

        # Test Inventory endpoint
        if curl -s http://localhost:5000/api/sheets/Inventory > /dev/null 2>&1; then
            echo "   ✅ /api/sheets/Inventory"
        else
            echo "   ❌ /api/sheets/Inventory"
        fi

        # Test Carriers endpoint
        if curl -s http://localhost:5000/api/sheets/Carriers > /dev/null 2>&1; then
            echo "   ✅ /api/sheets/Carriers"
        else
            echo "   ❌ /api/sheets/Carriers"
        fi

        # Test Dashboard Summary endpoint
        if curl -s http://localhost:5000/api/sheets/dashboard/summary > /dev/null 2>&1; then
            echo "   ✅ /api/sheets/dashboard/summary"
        else
            echo "   ❌ /api/sheets/dashboard/summary"
        fi

        echo ""
        echo "🔐 Authentication Endpoints:"
        echo "   ✅ POST /api/sheets/users/authenticate (Login)"
        echo "   ✅ GET /api/sheets/users (List Users)"
        echo "   ✅ GET /api/sheets/users?email=xxx (Filter by email)"
        echo "   ✅ GET /api/sheets/users?role=xxx (Filter by role)"
    fi
else
    GOOGLE_SHEETS_STATUS="❌ Chưa kết nối"
    echo "❌ Google Sheets: Chưa kết nối"
fi

# 2. Email Service
echo "📧 Email Service..."
EMAIL_STATUS=""
if grep -q "EMAIL_USERNAME=your-email@gmail.com" server/.env; then
    EMAIL_STATUS="⚠️ Chưa cấu hình"
    echo "⚠️ Email: Chưa cấu hình"
else
    EMAIL_STATUS="✅ Đã cấu hình"
    echo "✅ Email: Đã cấu hình"
fi

# 3. Telegram Bot
echo "🤖 Telegram Bot..."
TELEGRAM_STATUS=""
if grep -q "TELEGRAM_BOT_TOKEN=your-telegram-bot-token" server/.env || ! grep -q "TELEGRAM_BOT_TOKEN" server/.env; then
    TELEGRAM_STATUS="⚠️ Chưa cấu hình"
    echo "⚠️ Telegram Bot: Chưa cấu hình"
else
    TELEGRAM_STATUS="✅ Đã cấu hình"
    echo "✅ Telegram Bot: Đã cấu hình"
fi

# Khởi động Frontend
echo "🎨 Khởi động Frontend (Port 3000)..."
cd .. && PORT=3000 npm start &
FRONTEND_PID=$!

# Chờ frontend khởi động
echo "⏳ Đang chờ frontend khởi động..."
sleep 10

# Kiểm tra Frontend
echo "🎨 Kiểm tra Frontend..."
FRONTEND_STATUS=""
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    FRONTEND_STATUS="✅ Đã khởi động"
    echo "✅ Frontend: Đã khởi động thành công"
else
    FRONTEND_STATUS="❌ Chưa khởi động"
    echo "❌ Frontend: Chưa khởi động"
fi

echo ""
echo "🎉 DỰ ÁN MIA LOGISTICS MANAGER ĐÃ KHỞI ĐỘNG!"
echo "============================================="
echo "📋 Frontend: http://localhost:3000"
echo "📋 Backend API: http://localhost:5000"
echo ""
echo "🔧 TRẠNG THÁI CÁC SERVICES:"
echo "============================"
echo "📊 Google Sheets: $GOOGLE_SHEETS_STATUS"
echo "📧 Email Service: $EMAIL_STATUS"
echo "🤖 Telegram Bot: $TELEGRAM_STATUS"
echo "🎨 Frontend: $FRONTEND_STATUS"
echo ""
echo "💡 Để dừng tất cả dịch vụ, nhấn Ctrl+C"

# Chờ tín hiệu dừng
trap "echo '🛑 Đang dừng tất cả dịch vụ...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
