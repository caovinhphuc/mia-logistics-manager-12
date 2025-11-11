#!/bin/bash

# Start All Services Script
# Starts frontend, backend, and optional services for MIA Logistics Manager

echo "🚀 MIA Logistics Manager - Starting All Services"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}Killing process on port $port...${NC}"
    lsof -ti :$port | xargs kill -9 2>/dev/null
    sleep 2
}

# Function to start service
start_service() {
    local service_name=$1
    local port=$2
    local command=$3

    echo -e "${BLUE}Starting $service_name...${NC}"

    if check_port $port; then
        echo -e "${YELLOW}Port $port is already in use. Killing existing process...${NC}"
        kill_port $port
    fi

    # Start service in background
    eval "$command" &
    local pid=$!

    # Wait a moment and check if service started
    sleep 3
    if check_port $port; then
        echo -e "${GREEN}✅ $service_name started successfully on port $port (PID: $pid)${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to start $service_name${NC}"
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    echo -e "${YELLOW}Waiting for $service_name to be ready...${NC}"

    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi

        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e "${RED}❌ $service_name failed to start within timeout${NC}"
    return 1
}

# Main execution
echo "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo -e "${BLUE}Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi

echo ""

# Start Backend Service
start_service "Backend API" 3001 "cd backend && npm start"
if [ $? -eq 0 ]; then
    wait_for_service "http://localhost:3001/health" "Backend API"
fi

echo ""

# Start Frontend Service
start_service "Frontend (React)" 3000 "npm start"
if [ $? -eq 0 ]; then
    wait_for_service "http://localhost:3000" "Frontend"
fi

echo ""

# Optional: Start AI Service if available
if [ -d "ai-service" ]; then
    echo -e "${BLUE}AI Service found. Starting AI Service...${NC}"
    start_service "AI Service" 8000 "cd ai-service && python -m uvicorn main:app --host 0.0.0.0 --port 8000"
    if [ $? -eq 0 ]; then
        wait_for_service "http://localhost:8000/health" "AI Service"
    fi
else
    echo -e "${YELLOW}⚠️  AI Service not found. Skipping...${NC}"
fi

echo ""

# Summary
echo -e "${BLUE}Service Status Summary${NC}"
echo "======================"

# Check all services
services=(
    "Frontend:http://localhost:3000"
    "Backend:http://localhost:3001/health"
    "AI Service:http://localhost:8000/health"
)

for service in "${services[@]}"; do
    IFS=':' read -r name url <<< "$service"
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "$name: ${GREEN}✅ Running${NC}"
    else
        echo -e "$name: ${RED}❌ Not running${NC}"
    fi
done

echo ""

# Final message
echo -e "${GREEN}🎉 MIA Logistics Manager services started!${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3001"
echo "Health Check: http://localhost:3001/health"
echo "API Status: http://localhost:3001/api/status"
echo ""

# Keep script running to show logs
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping all services...${NC}"

    # Kill all Node.js processes
    pkill -f "node.*server.js" 2>/dev/null
    pkill -f "react-scripts start" 2>/dev/null
    pkill -f "uvicorn main:app" 2>/dev/null

    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
while true; do
    sleep 1
done
