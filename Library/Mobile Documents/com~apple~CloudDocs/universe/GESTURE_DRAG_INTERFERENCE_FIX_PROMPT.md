# GESTURE DRAG INTERFERENCE & TEXT SELECTION FIX PROMPT

## Context
The Discovery Dial application has critical gesture interference issues that are breaking core functionality:
1. **Dial Twist Gesture Interference**: When users try to twist/rotate the dial, it sometimes drags the entire screen instead of registering the rotation gesture
2. **Subcategory Selection Interference**: Gestures for selecting subcategories are being intercepted by scroll/drag events, preventing proper selection
3. **Unwanted Text Selection**: Users can accidentally highlight text on screen, which interferes with the touch experience
4. **Screen Drag Override**: Browser's default touch behaviors are overriding the custom gesture detection for dial interactions

## Task: Fix Gesture Interference and Disable Text Selection

### 1. **Diagnose Gesture Interference Issues**
- Identify where dial twist gestures are conflicting with scroll/drag events
- Check if subcategory selection touch events are being intercepted
- Review dial rotation gesture detection zones and boundaries
- Analyze if CSS `touch-action` properties are correctly set for dial area
- Verify that dial and subcategory gesture handlers are preventing default browser behaviors
- Test dial rotation sensitivity and subcategory tap detection
- Check for event bubbling issues between dial and parent containers

### 2. **Fix Dial Twist and Subcategory Gesture Handling**
- Implement proper `preventDefault()` and `stopPropagation()` for dial rotation events
- Add `touch-action: none` CSS property specifically to dial container and subcategory areas
- Ensure dial rotation detection has higher priority than scroll events
- Fix subcategory selection touch event handling to prevent scroll interference
- Add proper event delegation and cleanup for both dial and subcategory interactions
- Implement gesture state management to prevent conflicts between dial twist and screen drag
- Add specific touch event handling for circular gesture detection on the dial

### 3. **Disable Text Selection Globally**
- Add CSS rules to prevent text selection across the entire app
- Use `user-select: none` on all interactive elements
- Apply `-webkit-user-select: none` for Safari compatibility
- Disable text selection on touch devices with `-webkit-touch-callout: none`
- Ensure selection is disabled on dial, buttons, and all UI components

### 4. **Optimize Dial and Subcategory Touch Event Handling**
- Implement proper touch event listeners with passive/active flags for dial rotation
- Add circular gesture recognition with proper rotation thresholds for the dial
- Ensure smooth dial rotation-to-action mapping without screen drag interference
- Add visual feedback during dial rotation and subcategory selection
- Implement proper gesture cancellation to prevent screen drag during dial interaction
- Add specific touch event handling for subcategory tap detection
- Implement proper touch event isolation between dial area and scrollable content

### 5. **CSS and Styling Updates for Dial and Subcategories**
- Add comprehensive touch-action properties specifically for dial container
- Implement proper z-index layering for dial and subcategory gesture areas
- Ensure dial rotation zone has proper boundaries and isolation from scroll areas
- Add visual indicators for dial interaction zones and subcategory selection areas
- Optimize for mobile touch interactions with proper touch-action isolation
- Implement CSS to prevent scroll interference on dial and subcategory elements

## Expected Outcome
- ✅ Dial twist/rotation gestures work consistently without dragging the screen
- ✅ Subcategory selection works reliably without scroll interference
- ✅ No accidental text selection anywhere in the app
- ✅ Smooth, responsive dial rotation detection
- ✅ Proper touch event handling for both dial and subcategory interactions
- ✅ No interference between dial gestures and page scrolling
- ✅ Isolated touch zones for dial vs. scrollable content

## Files to Check and Update
- `src/App.jsx` - Main gesture handling and event delegation
- `src/components/DiscoveryDial.jsx` - Dial rotation gesture logic and touch event handling
- `src/components/SubcategorySelector.jsx` - Subcategory selection touch events
- `src/App.css` - Global CSS for text selection prevention and touch-action properties
- `src/index.css` - Base styles and touch properties for dial and subcategory areas
- Any gesture-related hook files in `src/hooks/` (especially dial rotation hooks)
- Component-specific CSS files for dial and subcategory styling
- Any parent container components that might be intercepting touch events

## Implementation Recommendations

### CSS Global Styles
```css
/* Disable text selection globally */
* {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}

/* Dial container - prevent all default touch behaviors */
.dial-container, .discovery-dial {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  touch-action: none; /* Critical: prevents scroll interference */
  position: relative;
  z-index: 10; /* Ensure dial is above other elements */
}

/* Subcategory selection areas */
.subcategory-item, .subcategory-selector {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  touch-action: manipulation; /* Allow tap but prevent scroll */
  position: relative;
  z-index: 5;
}
```

### JavaScript Gesture Handling
```javascript
// Dial rotation gesture handling
const handleDialTouchStart = (e) => {
  e.preventDefault();
  e.stopPropagation();
  // Start dial rotation tracking
  setDialRotationStart(e.touches[0]);
};

const handleDialTouchMove = (e) => {
  e.preventDefault();
  e.stopPropagation();
  // Process dial rotation without screen drag
  processDialRotation(e.touches[0]);
};

const handleDialTouchEnd = (e) => {
  e.preventDefault();
  e.stopPropagation();
  // Complete dial rotation
  finalizeDialRotation();
};

// Subcategory selection handling
const handleSubcategoryTouch = (e) => {
  e.preventDefault();
  e.stopPropagation();
  // Handle subcategory selection without scroll interference
  selectSubcategory(e.target.dataset.subcategory);
};
```

### Touch Action CSS Properties
```css
/* Dial area - completely disable default touch behaviors */
.dial-container, .discovery-dial, .dial-rotation-zone {
  touch-action: none; /* Critical: prevents all default touch behaviors */
  pointer-events: auto; /* Ensure touch events are captured */
}

/* Subcategory selection areas */
.subcategory-item, .subcategory-selector, .subcategory-button {
  touch-action: manipulation; /* Allow tap but prevent scroll/drag */
  pointer-events: auto;
}

/* Scrollable content areas (outside dial) */
.scrollable-content, .main-content {
  touch-action: pan-y; /* Allow only vertical scrolling */
}

/* Prevent any touch interference on parent containers */
.app-container, .main-app {
  touch-action: auto; /* Let child elements control their own touch behavior */
}
```

## Success Criteria
- ✅ Dial twist/rotation gestures register correctly 100% of the time
- ✅ No screen dragging when performing dial rotation gestures
- ✅ Subcategory selection works reliably without scroll interference
- ✅ Zero text selection possible anywhere in the app
- ✅ Smooth dial rotation recognition with proper visual feedback
- ✅ No conflicts between dial gestures and page scrolling
- ✅ Consistent behavior across all mobile devices and browsers
- ✅ Proper touch event isolation between dial area and scrollable content
- ✅ Subcategory taps register immediately without gesture conflicts

## Testing Requirements
- Test dial rotation on iOS Safari, Chrome Mobile, and other mobile browsers
- Verify subcategory selection works in all orientations
- Test edge cases like rapid dial rotations and multi-touch scenarios
- Ensure no text selection occurs during dial or subcategory interactions
- Validate that scrolling still works in content areas outside the dial
- Test dial rotation boundaries and subcategory selection zones
- Verify no screen drag occurs when twisting the dial
- Test subcategory selection responsiveness and accuracy

## Additional Recommendations
1. **Implement dial rotation debouncing** to prevent rapid-fire rotation events
2. **Add haptic feedback** for successful dial rotations and subcategory selections
3. **Create visual indicators** to show active dial rotation zones and subcategory selection areas
4. **Implement gesture history** for debugging dial rotation and subcategory selection issues
5. **Add dial sensitivity customization** options for different user preferences
6. **Optimize for accessibility** with proper ARIA labels for dial and subcategory interactions
7. **Add visual feedback** during dial rotation to show rotation progress
8. **Implement subcategory selection highlighting** to show which subcategory is being targeted
