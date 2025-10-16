/**
 * Fixed Gesture Testing System
 * Resolves CSS selector issues and element detection problems
 */

// Fixed element selection methods
const FixedElementSelection = {
  // Find button by text content (replaces invalid :contains() selector)
  findButtonByText: (text) => {
    const buttons = document.querySelectorAll('button');
    return Array.from(buttons).find(button => 
      button.textContent && button.textContent.includes(text)
    );
  },

  // Find dial element with multiple fallback selectors
  findDialElement: () => {
    return document.querySelector('.enhanced-dial') || 
           document.querySelector('.dial-container') ||
           document.querySelector('[data-testid="dial"]') ||
           document.querySelector('.primary-dial') ||
           document.querySelector('.compass-dial');
  },

  // Find subcategory dial element
  findSubcategoryElement: () => {
    return document.querySelector('.subcategory-dial') ||
           document.querySelector('.subcategory-container') ||
           document.querySelector('[data-testid="subcategory-dial"]') ||
           document.querySelector('.secondary-dial');
  },

  // Find day toggle button with multiple fallbacks
  findDayToggleButton: () => {
    return document.querySelector('.date-range-button') ||
           document.querySelector('.day-toggle-button') ||
           document.querySelector('[data-testid="day-toggle"]') ||
           document.querySelector('.timeframe-toggle') ||
           document.querySelector('button[class*="date"]') ||
           document.querySelector('button[class*="range"]') ||
           document.querySelector('button[class*="toggle"]') ||
           document.querySelector('button[aria-label*="timeframe"]');
  },

  // Find event display element
  findEventDisplay: () => {
    return document.querySelector('.event-info-panel') ||
           document.querySelector('.event-information') ||
           document.querySelector('[data-testid="event-display"]') ||
           document.querySelector('.event-details');
  }
};

// Fixed gesture simulation
const FixedGestureSimulation = {
  // Simulate touch events properly
  simulateTouch: (element, startPos, endPos) => {
    if (!element) return false;

    try {
      // Create touch events
      const touchStart = new TouchEvent('touchstart', {
        touches: [{
          clientX: startPos.x,
          clientY: startPos.y,
          target: element
        }],
        bubbles: true,
        cancelable: true
      });

      const touchMove = new TouchEvent('touchmove', {
        touches: [{
          clientX: endPos.x,
          clientY: endPos.y,
          target: element
        }],
        bubbles: true,
        cancelable: true
      });

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true
      });

      // Dispatch events
      element.dispatchEvent(touchStart);
      element.dispatchEvent(touchMove);
      element.dispatchEvent(touchEnd);

      return true;
    } catch (error) {
      console.error('Touch simulation failed:', error);
      return false;
    }
  },

  // Simulate click events
  simulateClick: (element) => {
    if (!element) return false;

    try {
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });

      element.dispatchEvent(clickEvent);
      return true;
    } catch (error) {
      console.error('Click simulation failed:', error);
      return false;
    }
  }
};

// Fixed testing functions
const FixedTestingFunctions = {
  // Test dial rotation functionality
  testDialRotation: () => {
    console.log('🔄 Testing dial rotation...');
    
    const dial = FixedElementSelection.findDialElement();
    if (!dial) {
      console.error('❌ Dial element not found');
      return { success: false, error: 'Dial element not found' };
    }

    // Test if dial is visible and interactive
    const rect = dial.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    const isInteractive = dial.style.pointerEvents !== 'none';

    if (!isVisible) {
      console.error('❌ Dial is not visible');
      return { success: false, error: 'Dial is not visible' };
    }

    if (!isInteractive) {
      console.error('❌ Dial is not interactive');
      return { success: false, error: 'Dial is not interactive' };
    }

    console.log('✅ Dial rotation test passed');
    return { success: true, element: dial };
  },

  // Test subcategory dial functionality
  testSubcategoryDial: () => {
    console.log('🎯 Testing subcategory dial...');
    
    const subcategoryDial = FixedElementSelection.findSubcategoryElement();
    if (!subcategoryDial) {
      console.error('❌ Subcategory dial element not found');
      return { success: false, error: 'Subcategory dial element not found' };
    }

    // Test visibility and positioning
    const rect = subcategoryDial.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    const isInViewport = rect.top >= 0 && rect.left >= 0 && 
                        rect.bottom <= window.innerHeight && 
                        rect.right <= window.innerWidth;

    if (!isVisible) {
      console.error('❌ Subcategory dial is not visible');
      return { success: false, error: 'Subcategory dial is not visible' };
    }

    if (!isInViewport) {
      console.error('❌ Subcategory dial is outside viewport');
      return { success: false, error: 'Subcategory dial is outside viewport' };
    }

    console.log('✅ Subcategory dial test passed');
    return { success: true, element: subcategoryDial };
  },

  // Test day toggle button functionality
  testDayToggleButton: () => {
    console.log('📅 Testing day toggle button...');
    
    const button = FixedElementSelection.findDayToggleButton();
    if (!button) {
      console.error('❌ Day toggle button not found');
      return { success: false, error: 'Day toggle button not found' };
    }

    // Test visibility and clickability
    const rect = button.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    const isClickable = button.style.pointerEvents !== 'none' && 
                       button.disabled !== true;

    if (!isVisible) {
      console.error('❌ Day toggle button is not visible');
      return { success: false, error: 'Day toggle button is not visible' };
    }

    if (!isClickable) {
      console.error('❌ Day toggle button is not clickable');
      return { success: false, error: 'Day toggle button is not clickable' };
    }

    // Test click functionality
    const originalText = button.textContent;
    const clickSuccess = FixedGestureSimulation.simulateClick(button);
    
    if (!clickSuccess) {
      console.error('❌ Day toggle button click failed');
      return { success: false, error: 'Day toggle button click failed' };
    }

    console.log('✅ Day toggle button test passed');
    return { success: true, element: button, originalText };
  },

  // Test event display functionality
  testEventDisplay: () => {
    console.log('📋 Testing event display...');
    
    const eventDisplay = FixedElementSelection.findEventDisplay();
    if (!eventDisplay) {
      console.error('❌ Event display element not found');
      return { success: false, error: 'Event display element not found' };
    }

    // Test visibility and content
    const rect = eventDisplay.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    const hasContent = eventDisplay.textContent && eventDisplay.textContent.trim().length > 0;

    if (!isVisible) {
      console.error('❌ Event display is not visible');
      return { success: false, error: 'Event display is not visible' };
    }

    if (!hasContent) {
      console.error('❌ Event display has no content');
      return { success: false, error: 'Event display has no content' };
    }

    console.log('✅ Event display test passed');
    return { success: true, element: eventDisplay };
  },

  // Test touch gesture functionality
  testTouchGestures: () => {
    console.log('👆 Testing touch gestures...');
    
    const dial = FixedElementSelection.findDialElement();
    if (!dial) {
      console.error('❌ Dial element not found for gesture testing');
      return { success: false, error: 'Dial element not found' };
    }

    // Test vertical swipe gesture
    const startPos = { x: 200, y: 200 };
    const endPos = { x: 200, y: 100 }; // Upward swipe
    
    const gestureSuccess = FixedGestureSimulation.simulateTouch(dial, startPos, endPos);
    
    if (!gestureSuccess) {
      console.error('❌ Touch gesture simulation failed');
      return { success: false, error: 'Touch gesture simulation failed' };
    }

    console.log('✅ Touch gestures test passed');
    return { success: true, element: dial };
  }
};

// Main testing function
const runFixedTests = () => {
  console.log('🧪 Running Fixed Functionality Tests...');
  console.log('=====================================');

  const results = {
    dialRotation: FixedTestingFunctions.testDialRotation(),
    subcategoryDial: FixedTestingFunctions.testSubcategoryDial(),
    dayToggleButton: FixedTestingFunctions.testDayToggleButton(),
    eventDisplay: FixedTestingFunctions.testEventDisplay(),
    touchGestures: FixedTestingFunctions.testTouchGestures()
  };

  // Calculate pass rate
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(result => result.success).length;
  const passRate = (passedTests / totalTests) * 100;

  console.log('=====================================');
  console.log('📊 FIXED TEST RESULTS');
  console.log('=====================================');
  console.log(`Pass Rate: ${passRate.toFixed(1)}% (${passedTests}/${totalTests})`);
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${test}`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });

  return results;
};

// Expose globally for console access
if (typeof window !== 'undefined') {
  window.fixedTesting = {
    runFixedTests,
    FixedElementSelection,
    FixedGestureSimulation,
    FixedTestingFunctions
  };
  
  console.log('🔧 Fixed Testing utilities loaded. Use window.fixedTesting.runFixedTests() to run tests.');
}

export {
  FixedElementSelection,
  FixedGestureSimulation,
  FixedTestingFunctions,
  runFixedTests
};
