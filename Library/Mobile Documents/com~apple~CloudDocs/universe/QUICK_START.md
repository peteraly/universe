# 🚀 Discovery Dial - Quick Start Guide

Get your Discovery Dial app up and running in minutes with this streamlined setup process.

## ⚡ One-Command Setup

```bash
# 1. Make the setup script executable
chmod +x setup-and-push.sh

# 2. Run the automated setup
./setup-and-push.sh

# 3. Follow the prompts:
#    - Copy the DiscoveryDial component code
#    - Press ENTER when ready
#    - Enter GitHub credentials when prompted

# 4. Install dependencies and test
npm install
npm run dev
```

## 📱 What You Get

### Complete Project Structure
```
discovery-dial/
├── src/
│   ├── main.jsx
│   └── DiscoveryDial.jsx (you'll copy this)
├── public/
├── package.json
├── vite.config.js
├── index.html
├── .gitignore
└── README.md
```

### Mobile-Optimized Features
- ✅ **4-Axis Gesture Navigation** (Swipe Up/Down/Left/Right)
- ✅ **Calendar Integration** (Pinch-to-zoom: Month/Week/3-Day/Day)
- ✅ **iPhone Ready** (Safe area, haptic feedback)
- ✅ **Touch Optimized** (44px touch targets)
- ✅ **PWA Support** (Add to Home Screen)

## 🎯 Next Steps

### 1. Copy the Component Code
The setup script will pause and ask you to copy the complete `DiscoveryDial` component code to `src/DiscoveryDial.jsx`. This is the main component with all the gesture handling and calendar functionality.

### 2. Test Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser: http://localhost:5173
```

### 3. Test on Mobile
```bash
# Find your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Access from mobile: http://[your-ip]:5173
# Example: http://192.168.1.100:5173
```

### 4. Deploy to Production
```bash
# Use the deployment script
chmod +x deploy.sh
./deploy.sh

# Choose your platform:
# 1) Vercel (Recommended)
# 2) Netlify  
# 3) GitHub Pages
```

## 📱 Mobile Testing

### iPhone Gestures
- **Swipe Up**: Deep Dive (similar topics)
- **Swipe Down**: Vibe Shift (different content)
- **Swipe Left**: Social (meetups, networking)
- **Swipe Right**: Action (workshops, tours)
- **Long-press center**: Open calendar
- **Double-tap center**: Save event
- **Two-finger tap**: Category picker

### Calendar Gestures
- **2-finger pinch in**: Zoom closer
- **2-finger pinch out**: Zoom farther
- **3-finger pinch**: Fast zoom
- **Swipe down**: Close calendar

## 🔧 Customization

### Adding Your Events
Replace the sample events in `src/DiscoveryDial.jsx` with your own data:

```javascript
// Replace SAMPLE_EVENTS with your event data
const SAMPLE_EVENTS = [
  {
    id: 1,
    name: "Your Event Name",
    primaryCategory: "Professional",
    secondaryTags: ["networking", "tech"],
    // ... rest of your event data
  }
  // ... more events
];
```

### Adjusting Algorithm Weights
Modify the scoring in `calculatePeripheralEvents()`:

```javascript
// Example: Boost academic events in NORTH direction
const northCandidates = available.map(e => ({
  event: e,
  score: weightedTagSimilarity(center, e) * 100 +
         (['Lecture', 'Symposium'].includes(e.format) ? 30 : 0)
}));
```

## 🚀 Deployment Options

### Vercel (Recommended)
- ⚡ Fastest deployment
- 🔄 Auto-deploy on git push
- 📱 Excellent mobile performance
- 🆓 Generous free tier

### Netlify
- ⚡ Fast deployment
- 🔄 Auto-deploy on git push
- 📱 Great mobile performance
- 🆓 Generous free tier

### GitHub Pages
- 🐢 Slower but reliable
- 🔄 Auto-deploy on git push
- 🆓 Unlimited free hosting
- ⚠️ Limited custom domain options

## 📊 Performance Targets

### Mobile Performance
- **Load Time**: < 3 seconds on 3G
- **First Interaction**: < 1 second
- **Gesture Response**: < 100ms
- **Animation**: 60fps smooth
- **Memory**: < 50MB usage

### Core Web Vitals
- **FCP**: < 1.8s (First Contentful Paint)
- **LCP**: < 2.5s (Largest Contentful Paint)
- **CLS**: < 0.1 (Cumulative Layout Shift)
- **FID**: < 100ms (First Input Delay)

## 🐛 Troubleshooting

### Common Issues

**Setup Script Fails:**
```bash
# Check git is installed
git --version

# Check if in correct directory
pwd

# Make script executable
chmod +x setup-and-push.sh
```

**Gestures Not Working:**
- Test on actual mobile device (not browser dev tools)
- Check viewport meta tag in `index.html`
- Ensure touch events are properly handled

**Build Fails:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Deployment Issues:**
- Check platform-specific logs
- Verify build completed successfully
- Ensure correct output directory

## 📚 Additional Resources

### Documentation
- [Complete Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Mobile Testing Guide](MOBILE_TESTING_GUIDE.md)
- [Full README](README.md)

### Support
- Check browser console for errors
- Test on multiple devices
- Use Chrome DevTools mobile simulation
- Gather real user feedback

## 🎯 Success Checklist

Before going live, ensure:

- [ ] All gestures work on iPhone
- [ ] Calendar pinch-to-zoom functions
- [ ] Performance meets benchmarks
- [ ] Cross-browser compatibility
- [ ] Mobile-optimized layout
- [ ] PWA features working
- [ ] Analytics configured (optional)
- [ ] Error monitoring in place

## 🚀 Ready to Launch!

Once you've completed the setup and testing:

1. **Deploy to production** using your chosen platform
2. **Test on real devices** with actual users
3. **Monitor performance** and user feedback
4. **Iterate and improve** based on usage patterns

---

**Happy Building! 🎉📱**

The Discovery Dial app is designed to provide an intuitive, gesture-based way to explore events. With proper setup and testing, it will deliver a smooth, mobile-optimized experience for your users.

