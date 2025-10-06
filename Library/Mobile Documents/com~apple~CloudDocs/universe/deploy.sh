#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Discovery Dial - One-Command Deploy${NC}"
echo ""
echo "Choose deployment platform:"
echo "1) Vercel (Recommended)"
echo "2) Netlify"
echo "3) GitHub Pages"
read -p "Enter choice [1-3]: " choice

case $choice in
  1)
    echo -e "${GREEN}📦 Installing Vercel CLI...${NC}"
    npm install -g vercel
    echo -e "${GREEN}🔐 Logging in to Vercel...${NC}"
    vercel login
    echo -e "${GREEN}🚀 Deploying to Vercel...${NC}"
    vercel --prod
    ;;
  2)
    echo -e "${GREEN}📦 Installing Netlify CLI...${NC}"
    npm install -g netlify-cli
    echo -e "${GREEN}🔐 Logging in to Netlify...${NC}"
    netlify login
    echo -e "${GREEN}🚀 Deploying to Netlify...${NC}"
    netlify deploy --prod --dir=dist
    ;;
  3)
    echo -e "${GREEN}📦 Building project...${NC}"
    npm run build
    echo -e "${GREEN}🚀 Deploying to GitHub Pages...${NC}"
    npm run deploy
    echo -e "${YELLOW}✅ Enable GitHub Pages at:${NC}"
    echo -e "${BLUE}https://github.com/peteraly/universe/settings/pages${NC}"
    ;;
  *)
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${YELLOW}📱 Test on your iPhone by scanning the QR code or visiting the URL${NC}"
