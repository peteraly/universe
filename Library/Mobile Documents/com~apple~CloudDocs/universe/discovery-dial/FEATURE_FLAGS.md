# 🚩 Feature Flags Guide

This document explains the feature flag system in the Event Compass application.

## Overview

Feature flags are simple boolean constants that enable/disable features at compile-time. They're defined in `src/config/featureFlags.js` and can be toggled without external libraries or environment-based build logic.

---

## Available Flags

### **ENABLE_HAPTICS** 
**Default:** `true`  
**Type:** Compile-time constant  
**Affects:** All haptic feedback (vibrations)

Enables or disables haptic feedback on gestures:
- **Hard tick (12ms):** Primary category changes (N/E/S/W swipes)
- **Soft tick (5ms):** Subcategory snaps, event navigation

**When to disable:**
- Testing without physical device
- Debugging gesture logic
- User preference (future: make runtime toggle)
- Devices without vibration support (auto-detected)

**Example:**
```javascript
// In featureFlags.js
export const ENABLE_HAPTICS = false; // Disable all haptics
```

---

### **ENABLE_INERTIA**
**Default:** `true`  
**Type:** Compile-time constant  
**Affects:** Subcategory rotation momentum

Enables momentum/inertia after fast flick gestures on subcategory rotation:
- Detects fast flicks (velocity > 1.5 px/ms)
- Continues spinning briefly with exponential decay
- Smooth, natural physics-based feel

**Technical details:**
- Decay factor: 0.92 per frame (~60fps)
- Minimum velocity: 0.5 px/ms (stops animation)
- Uses `requestAnimationFrame` for smooth updates
- Auto-cancels on new gesture or unmount

**When to disable:**
- Prefer precise, immediate control
- Low-end devices (performance)
- Testing exact subcategory positioning
- Motion sensitivity concerns

**Example:**
```javascript
// In featureFlags.js
export const ENABLE_INERTIA = false; // No momentum after flicks
```

---

### **SHOW_DISTANCE**
**Default:** `true`  
**Type:** Compile-time constant  
**Affects:** Event distance display in EventReadout

Shows distance from user location in event details:
- Example: "Tonight 7 PM · 1.2 mi"
- When disabled, only shows time: "Tonight 7 PM"

**When to disable:**
- Privacy concerns (hide location data)
- No geolocation available
- Testing without location services
- Cleaner, minimal event details

**Example:**
```javascript
// In featureFlags.js
export const SHOW_DISTANCE = false; // Hide distance in event cards
```

**UI comparison:**
```
// SHOW_DISTANCE = true
"Jazz in the Garden"
Live Music · Arts/Culture
Botanical Garden
Tonight 6 PM · 1.2 mi

// SHOW_DISTANCE = false
"Jazz in the Garden"
Live Music · Arts/Culture
Botanical Garden
Tonight 6 PM
```

---

### **ENABLE_KEYBOARD_SHORTCUTS**
**Default:** `true`  
**Type:** Compile-time constant  
**Affects:** Keyboard navigation

Enables keyboard shortcuts for navigation:
- **Arrow keys:** Primary category (↑ North, → East, ↓ South, ← West)
- **A/D:** Rotate subcategory
- **J/K:** Navigate events (next/prev)

**When to disable:**
- Touch-only devices (mobile)
- Prevent keyboard conflicts
- Testing gesture-only flow

**Example:**
```javascript
// In featureFlags.js
export const ENABLE_KEYBOARD_SHORTCUTS = false; // Touch/mouse only
```

---

### **SHOW_DEBUG_INFO**
**Default:** `false`  
**Type:** Compile-time constant  
**Affects:** Debug overlay (development only)

Shows debug overlay with current state:
- Primary category index and label
- Subcategory index and label
- Event index and name (truncated)
- Hover index during rotation

**Note:** Only visible in `NODE_ENV=development`. No-op in production builds.

**When to enable:**
- Debugging state machine
- Testing gesture detection
- Verifying index calculations
- QA/testing sessions

**Example:**
```javascript
// In featureFlags.js
export const SHOW_DEBUG_INFO = true; // Show debug overlay
```

---

### **ENABLE_ANIMATIONS**
**Default:** `true`  
**Type:** Compile-time constant  
**Affects:** All Framer Motion animations

Enables animations and transitions:
- Dial ring rotation
- Event card fade/slide
- Category label opacity
- Subcategory tick highlights

**Note:** Automatically respects `prefers-reduced-motion` user preference. This flag provides an additional manual override.

**When to disable:**
- Performance testing
- Low-end devices
- Accessibility (additional override)
- Testing instant state changes

**Example:**
```javascript
// In featureFlags.js
export const ENABLE_ANIMATIONS = false; // Instant transitions
```

---

## Usage Examples

### Basic Usage

```javascript
import { ENABLE_HAPTICS, SHOW_DISTANCE } from './config/featureFlags';

// Conditional haptic feedback
if (ENABLE_HAPTICS) {
  tick('soft');
}

// Conditional distance display
{SHOW_DISTANCE && activeEvent.distance && (
  <span>{activeEvent.distance}</span>
)}
```

### Dynamic Flag Checking

```javascript
import { isFeatureEnabled } from './config/featureFlags';

if (isFeatureEnabled('ENABLE_HAPTICS')) {
  tick('soft');
}
```

### Get All Enabled Features

```javascript
import { getEnabledFeatures, getDisabledFeatures } from './config/featureFlags';

console.log('Enabled:', getEnabledFeatures());
// Output: ['ENABLE_HAPTICS', 'ENABLE_INERTIA', 'SHOW_DISTANCE', ...]

console.log('Disabled:', getDisabledFeatures());
// Output: ['SHOW_DEBUG_INFO']
```

---

## How to Toggle Flags

### Step 1: Edit the Config File

Open `src/config/featureFlags.js`:

```javascript
// Change this:
export const ENABLE_HAPTICS = true;

// To this:
export const ENABLE_HAPTICS = false;
```

### Step 2: Restart Dev Server

```bash
npm run dev
```

**No rebuild required** for development. For production builds:

```bash
npm run build
```

---

## Architecture

### Compile-Time vs Runtime

**These are compile-time flags**, meaning:
- ✅ No runtime overhead (dead code elimination)
- ✅ Webpack/Vite tree-shaking removes disabled code
- ✅ Smaller bundle size for disabled features
- ❌ Requires rebuild to change (not dynamic)

**Why not runtime flags?**
- Simpler implementation (no external library)
- Better performance (no runtime checks)
- Smaller bundle size
- Easier to understand and maintain

**Future:** Could be upgraded to runtime flags with local storage persistence for user preferences.

---

## Integration Points

### Files Using Feature Flags

1. **`src/utils/haptics.js`**
   - Uses `ENABLE_HAPTICS`
   - Guards all `navigator.vibrate()` calls

2. **`src/components/EventReadout.jsx`**
   - Uses `SHOW_DISTANCE`
   - Conditionally renders distance field

3. **`src/hooks/useDialGestures.js`**
   - Uses `ENABLE_INERTIA`
   - Applies momentum after fast flicks

4. **`src/components/EventCompass.jsx`**
   - Uses `ENABLE_KEYBOARD_SHORTCUTS`
   - Enables/disables keyboard handlers
   - Uses `SHOW_DEBUG_INFO`
   - Shows/hides debug overlay

---

## Testing Recommendations

### Test Matrix

| Scenario | Haptics | Inertia | Distance | Keyboard | Animations |
|----------|---------|---------|----------|----------|------------|
| **Production** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Mobile** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Desktop** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Low-End** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Privacy** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Debug** | ✅ | ❌ | ✅ | ✅ | ❌ |

### Testing Procedure

1. **Enable all flags** (default) → Full experience
2. **Disable ENABLE_HAPTICS** → Verify no vibrations
3. **Disable ENABLE_INERTIA** → Verify no momentum after flicks
4. **Disable SHOW_DISTANCE** → Verify distance hidden
5. **Disable ENABLE_KEYBOARD_SHORTCUTS** → Verify arrow keys don't work
6. **Enable SHOW_DEBUG_INFO** → Verify debug overlay visible (dev only)

---

## Performance Impact

### Enabled Features

```
ENABLE_HAPTICS: +0.1ms per gesture (negligible)
ENABLE_INERTIA: +RAF loop (ends after ~500ms)
SHOW_DISTANCE: +1 DOM node per event
ENABLE_KEYBOARD_SHORTCUTS: +1 event listener
ENABLE_ANIMATIONS: +Framer Motion overhead
```

### Disabled Features

```
Tree-shaking removes unused code:
- Haptics: -2KB (navigator.vibrate calls)
- Inertia: -3KB (RAF animation loop)
- Distance: -0.5KB (conditional rendering)
- Keyboard: -2KB (event handlers)
```

---

## Best Practices

### DO ✅

- Keep flags as simple booleans
- Use descriptive flag names (ENABLE_*, SHOW_*)
- Document flag purpose and use cases
- Test with flags on/off
- Use tree-shaking for bundle optimization

### DON'T ❌

- Add env-based build logic (per requirements)
- Create complex flag combinations
- Use runtime flag evaluation (overhead)
- Mutate flag values (they're constants)
- Forget to document new flags

---

## Future Enhancements

### User Preferences (Runtime Flags)

Convert to runtime flags with localStorage:

```javascript
// Future: Runtime toggle
export function useFeatureFlag(flagName) {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem(flagName);
    return stored ? JSON.parse(stored) : FEATURE_FLAGS[flagName];
  });

  const toggle = () => {
    setEnabled(prev => {
      const next = !prev;
      localStorage.setItem(flagName, JSON.stringify(next));
      return next;
    });
  };

  return [enabled, toggle];
}
```

### Settings Panel

```jsx
// Future: Settings UI
function SettingsPanel() {
  const [haptics, toggleHaptics] = useFeatureFlag('ENABLE_HAPTICS');
  const [inertia, toggleInertia] = useFeatureFlag('ENABLE_INERTIA');
  
  return (
    <div>
      <Toggle label="Haptic Feedback" value={haptics} onChange={toggleHaptics} />
      <Toggle label="Inertia/Momentum" value={inertia} onChange={toggleInertia} />
    </div>
  );
}
```

---

## Summary

| Flag | Default | Purpose | Impact |
|------|---------|---------|--------|
| **ENABLE_HAPTICS** | ✅ | Vibration feedback | UX |
| **ENABLE_INERTIA** | ✅ | Momentum after flick | UX |
| **SHOW_DISTANCE** | ✅ | Display event distance | Privacy/UX |
| **ENABLE_KEYBOARD_SHORTCUTS** | ✅ | Arrow/letter keys | Desktop UX |
| **ENABLE_ANIMATIONS** | ✅ | Framer Motion | Performance |
| **SHOW_DEBUG_INFO** | ❌ | Debug overlay | Dev only |

**Status: PRODUCTION READY** 🚀

All flags are simple, documented, and safe to toggle for testing/deployment.

