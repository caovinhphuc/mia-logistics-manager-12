#!/bin/bash

# MIA Logistics Manager - Demo Deployment
echo "🚀 MIA Logistics Manager - Demo Deployment"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

print_success() {
    echo -e "${CYAN}🎉 $1${NC}"
}

# Check if build exists
if [ ! -d "build" ]; then
    print_error "Build directory not found. Please run 'npm run build' first."
    exit 1
fi

print_status "Build directory found"

# Check if serve is installed
if ! command -v serve &> /dev/null; then
    print_info "Installing serve..."
    npm install -g serve
fi

print_status "Serve is available"

# Start demo server
print_info "Starting demo deployment server..."
echo ""
print_success "🚀 MIA Logistics Manager Demo Deployment"
echo ""
print_info "Server starting on: http://localhost:3001"
print_info "Press Ctrl+C to stop the server"
echo ""
print_warning "Note: This is a demo deployment for testing purposes"
print_warning "For production deployment, use:"
echo "  - Netlify: ./scripts/deployNetlify.sh"
echo "  - Vercel: ./scripts/deployVercel.sh"
echo "  - Firebase: firebase deploy"
echo ""

# Start the server
serve -s build -l 3001
