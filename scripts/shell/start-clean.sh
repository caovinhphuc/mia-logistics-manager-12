#!/bin/bash

# MIA Logistics Manager - Clean Start Script
# Simple script to kill ports and start the project

echo "🚀 MIA Logistics Manager - Clean Start"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Kill existing processes
echo -e "${YELLOW}Killing existing processes...${NC}"

# Kill processes on ports
echo -e "${BLUE}Killing processes on ports 3000, 3001, 8000...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Kill npm processes
echo -e "${BLUE}Killing npm processes...${NC}"
pkill -f "npm start" 2>/dev/null || true
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true

echo -e "${GREEN}✅ Processes killed${NC}"

# Clear cache
echo -e "${YELLOW}Clearing cache...${NC}"
npm cache clean --force 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf backend/node_modules/.cache 2>/dev/null || true
rm -rf build 2>/dev/null || true
rm -rf temp 2>/dev/null || true

echo -e "${GREEN}✅ Cache cleared${NC}"

# Start services
echo -e "${YELLOW}Starting services...${NC}"

# Start backend
echo -e "${BLUE}Starting backend...${NC}"
cd backend && npm start &
cd ..

# Wait for backend
sleep 5

# Start frontend
echo -e "${BLUE}Starting frontend...${NC}"
npm start &

# Wait for frontend
sleep 10

# Test connections
echo -e "${YELLOW}Testing connections...${NC}"

if curl -s -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
fi

if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Project started!${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"

# Keep running
while true; do
    sleep 1
done
