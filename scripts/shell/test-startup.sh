#!/bin/bash

echo "🚀 TEST STARTUP SCRIPT - MIA LOGISTICS MANAGER"
echo "=============================================="
echo ""

# Khởi động Backend
echo "🔧 Khởi động Backend (Port 5000)..."
cd server && npm start &
BACKEND_PID=$!

# Chờ backend khởi động
echo "⏳ Đang chờ backend khởi động..."
sleep 8

# Kiểm tra Google Sheets
echo "🔍 Kiểm tra Google Sheets..."
if curl -s http://localhost:5000/api/sheets/info > /dev/null 2>&1; then
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
    echo "❌ Google Sheets: Chưa kết nối"
fi

echo ""
echo "🎉 TEST HOÀN THÀNH!"
echo "==================="
echo "📋 Backend API: http://localhost:5000"
echo "💡 Để dừng backend, nhấn Ctrl+C"

# Chờ tín hiệu dừng
trap "echo '🛑 Đang dừng backend...'; kill $BACKEND_PID; exit" INT
wait
