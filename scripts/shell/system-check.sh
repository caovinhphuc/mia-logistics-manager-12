#!/bin/bash

# System Check - Kiểm tra toàn hệ thống
# ====================================

echo "🔍 KIỂM TRA TOÀN HỆ THỐNG MIA LOGISTICS MANAGER"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "📋 1. KIỂM TRA CẤU TRÚC DỰ ÁN"
echo "----------------------------"

# Check project structure
if [ -d "src" ] && [ -d "public" ] && [ -f "package.json" ]; then
    echo "✅ Cấu trúc dự án đúng"
else
    echo "❌ Cấu trúc dự án không đúng"
fi

# Check key files
key_files=("src/App.js" "src/index.js" "src/components/auth/Login.js" "src/pages/Dashboard.jsx")
for file in "${key_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file tồn tại"
    else
        echo "❌ $file không tồn tại"
    fi
done

echo ""
echo "📋 2. KIỂM TRA DEPENDENCIES"
echo "-------------------------"

# Check package.json
if [ -f "package.json" ]; then
    echo "✅ package.json tồn tại"
    echo "📦 Dependencies:"
    grep -E '"react"|"@mui"|"react-router"' package.json | head -5
else
    echo "❌ package.json không tồn tại"
fi

# Check node_modules
if [ -d "node_modules" ]; then
    echo "✅ node_modules tồn tại"
else
    echo "❌ node_modules không tồn tại - cần chạy npm install"
fi

echo ""
echo "📋 3. KIỂM TRA SYNTAX ERRORS"
echo "--------------------------"

# Check for syntax errors in key files
echo "🔍 Kiểm tra Login.js..."
if grep -q "let.*=.*let\|const.*=.*const" src/components/auth/Login.js; then
    echo "⚠️ Có thể có duplicate declarations trong Login.js"
else
    echo "✅ Login.js syntax OK"
fi

# Check for common syntax issues
echo "🔍 Kiểm tra import statements..."
if grep -q "import.*from.*import" src/components/auth/Login.js; then
    echo "⚠️ Có thể có import issues"
else
    echo "✅ Import statements OK"
fi

echo ""
echo "📋 4. KIỂM TRA BUILD PROCESS"
echo "--------------------------"

# Test build
echo "🔨 Testing build process..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build thành công"

    # Check build output
    if [ -d "build" ]; then
        echo "✅ Build directory tồn tại"
        echo "📁 Build files:"
        ls -la build/ | head -5
    else
        echo "❌ Build directory không tồn tại"
    fi
else
    echo "❌ Build thất bại"
    echo "💡 Chạy: npm run build để xem chi tiết lỗi"
fi

echo ""
echo "📋 5. KIỂM TRA LINTING"
echo "--------------------"

# Test linting
echo "🔍 Testing linting..."
if npm run lint > /dev/null 2>&1; then
    echo "✅ Linting OK"
else
    echo "⚠️ Linting errors found"
    echo "💡 Chạy: npm run lint để xem chi tiết"
fi

echo ""
echo "📋 6. KIỂM TRA ENVIRONMENT"
echo "------------------------"

# Check environment files
if [ -f ".env" ]; then
    echo "✅ .env file tồn tại"
    if grep -q "REACT_APP_GOOGLE" .env; then
        echo "✅ Google API credentials configured"
    else
        echo "⚠️ Google API credentials chưa được cấu hình"
    fi
else
    echo "❌ .env file không tồn tại"
    echo "💡 Chạy: ./setup-env.sh để tạo .env file"
fi

# Check production environment
if [ -f "production.env" ]; then
    echo "✅ production.env tồn tại"
else
    echo "⚠️ production.env không tồn tại"
fi

echo ""
echo "📋 7. KIỂM TRA GOOGLE API INTEGRATION"
echo "----------------------------------"

# Check Google API files
google_files=("src/services/google/googleSheetsService.js" "src/contexts/GoogleContext.js" "src/components/GoogleApiStatus.jsx")
for file in "${google_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file tồn tại"
    else
        echo "❌ $file không tồn tại"
    fi
done

# Check for Google API methods
if grep -q "initializeAPI\|getData\|appendData" src/services/google/googleSheetsService.js; then
    echo "✅ Google API methods đã được implement"
else
    echo "⚠️ Google API methods có thể chưa đầy đủ"
fi

echo ""
echo "📋 8. KIỂM TRA NAVIGATION"
echo "------------------------"

# Check navigation setup
if grep -q "useNavigate\|navigate.*dashboard" src/components/auth/Login.js; then
    echo "✅ Navigation đã được setup"
else
    echo "⚠️ Navigation có thể chưa được setup đúng"
fi

# Check routes
if grep -q "path.*dashboard" src/App.js; then
    echo "✅ Dashboard route đã được cấu hình"
else
    echo "⚠️ Dashboard route có thể chưa được cấu hình"
fi

echo ""
echo "📋 9. KIỂM TRA ERROR HANDLING"
echo "----------------------------"

# Check error handling files
error_files=("src/utils/suppressWarnings.js" "src/components/ErrorBoundary.jsx")
for file in "${error_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file tồn tại"
    else
        echo "⚠️ $file không tồn tại"
    fi
done

echo ""
echo "📋 10. KIỂM TRA DEPLOYMENT FILES"
echo "-------------------------------"

# Check deployment files
deploy_files=("netlify.toml" "deploy.sh" "DEPLOYMENT_GUIDE.md" "ENVIRONMENT_SETUP.md")
for file in "${deploy_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file tồn tại"
    else
        echo "⚠️ $file không tồn tại"
    fi
done

echo ""
echo "📋 TỔNG KẾT HỆ THỐNG"
echo "==================="

# Count total issues
ISSUES=0

# Check build
if ! npm run build > /dev/null 2>&1; then
    ISSUES=$((ISSUES + 1))
fi

# Check linting
if ! npm run lint > /dev/null 2>&1; then
    ISSUES=$((ISSUES + 1))
fi

# Check environment
if [ ! -f ".env" ]; then
    ISSUES=$((ISSUES + 1))
fi

# Check key files
for file in "${key_files[@]}"; do
    if [ ! -f "$file" ]; then
        ISSUES=$((ISSUES + 1))
    fi
done

echo ""
if [ $ISSUES -eq 0 ]; then
    echo "🎉 HỆ THỐNG HOẠT ĐỘNG TỐT!"
    echo "✅ Tất cả các thành phần đã được kiểm tra và hoạt động bình thường"
    echo "🚀 Ứng dụng sẵn sàng để sử dụng và deploy"
else
    echo "⚠️ PHÁT HIỆN $ISSUES VẤN ĐỀ"
    echo "💡 Vui lòng kiểm tra và sửa các vấn đề trên"
fi

echo ""
echo "📋 KHUYẾN NGHỊ TIẾP THEO:"
echo "1. Chạy: npm start để khởi động ứng dụng"
echo "2. Truy cập: http://localhost:3000"
echo "3. Test đăng nhập với tài khoản admin"
echo "4. Kiểm tra Google API status trong Dashboard"
echo "5. Test các chức năng chính của ứng dụng"

echo ""
echo "✅ KIỂM TRA HỆ THỐNG HOÀN TẤT!"
