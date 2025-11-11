#!/bin/bash

echo "🔄 Force restart MIA Logistics Manager"
echo "====================================="

# Kill all processes
echo "Killing all processes..."
pkill -f "react-scripts" || true
pkill -f "npm start" || true
pkill -f "node.*server.js" || true
lsof -ti:3000,3001,8000 | xargs kill -9 2>/dev/null || true

# Clear all caches
echo "Clearing all caches..."
rm -rf node_modules/.cache
rm -rf build
rm -rf temp
npm cache clean --force

# Wait
echo "Waiting for processes to stop..."
sleep 3

# Start backend
echo "Starting backend..."
cd backend && npm start &
BACKEND_PID=$!
cd ..

# Wait for backend
sleep 5

# Start frontend
echo "Starting frontend..."
npm start &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Services starting... Please wait 30 seconds for full startup"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo ""
echo "To stop: kill $BACKEND_PID $FRONTEND_PID"
