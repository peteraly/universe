/**
 * Mobile UI Debug Utilities
 * Functions to debug and test mobile UI visibility issues
 */

// Debug subcategory dial positioning
export const debugSubcategoryDial = () => {
  const dial = document.querySelector('.subcategory-dial');
  if (dial) {
    const rect = dial.getBoundingClientRect();
    console.log('Subcategory dial position:', {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      isVisible: rect.left >= 0 && rect.top >= 0 && 
                 rect.right <= window.innerWidth && 
                 rect.bottom <= window.innerHeight
    });
  } else {
    console.log('Subcategory dial not found');
  }
};

// Debug day toggle button visibility
export const debugDayToggleButton = () => {
  const button = document.querySelector('.date-range-button');
  if (button) {
    const rect = button.getBoundingClientRect();
    console.log('Day toggle button position:', {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      isVisible: rect.left >= 0 && rect.top >= 0 && 
                 rect.right <= window.innerWidth && 
                 rect.bottom <= window.innerHeight,
      zIndex: window.getComputedStyle(button).zIndex
    });
  } else {
    console.log('Day toggle button not found');
  }
};

// Test mobile UI visibility
export const testMobileUI = () => {
  console.log('Testing mobile UI visibility...');
  debugSubcategoryDial();
  debugDayToggleButton();
  
  // Test viewport dimensions
  console.log('Viewport dimensions:', {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio
  });
  
  // Test touch targets
  const touchTargets = document.querySelectorAll('button, .subcategory-item');
  touchTargets.forEach((target, index) => {
    const rect = target.getBoundingClientRect();
    const meetsTouchTarget = rect.width >= 44 && rect.height >= 44;
    console.log(`Touch target ${index}:`, {
      element: target.tagName,
      width: rect.width,
      height: rect.height,
      meetsTouchTarget
    });
  });
};

// Force mobile UI fixes
export const forceMobileUIFixes = () => {
  console.log('Forcing mobile UI fixes...');
  
  // Force subcategory dial positioning
  const subcategoryDial = document.querySelector('.subcategory-dial');
  if (subcategoryDial) {
    subcategoryDial.style.position = 'relative';
    subcategoryDial.style.maxWidth = '100vw';
    subcategoryDial.style.maxHeight = '100vh';
    console.log('Applied subcategory dial fixes');
  }
  
  // Force day toggle button visibility
  const button = document.querySelector('.date-range-button');
  if (button) {
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '1000';
    button.style.minWidth = '120px';
    button.style.minHeight = '44px';
    console.log('Applied day toggle button fixes');
  }
  
  // Add mobile viewport class
  document.body.classList.add('mobile-viewport');
  console.log('Added mobile-viewport class');
};

// Expose to global scope for console testing
if (typeof window !== 'undefined') {
  window.mobileUIDebug = {
    debugSubcategoryDial,
    debugDayToggleButton,
    testMobileUI,
    forceMobileUIFixes
  };
  
  console.log('Mobile UI debug utilities available:');
  console.log('  - window.mobileUIDebug.debugSubcategoryDial()');
  console.log('  - window.mobileUIDebug.debugDayToggleButton()');
  console.log('  - window.mobileUIDebug.testMobileUI()');
  console.log('  - window.mobileUIDebug.forceMobileUIFixes()');
}
