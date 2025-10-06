#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Discovery Dial - GitHub Setup Script${NC}\n"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed. Please install git first.${NC}"
    exit 1
fi

# Check if we're in a git repo already
if [ -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Already in a git repository. Creating subfolder...${NC}"
    SUBFOLDER=true
    mkdir -p discovery-dial
    cd discovery-dial
else
    SUBFOLDER=false
fi

echo -e "${GREEN}📁 Creating project structure...${NC}"

# Create directories
mkdir -p src public

# Create package.json
cat > package.json << 'PACKAGE_JSON'
{
  "name": "discovery-dial",
  "version": "1.0.0",
  "description": "Discovery Dial - Gesture-based event exploration with calendar integration",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "vite build && gh-pages -d dist"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.0.0",
    "gh-pages": "^6.1.0"
  }
}
PACKAGE_JSON

# Create vite.config.js
cat > vite.config.js << 'VITE_CONFIG'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/universe/',
})
VITE_CONFIG

# Create index.html
cat > index.html << 'INDEX_HTML'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="theme-color" content="#0F172A" />
    <title>Discovery Dial - Event Exploration</title>
    <meta name="description" content="Gesture-based event discovery with intelligent matching" />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      #root {
        width: 100vw;
        height: 100vh;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
INDEX_HTML

# Create src/main.jsx
cat > src/main.jsx << 'MAIN_JSX'
import React from 'react'
import ReactDOM from 'react-dom/client'
import DiscoveryDial from './DiscoveryDial'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DiscoveryDial />
  </React.StrictMode>,
)
MAIN_JSX

# Create .gitignore
cat > .gitignore << 'GITIGNORE'
# Dependencies
node_modules
package-lock.json
yarn.lock

# Build output
dist
build

# Environment
.env
.env.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode
.idea
*.swp
*.swo
GITIGNORE

# Create README.md
cat > README.md << 'README'
# Discovery Dial

An intelligent, gesture-based event discovery application with integrated calendar functionality.

## 🎯 Features

### Discovery Dial
- **4-Axis Navigation**: Swipe to explore events based on:
  - **North (Deep Dive)**: Similar topics, academic formats
  - **South (Vibe Shift)**: Same format, different content
  - **East (Action)**: Hands-on workshops and tours
  - **West (Social)**: Casual meetups and networking
- **Smart Algorithm**: Weighted tag similarity with category matching
- **History Navigation**: Back button to retrace your exploration

### Calendar Integration
- **Pinch-to-Zoom**: Seamlessly zoom between Month → Week → 3-Day → Day views
- **Multi-Finger Gestures**: 2-finger for standard zoom, 3-finger for fast zoom
- **Visual Feedback**: Real-time progress indicator during pinch
- **Keyboard Shortcuts**: Desktop support with +/- keys

### Mobile Optimized
- **iPhone Ready**: Safe area insets, haptic feedback
- **Touch Optimized**: 44px minimum touch targets (WCAG AAA)
- **Gesture Tutorial**: First-time user onboarding
- **Performance**: Hardware-accelerated animations, 60fps

## 🚀 Getting Started
\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
\`\`\`

## 📱 Gestures

### Discovery Dial Mode
- **Swipe Up/Down/Left/Right**: Navigate to related events
- **Long-press center orb**: Open calendar (400ms)
- **Double-tap center orb**: Save event
- **Two-finger tap**: Open category picker

### Calendar Mode
- **2-finger pinch in**: Zoom closer (Month → Week → 3-Day → Day)
- **2-finger pinch out**: Zoom farther (Day → 3-Day → Week → Month)
- **3-finger pinch**: Fast zoom (skip one level)
- **Swipe down**: Close calendar and return to dial

### Desktop Keyboard Shortcuts
- **+ / =**: Zoom in one level
- **- / _**: Zoom out one level
- **Shift + +**: Fast zoom in
- **Shift + -**: Fast zoom out
- **1-4**: Jump directly to view (1=Month, 2=Week, 3=3-Day, 4=Day)
- **T**: Jump to today
- **Esc**: Close calendar

## 🎨 Tech Stack
- **React 18**: Modern hooks-based architecture
- **Vite**: Lightning-fast build tool
- **Lucide React**: Beautiful, consistent icons
- **Custom Gestures**: Native touch event handling (no external libraries)
- **CSS-in-JS**: Inline styles with Tailwind-inspired utilities

## 📊 Data Structure
Events use the following schema:
\`\`\`javascript
{
  id: number,
  name: string,
  primaryCategory: "Professional" | "Arts/Culture" | "Social/Fun" | "Education",
  secondaryTags: string[],
  tagWeights: { [tag: string]: 1-3 },
  format: string,
  venueType: string,
  venue: string,
  address: string,
  latitude: number,
  longitude: number,
  datetime: string (ISO 8601),
  endTime: string (ISO 8601),
  url: string,
  cost: string,
  popularity: number (0-100)
}
\`\`\`

## 🔧 Customization

### Adding Your Events
Replace SAMPLE_EVENTS in src/DiscoveryDial.jsx with your CSV data:
1. Use the CSV validator tool (in artifacts)
2. Generate the data file
3. Import into the component

### Adjusting Algorithm Weights
Modify the scoring functions in calculatePeripheralEvents():
\`\`\`javascript
// Example: Boost academic events more in NORTH direction
const northCandidates = available.map(e => ({
  event: e,
  score: weightedTagSimilarity(center, e) * 100 +
         (['Lecture', 'Symposium'].includes(e.format) ? 30 : 0) // Increased from 20
}))
\`\`\`

## 📄 License
MIT

## 🤝 Contributing
Issues and pull requests welcome!

Built with ❤️ for intelligent event discovery
README

echo -e "${GREEN}✅ Project files created!${NC}\n"

echo -e "${YELLOW}📝 IMPORTANT: You need to manually copy the DiscoveryDial component!${NC}"
echo -e "${BLUE}Copy the full component code from the Claude artifact to:${NC}"
echo -e "${GREEN}   src/DiscoveryDial.jsx${NC}\n"

# Create a placeholder file with instructions
cat > src/DiscoveryDial.jsx << 'PLACEHOLDER'
// TODO: Copy the complete DiscoveryDial component from Claude artifact here
// The component should start with:
// import React, { useState, useRef, useEffect } from 'react';
// import { Calendar, MapPin, ... } from 'lucide-react';
//
// And export default DiscoveryDial at the end
import React from 'react';
const DiscoveryDial = () => {
return (
<div style={{
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
height: '100vh',
background: 'linear-gradient(to bottom, #0F172A 0%, #1E1B4B 100%)',
color: 'white',
fontFamily: 'sans-serif',
padding: '20px',
textAlign: 'center'
}}>
<div>
<h1 style={{ fontSize: '24px', marginBottom: '20px' }}>⚠️ Component Not Loaded</h1>
<p style={{ marginBottom: '10px' }}>Please copy the complete DiscoveryDial component code to:</p>
<code style={{
background: 'rgba(255,255,255,0.1)',
padding: '10px',
borderRadius: '5px',
display: 'block',
marginBottom: '20px'
}}>
src/DiscoveryDial.jsx
</code>
<p style={{ fontSize: '14px', opacity: 0.7 }}>
Get the code from the Claude artifact above
</p>
</div>
</div>
);
};
export default DiscoveryDial;
PLACEHOLDER

echo -e "${YELLOW}⏳ Waiting for you to copy the component...${NC}"
echo -e "${BLUE}Press ENTER when you've copied the code to src/DiscoveryDial.jsx${NC}"
read -r

# Initialize git if needed
if [ "$SUBFOLDER" = false ]; then
    echo -e "${GREEN}🔧 Initializing git repository...${NC}"
    git init
    git branch -M main
fi

# Add files
echo -e "${GREEN}📦 Adding files to git...${NC}"
git add .

# Commit
echo -e "${GREEN}💾 Creating commit...${NC}"
git commit -m "Add Discovery Dial - gesture-based event exploration app

Features:
- 4-axis event discovery algorithm (Deep Dive, Vibe Shift, Action, Social)
- Integrated calendar with pinch-to-zoom (Month/Week/3-Day/Day views)
- Mobile-optimized with haptic feedback and safe area support
- Custom gesture handling (swipe, long-press, double-tap, pinch)
- First-time user tutorial
- Event saving and filtering

Tech: React 18, Vite, Lucide React, Custom touch gestures"

# Add remote if needed
if [ "$SUBFOLDER" = false ]; then
    echo -e "${GREEN}🔗 Adding remote repository...${NC}"
    git remote add origin https://github.com/peteraly/universe.git
fi

# Push
echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
if [ "$SUBFOLDER" = true ]; then
    cd ..
    git add discovery-dial/
    git commit -m "Add Discovery Dial event exploration app"
fi

echo -e "${YELLOW}Enter your GitHub credentials if prompted...${NC}"
git push -u origin main

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ SUCCESS! Code pushed to GitHub!${NC}"
    echo -e "${BLUE}View at: https://github.com/peteraly/universe${NC}\n"
    echo -e "${YELLOW}📱 Next Steps:${NC}"
    echo -e "1. Run: ${GREEN}npm install${NC}"
    echo -e "2. Run: ${GREEN}npm run dev${NC}"
    echo -e "3. Test on your iPhone!"
    echo -e "4. Deploy to Vercel/Netlify (optional)\n"
else
    echo -e "\n${YELLOW}⚠️  Push failed. Common issues:${NC}"
    echo -e "- Check your GitHub credentials"
    echo -e "- Make sure the repository exists"
    echo -e "- You may need: ${GREEN}git push -f origin main${NC} (if overwriting)\n"
fi
