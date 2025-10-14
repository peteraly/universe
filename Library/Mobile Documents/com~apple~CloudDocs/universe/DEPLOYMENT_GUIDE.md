# 🚀 Discovery Dial - Complete Deployment Guide

This guide covers deployment to Vercel, Netlify, and GitHub Pages with mobile optimization.

## 📋 Prerequisites

- Node.js 18+ installed
- Git repository with Discovery Dial code
- GitHub account (for all platforms)

## 🎯 Platform Comparison

| Platform | Speed | Auto-Deploy | Custom Domain | Free Tier | Mobile Performance |
|----------|-------|-------------|---------------|-----------|-------------------|
| **Vercel** | ⚡️ Fastest | ✅ Yes | ✅ Yes | ✅ Generous | 🏆 Excellent |
| **Netlify** | ⚡️ Fast | ✅ Yes | ✅ Yes | ✅ Generous | 🏆 Excellent |
| **GitHub Pages** | 🐢 Slower | ✅ Yes | ⚠️ Limited | ✅ Unlimited | 🟡 Good |

**Recommendation**: Use Vercel for best mobile performance and easiest setup.

---

## 🚀 Option 1: Vercel (Recommended)

### Method A: Vercel CLI (Instant Deployment)

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Navigate to your project
cd discovery-dial

# 3. Login to Vercel (opens browser)
vercel login

# 4. Deploy (first deployment)
vercel

# Follow the prompts:
# ? Set up and deploy "~/discovery-dial"? [Y/n] Y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] N
# ? What's your project's name? discovery-dial
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] N

# 5. Deploy to production
vercel --prod

# You'll get a URL like: https://discovery-dial.vercel.app
```

### Method B: GitHub Integration (Auto-Deploy)

```bash
# 1. Push your code to GitHub (you've already done this)
git push origin main

# 2. Go to https://vercel.com/new

# 3. Click "Import Git Repository"

# 4. Select "peteraly/universe"

# 5. Configure:
#    - Framework Preset: Vite
#    - Root Directory: discovery-dial (if it's in a subfolder)
#    - Build Command: npm run build
#    - Output Directory: dist

# 6. Click "Deploy"

# ✅ Done! Every push to main auto-deploys
```

### Vercel Configuration (Optional)

Create `vercel.json` in your project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🌐 Option 2: Netlify

### Method A: Netlify CLI

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Navigate to project
cd discovery-dial

# 3. Login
netlify login

# 4. Initialize site
netlify init

# Follow prompts:
# ? What would you like to do? Create & configure a new site
# ? Team: [Your Team]
# ? Site name: discovery-dial
# ? Build command: npm run build
# ? Directory to deploy: dist
# ? Netlify functions folder: [leave blank]

# 5. Deploy
netlify deploy --prod

# You'll get a URL like: https://discovery-dial.netlify.app
```

### Method B: Drag & Drop (Simplest)

```bash
# 1. Build your project
npm run build

# 2. Go to https://app.netlify.com/drop

# 3. Drag the 'dist' folder onto the page

# ✅ Instant deployment! (but no auto-deploy on git push)
```

### Method C: Connect to GitHub (Auto-Deploy)

```bash
# 1. Go to https://app.netlify.com/start

# 2. Click "Import from Git" → GitHub

# 3. Select "peteraly/universe"

# 4. Configure build settings:
#    - Base directory: discovery-dial (if in subfolder)
#    - Build command: npm run build
#    - Publish directory: discovery-dial/dist

# 5. Click "Deploy site"

# ✅ Auto-deploys on every push!
```

### Netlify Configuration

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

# Optional: Custom domain
# [[redirects]]
#   from = "https://discovery-dial.yourdomain.com/*"
#   to = "https://discovery-dial.netlify.app/:splat"
#   status = 301
#   force = true
```

---

## 📄 Option 3: GitHub Pages (Free, Simple)

```bash
# 1. Add deployment script to package.json
# (Already included in the setup script)

# 2. Install gh-pages
npm install --save-dev gh-pages

# 3. Update vite.config.js with correct base path
# Change base to match your repo name:
# vite.config.js:
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/universe/', // Change to your repo name
})

# 4. Deploy
npm run build
npm run deploy

# 5. Enable GitHub Pages
# Go to: https://github.com/peteraly/universe/settings/pages
# Source: Deploy from branch → gh-pages → root → Save

# Your site will be at:
# https://peteraly.github.io/universe/
```

---

## 📱 Mobile Optimization Setup

### PWA Configuration

Create `public/manifest.json`:

```json
{
  "name": "Discovery Dial",
  "short_name": "Discovery",
  "description": "Gesture-based event exploration",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F172A",
  "theme_color": "#0F172A",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add to `index.html` `<head>`:

```html
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/icon-192.png" />
```

### iPhone Testing Setup

```bash
# Install QR code generator for easy testing
npm install -g qrcode-terminal

# Generate QR code for your deployed URL
qrcode-terminal "https://your-app-url.vercel.app"

# Or use online tool:
# https://www.qr-code-generator.com/
```

---

## 🧪 iPhone Testing Checklist

Once deployed, test these on your iPhone:

### Core Functionality
- [ ] Open URL in Safari
- [ ] Swipe gestures (all 4 directions)
- [ ] Long-press center orb (calendar opens)
- [ ] Double-tap to save event
- [ ] Two-finger tap (category picker)

### Calendar Features
- [ ] Calendar: 2-finger pinch zoom
- [ ] Calendar: 3-finger fast zoom
- [ ] Calendar: Swipe down to close

### Mobile Experience
- [ ] Add to Home Screen (works like native app)
- [ ] Landscape mode
- [ ] Notch/safe area handling
- [ ] Haptic feedback (vibrations)
- [ ] Performance (smooth 60fps)

### Gesture Tutorial
- [ ] First-time user onboarding appears
- [ ] All gesture instructions are clear
- [ ] Tutorial can be skipped
- [ ] Tutorial reappears if needed

---

## 🚀 One-Command Deploy Script

Use the included `deploy.sh` script:

```bash
# Make executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

This script will:
1. Ask you to choose a platform
2. Install the necessary CLI tools
3. Deploy your app
4. Provide testing instructions

---

## 🔧 Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Mobile Gestures Not Working:**
- Check viewport meta tag in `index.html`
- Ensure touch events are properly handled
- Test on actual device (not browser dev tools)

**Deployment URL Not Working:**
- Check if the build completed successfully
- Verify the correct output directory
- Check platform-specific logs

**GitHub Pages 404:**
- Ensure `base` path in `vite.config.js` matches your repo name
- Check that `gh-pages` branch was created
- Verify GitHub Pages settings

### Performance Optimization

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Check mobile performance
# Use Chrome DevTools → Lighthouse → Mobile
```

---

## 📊 Analytics & Monitoring

### Vercel Analytics
```bash
# Add to your project
npm install @vercel/analytics

# Add to main.jsx
import { Analytics } from '@vercel/analytics/react'

# Wrap your app
<Analytics />
```

### Netlify Analytics
- Available in Netlify dashboard
- No code changes needed

### Custom Analytics
```javascript
// Track gesture usage
const trackGesture = (direction) => {
  // Your analytics code here
  console.log(`Gesture: ${direction}`)
}
```

---

## 🎯 Next Steps After Deployment

1. **Test on Multiple Devices**
   - iPhone (Safari)
   - Android (Chrome)
   - iPad (Safari)
   - Desktop (Chrome, Firefox, Safari)

2. **Performance Monitoring**
   - Use Lighthouse for mobile performance
   - Monitor Core Web Vitals
   - Check gesture responsiveness

3. **User Feedback**
   - Add feedback mechanism
   - Monitor usage patterns
   - Iterate based on real usage

4. **SEO Optimization**
   - Add meta tags for social sharing
   - Implement structured data
   - Optimize for search engines

---

## 🆘 Support

If you encounter issues:

1. **Check the logs** in your deployment platform
2. **Test locally** with `npm run dev`
3. **Verify mobile viewport** settings
4. **Check browser console** for errors
5. **Test on actual device** (not just dev tools)

For Discovery Dial specific issues, check:
- Gesture event handlers
- Touch event compatibility
- CSS for mobile optimization
- React state management

---

**Happy Deploying! 🚀📱**

