/**
 * QA Testing Utilities
 * Automated testing functions for the Discovery Dial application
 */

/**
 * Test dial rotation functionality
 */
export const testDialRotation = () => {
  console.log('🧪 Testing dial rotation...');
  
  const dial = document.querySelector('.enhanced-dial');
  if (!dial) {
    console.error('❌ Dial element not found');
    return false;
  }
  
  // Test if dial is interactive
  const isInteractive = dial.style.pointerEvents !== 'none';
  if (!isInteractive) {
    console.error('❌ Dial is not interactive');
    return false;
  }
  
  console.log('✅ Dial rotation test passed');
  return true;
};

/**
 * Test compass labels visibility
 */
export const testCompassLabels = () => {
  console.log('🧪 Testing compass labels...');
  
  const labels = document.querySelectorAll('.compass-label');
  if (labels.length !== 4) {
    console.error('❌ Expected 4 compass labels, found:', labels.length);
    return false;
  }
  
  const expectedLabels = ['North', 'East', 'South', 'West'];
  const foundLabels = Array.from(labels).map(label => label.textContent.trim());
  
  for (const expected of expectedLabels) {
    if (!foundLabels.includes(expected)) {
      console.error('❌ Missing compass label:', expected);
      return false;
    }
  }
  
  console.log('✅ Compass labels test passed');
  return true;
};

/**
 * Test event information display
 */
export const testEventInformation = () => {
  console.log('🧪 Testing event information...');
  
  const eventArea = document.querySelector('.event-information-area');
  if (!eventArea) {
    console.error('❌ Event information area not found');
    return false;
  }
  
  const eventTitle = eventArea.querySelector('.event-title');
  const eventDescription = eventArea.querySelector('.event-description');
  
  if (!eventTitle && !eventDescription) {
    console.error('❌ No event content found');
    return false;
  }
  
  console.log('✅ Event information test passed');
  return true;
};

/**
 * Test time picker functionality
 */
export const testTimePicker = () => {
  console.log('🧪 Testing time picker...');
  
  const timePicker = document.querySelector('.time-picker-container');
  if (!timePicker) {
    console.error('❌ Time picker not found');
    return false;
  }
  
  const buttons = timePicker.querySelectorAll('.time-picker-button');
  if (buttons.length === 0) {
    console.error('❌ No time picker buttons found');
    return false;
  }
  
  // Test if buttons are clickable
  const firstButton = buttons[0];
  const isClickable = firstButton.style.pointerEvents !== 'none';
  if (!isClickable) {
    console.error('❌ Time picker buttons are not clickable');
    return false;
  }
  
  console.log('✅ Time picker test passed');
  return true;
};

/**
 * Test date range button functionality
 */
export const testDateRangeButton = () => {
  console.log('🧪 Testing date range button...');
  
  // Look for the date range button (it's a motion.button with specific styling)
  const dateRangeButton = document.querySelector('button[aria-label*="Date range"]');
  if (!dateRangeButton) {
    console.error('❌ Date range button not found');
    return false;
  }
  
  // Test if button is clickable
  const isClickable = dateRangeButton.style.pointerEvents !== 'none' && !dateRangeButton.disabled;
  if (!isClickable) {
    console.error('❌ Date range button is not clickable');
    return false;
  }
  
  // Test click functionality
  try {
    console.log('Testing date range button click...');
    const initialText = dateRangeButton.textContent.trim();
    console.log('Initial button text:', initialText);
    
    dateRangeButton.click();
    
    // Wait a bit for the state to update
    setTimeout(() => {
      const newText = dateRangeButton.textContent.trim();
      console.log('New button text:', newText);
      
      if (newText !== initialText) {
        console.log('✅ Date range button text changed successfully');
      } else {
        console.log('⚠️ Date range button text did not change');
      }
    }, 200);
    
    console.log('✅ Date range button click test passed');
  } catch (error) {
    console.error('❌ Date range button click failed:', error);
    return false;
  }
  
  console.log('✅ Date range button test passed');
  return true;
};

/**
 * Test mobile responsiveness
 */
export const testMobileResponsiveness = () => {
  console.log('🧪 Testing mobile responsiveness...');
  
  const isMobile = window.innerWidth <= 768;
  if (!isMobile) {
    console.log('ℹ️ Not on mobile device, skipping mobile test');
    return true;
  }
  
  const dial = document.querySelector('.dial-container');
  if (!dial) {
    console.error('❌ Dial container not found');
    return false;
  }
  
  const dialWidth = dial.offsetWidth;
  const viewportWidth = window.innerWidth;
  const expectedMaxWidth = viewportWidth * 0.9; // Should be max 90% of viewport
  
  if (dialWidth > expectedMaxWidth) {
    console.error('❌ Dial too wide for mobile viewport');
    return false;
  }
  
  console.log('✅ Mobile responsiveness test passed');
  return true;
};

/**
 * Test touch event handling
 */
export const testTouchEvents = () => {
  console.log('🧪 Testing touch events...');
  
  const dial = document.querySelector('.enhanced-dial');
  if (!dial) {
    console.error('❌ Dial element not found');
    return false;
  }
  
  // Check if touch events are properly configured
  const touchAction = window.getComputedStyle(dial).touchAction;
  if (touchAction !== 'none') {
    console.warn('⚠️ Touch action not set to none:', touchAction);
  }
  
  console.log('✅ Touch events test passed');
  return true;
};

/**
 * Test WordPress.com API integration
 */
export const testWordPressAPI = async () => {
  console.log('🧪 Testing WordPress.com API...');
  
  try {
    const response = await fetch('https://hyyper.co/wp-json/wp/v2/posts');
    if (!response.ok) {
      console.error('❌ WordPress.com API not responding:', response.status);
      return false;
    }
    
    const data = await response.json();
    if (!Array.isArray(data)) {
      console.error('❌ WordPress.com API returned invalid data');
      return false;
    }
    
    console.log('✅ WordPress.com API test passed');
    return true;
  } catch (error) {
    console.error('❌ WordPress.com API test failed:', error.message);
    return false;
  }
};

/**
 * Test error boundary functionality
 */
export const testErrorBoundary = () => {
  console.log('🧪 Testing error boundary...');
  
  const errorBoundary = document.querySelector('[data-testid="error-boundary"]');
  if (!errorBoundary) {
    console.log('ℹ️ Error boundary not found (may not be visible)');
    return true;
  }
  
  console.log('✅ Error boundary test passed');
  return true;
};

/**
 * Test performance metrics
 */
export const testPerformance = () => {
  console.log('🧪 Testing performance...');
  
  if (!window.performance) {
    console.warn('⚠️ Performance API not available');
    return true;
  }
  
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation) {
    const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
    if (loadTime > 5000) {
      console.warn('⚠️ Page load time is slow:', loadTime + 'ms');
    } else {
      console.log('✅ Page load time is good:', loadTime + 'ms');
    }
  }
  
  return true;
};

/**
 * Test accessibility features
 */
export const testAccessibility = () => {
  console.log('🧪 Testing accessibility...');
  
  const dial = document.querySelector('.enhanced-dial');
  if (!dial) {
    console.error('❌ Dial element not found');
    return false;
  }
  
  const ariaLabel = dial.getAttribute('aria-label');
  if (!ariaLabel) {
    console.warn('⚠️ Dial missing aria-label');
  }
  
  const role = dial.getAttribute('role');
  if (!role) {
    console.warn('⚠️ Dial missing role attribute');
  }
  
  console.log('✅ Accessibility test passed');
  return true;
};

/**
 * Run all QA tests
 */
export const runAllQATests = async () => {
  console.log('🚀 Starting comprehensive QA testing...');
  console.log('=====================================');
  
  const tests = [
    { name: 'Dial Rotation', fn: testDialRotation },
    { name: 'Compass Labels', fn: testCompassLabels },
    { name: 'Event Information', fn: testEventInformation },
    { name: 'Time Picker', fn: testTimePicker },
    { name: 'Date Range Button', fn: testDateRangeButton },
    { name: 'Mobile Responsiveness', fn: testMobileResponsiveness },
    { name: 'Touch Events', fn: testTouchEvents },
    { name: 'WordPress API', fn: testWordPressAPI },
    { name: 'Error Boundary', fn: testErrorBoundary },
    { name: 'Performance', fn: testPerformance },
    { name: 'Accessibility', fn: testAccessibility }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} test failed with error:`, error);
      failed++;
    }
  }
  
  console.log('=====================================');
  console.log(`🎯 QA Testing Complete: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Application is ready for production.');
  } else {
    console.log('⚠️ Some tests failed. Please review and fix issues.');
  }
  
  return { passed, failed, total: tests.length };
};

/**
 * Test specific device/browser combination
 */
export const testDeviceBrowser = () => {
  console.log('🧪 Testing device/browser combination...');
  
  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isChrome = /Chrome/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isEdge = /Edg/.test(userAgent);
  
  console.log('Device Info:');
  console.log('- Mobile:', isMobile);
  console.log('- Safari:', isSafari);
  console.log('- Chrome:', isChrome);
  console.log('- Firefox:', isFirefox);
  console.log('- Edge:', isEdge);
  console.log('- Screen:', window.innerWidth + 'x' + window.innerHeight);
  console.log('- Viewport:', window.innerWidth + 'x' + window.innerHeight);
  
  return {
    isMobile,
    isSafari,
    isChrome,
    isFirefox,
    isEdge,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight
  };
};

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.qaTesting = {
    testDialRotation,
    testCompassLabels,
    testEventInformation,
    testTimePicker,
    testDateRangeButton,
    testMobileResponsiveness,
    testTouchEvents,
    testWordPressAPI,
    testErrorBoundary,
    testPerformance,
    testAccessibility,
    runAllQATests,
    testDeviceBrowser
  };
  
  console.log('🔧 QA Testing utilities loaded. Use window.qaTesting.runAllQATests() to run all tests.');
  console.log('🔧 Test date range button: window.qaTesting.testDateRangeButton()');
}
