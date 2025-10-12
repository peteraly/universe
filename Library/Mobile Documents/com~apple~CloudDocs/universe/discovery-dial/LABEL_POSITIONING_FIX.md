# 🎯 LABEL POSITIONING OPTIMIZATION

## **CURRENT PROBLEM:**
- Primary categories (N/E/S/W) positioned close to edge
- Subcategories also positioned near edge
- Potential for overlap/collision
- Hard to distinguish between primary and subcategory labels

## **RECOMMENDED SOLUTION:**

### **Visual Hierarchy:**

```
┌─────────────────────────────────┐
│                                 │
│    SUBCATEGORY (outside)        │
│         ↓                       │
│    ┌────────────┐               │
│    │            │               │
│    │ PRIMARY    │               │ 
│    │ (inside)   │               │
│    │            │               │
│    └────────────┘               │
│                                 │
└─────────────────────────────────┘
```

### **Positioning Strategy:**

1. **Primary Categories (Inside Circle)**
   - Position: 50-60% radius from center
   - Style: Larger (14-16px), bold
   - Always visible
   - Active: 100% opacity, very bold
   - Inactive: 40% opacity, lighter weight

2. **Subcategories (Outside Circle)**
   - Position: 110-120% radius (outside the circle)
   - Style: Smaller (10-11px), medium weight
   - Only visible when primary selected
   - Active: 100% opacity, bold
   - Inactive: 60% opacity, normal weight

3. **Separation:**
   - Clear visual distinction by position
   - Different font sizes
   - Different opacity levels
   - No overlap possible

---

## **IMPLEMENTATION:**

Update `src/components/EventCompassFinal.jsx`:

```javascript
import { useMemo, useCallback, useState, useEffect } from 'react';
import useEventCompassState from '../hooks/useEventCompassState';
import useDialGestures from '../hooks/useDialGestures';
import { hardTick, softTick } from '../utils/haptics';

/**
 * OPTIMIZED LABEL POSITIONING
 * - Primary categories: INSIDE circle (50-60% radius)
 * - Subcategories: OUTSIDE circle (110-120% radius)
 * - Clear visual hierarchy, no overlap
 */
export default function EventCompassFinal({ categories = [], config = {} }) {
  const [dialSize, setDialSize] = useState(400);
  
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
  
  const actionsWithHaptics = useMemo(() => ({
    setPrimaryByDirection: (direction) => {
      actions.setPrimaryByDirection(direction);
      hardTick();
    },
    rotateSub: (steps) => {
      actions.rotateSub(steps);
      softTick();
    },
    nextEvent: () => {
      actions.nextEvent();
      softTick();
    },
    prevEvent: () => {
      actions.prevEvent();
      softTick();
    }
  }), [actions]);

  const { bindDialAreaProps, bindLowerAreaProps, hoverSubIndex } = 
    useDialGestures(actionsWithHaptics, config.gestures);

  const subcategories = state.activePrimary?.subcategories || [];
  const subCount = subcategories.length;

  // Helper to calculate position on circle
  const polarToCartesian = (centerX, centerY, radius, angleDeg) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(angleRad),
      y: centerY + radius * Math.sin(angleRad)
    };
  };

  // Calculate primary category positions (INSIDE circle)
  const getPrimaryPosition = (direction) => {
    const centerX = dialSize / 2;
    const centerY = dialSize / 2;
    const radius = dialSize * 0.28; // 28% from center (well inside circle)
    
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
        {/* OUTER CIRCLE + SUBCATEGORY TICKS */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
          viewBox="0 0 100 100"
        >
          {/* Main circle */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            opacity="0.4"
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

        {/* RED POINTER */}
        <svg
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
        </svg>

        {/* CROSSHAIRS */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
          viewBox="0 0 100 100"
        >
          <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.3" opacity="0.15" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.3" opacity="0.15" />
        </svg>

        {/* PRIMARY CATEGORY LABELS (INSIDE circle at 28% radius) */}
        {categories.map((cat, index) => {
          const directions = ['north', 'east', 'south', 'west'];
          const direction = directions[index];
          const pos = getPrimaryPosition(direction);
          const isActive = index === state.primaryIndex;
          
          return (
            <div
              key={cat.id}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                fontSize: isActive ? '15px' : '14px',
                fontWeight: isActive ? '700' : '600',
                letterSpacing: '0.5px',
                color: 'white',
                opacity: isActive ? 1 : 0.4,
                transition: 'opacity 0.3s, font-size 0.2s, font-weight 0.2s',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                zIndex: 10,
                textTransform: 'uppercase'
              }}
            >
              {cat.label}
            </div>
          );
        })}

        {/* SUBCATEGORY LABELS (OUTSIDE circle at 58% radius) */}
        {subcategories.map((sub, i) => {
          const angle = (i * 360) / subCount;
          const radius = dialSize * 0.58; // 58% from center (OUTSIDE the circle)
          const centerX = dialSize / 2;
          const centerY = dialSize / 2;
          const pos = polarToCartesian(centerX, centerY, radius, angle);
          
          const isActive = i === state.subIndex;
          const isHovered = hoverSubIndex !== null && i === hoverSubIndex;
          const highlighted = isActive || isHovered;
          
          return (
            <div
              key={sub.id}
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
            </div>
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

      {/* EVENT READOUT */}
      <div 
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
      </div>
    </div>
  );
}
```

---

## **KEY POSITIONING PARAMETERS:**

### **Primary Categories:**
```javascript
radius: dialSize * 0.28  // 28% from center
fontSize: 14-15px
fontWeight: 600-700
opacity: Active 100%, Inactive 40%
zIndex: 10 (higher)
```

### **Subcategories:**
```javascript
radius: dialSize * 0.58  // 58% from center (OUTSIDE circle)
fontSize: 11-12px
fontWeight: 500-600
opacity: Active 100%, Inactive 60%
zIndex: 5 (lower)
```

### **Circle:**
```javascript
radius: 48% (viewBox units)
// Primary labels at ~28% = well inside
// Subcategory labels at ~58% = outside
```

---

## **VISUAL HIERARCHY:**

```
Layer Stack (Z-Index):
20 - Red pointer
10 - Primary category labels (INSIDE)
5  - Subcategory labels (OUTSIDE)
1  - Center dot
0  - Circle, ticks, crosshairs
```

---

## **DISTANCE CALCULATIONS:**

For a 400px dial:
- **Center**: 0px from center
- **Primary labels**: ~112px from center (28%)
- **Circle edge**: ~192px from center (48%)
- **Subcategory labels**: ~232px from center (58%)
- **Dial edge**: 200px from center (50%)

**Gap between primary and circle**: 80px
**Gap between circle and subcategories**: 40px

---

## **RESPONSIVE ADJUSTMENTS:**

```javascript
// Mobile (small dials < 350px)
if (dialSize < 350) {
  primaryRadius = dialSize * 0.25;  // Closer to center
  subcategoryRadius = dialSize * 0.60; // Further out
  primaryFontSize = 13;
  subcategoryFontSize = 10;
}

// Desktop (large dials > 450px)
if (dialSize > 450) {
  primaryRadius = dialSize * 0.30;  // More spacing
  subcategoryRadius = dialSize * 0.56; // Closer to circle
  primaryFontSize = 16;
  subcategoryFontSize = 12;
}
```

---

## **COLLISION PREVENTION:**

### **Strategy 1: Dynamic Font Sizing**
```javascript
// Reduce font size if labels are too close
const getSubcategoryFontSize = (count) => {
  if (count > 10) return 9;
  if (count > 7) return 10;
  return 11;
};
```

### **Strategy 2: Abbreviations**
```javascript
// For very long labels
const abbreviateLabel = (label, maxLength = 12) => {
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength - 1) + '…';
};
```

### **Strategy 3: Smart Positioning**
```javascript
// Avoid placing subcategories at exact N/E/S/W angles
const avoidCollision = (angle, primaryAngles = [0, 90, 180, 270]) => {
  const minDistance = 15; // degrees
  for (const primAngle of primaryAngles) {
    const diff = Math.abs(angle - primAngle);
    if (diff < minDistance) {
      return angle + minDistance; // Offset slightly
    }
  }
  return angle;
};
```

---

## **TESTING CHECKLIST:**

- [ ] Primary labels clearly inside circle
- [ ] Subcategory labels clearly outside circle
- [ ] No overlap between primary and subcategory labels
- [ ] Active primary is bright and bold
- [ ] Inactive primaries are faded but readable
- [ ] Active subcategory is bright and bold
- [ ] Inactive subcategories are faded but readable
- [ ] All labels readable on mobile (smallest screen: 320px)
- [ ] Labels don't extend beyond dial container
- [ ] Smooth transitions on category changes
- [ ] Labels maintain position during rotation
- [ ] Text doesn't wrap or truncate unexpectedly

---

## **ALTERNATIVE LAYOUTS:**

### **Option A: Primary at Cardinal Points (Original)**
```javascript
// Keep primaries at N/E/S/W edges
// Move subcategories to intermediate angles
```

### **Option B: Primary in Quadrants**
```javascript
// Position primaries at 45°, 135°, 225°, 315°
// Gives more space for subcategories
```

### **Option C: Stacked Labels**
```javascript
// Primary label above subcategory label
// Both at same angle, different radii
```

---

## **RECOMMENDED: Option from Prompt**

**Primary Categories**: INSIDE circle at 28% radius
**Subcategories**: OUTSIDE circle at 58% radius

This provides:
- ✅ Maximum separation (no overlap)
- ✅ Clear visual hierarchy
- ✅ Easy to distinguish at a glance
- ✅ Room for 8+ subcategories
- ✅ Clean, uncluttered aesthetic

---

**Implement the code above for optimal label positioning!**

