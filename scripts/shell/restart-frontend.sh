#!/bin/bash

echo "🔄 Restarting Frontend Only"
echo "=========================="

# Kill existing frontend processes
echo "Killing existing frontend processes..."
pkill -f "react-scripts" || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Wait
sleep 2

# Start frontend
echo "Starting frontend..."
npm start &
FRONTEND_PID=$!

echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Waiting for frontend to start..."
sleep 30

echo "Testing frontend..."
echo "=================="

# Test frontend
echo "Testing frontend..."
curl -s http://localhost:3000 | head -5 || echo "Frontend not ready"

echo ""
echo "🎉 Frontend restarted!"
echo "Frontend: http://localhost:3000"
echo ""
echo "To test login:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Try to login with: admin@mia.vn"
echo "3. Check browser console for any errors"
echo ""
echo "To stop: kill $FRONTEND_PID"
