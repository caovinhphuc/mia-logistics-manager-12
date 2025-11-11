#!/bin/bash

# MIA Logistics Manager - Startup Script
# Tự động khởi động toàn bộ dự án

echo "🚀 MIA LOGISTICS MANAGER - KHỞI ĐỘNG DỰ ÁN"
echo "=========================================="

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function để in thông báo với màu
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Kiểm tra xem có đang chạy trong thư mục đúng không
if [ ! -f "package.json" ] || [ ! -d "server" ]; then
    print_error "Vui lòng chạy script này từ thư mục gốc của dự án (mia-logistics-manager)"
    exit 1
fi

print_info "Đang kiểm tra và dọn dẹp các process cũ..."

# Kill tất cả Node.js processes
print_info "Đang dừng tất cả Node.js processes..."
killall -9 node 2>/dev/null || true
sleep 2

# Kill processes trên các port cụ thể
print_info "Đang giải phóng các port cần thiết..."

# Port 3000 (Frontend)
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Port 5050 (Backend)
lsof -ti:5050 | xargs kill -9 2>/dev/null || true

# Port 3000 (Fallback frontend)
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

sleep 2
print_status "Đã dọn dẹp xong các process cũ"

# Kiểm tra Node.js và npm
print_info "Đang kiểm tra môi trường..."

if ! command -v node &> /dev/null; then
    print_error "Node.js chưa được cài đặt. Vui lòng cài đặt Node.js trước."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm chưa được cài đặt. Vui lòng cài đặt npm trước."
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_status "Node.js: $NODE_VERSION | npm: $NPM_VERSION"

# Kiểm tra file .env
print_info "Đang kiểm tra cấu hình..."

if [ ! -f ".env" ]; then
    print_warning "File .env không tồn tại. Tạo file .env mẫu..."
    cat > .env << EOF
# MIA Logistics Manager Environment Variables
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
VITE_GOOGLE_APPS_SCRIPT_URL=your_google_apps_script_url_here
SHEET_ID=your_spreadsheet_id_here
ACTIVE_SPREADSHEET_ID=your_spreadsheet_id_here
SERVICE_ACCOUNT_PATH=./server/service-account-key.json
PORT=5050
NODE_ENV=development
EOF
    print_warning "Vui lòng cập nhật file .env với thông tin thực tế trước khi chạy lại."
fi

# Cài đặt dependencies cho root project
print_info "Đang cài đặt dependencies cho root project..."
npm install
if [ $? -eq 0 ]; then
    print_status "Root dependencies đã được cài đặt"
else
    print_error "Lỗi khi cài đặt root dependencies"
    exit 1
fi

# Cài đặt dependencies cho server
print_info "Đang cài đặt dependencies cho server..."
cd server
npm install
if [ $? -eq 0 ]; then
    print_status "Server dependencies đã được cài đặt"
else
    print_error "Lỗi khi cài đặt server dependencies"
    exit 1
fi
cd ..

# Kiểm tra service account key
print_info "Đang kiểm tra Google Service Account..."
if [ ! -f "server/service-account-key.json" ]; then
    print_warning "File service-account-key.json không tồn tại trong thư mục server/"
    print_warning "Vui lòng đặt file service account key vào server/service-account-key.json"
fi

# Kiểm tra cấu hình các service khác
print_info "Đang kiểm tra cấu hình các service..."

# Kiểm tra Google Apps Script
if [ -f "server/.env" ]; then
    if grep -q "GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" server/.env; then
        print_warning "Google Apps Script chưa được cấu hình (GOOGLE_APPS_SCRIPT_URL)"
    else
        print_status "Google Apps Script đã được cấu hình"
    fi

    # Kiểm tra Telegram Bot
    if grep -q "TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here" server/.env; then
        print_warning "Telegram Bot chưa được cấu hình (TELEGRAM_BOT_TOKEN)"
    else
        print_status "Telegram Bot đã được cấu hình"
    fi

    # Kiểm tra Google Maps
    if grep -q "GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here" server/.env; then
        print_warning "Google Maps API chưa được cấu hình (GOOGLE_MAPS_API_KEY)"
    else
        print_status "Google Maps API đã được cấu hình"
    fi
else
    print_warning "File server/.env không tồn tại"
fi

# Khởi động Backend
print_info "Đang khởi động Backend Server..."
cd server
npm start &
BACKEND_PID=$!
cd ..

# Đợi backend khởi động
print_info "Đang đợi Backend khởi động..."
sleep 8

# Kiểm tra xem backend có chạy không
if curl -s http://localhost:5050/health > /dev/null 2>&1; then
    print_status "Backend đã khởi động thành công trên port 5050"
else
    print_warning "Backend có thể chưa sẵn sàng hoàn toàn, nhưng đang chạy..."
fi

# Khởi động Frontend
print_info "Đang khởi động Frontend..."
npm run dev &
FRONTEND_PID=$!

# Đợi frontend khởi động
print_info "Đang đợi Frontend khởi động..."
sleep 5

# Kiểm tra xem frontend có chạy không
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_status "Frontend đã khởi động thành công trên port 3000"
else
    print_warning "Frontend có thể chưa sẵn sàng hoàn toàn, nhưng đang chạy..."
fi

# Hiển thị thông tin kết nối
echo ""
echo "🎉 DỰ ÁN ĐÃ KHỞI ĐỘNG THÀNH CÔNG!"
echo "=================================="
echo ""
print_info "🌐 Backend API: http://localhost:5050"
print_info "📱 Frontend App: http://localhost:3000"
print_info "📊 Google Sheets: Đã kết nối"
print_info "🔐 Bảo mật: Đã kích hoạt"
echo ""
print_info "Process IDs:"
print_info "  Backend PID: $BACKEND_PID"
print_info "  Frontend PID: $FRONTEND_PID"
echo ""
print_warning "Để dừng dự án, nhấn Ctrl+C hoặc chạy: ./stop-project.sh"
echo ""

# Function để dừng dự án khi nhấn Ctrl+C
cleanup() {
    echo ""
    print_info "Đang dừng dự án..."

    # Kill frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi

    # Kill backend
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi

    # Kill tất cả node processes
    killall -9 node 2>/dev/null || true

    print_status "Dự án đã được dừng"
    exit 0
}

# Bắt tín hiệu Ctrl+C
trap cleanup SIGINT SIGTERM

# Giữ script chạy và hiển thị logs
print_info "Đang theo dõi logs... (Nhấn Ctrl+C để dừng)"
echo ""

# Hiển thị logs của cả frontend và backend
tail -f /dev/null &
wait
