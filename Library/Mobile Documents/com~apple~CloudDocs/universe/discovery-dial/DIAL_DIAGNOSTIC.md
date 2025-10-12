# 🔍 COMPASS DIAL DIAGNOSTIC PROTOCOL

## **Quick Console Checks (Run in Production)**

Open your deployed site and paste this in DevTools console:

```javascript
// ====== DIAGNOSTIC SCRIPT ======

console.log('=== DIAL DIAGNOSTIC START ===');

// 1) Is the dial wrapper present?
const dial = document.querySelector('[data-dial-root]');
console.log('1. Dial wrapper found:', !!dial);
if (dial) {
  console.log('   → Bounds:', dial.getBoundingClientRect());
  console.log('   → Classes:', dial.className);
}

// 2) Is the SVG ring present?
const svg = dial?.querySelector('svg');
console.log('2. SVG ring found:', !!svg);
if (svg) {
  console.log('   → Bounds:', svg.getBoundingClientRect());
  console.log('   → ViewBox:', svg.getAttribute('viewBox'));
}

// 3) Critical class check
console.log('3. Critical classes:');
console.log('   → Has relative:', dial?.classList?.contains('relative'));
console.log('   → Has absolute children:', !!dial?.querySelector('.absolute'));
console.log('   → Transform classes:', Array.from(dial?.querySelectorAll('[class*="translate"]') || []).length);

// 4) Check for positioning context
const computedStyle = dial ? window.getComputedStyle(dial) : null;
console.log('4. Computed positioning:');
console.log('   → Position:', computedStyle?.position);
console.log('   → Display:', computedStyle?.display);
console.log('   → Dimensions:', computedStyle?.width, 'x', computedStyle?.height);

// 5) Check for categories data
console.log('5. Check React state (if available):');
try {
  const reactKey = Object.keys(dial || {}).find(key => key.startsWith('__reactInternalInstance'));
  console.log('   → React fiber found:', !!reactKey);
} catch (e) {
  console.log('   → React check failed:', e.message);
}

// 6) Framer Motion check
const motionElements = document.querySelectorAll('[class*="motion-"]');
console.log('6. Framer Motion elements:', motionElements.length);

console.log('=== DIAL DIAGNOSTIC END ===');
```

---

## **Interpretation Guide**

| Finding | Diagnosis | Fix |
|---------|-----------|-----|
| `NO DIAL NODE` | Component didn't mount | Add `"use client"` to components |
| `Width/Height ≈ 0` | Tailwind classes purged | Add safelist in `tailwind.config.js` |
| `!hasRelative` | Positioning context lost | Ensure `relative` class on wrapper |
| `!hasAbsoluteChild` | Children not positioned | Check CategoryLabels, RedPointer |
| `0 motion- elements` | Framer Motion not loaded | Check imports and build |
| `React fiber not found` | Hydration failed | Check SSR vs client rendering |

---

## **Common Production Issues**

### **Issue 1: Dial Appears as Static Text Stack**
- **Symptom**: Categories in vertical list, no rotation
- **Cause**: CSS transforms not applied
- **Quick Fix**: Check if `transform` style is in computed styles

### **Issue 2: Red Pointer Missing or Misplaced**
- **Symptom**: No triangle at top, or it's over event readout
- **Cause**: Z-index lost or absolute positioning removed
- **Quick Fix**: Verify `zIndex: 20` and `absolute` class

### **Issue 3: Subcategories Don't Appear**
- **Symptom**: Inner ring empty after selection
- **Cause**: State not updating or component not re-rendering
- **Quick Fix**: Check React DevTools for state changes

### **Issue 4: Gestures Don't Work**
- **Symptom**: Can't rotate dial or swipe events
- **Cause**: Event handlers not attached or `pointer-events-none` on wrong element
- **Quick Fix**: Check `bindDialAreaProps` is spread correctly

---

## **Build Verification Checklist**

Run locally before deploying:

```bash
# 1. Clean build
npm run build

# 2. Preview production build
npm run preview

# 3. Check bundle size
ls -lh dist/assets/*.js

# 4. Verify categories.json is in dist
find dist -name "categories.json"

# 5. Check for CSS
ls -lh dist/assets/*.css
```

Expected output:
- JS bundle: ~280KB gzipped
- CSS bundle: ~14KB gzipped
- No errors about missing modules

---

## **Vercel Deployment Checks**

After deploying:

1. **Hard Refresh**: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)
2. **Check Build Logs**: Look for warnings about purged classes
3. **Network Tab**: Verify all assets load (200 status)
4. **Console**: No errors about missing components

---

## **Emergency Rollback**

If production is broken:

```bash
# Revert to last working deployment
git log --oneline -5  # Find last good commit
vercel rollback [DEPLOYMENT_URL]
```

Or in Vercel dashboard:
1. Go to Deployments
2. Find last working deployment
3. Click "Promote to Production"

