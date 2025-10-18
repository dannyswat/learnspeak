#!/bin/bash

# Build script for LearnSpeak

echo "🔨 Building LearnSpeak..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Build backend
echo "🏗️  Building backend..."
cd backend
sh build.sh
cd ..

echo "✅ Build complete!"
echo ""
echo "To run in production:"
echo "  cd backend"
echo "  ./learnspeak-api"
echo ""
echo "The backend will serve the frontend from ./frontend"
