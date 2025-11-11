#!/bin/bash

echo "🔄 Restart and Test MIA Logistics Manager"
echo "========================================="

# Kill existing processes
echo "Killing existing processes..."
pkill -f "react-scripts" || true
lsof -ti:3000,3001 | xargs kill -9 2>/dev/null || true

# Wait
sleep 2

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
echo "Waiting for services to start..."
sleep 30

echo "Testing services..."
echo "=================="

# Test backend
echo "1. Testing backend health..."
curl -s http://localhost:3001/health | jq '.' || echo "Backend not ready"

# Test frontend
echo "2. Testing frontend..."
curl -s http://localhost:3000 | head -5 || echo "Frontend not ready"

echo ""
echo "🎉 Services started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo ""
echo "To test login:"
echo "1. Open http://localhost:3000"
echo "2. Try login with: admin@mia.vn"
echo "3. Check browser console for logs"
echo ""
echo "To stop: kill $BACKEND_PID $FRONTEND_PID"
