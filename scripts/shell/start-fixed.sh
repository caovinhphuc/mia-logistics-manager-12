#!/bin/bash

# MIA Logistics Manager - Fixed Startup Script
# ============================================

echo "🚀 Starting MIA Logistics Manager (Fixed Version)"
echo "=================================================="

# Kill any existing processes on ports 3000 and 3001
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000,3001 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 2

# Set environment variables for development
export NODE_ENV=development
export REACT_APP_USE_MOCK_DATA=true
export REACT_APP_ENABLE_GOOGLE_SHEETS=false
export REACT_APP_ENABLE_GOOGLE_DRIVE=false
export REACT_APP_ENABLE_GOOGLE_APPS_SCRIPT=false

echo "📋 Environment configured for mock mode"
echo "   - Google Sheets: DISABLED"
echo "   - Google Drive: DISABLED"
echo "   - Google Apps Script: DISABLED"
echo "   - Mock Data: ENABLED"
echo ""

# Start the React app
echo "🎯 Starting React application..."
echo "   URL: http://localhost:3000"
echo "   Press Ctrl+C to stop"
echo ""

# Start React app in foreground so we can see any errors
npm start
