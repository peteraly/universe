# 🚀 **QUICK START GUIDE**

Get the Event Compass running in under 2 minutes.

---

## **⚡ FASTEST PATH TO SUCCESS**

### **Step 1: Install Dependencies** (30 seconds)

```bash
cd discovery-dial
npm install
```

✅ **Expected:** No errors, packages install successfully

---

### **Step 2: Start Dev Server** (10 seconds)

```bash
npm run dev
```

✅ **Expected output:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### **Step 3: Open Browser** (5 seconds)

Open: **http://localhost:5173/**

✅ **You should see:**
- Black background
- White text
- Small red triangle at top (pointer)
- Circular dial in center
- Event name below dial

---

### **Step 4: Test Gestures** (60 seconds)

#### **On Desktop (Mouse):**

1. **Click and drag UP on the dial** → Category changes
2. **Click and drag LEFT/RIGHT on the dial** → Ring rotates
3. **Click and drag LEFT/RIGHT on the text below** → Event changes

#### **Keyboard Shortcuts:**

- **Arrow keys (↑ → ↓ ←)** → Change category
- **A / D keys** → Rotate subcategory
- **J / K keys** → Next/previous event

✅ **Pass:** All gestures respond smoothly

---

### **Step 5: Mobile Test** (Optional, 60 seconds)

#### **Option A: Phone/Tablet**

1. Find your local IP:
   ```bash
   npm run dev -- --host
   ```
   
2. Look for "Network:" line in output:
   ```
   ➜  Network: http://192.168.x.x:5173/
   ```

3. Open that URL on your phone

4. Test touch gestures (swipe up/down/left/right)

#### **Option B: Browser DevTools**

1. In browser, press **F12** (or Cmd+Opt+I on Mac)
2. Click **device toolbar icon** (or Cmd+Shift+M)
3. Select "iPhone 14" or similar
4. Test with mouse as touch

---

## **🎯 VERIFICATION CHECKLIST**

After completing steps 1-4, verify:

- [ ] App loads without console errors
- [ ] Background is pure black
- [ ] Text is pure white
- [ ] Red pointer visible at top
- [ ] Dial is centered
- [ ] Gestures work smoothly
- [ ] No lag or stuttering

**All checked?** ✅ **YOU'RE GOOD TO GO!**

---

## **🐛 TROUBLESHOOTING**

### **Problem: Port 5173 already in use**

**Solution:**
```bash
# Kill the process
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

---

### **Problem: "Module not found" errors**

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

### **Problem: Gestures not working**

**Check:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Verify no red error messages
4. Try refreshing the page (Cmd+R or Ctrl+R)

---

### **Problem: Blank screen**

**Solution:**
```bash
# Check the console
# Look for error message
# Most likely: missing dependency

# Try:
npm install framer-motion
npm run dev
```

---

## **🔧 ADVANCED TESTING**

### **Enable Debug Mode**

1. Open `src/config/featureFlags.js`
2. Change this line:
   ```javascript
   export const SHOW_DEBUG_INFO = true;
   ```
3. Restart dev server
4. You'll see debug overlay in bottom-right corner

---

### **Run Unit Tests**

```bash
npm test
```

✅ **Expected:** All tests pass

---

### **Build for Production**

```bash
npm run build
npm run preview
```

✅ **Expected:** Build succeeds, preview works

---

## **📱 MOBILE-SPECIFIC TESTING**

### **On Physical Device:**

1. **Haptic feedback:** Should feel small vibrations on gestures
2. **Swipe gestures:** Should feel natural and responsive
3. **Text readability:** All text should be clear and large enough
4. **No horizontal scroll:** Dial fits within screen

---

## **⚙️ CUSTOMIZE YOUR EXPERIENCE**

### **Adjust Sensitivity**

Open `src/config/compassConfig.js`:

```javascript
export const COMPASS_CONFIG = {
  gestures: {
    dialSensitivity: 100,  // Lower = more sensitive (default: 140)
  }
};
```

---

### **Toggle Features**

Open `src/config/featureFlags.js`:

```javascript
export const ENABLE_HAPTICS = false;    // Disable vibrations
export const ENABLE_INERTIA = false;    // Disable momentum
export const SHOW_DISTANCE = false;     // Hide distance in events
```

---

## **📚 NEXT STEPS**

After you've verified the basic functionality:

1. **Read full review:** See `PROJECT_REVIEW.md` for comprehensive testing
2. **Check feature flags:** See `FEATURE_FLAGS.md` for detailed flag documentation
3. **Review compliance:** See `DESIGN_COMPLIANCE.md` for requirements checklist

---

## **🎉 SUCCESS!**

If you can:
- ✅ See the dial
- ✅ Perform all 3 gestures (swipe, rotate, quick swipe)
- ✅ Navigate through events smoothly

**Then the app is working correctly!** 🚀

---

## **💡 PRO TIPS**

1. **Fast flick:** On dial, do a quick horizontal flick → watch momentum continue
2. **Keyboard navigation:** Press arrow keys rapidly → smooth category switching
3. **Mobile gestures:** Swipe from edge → feels like native app navigation
4. **Debug mode:** Enable `SHOW_DEBUG_INFO` to see internal state

---

## **📞 NEED MORE HELP?**

- **Full testing protocol:** `PROJECT_REVIEW.md` (14 phases, comprehensive)
- **Feature documentation:** `FEATURE_FLAGS.md` (all toggles explained)
- **Design requirements:** `DESIGN_COMPLIANCE.md` (what's implemented)

---

**ESTIMATED TIME TO WORKING APP: 2 MINUTES** ⏱️

Just run:
```bash
npm install && npm run dev
```

Then open **http://localhost:5173/** and start swiping! 🎉


