#!/bin/bash

# MIA Logistics Manager - Restart with Environment Variables
# Restart the project to load environment variables properly

echo "🚀 MIA Logistics Manager - Restart with Environment Variables"
echo "============================================================="
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

# Function to check environment variables
check_env_vars() {
    echo -e "${YELLOW}Checking environment variables...${NC}"

    # Check if .env file exists
    if [ ! -f ".env" ]; then
        echo -e "${RED}❌ .env file not found${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ .env file found${NC}"

    # Check key environment variables
    local client_id=$(grep "REACT_APP_GOOGLE_CLIENT_ID" .env | cut -d'=' -f2)
    local spreadsheet_id=$(grep "REACT_APP_GOOGLE_SPREADSHEET_ID" .env | cut -d'=' -f2)
    local api_key=$(grep "REACT_APP_GOOGLE_API_KEY" .env | cut -d'=' -f2)

    if [ "$client_id" = "your_actual_client_id_here" ] || [ -z "$client_id" ]; then
        echo -e "${RED}❌ REACT_APP_GOOGLE_CLIENT_ID not configured properly${NC}"
        return 1
    fi

    if [ "$spreadsheet_id" = "your_spreadsheet_id_here" ] || [ -z "$spreadsheet_id" ]; then
        echo -e "${RED}❌ REACT_APP_GOOGLE_SPREADSHEET_ID not configured properly${NC}"
        return 1
    fi

    if [ "$api_key" = "your_actual_api_key_here" ] || [ -z "$api_key" ]; then
        echo -e "${RED}❌ REACT_APP_GOOGLE_API_KEY not configured properly${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ Environment variables configured properly${NC}"
    echo -e "${BLUE}Client ID: ${client_id:0:20}...${NC}"
    echo -e "${BLUE}Spreadsheet ID: ${spreadsheet_id}${NC}"
    echo -e "${BLUE}API Key: ${api_key:0:20}...${NC}"

    return 0
}

# Function to start services
start_services() {
    echo -e "${YELLOW}Starting services...${NC}"

    # Start backend
    echo -e "${BLUE}Starting backend...${NC}"
    (cd backend && npm start) &

    # Wait for backend
    sleep 5

    # Start frontend with environment variables
    echo -e "${BLUE}Starting frontend with environment variables...${NC}"
    npm start &

    # Wait for frontend
    sleep 10

    echo -e "${GREEN}✅ Services started${NC}"
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

    # Test Google Sheets connection
    echo -e "${BLUE}Testing Google Sheets connection...${NC}"
    local sheets_response=$(curl -s http://localhost:3001/api/sheets/test)
    if echo "$sheets_response" | grep -q "success.*true"; then
        echo -e "${GREEN}✅ Google Sheets connection successful${NC}"
    else
        echo -e "${RED}❌ Google Sheets connection failed${NC}"
        echo -e "${YELLOW}Response: $sheets_response${NC}"
    fi

    return 0
}

# Main execution
echo "Step 0: Checking environment variables..."
if ! check_env_vars; then
    echo -e "${RED}❌ Environment variables not configured properly${NC}"
    echo -e "${YELLOW}Please check your .env file and configure the required variables${NC}"
    exit 1
fi

echo ""
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
echo "Step 2: Starting services..."
start_services

echo ""
echo "Step 3: Testing connections..."
if test_connections; then
    echo -e "${GREEN}✅ All connections successful${NC}"
else
    echo -e "${RED}❌ Some connections failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Project restarted with environment variables!${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo "Frontend: http://localhost:3000"
echo "Backend: http endpoint:3001"
echo "Health Check: http://localhost:3001/health"
echo "Google Sheets Test: http://localhost:3001/api/sheets/test"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"

# Keep running
while true; do
    sleep 1
done
