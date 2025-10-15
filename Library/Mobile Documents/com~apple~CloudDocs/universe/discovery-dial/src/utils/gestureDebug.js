/**
 * Gesture Debug Utilities
 * Simple debugging tools to test gesture detection
 */

export const testGestureDetection = () => {
  console.log('🧪 Testing Gesture Detection...');
  
  // Test if touch events are being captured
  const testElement = document.querySelector('.enhanced-dial');
  if (!testElement) {
    console.log('❌ Enhanced dial element not found');
    return;
  }
  
  console.log('✅ Enhanced dial element found');
  
  // Add test event listeners
  const testTouchStart = (e) => {
    console.log('👆 Touch Start detected:', {
      touches: e.touches.length,
      clientX: e.touches[0]?.clientX,
      clientY: e.touches[0]?.clientY,
      target: e.target.className
    });
  };
  
  const testTouchMove = (e) => {
    console.log('👆 Touch Move detected:', {
      touches: e.touches.length,
      clientX: e.touches[0]?.clientX,
      clientY: e.touches[0]?.clientY,
      movementX: e.movementX,
      movementY: e.movementY
    });
  };
  
  const testTouchEnd = (e) => {
    console.log('👆 Touch End detected:', {
      touches: e.touches.length,
      changedTouches: e.changedTouches.length
    });
  };
  
  // Add test listeners
  testElement.addEventListener('touchstart', testTouchStart, { passive: false });
  testElement.addEventListener('touchmove', testTouchMove, { passive: false });
  testElement.addEventListener('touchend', testTouchEnd, { passive: false });
  
  console.log('✅ Test event listeners added');
  console.log('👆 Try touching the dial to see if events are captured');
  
  // Return cleanup function
  return () => {
    testElement.removeEventListener('touchstart', testTouchStart);
    testElement.removeEventListener('touchmove', testTouchMove);
    testElement.removeEventListener('touchend', testTouchEnd);
    console.log('🧹 Test event listeners removed');
  };
};

export const testDialElements = () => {
  console.log('🔍 Testing Dial Elements...');
  
  const elements = {
    enhancedDial: document.querySelector('.enhanced-dial'),
    subcategoryDial: document.querySelector('.subcategory-dial'),
    primaryCategories: document.querySelectorAll('.primary-category'),
    subcategories: document.querySelectorAll('.subcategory-item')
  };
  
  Object.entries(elements).forEach(([name, element]) => {
    if (element) {
      console.log(`✅ ${name}: Found`, {
        className: element.className,
        id: element.id,
        children: element.children.length
      });
    } else {
      console.log(`❌ ${name}: Not found`);
    }
  });
  
  return elements;
};

export const testGestureState = () => {
  console.log('🔍 Testing Gesture State...');
  
  // Check if gesture detection hook is working
  const dialElement = document.querySelector('.enhanced-dial');
  if (!dialElement) {
    console.log('❌ Dial element not found');
    return;
  }
  
  // Check for gesture-related data attributes or classes
  const hasGestureClasses = dialElement.classList.contains('gesture-active') || 
                           dialElement.classList.contains('gesture-processing');
  
  console.log('Gesture element state:', {
    hasGestureClasses,
    classList: Array.from(dialElement.classList),
    style: dialElement.style.transform
  });
  
  return {
    hasGestureClasses,
    classList: Array.from(dialElement.classList),
    style: dialElement.style.transform
  };
};

export const runGestureDiagnostics = () => {
  console.log('🚀 Running Gesture Diagnostics...');
  console.log('='.repeat(50));
  
  const results = {
    elements: testDialElements(),
    gestureState: testGestureState(),
    cleanup: testGestureDetection()
  };
  
  console.log('='.repeat(50));
  console.log('📊 Diagnostic Results:', results);
  
  return results;
};

// Expose globally for easy testing
if (typeof window !== 'undefined') {
  window.gestureDebug = {
    testGestureDetection,
    testDialElements,
    testGestureState,
    runGestureDiagnostics
  };
  
  console.log('🧪 Gesture Debug utilities loaded. Access via window.gestureDebug');
}
