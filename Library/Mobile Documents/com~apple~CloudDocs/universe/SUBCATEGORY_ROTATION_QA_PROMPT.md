# SUBCATEGORY ROTATION QA & ENHANCEMENT PROMPT

## 🎯 OBJECTIVE
Verify and enhance the circular rotation gesture for subcategories on the Discovery Dial compass interface. Ensure users can smoothly rotate through subcategories using a circular drag motion, with clear visual and haptic feedback.

---

## 📋 CURRENT IMPLEMENTATION STATUS

### What Should Work:
1. **Circular Drag Gesture**: User drags finger in a circular arc around the dial perimeter
2. **Subcategory Labels**: Positioned at 58% radius (OUTSIDE the main circle)
3. **Visual Feedback**: 
   - Rotation symbol (↻) appears during drag
   - Circle gets glowing drop-shadow
   - Active subcategory label pulses and scales
4. **Haptic Feedback**: Soft triple-tick vibration pattern [0, 15, 30, 15, 30, 15]
5. **Smooth Rotation**: Labels should rotate around the perimeter as user drags

---

## 🔍 VERIFICATION CHECKLIST

### A. Gesture Recognition
- [ ] **Horizontal drag on dial area** triggers subcategory rotation (not primary swipe)
- [ ] **Circular motion** is properly detected (not confused with directional swipe)
- [ ] **Sensitivity**: ~140px of horizontal drag = 1 subcategory step
- [ ] **Gesture conflict prevention**: Rotation doesn't trigger if directional swipe is detected first

### B. Visual Response
- [ ] **Subcategory labels** are visible around the perimeter (outside the circle)
- [ ] **Labels rotate smoothly** as user drags (not jerky or laggy)
- [ ] **Active subcategory** is clearly highlighted (brighter, larger)
- [ ] **Rotation indicator (↻)** appears in center during drag
- [ ] **Circle glow effect** is visible during rotation
- [ ] **Hover state**: `hoverSubIndex` shows preview during drag

### C. Haptic & Audio Feedback
- [ ] **Triple-tick vibration** fires on rotation snap
- [ ] **Distinct from primary swipe**: Softer, three pulses vs two strong pulses
- [ ] **Feedback timing**: Vibrates when snapping to new subcategory, not continuously

### D. Edge Cases & Polish
- [ ] **Wrapping**: Can rotate from last → first and first → last subcategory
- [ ] **Inertia** (if enabled): Continues rotating after release with momentum
- [ ] **Release behavior**: Snaps to nearest subcategory on `pointerup`
- [ ] **Multi-touch**: Doesn't break with accidental multi-finger gestures
- [ ] **Mobile viewport**: Works on small screens (320px+)

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: "Rotation doesn't trigger, only primary swipes work"
**Diagnosis:**
- Gesture priority system may be favoring directional swipes
- `minSwipeDistance` threshold may be too low, catching rotations as swipes

**Fix:**
```javascript
// In useDialGestures.js, ensure rotation detection happens BEFORE swipe detection
// Check if gesture is primarily horizontal (rotation) vs vertical/diagonal (swipe)

const isDominantlyHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 1.5;
if (isDominantlyHorizontal && !gestureTypeDetected) {
  gestureTypeDetected = 'rotate';
}
```

### Issue 2: "Labels don't rotate, they just highlight in place"
**Diagnosis:**
- `hoverSubIndex` is updating but visual position isn't changing
- DialRing component may not be responding to state changes

**Fix:**
```javascript
// In DialRing.jsx or EventCompassFinal.jsx
// Ensure subcategory labels are re-rendered with updated angles based on activeSubIndex

const displayAngle = (i * 360) / subCount - (state.subIndex * 360 / subCount);
// This rotates the entire array so active is always at top
```

### Issue 3: "Rotation is too sensitive / not sensitive enough"
**Diagnosis:**
- `dialSensitivity` config value (default: 140px per step) may need tuning

**Fix:**
```javascript
// In compassConfig.js
gestures: {
  dialSensitivity: 120, // Lower = more sensitive (less drag needed)
  // OR
  dialSensitivity: 180, // Higher = less sensitive (more drag needed)
}
```

### Issue 4: "Can't tell difference between primary swipe and rotation"
**Diagnosis:**
- Visual/haptic feedback may be too similar or not firing

**Fix:**
- **Primary swipe**: Directional arrow (↑→↓←), blue tint, DA-DUM haptic
- **Rotation**: Circular symbol (↻), white glow, tick-tick-tick haptic
- Ensure `gestureState.type` is correctly set to `'primary'` vs `'subcategory'`

### Issue 5: "Rotation works but feels laggy"
**Diagnosis:**
- RAF throttling may be too aggressive
- Too many re-renders during drag

**Fix:**
```javascript
// In useDialGestures.js
// Use throttleRAF for hover updates (already implemented)
const setHoverSubIndexThrottled = useMemo(
  () => throttleRAF(setHoverSubIndex),
  []
);
```

---

## 🛠️ ENHANCEMENT RECOMMENDATIONS

### 1. **Visual Ring Rotation**
Instead of just highlighting labels in place, rotate the ENTIRE ring visually:

```javascript
// In DialRing.jsx or EventCompassFinal.jsx
<motion.svg
  animate={{ rotate: -(state.subIndex * 360 / subCount) }}
  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
>
  {/* Subcategory ticks and labels */}
</motion.svg>
```

**Benefit:** User sees the entire ring physically rotate, making the interaction more intuitive.

### 2. **Active Subcategory Always at Top**
Position the active subcategory at the "12 o'clock" position (aligned with red pointer):

```javascript
const rotationOffset = -(state.subIndex * 360 / subCount);
const adjustedAngle = (i * 360 / subCount) + rotationOffset;
```

**Benefit:** Clear reference point—active item is always at top, like a traditional dial.

### 3. **Progressive Opacity Gradient**
Fade subcategories based on distance from active:

```javascript
const distance = Math.abs(i - state.subIndex);
const opacity = distance === 0 ? 1 : 0.6 - (distance * 0.15);
```

**Benefit:** Focuses attention on active and immediately adjacent subcategories.

### 4. **Continuous Drag Visual Feedback**
Show real-time rotation during drag (not just on release):

```javascript
// In useDialGestures.js, provide fractional rotation during drag
const fractionalRotation = totalDeltaX / config.dialSensitivity;
// Pass this to components for smooth interpolation
```

**Benefit:** Makes rotation feel fluid and responsive, not stepped.

### 5. **Snap Points with Resistance**
Add subtle resistance at each subcategory position:

```javascript
// Snap to nearest when velocity is low
if (Math.abs(velocity) < 0.5) {
  const nearestIndex = Math.round(currentRotation);
  snapTo(nearestIndex);
}
```

**Benefit:** Prevents accidental over-rotation, makes selection deliberate.

---

## 🧪 TESTING PROTOCOL

### Manual Testing Steps:

1. **Open app on mobile device** (real device, not simulator if possible)
2. **Select a primary category** (e.g., swipe UP to "Social")
3. **Verify subcategories appear** around the perimeter
4. **Place finger on dial** (anywhere in the circular area)
5. **Drag horizontally** (left or right, ~2 inches / 5cm)
6. **Observe:**
   - Does rotation symbol (↻) appear?
   - Do subcategory labels rotate or does active label change?
   - Do you feel soft triple-tick vibration?
   - Is the new subcategory clearly highlighted?
7. **Continue dragging in same direction**
   - Should rotate through multiple subcategories
   - Should wrap around (last → first or first → last)
8. **Release finger**
   - Should snap to nearest subcategory
   - Should update event list below to match new subcategory
9. **Try fast flick** (if inertia enabled)
   - Should continue rotating with momentum
   - Should gradually slow down and snap

### Automated Testing (Optional):

```javascript
// In useDialGestures.test.js
test('horizontal drag triggers subcategory rotation', () => {
  const { result } = renderHook(() => useDialGestures(mockActions));
  const { bindDialAreaProps } = result.current;
  
  // Simulate horizontal drag (150px, low vertical movement)
  act(() => {
    bindDialAreaProps.onPointerDown({ clientX: 100, clientY: 100 });
    bindDialAreaProps.onPointerMove({ clientX: 250, clientY: 105 });
    bindDialAreaProps.onPointerUp({ clientX: 250, clientY: 105 });
  });
  
  // Should call rotateSub, NOT setPrimaryByDirection
  expect(mockActions.rotateSub).toHaveBeenCalledWith(1);
  expect(mockActions.setPrimaryByDirection).not.toHaveBeenCalled();
});
```

---

## ✅ ACCEPTANCE CRITERIA

The subcategory rotation feature is COMPLETE when:

1. ✅ **Circular drag gesture** reliably triggers rotation (not confused with primary swipe)
2. ✅ **Visual feedback** is clear and distinct from primary swipe (↻ symbol, glow, label highlight)
3. ✅ **Haptic feedback** is distinct (soft triple-tick vs strong double-pulse)
4. ✅ **Smooth rotation** through all subcategories with wrapping
5. ✅ **Snap behavior** on release to nearest subcategory
6. ✅ **Event list updates** to match newly selected subcategory
7. ✅ **Works on mobile viewport** (320px to 768px wide)
8. ✅ **No gesture conflicts** (rotation doesn't accidentally trigger primary swipe or vice versa)
9. ✅ **Performance**: 60fps during drag, no jank or lag
10. ✅ **Accessibility**: Works with reduced motion, keyboard alternatives available

---

## 📂 FILES TO CHECK

### Core Logic:
- `discovery-dial/src/hooks/useDialGestures.js`
  - Line ~60-120: Rotation detection and `rotateSub` logic
  - Check `gestureType === 'rotate'` path
  - Verify `dialSensitivity` config usage

### Visual Components:
- `discovery-dial/src/components/EventCompassFinal.jsx`
  - Line ~195-217: Rotation visual feedback overlay (↻ symbol)
  - Line ~359-400: Subcategory labels with pulse animation
  - Line ~220-278: DialRing SVG with glow effect

### State Management:
- `discovery-dial/src/hooks/useEventCompassState.js`
  - `rotateSub(steps)` function
  - Ensure it properly wraps indices and updates `activeSub`

### Configuration:
- `discovery-dial/src/config/compassConfig.js`
  - `gestures.dialSensitivity: 140` (tune if needed)

---

## 🚀 IMPLEMENTATION STEPS (IF NOT WORKING)

### Step 1: Verify Gesture Detection
```bash
# Add debug logging to useDialGestures.js
console.log('Gesture detected:', gestureType, 'Delta X:', totalDeltaX);
```
- Trigger rotation gesture
- Check console: Should log `Gesture detected: rotate`

### Step 2: Verify State Update
```bash
# Add logging to useEventCompassState.js
console.log('rotateSub called with steps:', steps, 'New subIndex:', newSubIndex);
```
- Check that `rotateSub` is called with correct step count
- Verify `subIndex` updates in state

### Step 3: Verify Visual Update
```bash
# Add logging to EventCompassFinal.jsx
console.log('Subcategories rendering:', subcategories.length, 'Active:', state.subIndex);
```
- Check that component re-renders with new `state.subIndex`
- Verify active subcategory label receives `highlighted` class

### Step 4: Test Edge Cases
- Rotate from last to first (should wrap)
- Rotate from first to last (should wrap)
- Fast drag (multiple steps at once)
- Very slow drag (fractional step)

### Step 5: Polish Feedback
- Ensure ↻ symbol appears and disappears smoothly
- Verify triple-tick haptic fires (check mobile vibration)
- Confirm circle glow is visible (may need to increase opacity)

---

## 🎨 VISUAL REFERENCE

```
        NORTH (Primary)
            ↑
            🔺 (Red Pointer)
        ┌───────┐
    WEST│   ↻   │EAST
        │ (dial)│
        └───────┘
     Sub1  Sub2  Sub3  ← Subcategories rotate around perimeter
        SOUTH
```

**Rotation Behavior:**
- Drag LEFT → Labels rotate clockwise (Sub1 → Sub2 → Sub3 → Sub1)
- Drag RIGHT → Labels rotate counter-clockwise (Sub3 → Sub2 → Sub1 → Sub3)
- Active subcategory moves toward red pointer (top position)

---

## 📝 NOTES

- **Gesture Priority**: Directional swipes (primary) should take precedence if detected early. Rotation only activates if horizontal movement dominates.
- **Mobile Testing**: Simulator gestures may not perfectly replicate real finger drag. Test on actual device.
- **Haptic Support**: Not all devices support `navigator.vibrate`. Ensure visual feedback is sufficient without haptics.
- **Reduced Motion**: If user has `prefers-reduced-motion`, disable or simplify rotation animations.

---

## 🔗 RELATED DOCUMENTATION

- `GESTURE_FEEDBACK_ENHANCEMENT.md` - Multi-sensory feedback implementation
- `LABEL_POSITIONING_FIX.md` - Primary vs subcategory label placement
- `compassConfig.js` - All tunable gesture parameters
- `useDialGestures.js` - Core gesture detection logic

---

**STATUS**: 🟡 NEEDS VERIFICATION  
**PRIORITY**: P0 (Core Interaction)  
**ESTIMATED TIME**: 30-60 minutes for QA + fixes  

---

**GOAL**: Smooth, intuitive circular rotation through subcategories with clear, distinct feedback that never conflicts with primary category swipes. 🎯

