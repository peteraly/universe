#!/bin/bash

# Deploy Discovery Dial to hyyper.co
# This script helps deploy your Discovery Dial app to Vercel with custom domain

echo "🚀 Deploying Discovery Dial to hyyper.co"
echo "========================================"

# Check if we're in the right directory
if [ ! -d "discovery-dial" ]; then
    echo "❌ Error: discovery-dial directory not found"
    echo "Please run this script from the universe directory"
    exit 1
fi

# Navigate to discovery-dial directory
cd discovery-dial

echo "📦 Building Discovery Dial application..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🌐 Deploying to Vercel..."

# Deploy to Vercel
vercel --prod

echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Add custom domain: hyyper.co"
echo "3. Configure DNS settings as instructed"
echo "4. Add environment variable: WORDPRESS_API_URL=https://hyyper.co/wp-json/wp/v2"
echo ""
echo "Your Discovery Dial will be available at hyyper.co!"
