#!/bin/bash

# MIA Logistics Manager - Start with Monitoring Script
# Khởi động dự án với kiểm tra kết nối và gửi thông báo Telegram/Email

echo "🚀 MIA Logistics Manager - Start with Monitoring"
echo "==============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to kill process on port
kill_port() {
    local port=$1
    local service_name=$2
    
    echo -e "${YELLOW}Killing $service_name on port $port...${NC}"
    
    local pids=$(lsof -ti :$port 2>/dev/null)
    if [ -n "$pids" ]; then
        echo "$pids" | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✅ Killed $service_name on port $port${NC}"
    else
        echo -e "${BLUE}ℹ️  No process found on port $port${NC}"
    fi
}

# Function to kill processes by name
kill_process() {
    local process_name=$1
    local service_name=$2
    
    echo -e "${YELLOW}Killing $service_name processes...${NC}"
    
    local pids=$(pgrep -f "$process_name" 2>/dev/null)
    if [ -n "$pids" ]; then
        echo "$pids" | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✅ Killed $service_name processes${NC}"
    else
        echo -e "${BLUE}ℹ️  No $service_name processes found${NC}"
    fi
}

# Function to clear cache
clear_cache() {
    echo -e "${YELLOW}Clearing cache...${NC}"
    
    npm cache clean --force 2>/dev/null || true
    rm -rf node_modules/.cache 2>/dev/null || true
    rm -rf backend/node_modules/.cache 2>/dev/null || true
    rm -rf build 2>/dev/null || true
    rm -rf temp 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cache cleared${NC}"
}

# Function to start services
start_services() {
    echo -e "${YELLOW}Starting services...${NC}"
    
    # Get current directory
    local current_dir=$(pwd)
    echo -e "${BLUE}Current directory: $current_dir${NC}"
    
    # Start backend
    echo -e "${BLUE}Starting backend...${NC}"
    (cd backend && npm start) &
    
    # Wait for backend
    sleep 5
    
    # Start frontend
    echo -e "${BLUE}Starting frontend...${NC}"
    npm start &
    
    # Wait for frontend
    sleep 10
    
    echo -e "${GREEN}✅ Services started${NC}"
}

# Function to check connections and send notifications
check_connections_and_notify() {
    echo -e "${YELLOW}Checking connections and sending notifications...${NC}"
    
    # Wait for services to be ready
    sleep 15
    
    # Run connection checker
    echo -e "${BLUE}Running connection checker...${NC}"
    node scripts/connection-checker.js
    
    echo -e "${GREEN}✅ Connection check completed${NC}"
}

# Function to test connections
test_connections() {
    echo -e "${YELLOW}Testing connections...${NC}"
    
    # Test backend
    if curl -s -f http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is running${NC}"
    else
        echo -e "${RED}❌ Backend failed to start${NC}"
        return 1
    fi
    
    # Test frontend
    if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is running${NC}"
    else
        echo -e "${RED}❌ Frontend failed to start${NC}"
        return 1
    fi
    
    return 0
}

# Main execution
echo "Step 0: Setting up working directory..."
# Ensure we're in the correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run this script from the project root directory.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Working directory confirmed: $(pwd)${NC}"

echo "Step 1: Killing existing processes..."

# Kill processes on ports
kill_port 3000 "Frontend"
kill_port 3001 "Backend"
kill_port 8000 "AI Service"

# Kill processes by name
kill_process "npm start" "npm start"
kill_process "node.*server.js" "Backend server"
kill_process "react-scripts" "React scripts"

echo ""
echo "Step 2: Clearing cache..."
clear_cache

echo ""
echo "Step 3: Starting services..."
start_services

echo ""
echo "Step 4: Testing connections..."
if test_connections; then
    echo -e "${GREEN}✅ All connections successful${NC}"
else
    echo -e "${RED}❌ Some connections failed${NC}"
    exit 1
fi

echo ""
echo "Step 5: Checking connections and sending notifications..."
check_connections_and_notify

echo ""
echo -e "${GREEN}🎉 Project started with monitoring!${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo "Health Check: http://localhost:3001/health"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"

# Keep running
while true; do
    sleep 1
done
