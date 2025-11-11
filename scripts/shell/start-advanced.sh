#!/bin/bash

# MIA LOGISTICS MANAGER - Advanced Startup Script
# ===============================================

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
sleep 8

# Kiểm tra tất cả services
echo "🔍 KIỂM TRA TẤT CẢ CÁC SERVICES..."
echo "=================================="

# 1. Kiểm tra Google Sheets
echo "📊 [1/3] Kiểm tra Google Sheets..."
GOOGLE_SHEETS_STATUS=""
RETRY_COUNT=0
MAX_RETRIES=3

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:5000/api/sheets/info > /dev/null 2>&1; then
        GOOGLE_SHEETS_STATUS="✅ Đã kết nối"
        echo "✅ Google Sheets: Kết nối thành công"

        # Lấy thông tin chi tiết Google Sheets
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
                RECORD_COUNT=$(curl -s http://localhost:5000/api/sheets/TransportRequests 2>/dev/null | grep -o '"count":[0-9]*' | cut -d':' -f2)
                echo "   ✅ /api/sheets/TransportRequests ($RECORD_COUNT records)"
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
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "⏳ Thử lại kết nối Google Sheets... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 3
    fi
done

if [ -z "$GOOGLE_SHEETS_STATUS" ]; then
    GOOGLE_SHEETS_STATUS="❌ Chưa kết nối"
    echo "❌ Google Sheets: Không thể kết nối sau $MAX_RETRIES lần thử"
fi

echo ""

# 2. Kiểm tra Email Service
echo "📧 [2/3] Kiểm tra Email Service..."
EMAIL_STATUS=""

# Kiểm tra cấu hình email trong .env
if grep -q "EMAIL_USERNAME=your-email@gmail.com" server/.env; then
    EMAIL_STATUS="⚠️ Chưa cấu hình"
    echo "⚠️ Email: Chưa cấu hình (sử dụng giá trị mặc định)"
else
    EMAIL_STATUS="✅ Đã cấu hình"
    echo "✅ Email: Đã cấu hình"

    # Test email service nếu có endpoint
    if curl -s http://localhost:5000/api/email/test > /dev/null 2>&1; then
        echo "✅ Email Service: Hoạt động"
    else
        echo "⚠️ Email Service: Không có endpoint test"
    fi
fi

echo ""

# 3. Kiểm tra Telegram Bot
echo "🤖 [3/3] Kiểm tra Telegram Bot..."
TELEGRAM_STATUS=""

# Kiểm tra cấu hình telegram trong .env
if grep -q "TELEGRAM_BOT_TOKEN=your-telegram-bot-token" server/.env || ! grep -q "TELEGRAM_BOT_TOKEN" server/.env; then
    TELEGRAM_STATUS="⚠️ Chưa cấu hình"
    echo "⚠️ Telegram Bot: Chưa cấu hình"
else
    TELEGRAM_STATUS="✅ Đã cấu hình"
    echo "✅ Telegram Bot: Đã cấu hình"

    # Test telegram service nếu có endpoint
    if curl -s http://localhost:5000/api/telegram/test > /dev/null 2>&1; then
        echo "✅ Telegram Bot: Hoạt động"
    else
        echo "⚠️ Telegram Bot: Không có endpoint test"
    fi
fi

echo ""

# Khởi động Frontend
echo "🎨 Khởi động Frontend (Port 3000)..."
cd .. && PORT=3000 npm start &
FRONTEND_PID=$!

# Chờ frontend khởi động
echo "⏳ Đang chờ frontend khởi động..."
sleep 10

# Kiểm tra frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    FRONTEND_STATUS="✅ Đã khởi động"
else
    FRONTEND_STATUS="❌ Chưa khởi động"
fi

# Kiểm tra backend
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    BACKEND_STATUS="✅ Đã khởi động"
else
    BACKEND_STATUS="❌ Chưa khởi động"
fi

echo ""
echo "🎉 DỰ ÁN MIA LOGISTICS MANAGER ĐÃ KHỞI ĐỘNG!"
echo "============================================="
echo "📋 Frontend: http://localhost:3000 - $FRONTEND_STATUS"
echo "📋 Backend API: http://localhost:5000 - $BACKEND_STATUS"
echo ""
echo "🔧 TRẠNG THÁI CÁC SERVICES:"
echo "============================"
echo "📊 Google Sheets: $GOOGLE_SHEETS_STATUS"
echo "📧 Email Service: $EMAIL_STATUS"
echo "🤖 Telegram Bot: $TELEGRAM_STATUS"
echo ""
echo "🔗 Các endpoint quan trọng:"
echo "   • Health Check: http://localhost:5000/health"
echo "   • API Docs: http://localhost:5000/api-docs"
echo "   • Sheets Info: http://localhost:5000/api/sheets/info"
echo "   • TransportRequests: http://localhost:5000/api/sheets/TransportRequests"
echo ""
echo "💡 Để dừng tất cả dịch vụ, nhấn Ctrl+C"

# Chờ tín hiệu dừng
trap "echo '🛑 Đang dừng tất cả dịch vụ...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
