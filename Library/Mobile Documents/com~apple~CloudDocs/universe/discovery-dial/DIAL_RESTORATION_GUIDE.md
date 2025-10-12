# 🧭 **COMPASS DIAL RESTORATION GUIDE**

## **Overview**

This guide restores the full circular compass-style dial interface with:
- **Outer Ring**: Primary categories (N/E/S/W) that rotate and snap
- **Inner Ring**: Subcategories for selected primary
- **Fixed Pointer**: Red triangle at North (doesn't rotate)
- **Event Readout**: Bottom section with swipe pagination
- **Gestures**: Rotation for categories, horizontal swipe for events

---

## **🎯 TARGET DESIGN**

```
         ▲ RED POINTER (fixed)
         |
    [N] SOCIAL
         |
[W] PROF ⊕ [E] EDU
         |
    [S] RECREATION
         |
    Event Readout
   (swipe ← →)
```

### **Visual Specifications**
- **Dial Size**: 360×360px (or `min(90vw, 520px)`)
- **Outer Ring**: White border, tick marks every 2° (major every 30°)
- **Inner Ring**: Appears after primary selection, subcategory labels
- **Pointer**: Red (#E63946), 18×12px triangle, z-index 30
- **Background**: Pure black (#000)
- **Text**: White with opacity variants (100%, 70%, 60%)

---

## **📦 IMPLEMENTATION PHASES**

### **PHASE 1: Foundation (Critical Path)**

#### **1.1 Safeguard Tailwind Classes**

**File**: `tailwind.config.js`

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // Critical positioning
    'relative', 'absolute', 'fixed', 'inset-0', 'inset-10',
    'left-1/2', 'top-1/2', '-translate-x-1/2', '-translate-y-1/2',
    'origin-center', 'origin-[0_100%]',
    
    // Z-index layers
    'z-10', 'z-20', 'z-30',
    
    // Transforms (for rotation)
    'rotate-0', 'rotate-90', 'rotate-180', 'rotate-270',
    '-rotate-90', '-rotate-180', '-rotate-270',
    
    // Text variants
    'text-white', 'text-white/60', 'text-white/70', 'text-white/80', 'text-white/90',
    'text-[11px]', 'text-xs', 'text-sm', 'text-base',
    
    // Layout
    'rounded-full', 'border', 'border-white/25', 'border-white/16',
    'pointer-events-none', 'pointer-events-auto',
    'select-none', 'touch-none',
    
    // Display
    'flex', 'items-center', 'justify-center',
    'w-full', 'h-full', 'min-h-screen',
    'overflow-hidden', 'overflow-visible'
  ]
}
```

#### **1.2 Global CSS with Mobile Optimizations**

**File**: `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Ensure full height */
html, body, #root, #__next {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  width: 100%;
  height: 100vh;
  background-color: #000000 !important;
  color: #ffffff;
  overflow: hidden;
  
  /* Mobile optimizations */
  padding: env(safe-area-inset-top) 
           env(safe-area-inset-right) 
           env(safe-area-inset-bottom) 
           env(safe-area-inset-left);
  overscroll-behavior: none;
  touch-action: pan-x pan-y;
  
  /* Font rendering */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* GPU acceleration for transforms */
[data-dial-root],
[data-dial-root] * {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

#### **1.3 HTML Viewport Meta**

**File**: `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#000000" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <title>Discovery Dial - Event Compass</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

### **PHASE 2: Dial Container Architecture**

#### **2.1 Main EventCompass Component**

**File**: `src/components/EventCompass.jsx`

```jsx
import { useState, useMemo } from 'react';
import { useMotionValue, useTransform } from 'framer-motion';
import DialOuterRing from './DialOuterRing';
import DialInnerRing from './DialInnerRing';
import RedPointer from './RedPointer';
import EventReadout from './EventReadout';
import useEventCompassState from '../hooks/useEventCompassState';
import categoriesData from '../data/categories.json';

export default function EventCompass() {
  const { state, actions } = useEventCompassState(categoriesData.categories);
  const dialRotation = useMotionValue(0);
  
  // Map categories to compass directions
  const nesw = useMemo(() => {
    const cats = state.categories || [];
    return [
      { direction: 'north', label: cats[0]?.label || 'Social', active: state.primaryIndex === 0 },
      { direction: 'east', label: cats[1]?.label || 'Educational', active: state.primaryIndex === 1 },
      { direction: 'south', label: cats[2]?.label || 'Recreational', active: state.primaryIndex === 2 },
      { direction: 'west', label: cats[3]?.label || 'Professional', active: state.primaryIndex === 3 }
    ];
  }, [state.categories, state.primaryIndex]);

  function handleDialSnap(activeIndex, rotation) {
    actions.setPrimaryByIndex(activeIndex);
    dialRotation.set(rotation);
  }

  function handleSubSelect(subIndex) {
    actions.setSubcategory(subIndex);
  }

  return (
    <div 
      className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-center"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Debug overlay (remove in production) */}
      <div className="absolute top-2 left-2 text-white/60 text-xs z-50">
        Primary: {state.primaryIndex} | Sub: {state.subIndex} | Events: {state.filteredEvents?.length || 0}
      </div>

      {/* DIAL CONTAINER */}
      <div
        data-dial-root
        className="relative select-none"
        style={{
          width: 'min(90vw, 90vh, 520px)',
          height: 'min(90vw, 90vh, 520px)',
          maxWidth: '520px',
          maxHeight: '520px'
        }}
      >
        {/* Fixed Red Pointer (z-index 30, never rotates) */}
        <RedPointer />

        {/* Outer Ring (rotates, z-index 10) */}
        <DialOuterRing
          labels={nesw}
          rotation={dialRotation}
          onSnap={handleDialSnap}
        />

        {/* Inner Ring (z-index 20, shows subcategories) */}
        {state.activePrimary && (
          <DialInnerRing
            items={state.activePrimary.subcategories?.map(s => s.label) || []}
            activeIndex={state.subIndex}
            onSelect={handleSubSelect}
          />
        )}

        {/* Center dot (visual anchor) */}
        <div 
          className="absolute left-1/2 top-1/2 w-2 h-2 bg-white rounded-full"
          style={{
            transform: 'translate(-50%, -50%)',
            opacity: 0.3,
            zIndex: 25
          }}
        />
      </div>

      {/* EVENT READOUT (below dial) */}
      <div className="mt-8 w-full max-w-[600px] px-4 text-center">
        <EventReadout
          activeEvent={state.activeEvent}
          activePrimary={state.activePrimary}
          onSwipeLeft={() => actions.nextEvent()}
          onSwipeRight={() => actions.prevEvent()}
        />
      </div>
    </div>
  );
}
```

---

### **PHASE 3: Outer Ring (Primary Categories)**

#### **3.1 DialOuterRing Component**

**File**: `src/components/DialOuterRing.jsx`

```jsx
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function DialOuterRing({ labels = [], rotation, onSnap }) {
  const [isDragging, setIsDragging] = useState(false);

  function snapRotation(deg) {
    // Snap to nearest 90° (N/E/S/W)
    const snapped = Math.round(deg / 90) * 90;
    return ((snapped % 360) + 360) % 360;
  }

  function handleDragEnd(event, info) {
    setIsDragging(false);
    const currentRotation = rotation.get();
    const delta = info.offset.x; // Horizontal drag distance
    const newRotation = currentRotation + (delta * 0.5); // Sensitivity factor
    const snapped = snapRotation(newRotation);
    
    // Calculate which index is now at North (top)
    const activeIndex = (4 - Math.round(snapped / 90)) % 4;
    
    onSnap?.(activeIndex, snapped);
  }

  return (
    <motion.div
      className="absolute inset-0 z-10"
      style={{ rotate: rotation }}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
    >
      {/* Outer circle border */}
      <div className="absolute inset-0 rounded-full border border-white/25" />

      {/* Tick marks (every 2°, major every 30°) */}
      {Array.from({ length: 180 }).map((_, i) => {
        const angle = i * 2;
        const isMajor = i % 15 === 0; // Every 30°
        return (
          <div
            key={i}
            className="absolute left-1/2 top-0"
            style={{
              width: isMajor ? '2px' : '1px',
              height: isMajor ? '12px' : '6px',
              background: `rgba(255,255,255,${isMajor ? 0.8 : 0.4})`,
              transformOrigin: 'center bottom',
              transform: `rotate(${angle}deg) translateX(-50%)`,
              marginTop: '0px'
            }}
          />
        );
      })}

      {/* Category labels at cardinal points */}
      {labels.map((label, idx) => {
        const positions = [
          { top: 8, left: '50%', transform: 'translateX(-50%)' }, // North
          { right: 8, top: '50%', transform: 'translateY(-50%) rotate(90deg)' }, // East
          { bottom: 8, left: '50%', transform: 'translateX(-50%) rotate(180deg)' }, // South
          { left: 8, top: '50%', transform: 'translateY(-50%) rotate(-90deg)' } // West
        ];

        return (
          <div
            key={label.direction}
            className={`absolute text-[11px] md:text-sm font-medium tracking-wide z-10 ${
              label.active ? 'text-white' : 'text-white/60'
            }`}
            style={positions[idx]}
          >
            {label.label.toUpperCase()}
          </div>
        );
      })}
    </motion.div>
  );
}
```

---

### **PHASE 4: Inner Ring (Subcategories)**

#### **4.1 DialInnerRing Component**

**File**: `src/components/DialInnerRing.jsx`

```jsx
export default function DialInnerRing({ items = [], activeIndex = 0, onSelect }) {
  if (!items || items.length === 0) return null;

  const count = items.length;

  return (
    <div className="absolute inset-10 z-20 rounded-full border border-white/16">
      {items.map((label, i) => {
        const angle = (i / count) * 360;
        const isActive = i === activeIndex;
        const radius = 135; // Distance from center

        return (
          <button
            key={`${label}-${i}`}
            onClick={() => onSelect(i)}
            className={`absolute left-1/2 top-1/2 text-xs font-medium ${
              isActive ? 'text-white' : 'text-white/70'
            }`}
            style={{
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(${-angle}deg)`,
              zIndex: 21,
              pointerEvents: 'auto'
            }}
          >
            {label.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
```

---

### **PHASE 5: Fixed Red Pointer**

#### **5.1 RedPointer Component (Already Correct)**

**File**: `src/components/RedPointer.jsx`

```jsx
export default function RedPointer() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 -translate-x-1/2"
      style={{ top: 6, zIndex: 30 }}
      width="18"
      height="12"
      viewBox="0 0 18 12"
      focusable="false"
    >
      <path d="M9 0 L18 12 H0 Z" fill="#E63946" />
    </svg>
  );
}
```

---

### **PHASE 6: Event Readout with Swipe**

#### **6.1 Enhanced EventReadout**

**File**: `src/components/EventReadout.jsx`

```jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import useReducedMotion from '../hooks/useReducedMotion';

export default function EventReadout({ activeEvent, activePrimary, onSwipeLeft, onSwipeRight }) {
  const prefersReducedMotion = useReducedMotion();

  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipeLeft?.(),
    onSwipedRight: () => onSwipeRight?.(),
    preventScrollOnSwipe: true,
    trackMouse: true,
    delta: 50 // Minimum swipe distance
  });

  if (!activeEvent) {
    return (
      <div className="w-full px-4 py-6 text-center mx-auto">
        <p className="text-white/50">No events found</p>
      </div>
    );
  }

  return (
    <div 
      {...handlers}
      className="w-full px-4 py-6 text-center mx-auto touch-none"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeEvent.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <h2 className="text-white font-bold mb-2 text-2xl md:text-3xl leading-tight">
            {activeEvent.name}
          </h2>

          {activeEvent.tags && activeEvent.tags.length > 0 && (
            <p className="text-white/70 mb-1 text-sm md:text-base">
              {activeEvent.tags.join(' · ')} · {activePrimary?.label}
            </p>
          )}

          {activeEvent.address && (
            <p className="text-white/80 mb-1 text-sm md:text-base">
              {activeEvent.address}
            </p>
          )}

          <div className="text-white/70 flex items-center justify-center gap-3 text-sm md:text-base">
            {activeEvent.time && <span>{activeEvent.time}</span>}
            {activeEvent.distance && (
              <>
                <span>·</span>
                <span>{activeEvent.distance}</span>
              </>
            )}
          </div>

          {/* Swipe indicator */}
          <div className="mt-4 text-white/40 text-xs">
            ← Swipe to change event →
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

---

## **📦 REQUIRED DEPENDENCIES**

```bash
npm install framer-motion react-swipeable
```

---

## **✅ TESTING CHECKLIST**

### **Local Testing**
- [ ] Outer ring rotates smoothly on drag
- [ ] Ring snaps to N/E/S/W on release
- [ ] Active category label is bright, others faded
- [ ] Red pointer stays fixed at top (doesn't rotate)
- [ ] Inner ring appears after selecting primary
- [ ] Subcategories clickable and update state
- [ ] Event readout shows correct filtered events
- [ ] Swipe left/right changes events
- [ ] No console errors

### **Production (Vercel) Testing**
- [ ] Run diagnostic script (see DIAL_DIAGNOSTIC.md)
- [ ] Hard refresh (Cmd+Shift+R)
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Verify no layout shift vs localhost
- [ ] Check Network tab for missing assets
- [ ] Verify categories.json loaded

---

## **🚀 DEPLOYMENT STEPS**

```bash
# 1. Test build locally
npm run build
npm run preview

# 2. Commit changes
git add .
git commit -m "feat: restore compass dial with outer/inner rings"
git push origin master

# 3. Deploy to Vercel (auto-deploys on push)
# Or manual:
cd discovery-dial
npx vercel --prod --yes

# 4. Clear cache if needed
# Vercel Dashboard → Deployments → Redeploy → "Clear build cache"
```

---

## **🐛 TROUBLESHOOTING**

See `DIAL_DIAGNOSTIC.md` for detailed diagnostic procedures.

**Quick Fixes:**
- **Dial still flat**: Check Tailwind safelist
- **No rotation**: Verify Framer Motion installed
- **Pointer misplaced**: Check z-index hierarchy
- **Gestures broken**: Verify event handlers attached
- **Layout differs**: Clear Vercel build cache

