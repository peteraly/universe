# 🎯 GESTURE FEEDBACK ENHANCEMENT - Clear Distinction Between Primary & Subcategory Navigation

## **CURRENT PROBLEM:**
Users may not clearly understand the difference between:
1. **Directional swipes** (Up/Down/Left/Right) → Change primary category
2. **Circular drag** (Rotate) → Change subcategory

Both happen on the same dial area, need clear visual/audio/haptic differentiation.

---

## **SOLUTION: Multi-Sensory Feedback System**

### **Design Principle:**
Each gesture type should have UNIQUE feedback across 3 channels:
1. **Visual** - What you see
2. **Haptic** - What you feel  
3. **Audio** (optional) - What you hear

---

## **GESTURE 1: PRIMARY CATEGORY SWITCH (Directional Swipe)**

### **Visual Feedback:**

#### **During Swipe (Real-time):**
```javascript
- Dim ALL primary labels to 20% opacity
- Bright arrow/indicator appears in swipe direction
- Crosshairs pulse/glow
- Subtle color shift (white → blue tint)
```

#### **On Commit:**
```javascript
- Flash animation on new primary label
- All subcategories fade out → new ones fade in
- Brief radial burst from center
- Primary label scales up momentarily (1.2x → 1.0x)
```

#### **Visual Indicators:**
```javascript
// Show directional arrows during swipe
┌─────────────┐
│      ↑      │  ← Arrow appears
│   [DIAL]    │
│             │
└─────────────┘
```

---

## **GESTURE 2: SUBCATEGORY ROTATION (Circular Drag)**

### **Visual Feedback:**

#### **During Rotation (Real-time):**
```javascript
- Subcategory labels rotate smoothly
- Active tick mark elongates/brightens
- Subtle circular trail effect
- Circle border thickens slightly
```

#### **On Snap:**
```javascript
- New subcategory label pulses
- Tick mark settles with spring animation
- Subtle glow around active subcategory
- Event readout updates with slide transition
```

#### **Visual Indicators:**
```javascript
// Show rotation progress
┌─────────────┐
│   WORKSHOPS │  ← Label rotating
│   [DIAL] ↻  │  ← Rotation indicator
│   TALKS     │
└─────────────┘
```

---

## **HAPTIC PATTERNS:**

### **Primary Category (Directional):**
```javascript
// STRONG, DISTINCT pattern
vibrate([0, 50, 100, 50])  // Double pulse, strong
// Feel: DA-DUM (authoritative, categorical)
```

### **Subcategory (Rotation):**
```javascript
// SOFT, CONTINUOUS pattern
vibrate([0, 15, 30, 15, 30, 15])  // Triple tick, soft
// Feel: tick-tick-tick (gentle, continuous)
```

### **During Drag:**
```javascript
// Subcategory rotation: tick on each snap point
// Primary swipe: single strong pulse on commit
```

---

## **AUDIO FEEDBACK (Optional):**

### **Primary Category:**
```javascript
// Low-pitched "whoosh" sound (150-200 Hz)
// Duration: 200ms
// Volume: Medium
// Feel: Authoritative, page-turn
```

### **Subcategory:**
```javascript
// High-pitched "click" (800-1000 Hz)
// Duration: 50ms
// Volume: Soft
// Feel: Mechanical, dial-click
```

---

## **COMPLETE IMPLEMENTATION:**

```javascript
import { useMemo, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEventCompassState from '../hooks/useEventCompassState';
import useDialGestures from '../hooks/useDialGestures';
import { hardTick, softTick } from '../utils/haptics';

/**
 * Enhanced gesture feedback for clear distinction between:
 * - Primary category switch (directional swipe)
 * - Subcategory rotation (circular drag)
 */
export default function EventCompassFinal({ categories = [], config = {} }) {
  const [dialSize, setDialSize] = useState(400);
  const [gestureState, setGestureState] = useState({
    type: null,  // 'primary' | 'subcategory' | null
    direction: null,  // 'north' | 'east' | 'south' | 'west' | 'rotate'
    isActive: false
  });
  
  useEffect(() => {
    const calculateSize = () => {
      const size = Math.min(
        window.innerWidth * 0.85,
        window.innerHeight * 0.5,
        480
      );
      setDialSize(size);
    };
    
    calculateSize();
    window.addEventListener('resize', calculateSize);
    return () => window.removeEventListener('resize', calculateSize);
  }, []);
  
  const { state, actions } = useEventCompassState(categories);
  
  // Enhanced haptic patterns
  const primaryHaptic = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate([0, 50, 100, 50]); // Strong double pulse
    }
  }, []);
  
  const subcategoryHaptic = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate([0, 15, 30, 15, 30, 15]); // Soft triple tick
    }
  }, []);
  
  // Audio feedback (optional)
  const primarySound = useCallback(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 180; // Low whoosh
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  }, []);
  
  const subcategorySound = useCallback(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 900; // High click
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.05);
  }, []);
  
  // Wrapped actions with enhanced feedback
  const actionsWithFeedback = useMemo(() => ({
    setPrimaryByDirection: (direction) => {
      // Set gesture state
      setGestureState({ type: 'primary', direction, isActive: true });
      
      // Multi-sensory feedback
      primaryHaptic();
      // primarySound(); // Uncomment if audio desired
      
      // Execute action
      actions.setPrimaryByDirection(direction);
      
      // Clear gesture state after animation
      setTimeout(() => {
        setGestureState({ type: null, direction: null, isActive: false });
      }, 600);
    },
    rotateSub: (steps) => {
      // Set gesture state
      setGestureState({ type: 'subcategory', direction: 'rotate', isActive: true });
      
      // Multi-sensory feedback
      subcategoryHaptic();
      // subcategorySound(); // Uncomment if audio desired
      
      // Execute action
      actions.rotateSub(steps);
      
      // Clear gesture state after animation
      setTimeout(() => {
        setGestureState({ type: null, direction: null, isActive: false });
      }, 300);
    },
    nextEvent: () => {
      softTick();
      actions.nextEvent();
    },
    prevEvent: () => {
      softTick();
      actions.prevEvent();
    }
  }), [actions, primaryHaptic, subcategoryHaptic]);

  const { bindDialAreaProps, bindLowerAreaProps, hoverSubIndex } = 
    useDialGestures(actionsWithFeedback, config.gestures);

  const subcategories = state.activePrimary?.subcategories || [];
  const subCount = subcategories.length;

  const polarToCartesian = (centerX, centerY, radius, angleDeg) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(angleRad),
      y: centerY + radius * Math.sin(angleRad)
    };
  };

  const getPrimaryPosition = (direction) => {
    const centerX = dialSize / 2;
    const centerY = dialSize / 2;
    const radius = dialSize * 0.28;
    
    const angles = {
      north: 0,
      east: 90,
      south: 180,
      west: 270
    };
    
    return polarToCartesian(centerX, centerY, radius, angles[direction]);
  };

  if (!categories || categories.length === 0) {
    return (
      <div style={{ 
        background: '#000',
        color: '#fff', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        No Categories Available
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#000000',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      paddingTop: 'max(20px, env(safe-area-inset-top))',
      paddingBottom: 'max(20px, env(safe-area-inset-bottom))'
    }}>
      
      {/* DIAL CONTAINER */}
      <div
        data-dial-root
        {...bindDialAreaProps}
        style={{
          position: 'relative',
          width: `${dialSize}px`,
          height: `${dialSize}px`,
          flexShrink: 0
        }}
      >
        {/* VISUAL FEEDBACK: Directional arrow during primary swipe */}
        <AnimatePresence>
          {gestureState.type === 'primary' && gestureState.isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '48px',
                color: 'rgba(100, 150, 255, 0.8)',
                zIndex: 30,
                pointerEvents: 'none'
              }}
            >
              {gestureState.direction === 'north' && '↑'}
              {gestureState.direction === 'east' && '→'}
              {gestureState.direction === 'south' && '↓'}
              {gestureState.direction === 'west' && '←'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* VISUAL FEEDBACK: Rotation indicator during subcategory drag */}
        <AnimatePresence>
          {gestureState.type === 'subcategory' && gestureState.isActive && (
            <motion.div
              initial={{ opacity: 0, rotate: -30 }}
              animate={{ opacity: 0.6, rotate: 0 }}
              exit={{ opacity: 0, rotate: 30 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '32px',
                color: 'rgba(255, 255, 255, 0.5)',
                zIndex: 30,
                pointerEvents: 'none'
              }}
            >
              ↻
            </motion.div>
          )}
        </AnimatePresence>

        {/* OUTER CIRCLE + SUBCATEGORY TICKS */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            // Glow during rotation
            filter: gestureState.type === 'subcategory' && gestureState.isActive 
              ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))' 
              : 'none',
            transition: 'filter 0.3s'
          }}
          viewBox="0 0 100 100"
        >
          {/* Main circle */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke={gestureState.type === 'primary' ? 'rgba(100, 150, 255, 0.6)' : 'white'}
            strokeWidth={gestureState.type === 'primary' ? '1.0' : '0.5'}
            opacity="0.4"
            style={{
              transition: 'stroke 0.3s, stroke-width 0.3s'
            }}
          />
          
          {/* Subcategory tick marks */}
          {subcategories.map((sub, i) => {
            const angle = (i * 360) / subCount;
            const isActive = i === state.subIndex;
            const isHovered = hoverSubIndex !== null && i === hoverSubIndex;
            const highlighted = isActive || isHovered;
            
            const outerR = 48;
            const innerR = outerR - (highlighted ? 4 : 3);
            const p1 = polarToCartesian(50, 50, outerR, angle);
            const p2 = polarToCartesian(50, 50, innerR, angle);
            
            return (
              <line
                key={sub.id}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="white"
                strokeWidth={highlighted ? 0.8 : 0.5}
                opacity={highlighted ? 1 : 0.5}
                style={{
                  transition: 'opacity 0.2s, stroke-width 0.2s'
                }}
              />
            );
          })}
        </svg>

        {/* RED POINTER (with pulse during primary change) */}
        <motion.svg
          animate={gestureState.type === 'primary' && gestureState.isActive ? {
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1]
          } : {}}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '8px',
            transform: 'translateX(-50%)',
            zIndex: 20
          }}
          width="14"
          height="10"
          viewBox="0 0 14 10"
        >
          <path d="M7 0 L14 10 H0 Z" fill="#FF3B30" />
        </motion.svg>

        {/* CROSSHAIRS (pulse during primary change) */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: gestureState.type === 'primary' && gestureState.isActive ? 0.4 : 0.15,
            transition: 'opacity 0.3s'
          }}
          viewBox="0 0 100 100"
        >
          <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.3" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.3" />
        </svg>

        {/* PRIMARY CATEGORY LABELS (with flash animation on change) */}
        {categories.map((cat, index) => {
          const directions = ['north', 'east', 'south', 'west'];
          const direction = directions[index];
          const pos = getPrimaryPosition(direction);
          const isActive = index === state.primaryIndex;
          const justActivated = gestureState.type === 'primary' && isActive && gestureState.isActive;
          
          return (
            <motion.div
              key={cat.id}
              animate={justActivated ? {
                scale: [1, 1.2, 1],
                opacity: [0.4, 1, 1]
              } : {}}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                fontSize: isActive ? '15px' : '14px',
                fontWeight: isActive ? '700' : '600',
                letterSpacing: '0.5px',
                color: 'white',
                opacity: gestureState.type === 'primary' && gestureState.isActive && !isActive 
                  ? 0.2  // Dim others during swipe
                  : isActive ? 1 : 0.4,
                transition: 'opacity 0.3s, font-size 0.2s, font-weight 0.2s',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                zIndex: 10,
                textTransform: 'uppercase'
              }}
            >
              {cat.label}
            </motion.div>
          );
        })}

        {/* SUBCATEGORY LABELS (with pulse on rotation) */}
        {subcategories.map((sub, i) => {
          const angle = (i * 360) / subCount;
          const radius = dialSize * 0.58;
          const centerX = dialSize / 2;
          const centerY = dialSize / 2;
          const pos = polarToCartesian(centerX, centerY, radius, angle);
          
          const isActive = i === state.subIndex;
          const isHovered = hoverSubIndex !== null && i === hoverSubIndex;
          const highlighted = isActive || isHovered;
          const justActivated = gestureState.type === 'subcategory' && isActive && gestureState.isActive;
          
          return (
            <motion.div
              key={sub.id}
              animate={justActivated ? {
                scale: [1, 1.15, 1],
                opacity: [0.6, 1, 1]
              } : {}}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                fontSize: highlighted ? '12px' : '11px',
                fontWeight: highlighted ? '600' : '500',
                letterSpacing: '0.3px',
                color: 'white',
                opacity: highlighted ? 1 : 0.6,
                transition: 'opacity 0.2s, font-size 0.2s, font-weight 0.2s',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                zIndex: 5,
                textTransform: 'uppercase'
              }}
            >
              {sub.label}
            </motion.div>
          );
        })}

        {/* CENTER DOT */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '6px',
          height: '6px',
          background: 'white',
          borderRadius: '50%',
          opacity: 0.4,
          zIndex: 1
        }} />
      </div>

      {/* EVENT READOUT (with slide transition) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.activeEvent?.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          {...bindLowerAreaProps}
          style={{
            marginTop: '40px',
            textAlign: 'center',
            maxWidth: '90vw',
            width: '100%'
          }}
        >
          {state.activeEvent ? (
            <>
              <h2 style={{
                fontSize: 'clamp(24px, 6vw, 32px)',
                fontWeight: '700',
                marginBottom: '12px',
                lineHeight: '1.2',
                letterSpacing: '-0.02em'
              }}>
                {state.activeEvent.name}
              </h2>

              <p style={{
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                opacity: 0.9,
                marginBottom: '6px'
              }}>
                {state.activeEvent.tags?.join(' · ')}
                {state.activeEvent.tags?.length > 0 && ' · '}
                {state.activeSub?.label} · {state.activePrimary?.label}
              </p>

              <p style={{
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                opacity: 0.8,
                marginBottom: '6px'
              }}>
                {state.activeEvent.address}
              </p>

              <p style={{
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                opacity: 0.7
              }}>
                {state.activeEvent.time}
                {state.activeEvent.distance && ` · ${state.activeEvent.distance}`}
              </p>
            </>
          ) : (
            <p style={{ opacity: 0.5 }}>No events found</p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

---

## **FEEDBACK SUMMARY TABLE:**

| Gesture Type | Visual | Haptic | Audio (Optional) | Duration |
|--------------|--------|--------|------------------|----------|
| **Primary Swipe** | Directional arrow, blue tint, dim others, crosshair pulse | Double strong pulse (DA-DUM) | Low whoosh (180Hz, 200ms) | 400-600ms |
| **Subcategory Rotate** | Rotation symbol (↻), circle glow, label pulse | Triple soft tick (tick-tick-tick) | High click (900Hz, 50ms) | 200-300ms |
| **Event Browse** | Slide transition | Single soft tick | None | 150ms |

---

## **USER EDUCATION (First-Time Instructions):**

Add an optional tutorial overlay on first visit:

```javascript
const [showTutorial, setShowTutorial] = useState(true);

// Tutorial overlay
{showTutorial && (
  <div style={{
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  }}>
    <div style={{ maxWidth: '400px', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '20px' }}>How to Navigate</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>↕️ ↔️</div>
        <strong>Swipe Up/Down/Left/Right</strong>
        <p style={{ opacity: 0.7, fontSize: '14px' }}>
          Change primary category<br/>
          (Strong pulse feedback)
        </p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>↻</div>
        <strong>Drag in Circle</strong>
        <p style={{ opacity: 0.7, fontSize: '14px' }}>
          Rotate through subcategories<br/>
          (Soft tick feedback)
        </p>
      </div>
      
      <button 
        onClick={() => setShowTutorial(false)}
        style={{
          padding: '12px 24px',
          background: '#FF3B30',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Got it!
      </button>
    </div>
  </div>
)}
```

---

## **ACCESSIBILITY CONSIDERATIONS:**

### **Screen Reader Announcements:**
```javascript
// Add aria-live region
<div aria-live="polite" className="sr-only">
  {gestureState.type === 'primary' && `Switching to ${state.activePrimary?.label} category`}
  {gestureState.type === 'subcategory' && `Selected ${state.activeSub?.label}`}
</div>
```

### **Reduced Motion:**
```javascript
// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Simplify animations if user prefers
const feedbackDuration = prefersReducedMotion ? 0 : 300;
```

---

## **TESTING CHECKLIST:**

- [ ] Primary swipe shows blue arrow
- [ ] Primary swipe has strong double-pulse haptic
- [ ] Primary swipe dims other categories
- [ ] Primary swipe pulses crosshairs
- [ ] New primary flashes/scales on activation
- [ ] Subcategory rotation shows ↻ symbol
- [ ] Subcategory rotation has soft triple-tick haptic
- [ ] Subcategory rotation adds glow to circle
- [ ] Active subcategory pulses on selection
- [ ] Feedback is clearly different between gestures
- [ ] Audio plays correctly (if enabled)
- [ ] Reduced motion is respected
- [ ] Screen reader announces changes
- [ ] Tutorial is clear and dismissable

---

**This implementation makes the two gesture types unmistakably different through coordinated visual, haptic, and optional audio feedback!**


