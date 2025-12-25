#!/bin/bash
echo "🚀 Starting MIA Logistics Manager in development mode..."
export NODE_ENV=development
export BROWSER=none
# Suppress Node.js deprecation warnings (util._extend is deprecated)
# Only suppress deprecation warnings, keep other warnings
export NODE_OPTIONS="--no-deprecation"
npm start
