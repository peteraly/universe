// iPhone Compass App Proportions - Exact Reference
export const COMPASS_PROPORTIONS = {
  // Dial sizing (VISUAL DOMINANCE MANDATE - 70% of vertical screen space)
  DIAL_SIZE: 'min(70vh, 70vw)',         // 70% of viewport height for visual dominance
  DIAL_RADIUS: '35vh',                  // Half of 70vh for responsive radius
  DIAL_MAX_SIZE: '400px',               // Maximum size for large screens
  DIAL_MIN_SIZE: '280px',               // Minimum size for small screens
  
  // Ring styling (matches compass precision)
  OUTER_RING_WIDTH: '1px',              // Thin border like compass
  OUTER_RING_COLOR: 'rgba(0,0,0,0.3)',  // Subtle but visible
  
  // Tick marks (exact compass spacing)
  TICK_MAJOR_HEIGHT: 12,                 // Major ticks (every 30°)
  TICK_MINOR_HEIGHT: 6,                  // Minor ticks (every 2°)
  TICK_MAJOR_WIDTH: 2,                   // Major tick width
  TICK_MINOR_WIDTH: 1,                   // Minor tick width
  TICK_MAJOR_COLOR: 'rgba(0,0,0,0.8)',  // High contrast major ticks
  TICK_MINOR_COLOR: 'rgba(0,0,0,0.4)',  // Medium contrast minor ticks
  
  // Label positioning (compass accuracy)
  LABEL_DISTANCE: 140,                   // Distance from center to labels
  LABEL_FONT_SIZE: 12,                   // Readable label size
  LABEL_FONT_WEIGHT: 500,                // Medium weight for clarity
  LABEL_COLOR: '#000000',                // Pure black for contrast
  
  // Pointer styling (compass red)
  POINTER_SIZE: 10,                      // Red pointer height
  POINTER_COLOR: '#E63946',              // Bright red pointer
  POINTER_SHADOW: '0 1px 2px rgba(0,0,0,0.2)', // Subtle shadow
  
  // Center styling (compass minimalism with integrated event display)
  CENTER_SIZE: '25vh',                   // Center circle diameter - responsive
  CENTER_FONT_SIZE: 'clamp(14px, 4vw, 18px)', // Responsive center text
  CENTER_BACKGROUND: 'transparent',      // No background like compass
  EVENT_TITLE_SIZE: 'clamp(16px, 5vw, 24px)', // Large, clear event title
  EVENT_DETAILS_SIZE: 'clamp(12px, 3vw, 16px)', // Event details text
  
  // Gesture thresholds (optimized for mobile)
  VERTICAL_THRESHOLD: 50,                // px minimum for vertical swipe
  HORIZONTAL_THRESHOLD: 30,              // px minimum for horizontal swipe
  CIRCULAR_THRESHOLD: 15,                // degrees minimum for circular drag
  VELOCITY_THRESHOLD: 150,               // px/s minimum velocity
  
  // Touch targets (accessibility)
  MIN_TOUCH_TARGET: 44,                  // 44px minimum touch target
  GESTURE_AREA_PADDING: 20,              // Extra area around dial for gestures
};

// Performance targets (iPhone Compass level)
export const PERFORMANCE_TARGETS = {
  ANIMATION_FPS: 60,                     // Smooth animations
  GESTURE_LATENCY: 16,                   // <16ms response time
  RENDER_TIME: 8,                        // <8ms render time
  MEMORY_USAGE: 50,                      // <50MB memory usage
  BATTERY_IMPACT: 'minimal',             // Battery friendly
};

// Mobile device specifications
export const MOBILE_SPECS = {
  // iPhone 15 Pro (390x844)
  iphone15Pro: {
    width: 390,
    height: 844,
    dialSize: 280,
    safeArea: { top: 44, bottom: 34 }
  },
  
  // iPhone SE (375x667)
  iphoneSE: {
    width: 375,
    height: 667,
    dialSize: 260,
    safeArea: { top: 20, bottom: 0 }
  },
  
  // Android (various sizes)
  android: {
    width: '100vw',
    height: '100vh',
    dialSize: '70vw',
    safeArea: { top: 24, bottom: 0 }
  }
};
