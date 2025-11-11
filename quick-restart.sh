#!/bin/bash

# MIA Logistics Manager - Quick Restart Script
# Kills ports, clears cache, and restarts the project quickly

echo "🚀 MIA Logistics Manager - Quick Restart"
echo "======================================="
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
    
    # Find and kill processes on the port
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
    echo -e "${YELLOW}Clearing caches...${NC}"
    
    # Clear npm cache
    echo -e "${BLUE}Clearing npm cache...${NC}"
    npm cache clean --force 2>/dev/null || true
    
    # Clear node_modules cache
    echo -e "${BLUE}Clearing node_modules cache...${NC}"
    rm -rf node_modules/.cache 2>/dev/null || true
    rm -rf backend/node_modules/.cache 2>/dev/null || true
    
    # Clear build cache
    echo -e "${BLUE}Clearing build cache...${NC}"
    rm -rf build 2>/dev/null || true
    rm -rf backend/build 2>/dev/null || true
    
    # Clear temp files
    echo -e "${BLUE}Clearing temp files...${NC}"
    rm -rf temp 2>/dev/null || true
    rm -rf backend/temp 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cache cleared successfully${NC}"
}

# Function to start services
start_services() {
    echo -e "${YELLOW}Starting services...${NC}"
    
    # Start backend first
    echo -e "${BLUE}Starting backend service...${NC}"
    cd backend && npm start &
    local backend_pid=$!
    cd ..
    
    # Wait for backend to start
    echo -e "${BLUE}Waiting for backend to start...${NC}"
    sleep 5
    
    # Check if backend is running
    if curl -s -f http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend started successfully${NC}"
    else
        echo -e "${RED}❌ Backend failed to start${NC}"
        return 1
    fi
    
    # Start frontend
    echo -e "${BLUE}Starting frontend service...${NC}"
    npm start &
    local frontend_pid=$!
    
    # Wait for frontend to start
    echo -e "${BLUE}Waiting for frontend to start...${NC}"
    sleep 10
    
    # Check if frontend is running
    if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend started successfully${NC}"
    else
        echo -e "${RED}❌ Frontend failed to start${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ All services started successfully${NC}"
    return 0
}

# Function to test connections
test_connections() {
    echo -e "${YELLOW}Testing connections...${NC}"
    
    # Test backend
    echo -e "${BLUE}Testing backend connection...${NC}"
    if curl -s -f http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend connection successful${NC}"
    else
        echo -e "${RED}❌ Backend connection failed${NC}"
        return 1
    fi
    
    # Test frontend
    echo -e "${BLUE}Testing frontend connection...${NC}"
    if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend connection successful${NC}"
    else
        echo -e "${RED}❌ Frontend connection failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ All connections successful${NC}"
    return 0
}

# Main execution
echo "Step 1: Killing existing processes..."

# Kill processes on specific ports
kill_port 3000 "Frontend"
kill_port 3001 "Backend"
kill_port 8000 "AI Service"

# Kill processes by name
kill_process "npm start" "npm start"
kill_process "node.*server.js" "Backend server"
kill_process "react-scripts" "React scripts"
kill_process "webpack-dev-server" "Webpack dev server"

echo ""
echo "Step 2: Clearing caches..."
clear_cache

echo ""
echo "Step 3: Starting services..."
if start_services; then
    echo ""
    echo "Step 4: Testing connections..."
    if test_connections; then
        echo ""
        echo -e "${GREEN}🎉 Project restarted successfully!${NC}"
        echo ""
        echo -e "${BLUE}Access URLs:${NC}"
        echo "Frontend: http://localhost:3000"
        echo "Backend: http://localhost:3001"
        echo "Health Check: http://localhost:3001/health"
        echo ""
        echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
        
        # Keep script running to show logs
        while true; do
            sleep 1
        done
    else
        echo -e "${RED}❌ Connection tests failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Failed to start services${NC}"
    exit 1
fi
