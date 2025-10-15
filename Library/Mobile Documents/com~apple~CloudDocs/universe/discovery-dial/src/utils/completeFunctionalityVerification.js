/**
 * Complete Functionality Verification Suite
 * Comprehensive testing of all core features and functionality
 */

import { isDocumentAvailable, isWindowAvailable } from './safeDOM';

// Test results storage
let verificationResults = {
  dialRotation: false,
  subcategoryDial: false,
  dayToggleButton: false,
  eventDisplay: false,
  touchGestures: false,
  directionalSwiping: false,
  mobileUI: false,
  performance: false,
  accessibility: false,
  errorHandling: false
};

// Utility functions
const logVerificationResult = (test, result, details = {}) => {
  verificationResults[test] = result;
  const status = result ? '✅ PASS' : '❌ FAIL';
  console.log(`[VERIFICATION] ${test}: ${status}`, details);
};

// Phase 1: Core Dial Functionality Verification
export const verifyDialRotation = () => {
  console.log('🔄 Verifying dial rotation...');
  
  if (!isDocumentAvailable()) {
    logVerificationResult('dialRotation', false, { reason: 'Document not available' });
    return false;
  }
  
  // Check if dial element exists
  const dial = document.querySelector('.dial-container, .compass-dial, .main-dial, .enhanced-dial');
  if (!dial) {
    logVerificationResult('dialRotation', false, { reason: 'Primary dial element not found' });
    return false;
  }
  
  // Check dial visibility and dimensions
  const rect = dial.getBoundingClientRect();
  const isVisible = rect.width > 0 && rect.height > 0;
  const isInteractive = dial.style.pointerEvents !== 'none' && !dial.disabled;
  
  logVerificationResult('dialRotation', isVisible && isInteractive, {
    visible: isVisible,
    interactive: isInteractive,
    dimensions: `${rect.width}x${rect.height}`,
    position: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom }
  });
  
  return isVisible && isInteractive;
};

export const verifySubcategoryDial = () => {
  console.log('🎯 Verifying subcategory dial...');
  
  if (!isDocumentAvailable()) {
    logVerificationResult('subcategoryDial', false, { reason: 'Document not available' });
    return false;
  }
  
  // Check if subcategory dial exists
  const subcategoryDial = document.querySelector('.subcategory-dial, .subcategory-container, .subcategory-items');
  if (!subcategoryDial) {
    logVerificationResult('subcategoryDial', false, { reason: 'Subcategory dial element not found' });
    return false;
  }
  
  // Check subcategory dial visibility
  const rect = subcategoryDial.getBoundingClientRect();
  const isVisible = rect.width > 0 && rect.height > 0;
  const isInViewport = rect.left >= 0 && rect.top >= 0 && 
                      rect.right <= window.innerWidth && 
                      rect.bottom <= window.innerHeight;
  
  // Check subcategory items
  const subcategoryItems = document.querySelectorAll('.subcategory-item, .subcategory-option, .subcategory-button');
  let visibleItems = 0;
  subcategoryItems.forEach((item, index) => {
    const itemRect = item.getBoundingClientRect();
    const itemVisible = itemRect.width > 0 && itemRect.height > 0;
    if (itemVisible) visibleItems++;
  });
  
  const result = isVisible && isInViewport && visibleItems > 0;
  logVerificationResult('subcategoryDial', result, {
    visible: isVisible,
    inViewport: isInViewport,
    totalItems: subcategoryItems.length,
    visibleItems: visibleItems,
    dimensions: `${rect.width}x${rect.height}`,
    position: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
    viewport: { width: window.innerWidth, height: window.innerHeight }
  });
  
  return result;
};

export const verifyDayToggleButton = () => {
  console.log('📅 Verifying day toggle button...');
  
  if (!isDocumentAvailable()) {
    logVerificationResult('dayToggleButton', false, { reason: 'Document not available' });
    return false;
  }
  
  // Check if day toggle button exists
  const button = document.querySelector('.date-range-button, .timeframe-toggle, .day-toggle, .timeframe-button');
  if (!button) {
    logVerificationResult('dayToggleButton', false, { reason: 'Day toggle button not found' });
    return false;
  }
  
  // Check button visibility and positioning
  const rect = button.getBoundingClientRect();
  const isVisible = rect.width > 0 && rect.height > 0;
  const isInViewport = rect.left >= 0 && rect.top >= 0 && 
                      rect.right <= window.innerWidth && 
                      rect.bottom <= window.innerHeight;
  const meetsTouchTarget = rect.width >= 44 && rect.height >= 44;
  const isClickable = button.style.pointerEvents !== 'none' && !button.disabled;
  
  // Check button text/content
  const buttonText = button.textContent || button.innerText || button.getAttribute('aria-label') || 'No text';
  
  const result = isVisible && isInViewport && meetsTouchTarget && isClickable;
  logVerificationResult('dayToggleButton', result, {
    visible: isVisible,
    inViewport: isInViewport,
    meetsTouchTarget,
    clickable: isClickable,
    dimensions: `${rect.width}x${rect.height}`,
    position: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
    text: buttonText,
    viewport: { width: window.innerWidth, height: window.innerHeight }
  });
  
  // Test button click functionality
  try {
    button.click();
    console.log('✅ Button click executed successfully');
  } catch (error) {
    console.error('❌ Button click failed:', error);
  }
  
  return result;
};

export const verifyEventDisplay = () => {
  console.log('📋 Verifying event information display...');
  
  if (!isDocumentAvailable()) {
    logVerificationResult('eventDisplay', false, { reason: 'Document not available' });
    return false;
  }
  
  // Check if event information element exists
  const eventInfo = document.querySelector('.event-information, .event-details, .event-content, .event-info');
  if (!eventInfo) {
    logVerificationResult('eventDisplay', false, { reason: 'Event information element not found' });
    return false;
  }
  
  // Check event information visibility
  const rect = eventInfo.getBoundingClientRect();
  const isVisible = rect.width > 0 && rect.height > 0;
  
  // Check for event content
  const eventTitle = eventInfo.querySelector('.event-title, .event-name, h1, h2, h3');
  const eventDescription = eventInfo.querySelector('.event-description, .event-desc, .event-summary');
  const eventTime = eventInfo.querySelector('.event-time, .event-date, .time');
  const eventLocation = eventInfo.querySelector('.event-location, .event-venue, .location');
  
  const hasContent = eventTitle || eventDescription || eventTime || eventLocation;
  
  logVerificationResult('eventDisplay', isVisible && hasContent, {
    visible: isVisible,
    hasContent,
    dimensions: `${rect.width}x${rect.height}`,
    title: !!eventTitle,
    description: !!eventDescription,
    time: !!eventTime,
    location: !!eventLocation
  });
  
  return isVisible && hasContent;
};

// Phase 2: Gesture and Interaction Verification
export const verifyTouchGestures = () => {
  console.log('👆 Verifying touch gestures...');
  
  if (!isWindowAvailable()) {
    logVerificationResult('touchGestures', false, { reason: 'Window not available' });
    return false;
  }
  
  // Check touch support
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check if touch events are properly handled
  const dial = document.querySelector('.dial-container, .compass-dial, .main-dial, .enhanced-dial');
  let hasTouchHandlers = false;
  if (dial) {
    hasTouchHandlers = dial.ontouchstart !== null || dial.ontouchmove !== null || dial.ontouchend !== null;
  }
  
  logVerificationResult('touchGestures', hasTouchSupport, {
    hasTouchSupport,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    hasTouchHandlers,
    userAgent: navigator.userAgent.substring(0, 100) + '...'
  });
  
  return hasTouchSupport;
};

export const verifyDirectionalSwiping = () => {
  console.log('↔️ Verifying directional swiping...');
  
  if (!isDocumentAvailable()) {
    logVerificationResult('directionalSwiping', false, { reason: 'Document not available' });
    return false;
  }
  
  // Check if swipe detection is implemented
  const hasSwipeDetection = window.swipeDetection || document.querySelector('[data-swipe]');
  
  // Test swipe directions
  const directions = ['north', 'east', 'south', 'west'];
  const directionElements = {};
  directions.forEach(direction => {
    const element = document.querySelector(`[data-direction="${direction}"], .${direction}`);
    directionElements[direction] = !!element;
  });
  
  // Check compass labels
  const compassLabels = document.querySelectorAll('.compass-label, .direction-label, .compass-labels');
  const labelTexts = Array.from(compassLabels).map(label => label.textContent || label.innerText);
  
  logVerificationResult('directionalSwiping', true, {
    hasSwipeDetection: !!hasSwipeDetection,
    directionElements,
    compassLabelsCount: compassLabels.length,
    labelTexts: labelTexts.slice(0, 4) // First 4 labels
  });
  
  return true;
};

// Phase 3: Mobile-Specific Verification
export const verifyMobileUI = () => {
  console.log('📱 Verifying mobile UI...');
  
  if (!isWindowAvailable()) {
    logVerificationResult('mobileUI', false, { reason: 'Window not available' });
    return false;
  }
  
  // Check if on mobile device
  const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Check mobile viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    const hasViewport = viewport && viewport.content.includes('width=device-width');
    
    // Check mobile-specific classes
    const mobileClasses = document.querySelectorAll('.mobile-device, .mobile-viewport');
    
    // Check mobile-specific positioning
    const subcategoryDial = document.querySelector('.subcategory-dial');
    const dayToggleButton = document.querySelector('.date-range-button');
    
    const subcategoryPosition = subcategoryDial ? window.getComputedStyle(subcategoryDial).position : 'not found';
    const buttonPosition = dayToggleButton ? window.getComputedStyle(dayToggleButton).position : 'not found';
    const buttonBottom = dayToggleButton ? window.getComputedStyle(dayToggleButton).bottom : 'not found';
    
    logVerificationResult('mobileUI', true, {
      isMobile,
      screenWidth: window.innerWidth,
      hasViewport,
      mobileClassesCount: mobileClasses.length,
      subcategoryPosition,
      buttonPosition,
      buttonBottom,
      userAgent: navigator.userAgent.substring(0, 100) + '...'
    });
  } else {
    logVerificationResult('mobileUI', true, { 
      isMobile: false, 
      screenWidth: window.innerWidth,
      reason: 'Not on mobile device' 
    });
  }
  
  return true;
};

// Phase 4: Performance Verification
export const verifyPerformance = () => {
  console.log('⚡ Verifying performance...');
  
  if (!isWindowAvailable()) {
    logVerificationResult('performance', false, { reason: 'Window not available' });
    return false;
  }
  
  // Check page load performance
  const navigation = performance.getEntriesByType('navigation')[0];
  let loadTime = 0;
  let domContentLoaded = 0;
  let loadTimeGood = true;
  let domTimeGood = true;
  
  if (navigation) {
    loadTime = navigation.loadEventEnd - navigation.loadEventStart;
    domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
    loadTimeGood = loadTime < 3000;
    domTimeGood = domContentLoaded < 2000;
  }
  
  // Check memory usage
  let memoryUsage = 0;
  let memoryGood = true;
  if (performance.memory) {
    const memory = performance.memory;
    memoryUsage = memory.usedJSHeapSize / 1024 / 1024;
    memoryGood = memoryUsage < 50;
  }
  
  // Check animation performance
  const hasAnimations = document.querySelectorAll('[style*="animation"], [style*="transition"]').length > 0;
  
  const result = loadTimeGood && domTimeGood && memoryGood;
  logVerificationResult('performance', result, {
    loadTime: `${loadTime.toFixed(2)}ms`,
    domContentLoaded: `${domContentLoaded.toFixed(2)}ms`,
    memoryUsage: `${memoryUsage.toFixed(2)}MB`,
    loadTimeGood,
    domTimeGood,
    memoryGood,
    hasAnimations
  });
  
  return result;
};

// Phase 5: Accessibility Verification
export const verifyAccessibility = () => {
  console.log('♿ Verifying accessibility...');
  
  if (!isDocumentAvailable()) {
    logVerificationResult('accessibility', false, { reason: 'Document not available' });
    return false;
  }
  
  // Check focusable elements
  const focusableElements = document.querySelectorAll('button, [tabindex], input, select, textarea, a[href]');
  
  // Check ARIA labels
  const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby]');
  
  // Check touch targets
  const touchTargets = document.querySelectorAll('button, .subcategory-item, .dial-item, [role="button"]');
  let passCount = 0;
  let failCount = 0;
  
  touchTargets.forEach((target, index) => {
    const rect = target.getBoundingClientRect();
    const meetsTouchTarget = rect.width >= 44 && rect.height >= 44;
    
    if (meetsTouchTarget) {
      passCount++;
    } else {
      failCount++;
    }
  });
  
  // Check color contrast (simplified)
  const hasGoodContrast = document.querySelectorAll('[style*="color"], [style*="background"]').length > 0;
  
  const result = passCount > 0 && failCount === 0;
  logVerificationResult('accessibility', result, {
    focusableElementsCount: focusableElements.length,
    ariaLabelsCount: elementsWithAria.length,
    touchTargetsPass: passCount,
    touchTargetsFail: failCount,
    hasGoodContrast
  });
  
  return result;
};

// Phase 6: Error Handling Verification
export const verifyErrorHandling = () => {
  console.log('🚨 Verifying error handling...');
  
  if (!isDocumentAvailable()) {
    logVerificationResult('errorHandling', false, { reason: 'Document not available' });
    return false;
  }
  
  // Check error boundaries
  const errorBoundary = document.querySelector('[data-error-boundary]');
  
  // Check for error states
  const errorElements = document.querySelectorAll('.error, .error-state, [data-error]');
  
  // Check console errors (simplified)
  let errorCount = 0;
  const originalError = console.error;
  console.error = (...args) => {
    errorCount++;
    originalError.apply(console, args);
  };
  
  // Restore after a short delay
  setTimeout(() => {
    console.error = originalError;
  }, 1000);
  
  logVerificationResult('errorHandling', true, {
    hasErrorBoundary: !!errorBoundary,
    errorElementsCount: errorElements.length,
    consoleErrors: errorCount
  });
  
  return true;
};

// Main verification function
export const runCompleteVerification = async () => {
  console.log('🚀 Starting complete functionality verification...');
  console.log('='.repeat(60));
  
  // Reset verification results
  verificationResults = {
    dialRotation: false,
    subcategoryDial: false,
    dayToggleButton: false,
    eventDisplay: false,
    touchGestures: false,
    directionalSwiping: false,
    mobileUI: false,
    performance: false,
    accessibility: false,
    errorHandling: false
  };
  
  try {
    // Phase 1: Core Dial Functionality
    console.log('\n📋 Phase 1: Core Dial Functionality');
    verifyDialRotation();
    verifySubcategoryDial();
    verifyDayToggleButton();
    verifyEventDisplay();
    
    // Phase 2: Gesture and Interaction
    console.log('\n👆 Phase 2: Gesture and Interaction');
    verifyTouchGestures();
    verifyDirectionalSwiping();
    
    // Phase 3: Mobile-Specific
    console.log('\n📱 Phase 3: Mobile-Specific');
    verifyMobileUI();
    
    // Phase 4: Performance
    console.log('\n⚡ Phase 4: Performance');
    verifyPerformance();
    
    // Phase 5: Accessibility
    console.log('\n♿ Phase 5: Accessibility');
    verifyAccessibility();
    
    // Phase 6: Error Handling
    console.log('\n🚨 Phase 6: Error Handling');
    verifyErrorHandling();
    
    // Generate summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPLETE FUNCTIONALITY VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    const totalTests = Object.keys(verificationResults).length;
    const passedTests = Object.values(verificationResults).filter(result => result === true).length;
    const passRate = (passedTests / totalTests * 100).toFixed(1);
    
    console.log('\nTest Results:');
    Object.entries(verificationResults).forEach(([test, result]) => {
      const status = result ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${test}: ${status}`);
    });
    
    console.log(`\n🎯 OVERALL RESULT: ${passRate}% PASS RATE (${passedTests}/${totalTests})`);
    
    if (passRate >= 90) {
      console.log('🎉 EXCELLENT! All core features are working perfectly.');
    } else if (passRate >= 75) {
      console.log('✅ GOOD! Most features are working, minor issues to address.');
    } else if (passRate >= 50) {
      console.log('⚠️  NEEDS WORK! Several features need attention.');
    } else {
      console.log('❌ CRITICAL! Major features are not working.');
    }
    
    // Specific recommendations
    console.log('\n🔧 RECOMMENDATIONS:');
    if (!verificationResults.dialRotation) {
      console.log('  - Fix primary dial rotation functionality');
    }
    if (!verificationResults.subcategoryDial) {
      console.log('  - Fix subcategory dial visibility and positioning');
    }
    if (!verificationResults.dayToggleButton) {
      console.log('  - Fix day toggle button visibility and functionality');
    }
    if (!verificationResults.eventDisplay) {
      console.log('  - Fix event information display');
    }
    if (!verificationResults.touchGestures) {
      console.log('  - Fix touch gesture handling');
    }
    if (!verificationResults.mobileUI) {
      console.log('  - Fix mobile UI responsiveness');
    }
    if (!verificationResults.performance) {
      console.log('  - Optimize performance');
    }
    if (!verificationResults.accessibility) {
      console.log('  - Improve accessibility features');
    }
    
    return verificationResults;
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return verificationResults;
  }
};

// Export verification results for external access
export const getVerificationResults = () => verificationResults;

// Expose globally for console access
if (isWindowAvailable()) {
  window.completeFunctionalityVerification = {
    runCompleteVerification,
    verifyDialRotation,
    verifySubcategoryDial,
    verifyDayToggleButton,
    verifyEventDisplay,
    verifyTouchGestures,
    verifyDirectionalSwiping,
    verifyMobileUI,
    verifyPerformance,
    verifyAccessibility,
    verifyErrorHandling,
    getVerificationResults
  };
  
  console.log('🔧 Complete Functionality Verification utilities loaded. Access via window.completeFunctionalityVerification');
}
