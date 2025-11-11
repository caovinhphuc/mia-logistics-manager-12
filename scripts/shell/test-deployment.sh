#!/bin/bash

echo "🧪 KIỂM TRA TRIỂN KHAI MIA LOGISTICS"
echo "==================================="
echo ""

# URL của deployment
DEPLOY_URL="https://mia-logistics-manager.netlify.app"
UNIQUE_URL="https://68fba531d22b6900c81602e8--mia-logistics-manager.netlify.app"

echo "🌐 Production URL: $DEPLOY_URL"
echo "🔗 Unique URL: $UNIQUE_URL"
echo ""

# Test 1: Kiểm tra trang chủ
echo "📋 Test 1: Kiểm tra trang chủ..."
if curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL" | grep -q "200"; then
    echo "✅ Trang chủ hoạt động (HTTP 200)"
else
    echo "❌ Trang chủ không hoạt động"
fi

# Test 2: Kiểm tra loading screen
echo "📋 Test 2: Kiểm tra loading screen..."
if curl -s "$DEPLOY_URL" | grep -q "loading-screen"; then
    echo "✅ Loading screen có trong HTML"
else
    echo "❌ Loading screen không tìm thấy"
fi

# Test 3: Kiểm tra network detection
echo "📋 Test 3: Kiểm tra network detection..."
if curl -s "$DEPLOY_URL" | grep -q "checkNetworkStatus"; then
    echo "✅ Network detection script có trong HTML"
else
    echo "❌ Network detection script không tìm thấy"
fi

# Test 4: Kiểm tra authentication check
echo "📋 Test 4: Kiểm tra authentication check..."
if curl -s "$DEPLOY_URL" | grep -q "checkAuthentication"; then
    echo "✅ Authentication check script có trong HTML"
else
    echo "❌ Authentication check script không tìm thấy"
fi

# Test 5: Kiểm tra backend connection
echo "📋 Test 5: Kiểm tra backend connection..."
if curl -s "$DEPLOY_URL" | grep -q "checkBackendConnection"; then
    echo "✅ Backend connection script có trong HTML"
else
    echo "❌ Backend connection script không tìm thấy"
fi

# Test 6: Kiểm tra mobile support
echo "📋 Test 6: Kiểm tra mobile support..."
if curl -s "$DEPLOY_URL" | grep -q "mobile-web-app-capable"; then
    echo "✅ Mobile meta tags có trong HTML"
else
    echo "❌ Mobile meta tags không tìm thấy"
fi

# Test 7: Kiểm tra PWA support
echo "📋 Test 7: Kiểm tra PWA support..."
if curl -s "$DEPLOY_URL" | grep -q "manifest.json"; then
    echo "✅ PWA manifest có trong HTML"
else
    echo "❌ PWA manifest không tìm thấy"
fi

# Test 8: Kiểm tra offline mode
echo "📋 Test 8: Kiểm tra offline mode..."
if curl -s "$DEPLOY_URL" | grep -q "offline"; then
    echo "✅ Offline mode script có trong HTML"
else
    echo "❌ Offline mode script không tìm thấy"
fi

# Test 9: Kiểm tra service worker
echo "📋 Test 9: Kiểm tra service worker..."
if curl -s "$DEPLOY_URL" | grep -q "serviceWorker"; then
    echo "✅ Service worker script có trong HTML"
else
    echo "❌ Service worker script không tìm thấy"
fi

# Test 10: Kiểm tra security headers
echo "📋 Test 10: Kiểm tra security headers..."
if curl -s -I "$DEPLOY_URL" | grep -q "X-Frame-Options"; then
    echo "✅ Security headers được cấu hình"
else
    echo "⚠️ Security headers có thể chưa được cấu hình"
fi

echo ""
echo "🎉 KIỂM TRA HOÀN TẤT!"
echo "===================="
echo ""
echo "📊 KẾT QUẢ:"
echo "🌐 Production URL: $DEPLOY_URL"
echo "🔗 Unique URL: $UNIQUE_URL"
echo ""
echo "📱 MOBILE TESTING:"
echo "1. Mở URL trên mobile browser"
echo "2. Kiểm tra responsive design"
echo "3. Test touch gestures"
echo "4. Test PWA installation"
echo ""
echo "🔐 AUTHENTICATION TESTING:"
echo "1. Kiểm tra loading screen"
echo "2. Test network detection"
echo "3. Test authentication flow"
echo "4. Test redirect logic"
echo ""
echo "🔄 OFFLINE TESTING:"
echo "1. Disconnect network"
echo "2. Test offline mode"
echo "3. Test service worker"
echo "4. Test background sync"
echo ""
echo "🛡️ SECURITY TESTING:"
echo "1. Kiểm tra CSP headers"
echo "2. Test XSS protection"
echo "3. Test iframe protection"
echo "4. Test content security"
echo ""
echo "💡 NEXT STEPS:"
echo "1. Test trên mobile devices"
echo "2. Test authentication flow"
echo "3. Test offline functionality"
echo "4. Monitor performance"
echo ""
echo "🎉 Deployment ready for testing!"
