#!/bin/bash

# MIA Logistics Manager - GCP Authentication Setup
# Script để setup authentication cho Google Cloud Platform

echo "🔐 MIA Logistics Manager - GCP Authentication Setup"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Setup PATH
export PATH=$PATH:/Users/phuccao/google-cloud-sdk/bin

echo "📋 Hướng dẫn setup Google Cloud Platform Authentication:"
echo "========================================================"
echo ""

echo "1. 🌐 Đăng nhập vào Google Cloud:"
echo "   Chạy lệnh sau để đăng nhập:"
echo "   gcloud auth login"
echo ""

echo "2. 🔑 Chọn Google Account:"
echo "   - Chọn Google account có quyền tạo project"
echo "   - Hoặc tạo Google account mới nếu cần"
echo ""

echo "3. 💳 Enable Billing:"
echo "   - Truy cập: https://console.cloud.google.com/billing"
echo "   - Tạo billing account hoặc link existing account"
echo "   - Link billing account với project"
echo ""

echo "4. 🚀 Chạy Deployment:"
echo "   Sau khi đăng nhập thành công, chạy:"
echo "   ./scripts/runGCPDeployment.sh"
echo ""

print_info "Bạn có muốn đăng nhập ngay bây giờ không? (y/n)"
read -r response

if [[ "$response" == "y" || "$response" == "Y" ]]; then
    print_info "Đang mở browser để đăng nhập..."
    gcloud auth login

    if [ $? -eq 0 ]; then
        print_status "Đăng nhập thành công!"
        echo ""
        print_info "Bây giờ bạn có thể chạy deployment:"
        echo "./scripts/runGCPDeployment.sh"
    else
        print_error "Đăng nhập thất bại. Vui lòng thử lại."
    fi
else
    echo ""
    print_info "Để đăng nhập sau, chạy lệnh:"
    echo "gcloud auth login"
    echo ""
    print_info "Sau khi đăng nhập thành công, chạy:"
    echo "./scripts/runGCPDeployment.sh"
fi

echo ""
echo "📚 Tài liệu tham khảo:"
echo "====================="
echo "- GOOGLE_CLOUD_SETUP.md: Hướng dẫn setup chi tiết"
echo "- GOOGLE_SETUP_GUIDE.md: Hướng dẫn setup cơ bản"
echo "- GOOGLE_APIS_DEPLOYMENT.md: Hướng dẫn deployment"
echo ""

echo "🎯 Các bước tiếp theo:"
echo "======================"
echo "1. Đăng nhập Google Cloud: gcloud auth login"
echo "2. Chạy deployment: ./scripts/runGCPDeployment.sh"
echo "3. Setup OAuth 2.0 trong Google Cloud Console"
echo "4. Setup Google Sheets trong Apps Script"
echo "5. Test ứng dụng: npm start"
echo ""

print_warning "Lưu ý: Cần có Google account và billing account để sử dụng Google Cloud Platform"
