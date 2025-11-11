#!/bin/bash

# Test API Endpoints Script
# ==========================

echo "🧪 KIỂM TRA API ENDPOINTS"
echo "========================="
echo ""

# Kiểm tra backend có chạy không
if ! curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "❌ Backend chưa chạy! Vui lòng khởi động backend trước."
    echo "💡 Chạy: npm run start:backend"
    exit 1
fi

echo "✅ Backend đang chạy"
echo ""

# Test các API endpoints
echo "🔍 KIỂM TRA CÁC API ENDPOINTS..."
echo "================================="

# 1. Test Google Sheets info
echo "📊 [1/8] Test Google Sheets info..."
if curl -s http://localhost:5000/api/sheets/info > /dev/null 2>&1; then
    echo "✅ /api/sheets/info - OK"
else
    echo "❌ /api/sheets/info - FAILED"
fi

# 2. Test TransportRequests
echo "🚛 [2/8] Test TransportRequests..."
if curl -s http://localhost:5000/api/sheets/transport-requests > /dev/null 2>&1; then
    echo "✅ /api/sheets/transport-requests - OK"
else
    echo "❌ /api/sheets/transport-requests - FAILED"
fi

# 3. Test Orders
echo "📦 [3/8] Test Orders..."
if curl -s http://localhost:5000/api/sheets/orders > /dev/null 2>&1; then
    echo "✅ /api/sheets/orders - OK"
else
    echo "❌ /api/sheets/orders - FAILED"
fi

# 4. Test Inventory
echo "📋 [4/8] Test Inventory..."
if curl -s http://localhost:5000/api/sheets/inventory > /dev/null 2>&1; then
    echo "✅ /api/sheets/inventory - OK"
else
    echo "❌ /api/sheets/inventory - FAILED"
fi

# 5. Test Users
echo "👥 [5/8] Test Users..."
if curl -s http://localhost:5000/api/sheets/users > /dev/null 2>&1; then
    echo "✅ /api/sheets/users - OK"
else
    echo "❌ /api/sheets/users - FAILED"
fi

# 6. Test Carriers
echo "🚚 [6/8] Test Carriers..."
if curl -s http://localhost:5000/api/sheets/carriers > /dev/null 2>&1; then
    echo "✅ /api/sheets/carriers - OK"
else
    echo "❌ /api/sheets/carriers - FAILED"
fi

# 7. Test Dashboard Summary
echo "📊 [7/8] Test Dashboard Summary..."
if curl -s http://localhost:5000/api/sheets/dashboard/summary > /dev/null 2>&1; then
    echo "✅ /api/sheets/dashboard/summary - OK"
else
    echo "❌ /api/sheets/dashboard/summary - FAILED"
fi

# 8. Test TransportRequests với filters
echo "🔍 [8/8] Test TransportRequests với filters..."
if curl -s "http://localhost:5000/api/sheets/transport-requests?status=in_transit&limit=5" > /dev/null 2>&1; then
    echo "✅ /api/sheets/transport-requests với filters - OK"
else
    echo "❌ /api/sheets/transport-requests với filters - FAILED"
fi

echo ""
echo "📊 TỔNG KẾT API ENDPOINTS"
echo "========================="

# Đếm số endpoints hoạt động
ACTIVE_ENDPOINTS=0
TOTAL_ENDPOINTS=8

# Test lại và đếm
if curl -s http://localhost:5000/api/sheets/info > /dev/null 2>&1; then ACTIVE_ENDPOINTS=$((ACTIVE_ENDPOINTS + 1)); fi
if curl -s http://localhost:5000/api/sheets/transport-requests > /dev/null 2>&1; then ACTIVE_ENDPOINTS=$((ACTIVE_ENDPOINTS + 1)); fi
if curl -s http://localhost:5000/api/sheets/orders > /dev/null 2>&1; then ACTIVE_ENDPOINTS=$((ACTIVE_ENDPOINTS + 1)); fi
if curl -s http://localhost:5000/api/sheets/inventory > /dev/null 2>&1; then ACTIVE_ENDPOINTS=$((ACTIVE_ENDPOINTS + 1)); fi
if curl -s http://localhost:5000/api/sheets/users > /dev/null 2>&1; then ACTIVE_ENDPOINTS=$((ACTIVE_ENDPOINTS + 1)); fi
if curl -s http://localhost:5000/api/sheets/carriers > /dev/null 2>&1; then ACTIVE_ENDPOINTS=$((ACTIVE_ENDPOINTS + 1)); fi
if curl -s http://localhost:5000/api/sheets/dashboard/summary > /dev/null 2>&1; then ACTIVE_ENDPOINTS=$((ACTIVE_ENDPOINTS + 1)); fi
if curl -s "http://localhost:5000/api/sheets/transport-requests?status=in_transit&limit=5" > /dev/null 2>&1; then ACTIVE_ENDPOINTS=$((ACTIVE_ENDPOINTS + 1)); fi

echo "📈 Tỷ lệ hoạt động: $ACTIVE_ENDPOINTS/$TOTAL_ENDPOINTS endpoints"

if [ $ACTIVE_ENDPOINTS -eq $TOTAL_ENDPOINTS ]; then
    echo "🎉 Tất cả API endpoints hoạt động bình thường!"
elif [ $ACTIVE_ENDPOINTS -gt 0 ]; then
    echo "⚠️ Một số API endpoints cần được kiểm tra"
else
    echo "❌ Không có API endpoints nào hoạt động"
fi

echo ""
echo "🔗 Các API endpoints có sẵn:"
echo "   • GET /api/sheets/info - Thông tin spreadsheet"
echo "   • GET /api/sheets/transport-requests - Yêu cầu vận chuyển"
echo "   • GET /api/sheets/orders - Đơn hàng"
echo "   • GET /api/sheets/inventory - Tồn kho"
echo "   • GET /api/sheets/users - Người dùng"
echo "   • GET /api/sheets/carriers - Nhà vận chuyển"
echo "   • GET /api/sheets/dashboard/summary - Tổng quan dashboard"
echo "   • GET /api/sheets/:sheetName - Sheet bất kỳ"
echo ""
echo "💡 Sử dụng query parameters: ?limit=10&offset=0&search=keyword"
