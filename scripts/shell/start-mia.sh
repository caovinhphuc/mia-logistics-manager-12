#!/bin/bash

# 🚀 MIA LOGISTICS MANAGER - SMART STARTUP SCRIPT
# ================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    print_warning "Port $port đang được sử dụng. Đang dừng process..."
    lsof -ti :$port | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Main startup function
start_mia() {
    print_header "🚀 MIA LOGISTICS MANAGER - SMART STARTUP"
    print_header "========================================"
    echo ""

    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "Không tìm thấy package.json. Vui lòng chạy script từ thư mục mia-logistics-manager"
        exit 1
    fi

    # Check Node.js version
    print_status "Kiểm tra Node.js version..."
    node_version=$(node --version 2>/dev/null || echo "Not installed")
    npm_version=$(npm --version 2>/dev/null || echo "Not installed")
    print_success "Node.js: $node_version | npm: $npm_version"

    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "Dependencies chưa được cài đặt. Đang cài đặt..."
        npm install
        print_success "Dependencies đã được cài đặt"
    else
        print_success "Dependencies đã sẵn sàng"
    fi

    # Check port 5173
    if check_port 5173; then
        print_warning "Port 5173 đang được sử dụng"
        read -p "Bạn có muốn dừng process hiện tại và khởi động lại? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill_port 5173
        else
            print_error "Không thể khởi động. Port 5173 đang được sử dụng."
            exit 1
        fi
    fi

    # Type check
    print_status "Kiểm tra TypeScript..."
    if npm run type-check >/dev/null 2>&1; then
        print_success "TypeScript check passed"
    else
        print_warning "TypeScript có lỗi, nhưng vẫn tiếp tục..."
    fi

    # Lint check
    print_status "Kiểm tra ESLint..."
    if npm run lint:check >/dev/null 2>&1; then
        print_success "ESLint check passed"
    else
        print_warning "ESLint có lỗi, nhưng vẫn tiếp tục..."
    fi

    # Start development server
    print_status "Khởi động development server..."
    print_header "🎯 MIA LOGISTICS MANAGER ĐANG KHỞI ĐỘNG..."
    print_header "========================================="
    echo ""
    print_success "📱 Truy cập ứng dụng: http://localhost:5173"
    print_success "🔐 Đăng nhập với: admin@mia.vn / admin@123"
    echo ""
    print_status "💡 Để dừng server: Ctrl+C"
    print_status "💡 Để xem logs: Kiểm tra terminal này"
    echo ""

    # Start the development server
    npm run dev
}

# Handle script arguments
case "${1:-}" in
    "clean")
        print_status "Dọn dẹp cache và dependencies..."
        npm run clean:all
        print_success "Đã dọn dẹp xong"
        ;;
    "reinstall")
        print_status "Cài đặt lại dependencies..."
        npm run reinstall
        print_success "Đã cài đặt lại xong"
        ;;
    "build")
        print_status "Build production..."
        npm run build:prod
        print_success "Build hoàn thành"
        ;;
    "preview")
        print_status "Khởi động preview server..."
        npm run preview
        ;;
    "health")
        print_status "Kiểm tra health..."
        npm run health
        ;;
    "help"|"-h"|"--help")
        echo "MIA LOGISTICS MANAGER - Smart Startup Script"
        echo ""
        echo "Usage: ./start-mia.sh [command]"
        echo ""
        echo "Commands:"
        echo "  (no args)  - Khởi động development server"
        echo "  clean      - Dọn dẹp cache và dependencies"
        echo "  reinstall  - Cài đặt lại dependencies"
        echo "  build      - Build production"
        echo "  preview    - Khởi động preview server"
        echo "  health     - Kiểm tra health"
        echo "  help       - Hiển thị help"
        ;;
    *)
        start_mia
        ;;
esac
