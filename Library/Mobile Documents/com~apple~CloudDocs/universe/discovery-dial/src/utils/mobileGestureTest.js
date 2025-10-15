/**
 * Mobile Gesture Testing Utilities
 * Simple tools to test and debug mobile gesture functionality
 */

export const testMobileGestures = () => {
  console.log('📱 Testing Mobile Gestures...');
  
  // Test device detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTouch = 'ontouchstart' in window;
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  
  console.log('Device Info:', {
    isMobile,
    isTouch,
    isSafari,
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
  });
  
  // Test touch event support
  const touchSupport = {
    touchstart: 'ontouchstart' in window,
    touchmove: 'ontouchmove' in window,
    touchend: 'ontouchend' in window,
    touchcancel: 'ontouchcancel' in window
  };
  
  console.log('Touch Support:', touchSupport);
  
  // Test dial elements
  const dialElement = document.querySelector('.enhanced-dial');
  const subcategoryDial = document.querySelector('.subcategory-dial');
  
  if (dialElement) {
    const rect = dialElement.getBoundingClientRect();
    console.log('Enhanced Dial:', {
      found: true,
      position: { x: rect.left, y: rect.top },
      size: { width: rect.width, height: rect.height },
      center: { x: rect.left + rect.width/2, y: rect.top + rect.height/2 }
    });
  } else {
    console.log('Enhanced Dial: Not found');
  }
  
  if (subcategoryDial) {
    const rect = subcategoryDial.getBoundingClientRect();
    console.log('Subcategory Dial:', {
      found: true,
      position: { x: rect.left, y: rect.top },
      size: { width: rect.width, height: rect.height },
      center: { x: rect.left + rect.width/2, y: rect.top + rect.height/2 }
    });
  } else {
    console.log('Subcategory Dial: Not found');
  }
  
  return {
    deviceInfo: { isMobile, isTouch, isSafari },
    touchSupport,
    dialElements: { dialElement: !!dialElement, subcategoryDial: !!subcategoryDial }
  };
};

export const testTouchEvents = () => {
  console.log('👆 Testing Touch Events...');
  
  const dialElement = document.querySelector('.enhanced-dial');
  if (!dialElement) {
    console.log('❌ Dial element not found');
    return;
  }
  
  let touchStartTime = 0;
  let touchEndTime = 0;
  let touchStartPos = null;
  let touchEndPos = null;
  
  const handleTouchStart = (e) => {
    touchStartTime = Date.now();
    touchStartPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    console.log('👆 Touch Start:', {
      time: touchStartTime,
      position: touchStartPos,
      touches: e.touches.length
    });
  };
  
  const handleTouchMove = (e) => {
    if (touchStartPos) {
      const currentPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      const deltaX = currentPos.x - touchStartPos.x;
      const deltaY = currentPos.y - touchStartPos.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      console.log('👆 Touch Move:', {
        position: currentPos,
        delta: { x: deltaX, y: deltaY },
        distance: distance.toFixed(2)
      });
    }
  };
  
  const handleTouchEnd = (e) => {
    touchEndTime = Date.now();
    if (touchStartPos) {
      touchEndPos = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };
      const deltaX = touchEndPos.x - touchStartPos.x;
      const deltaY = touchEndPos.y - touchStartPos.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = touchEndTime - touchStartTime;
      const velocity = distance / duration * 1000; // px/s
      
      console.log('👆 Touch End:', {
        time: touchEndTime,
        position: touchEndPos,
        delta: { x: deltaX, y: deltaY },
        distance: distance.toFixed(2),
        duration: duration + 'ms',
        velocity: velocity.toFixed(2) + ' px/s'
      });
      
      // Reset for next gesture
      touchStartTime = 0;
      touchStartPos = null;
      touchEndPos = null;
    }
  };
  
  // Add event listeners
  dialElement.addEventListener('touchstart', handleTouchStart, { passive: false });
  dialElement.addEventListener('touchmove', handleTouchMove, { passive: false });
  dialElement.addEventListener('touchend', handleTouchEnd, { passive: false });
  
  console.log('✅ Touch event listeners added to dial');
  console.log('👆 Try touching the dial to see touch events');
  
  // Return cleanup function
  return () => {
    dialElement.removeEventListener('touchstart', handleTouchStart);
    dialElement.removeEventListener('touchmove', handleTouchMove);
    dialElement.removeEventListener('touchend', handleTouchEnd);
    console.log('🧹 Touch event listeners removed');
  };
};

export const testGestureDetection = () => {
  console.log('🎯 Testing Gesture Detection...');
  
  // Test if gesture detection hook is working
  const dialElement = document.querySelector('.enhanced-dial');
  if (!dialElement) {
    console.log('❌ Dial element not found');
    return;
  }
  
  // Check for gesture-related classes or data attributes
  const hasGestureClasses = dialElement.classList.contains('gesture-active') || 
                           dialElement.classList.contains('gesture-processing');
  
  console.log('Gesture Detection Status:', {
    hasGestureClasses,
    classList: Array.from(dialElement.classList),
    style: dialElement.style.transform,
    computedStyle: {
      transform: window.getComputedStyle(dialElement).transform,
      transition: window.getComputedStyle(dialElement).transition
    }
  });
  
  // Test if gesture detection hook is available
  if (window.gestureDebug) {
    console.log('✅ Gesture debug utilities available');
    return window.gestureDebug.runGestureDiagnostics();
  } else {
    console.log('❌ Gesture debug utilities not available');
    return null;
  }
};

export const runMobileGestureTests = () => {
  console.log('🚀 Running Mobile Gesture Tests...');
  console.log('='.repeat(50));
  
  const results = {
    deviceInfo: testMobileGestures(),
    touchEvents: null,
    gestureDetection: null
  };
  
  // Test touch events
  try {
    results.touchEvents = testTouchEvents();
  } catch (error) {
    console.error('Touch event test failed:', error);
  }
  
  // Test gesture detection
  try {
    results.gestureDetection = testGestureDetection();
  } catch (error) {
    console.error('Gesture detection test failed:', error);
  }
  
  console.log('='.repeat(50));
  console.log('📊 Mobile Gesture Test Results:', results);
  
  return results;
};

// Expose globally for easy testing
if (typeof window !== 'undefined') {
  window.mobileGestureTest = {
    testMobileGestures,
    testTouchEvents,
    testGestureDetection,
    runMobileGestureTests
  };
  
  console.log('📱 Mobile Gesture Test utilities loaded. Access via window.mobileGestureTest');
}
