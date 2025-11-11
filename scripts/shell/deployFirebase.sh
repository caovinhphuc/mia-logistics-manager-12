#!/bin/bash

# Firebase Deployment Script
echo "🚀 Deploying to Firebase..."

# Install Firebase CLI if not installed
if ! command -v firebase &> /dev/null; then
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Login to Firebase
firebase login

# Initialize project (if not already done)
if [ ! -f "firebase.json" ]; then
    firebase init hosting
fi

# Build and deploy
npm run build
firebase deploy

echo "✅ Deployment completed!"
