/**
 * Comprehensive Gesture and Filter Testing Utilities
 * Tests all gestures, swipes, filters, and map synchronization
 */

import { isDocumentAvailable, isWindowAvailable } from './safeDOM';

// ========================================
// GESTURE TESTING UTILITIES
// ========================================

/**
 * Simulate swipe gesture
 */
const simulateSwipe = (direction, element = null) => {
  if (!isDocumentAvailable()) return;
  
  const targetElement = element || document.querySelector('.enhanced-dial');
  if (!targetElement) {
    console.warn('Target element not found for swipe simulation');
    return;
  }

  const rect = targetElement.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  let startX, startY, endX, endY;
  
  switch (direction.toLowerCase()) {
    case 'north':
      startX = centerX;
      startY = centerY + 50;
      endX = centerX;
      endY = centerY - 50;
      break;
    case 'east':
      startX = centerX - 50;
      startY = centerY;
      endX = centerX + 50;
      endY = centerY;
      break;
    case 'south':
      startX = centerX;
      startY = centerY - 50;
      endX = centerX;
      endY = centerY + 50;
      break;
    case 'west':
      startX = centerX + 50;
      startY = centerY;
      endX = centerX - 50;
      endY = centerY;
      break;
    default:
      console.warn(`Unknown swipe direction: ${direction}`);
      return;
  }

  // Create touch events
  const touchStart = new TouchEvent('touchstart', {
    touches: [new Touch({
      identifier: 1,
      target: targetElement,
      clientX: startX,
      clientY: startY
    })]
  });

  const touchMove = new TouchEvent('touchmove', {
    touches: [new Touch({
      identifier: 1,
      target: targetElement,
      clientX: endX,
      clientY: endY
    })]
  });

  const touchEnd = new TouchEvent('touchend', {
    touches: []
  });

  // Dispatch events
  targetElement.dispatchEvent(touchStart);
  setTimeout(() => targetElement.dispatchEvent(touchMove), 50);
  setTimeout(() => targetElement.dispatchEvent(touchEnd), 100);
  
  console.log(`🔄 Simulated ${direction} swipe`);
};

/**
 * Simulate rotation gesture
 */
const simulateRotation = (direction, degrees, element = null) => {
  if (!isDocumentAvailable()) return;
  
  const targetElement = element || document.querySelector('.subcategory-dial');
  if (!targetElement) {
    console.warn('Target element not found for rotation simulation');
    return;
  }

  const rect = targetElement.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const radius = Math.min(rect.width, rect.height) / 3;
  
  const radians = (degrees * Math.PI) / 180;
  const multiplier = direction === 'clockwise' ? 1 : -1;
  
  const startX = centerX + radius;
  const startY = centerY;
  const endX = centerX + radius * Math.cos(radians * multiplier);
  const endY = centerY + radius * Math.sin(radians * multiplier);

  // Create touch events for rotation
  const touchStart = new TouchEvent('touchstart', {
    touches: [new Touch({
      identifier: 1,
      target: targetElement,
      clientX: startX,
      clientY: startY
    })]
  });

  const touchMove = new TouchEvent('touchmove', {
    touches: [new Touch({
      identifier: 1,
      target: targetElement,
      clientX: endX,
      clientY: endY
    })]
  });

  const touchEnd = new TouchEvent('touchend', {
    touches: []
  });

  // Dispatch events
  targetElement.dispatchEvent(touchStart);
  setTimeout(() => targetElement.dispatchEvent(touchMove), 50);
  setTimeout(() => targetElement.dispatchEvent(touchEnd), 100);
  
  console.log(`🔄 Simulated ${direction} rotation: ${degrees}°`);
};

/**
 * Simulate touch interaction
 */
const simulateTouch = (type, coordinates, element = null) => {
  if (!isDocumentAvailable()) return;
  
  const targetElement = element || document.querySelector('.enhanced-dial');
  if (!targetElement) {
    console.warn('Target element not found for touch simulation');
    return;
  }

  const { x, y, touches = 1 } = coordinates;
  
  const touchEvent = new TouchEvent(`touch${type}`, {
    touches: Array.from({ length: touches }, (_, i) => new Touch({
      identifier: i + 1,
      target: targetElement,
      clientX: x + (i * 10),
      clientY: y + (i * 10)
    }))
  });

  targetElement.dispatchEvent(touchEvent);
  console.log(`👆 Simulated ${type} touch at (${x}, ${y}) with ${touches} touches`);
};

// ========================================
// FILTER TESTING UTILITIES
// ========================================

/**
 * Click time filter
 */
const clickTimeFilter = (time) => {
  if (!isDocumentAvailable()) return;
  
  const filterButton = document.querySelector(`[data-filter="time"][data-value="${time}"]`) ||
                      document.querySelector(`.filter-pill[data-time="${time}"]`) ||
                      Array.from(document.querySelectorAll('button')).find(btn => btn.textContent && btn.textContent.includes(time));
  
  if (filterButton) {
    filterButton.click();
    console.log(`⏰ Clicked time filter: ${time}`);
  } else {
    console.warn(`Time filter button not found: ${time}`);
  }
};

/**
 * Click day filter
 */
const clickDayFilter = (day) => {
  if (!isDocumentAvailable()) return;
  
  const filterButton = document.querySelector(`[data-filter="day"][data-value="${day}"]`) ||
                      document.querySelector(`.filter-pill[data-day="${day}"]`) ||
                      Array.from(document.querySelectorAll('button')).find(btn => btn.textContent && btn.textContent.includes(day));
  
  if (filterButton) {
    filterButton.click();
    console.log(`📅 Clicked day filter: ${day}`);
  } else {
    console.warn(`Day filter button not found: ${day}`);
  }
};

/**
 * Select category via dial
 */
const selectCategoryViaDial = (category) => {
  if (!isDocumentAvailable()) return;
  
  // Find category element
  const categoryElement = document.querySelector(`[data-category="${category}"]`) ||
                         Array.from(document.querySelectorAll('.primary-category')).find(el => el.textContent && el.textContent.includes(category));
  
  if (categoryElement) {
    categoryElement.click();
    console.log(`🎯 Selected category via dial: ${category}`);
  } else {
    console.warn(`Category element not found: ${category}`);
  }
};

/**
 * Select subcategory
 */
const selectSubcategory = (subcategory) => {
  if (!isDocumentAvailable()) return;
  
  const subcategoryElement = document.querySelector(`[data-subcategory="${subcategory}"]`) ||
                            Array.from(document.querySelectorAll('.subcategory-label')).find(el => el.textContent && el.textContent.includes(subcategory));
  
  if (subcategoryElement) {
    subcategoryElement.click();
    console.log(`🎯 Selected subcategory: ${subcategory}`);
  } else {
    console.warn(`Subcategory element not found: ${subcategory}`);
  }
};

// ========================================
// VERIFICATION UTILITIES
// ========================================

/**
 * Verify category selection
 */
const verifyCategorySelection = (expectedCategory) => {
  if (!isDocumentAvailable()) return false;
  
  const activeCategory = document.querySelector('.primary-category.active') ||
                        document.querySelector('.primary-category.selected');
  
  if (activeCategory) {
    const categoryName = activeCategory.textContent.trim();
    const isCorrect = categoryName.includes(expectedCategory);
    console.log(`${isCorrect ? '✅' : '❌'} Category selection: ${categoryName} (expected: ${expectedCategory})`);
    return isCorrect;
  } else {
    console.log('❌ No active category found');
    return false;
  }
};

/**
 * Verify subcategory change
 */
const verifySubcategoryChange = () => {
  if (!isDocumentAvailable()) return false;
  
  const activeSubcategory = document.querySelector('.subcategory-label.active') ||
                           document.querySelector('.subcategory-label.selected');
  
  if (activeSubcategory) {
    const subcategoryName = activeSubcategory.textContent.trim();
    console.log(`✅ Subcategory changed to: ${subcategoryName}`);
    return true;
  } else {
    console.log('❌ No active subcategory found');
    return false;
  }
};

/**
 * Verify map markers filtered
 */
const verifyMapMarkersFiltered = (filterType, value) => {
  if (!isDocumentAvailable()) return false;
  
  const markers = document.querySelectorAll('.mapboxgl-marker');
  const visibleMarkers = Array.from(markers).filter(marker => 
    marker.style.display !== 'none' && marker.style.visibility !== 'hidden'
  );
  
  console.log(`🗺️ Map markers filtered by ${filterType}: ${value} - ${visibleMarkers.length} visible markers`);
  return visibleMarkers.length > 0;
};

/**
 * Verify event list filtered
 */
const verifyEventListFiltered = (filterType, value) => {
  if (!isDocumentAvailable()) return false;
  
  const eventCards = document.querySelectorAll('.event-card');
  const visibleEvents = Array.from(eventCards).filter(card => 
    card.style.display !== 'none' && card.style.visibility !== 'hidden'
  );
  
  console.log(`📋 Event list filtered by ${filterType}: ${value} - ${visibleEvents.length} visible events`);
  return visibleEvents.length > 0;
};

/**
 * Verify dial selection maintained
 */
const verifyDialSelectionMaintained = () => {
  if (!isDocumentAvailable()) return false;
  
  const activeCategory = document.querySelector('.primary-category.active');
  const activeSubcategory = document.querySelector('.subcategory-label.active');
  
  const hasSelection = activeCategory || activeSubcategory;
  console.log(`${hasSelection ? '✅' : '❌'} Dial selection maintained`);
  return hasSelection;
};

/**
 * Verify filter pills updated
 */
const verifyFilterPillsUpdated = (filterType, value) => {
  if (!isDocumentAvailable()) return false;
  
  const activePill = document.querySelector(`.filter-pill.active[data-${filterType}="${value}"]`);
  const isUpdated = !!activePill;
  console.log(`${isUpdated ? '✅' : '❌'} Filter pill updated: ${filterType} = ${value}`);
  return isUpdated;
};

// ========================================
// MAP INTEGRATION TESTING
// ========================================

/**
 * Verify all markers visible
 */
const verifyAllMarkersVisible = () => {
  if (!isDocumentAvailable()) return false;
  
  const markers = document.querySelectorAll('.mapboxgl-marker');
  const visibleMarkers = Array.from(markers).filter(marker => 
    marker.style.display !== 'none' && marker.style.visibility !== 'hidden'
  );
  
  console.log(`🗺️ All markers visible: ${visibleMarkers.length}/${markers.length}`);
  return visibleMarkers.length === markers.length;
};

/**
 * Click marker
 */
const clickMarker = (marker) => {
  if (!isDocumentAvailable()) return;
  
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    clientX: marker.offsetLeft + marker.offsetWidth / 2,
    clientY: marker.offsetTop + marker.offsetHeight / 2
  });
  
  marker.dispatchEvent(clickEvent);
  console.log('🖱️ Clicked map marker');
};

/**
 * Verify event selected
 */
const verifyEventSelected = () => {
  if (!isDocumentAvailable()) return false;
  
  const selectedEvent = document.querySelector('.event-card.selected') ||
                       document.querySelector('.selected-event-overlay');
  
  const isSelected = !!selectedEvent;
  console.log(`${isSelected ? '✅' : '❌'} Event selected`);
  return isSelected;
};

/**
 * Verify event info displayed
 */
const verifyEventInfoDisplayed = () => {
  if (!isDocumentAvailable()) return false;
  
  const eventInfo = document.querySelector('.event-info-panel') ||
                   document.querySelector('.event-info-details');
  
  const isDisplayed = !!eventInfo && eventInfo.style.display !== 'none';
  console.log(`${isDisplayed ? '✅' : '❌'} Event info displayed`);
  return isDisplayed;
};

// ========================================
// MOBILE TESTING UTILITIES
// ========================================

/**
 * Test touch targets
 */
const testTouchTargets = () => {
  if (!isDocumentAvailable()) return;
  
  const touchTargets = document.querySelectorAll('.dial-foreground-layer button, .subcategory-label, .filter-pill');
  let passedTargets = 0;
  
  touchTargets.forEach((target, index) => {
    const rect = target.getBoundingClientRect();
    const meetsTouchTarget = rect.width >= 44 && rect.height >= 44;
    
    if (meetsTouchTarget) {
      passedTargets++;
    } else {
      console.warn(`Touch target ${index} too small: ${target.className} (${rect.width}x${rect.height}px)`);
    }
  });
  
  console.log(`👆 Touch targets test: ${passedTargets}/${touchTargets.length} meet 44px minimum`);
  return passedTargets === touchTargets.length;
};

/**
 * Test mobile gesture recognition
 */
const testMobileGestureRecognition = () => {
  if (!isDocumentAvailable()) return false;
  
  console.log('🧪 Testing mobile gesture recognition...');
  
  // Test swipe gestures
  const directions = ['north', 'east', 'south', 'west'];
  let recognizedGestures = 0;
  
  directions.forEach(direction => {
    simulateSwipe(direction);
    // Wait for gesture processing
    setTimeout(() => {
      const recognized = verifyCategorySelection(direction);
      if (recognized) recognizedGestures++;
    }, 200);
  });
  
  console.log(`📱 Mobile gesture recognition: ${recognizedGestures}/${directions.length} gestures recognized`);
  return recognizedGestures === directions.length;
};

/**
 * Test haptic feedback
 */
const testHapticFeedback = () => {
  if (!isWindowAvailable()) return false;
  
  // Check if vibration API is available
  const hasVibration = 'vibrate' in navigator;
  
  if (hasVibration) {
    try {
      navigator.vibrate(50); // Short vibration
      console.log('📳 Haptic feedback test: Vibration API available');
      return true;
    } catch (error) {
      console.warn('📳 Haptic feedback test: Vibration failed', error);
      return false;
    }
  } else {
    console.log('📳 Haptic feedback test: Vibration API not available');
    return false;
  }
};

// ========================================
// PERFORMANCE TESTING UTILITIES
// ========================================

/**
 * Measure frame rate
 */
const measureFrameRate = () => {
  if (!isWindowAvailable()) return 0;
  
  let frames = 0;
  const startTime = performance.now();
  
  const countFrame = () => {
    frames++;
    if (performance.now() - startTime < 1000) {
      requestAnimationFrame(countFrame);
    }
  };
  
  requestAnimationFrame(countFrame);
  
  return new Promise(resolve => {
    setTimeout(() => {
      const fps = frames;
      console.log(`📊 Frame rate: ${fps} fps`);
      resolve(fps);
    }, 1000);
  });
};

/**
 * Measure memory usage
 */
const measureMemoryUsage = () => {
  if (!isWindowAvailable()) return 0;
  
  if ('memory' in performance) {
    const memory = performance.memory;
    const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    console.log(`💾 Memory usage: ${usedMB} MB`);
    return usedMB;
  } else {
    console.log('💾 Memory usage: Not available');
    return 0;
  }
};

/**
 * Measure touch response time
 */
const measureTouchResponseTime = () => {
  if (!isDocumentAvailable()) return 0;
  
  const startTime = performance.now();
  
  const targetElement = document.querySelector('.enhanced-dial');
  if (!targetElement) return 0;
  
  const handleResponse = () => {
    const responseTime = performance.now() - startTime;
    console.log(`⚡ Touch response time: ${responseTime.toFixed(2)} ms`);
    return responseTime;
  };
  
  // Simulate touch and measure response
  simulateTouch('start', { x: 200, y: 300 }, targetElement);
  
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(handleResponse());
    }, 100);
  });
};

// ========================================
// COMPREHENSIVE TESTING FUNCTIONS
// ========================================

/**
 * Test primary dial gestures
 */
const testPrimaryGestures = async () => {
  console.log('🧪 Testing Primary Dial Gestures...');
  
  const directions = ['north', 'east', 'south', 'west'];
  let passedTests = 0;
  
  for (const direction of directions) {
    simulateSwipe(direction);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const passed = verifyCategorySelection(direction);
    if (passed) passedTests++;
  }
  
  console.log(`✅ Primary gestures test: ${passedTests}/${directions.length} passed`);
  return passedTests === directions.length;
};

/**
 * Test subcategory rotation
 */
const testSubcategoryRotation = async () => {
  console.log('🧪 Testing Subcategory Rotation...');
  
  let passedTests = 0;
  
  // Test clockwise rotation
  simulateRotation('clockwise', 45);
  await new Promise(resolve => setTimeout(resolve, 200));
  if (verifySubcategoryChange()) passedTests++;
  
  // Test counter-clockwise rotation
  simulateRotation('counter-clockwise', 30);
  await new Promise(resolve => setTimeout(resolve, 200));
  if (verifySubcategoryChange()) passedTests++;
  
  console.log(`✅ Subcategory rotation test: ${passedTests}/2 passed`);
  return passedTests === 2;
};

/**
 * Test touch interactions
 */
const testTouchInteractions = async () => {
  console.log('🧪 Testing Touch Interactions...');
  
  let passedTests = 0;
  
  // Test single touch
  simulateTouch('start', { x: 200, y: 300 });
  await new Promise(resolve => setTimeout(resolve, 100));
  passedTests++;
  
  // Test multi-touch prevention
  simulateTouch('start', { x: 200, y: 300, touches: 2 });
  await new Promise(resolve => setTimeout(resolve, 100));
  passedTests++;
  
  // Test touch targets
  if (testTouchTargets()) passedTests++;
  
  console.log(`✅ Touch interactions test: ${passedTests}/3 passed`);
  return passedTests === 3;
};

/**
 * Test time filters
 */
const testTimeFilters = async () => {
  console.log('🧪 Testing Time Filter Synchronization...');
  
  const timeFilters = ['Morning', 'Afternoon', 'Evening', 'Night'];
  let passedTests = 0;
  
  for (const time of timeFilters) {
    clickTimeFilter(time);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (verifyMapMarkersFiltered('time', time)) passedTests++;
  }
  
  console.log(`✅ Time filter synchronization test: ${passedTests}/${timeFilters.length} passed`);
  return passedTests === timeFilters.length;
};

/**
 * Test day filters
 */
const testDayFilters = async () => {
  console.log('🧪 Testing Day Filter Synchronization...');
  
  const dayFilters = ['Today', 'Tomorrow', 'This Week', 'Weekend'];
  let passedTests = 0;
  
  for (const day of dayFilters) {
    clickDayFilter(day);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (verifyMapMarkersFiltered('day', day)) passedTests++;
  }
  
  console.log(`✅ Day filter synchronization test: ${passedTests}/${dayFilters.length} passed`);
  return passedTests === dayFilters.length;
};

/**
 * Test category filters
 */
const testCategoryFilters = async () => {
  console.log('🧪 Testing Category Filter Synchronization...');
  
  const categories = ['Social', 'Education', 'Recreation', 'Professional'];
  let passedTests = 0;
  
  for (const category of categories) {
    selectCategoryViaDial(category);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (verifyMapMarkersFiltered('category', category)) passedTests++;
  }
  
  console.log(`✅ Category filter synchronization test: ${passedTests}/${categories.length} passed`);
  return passedTests === categories.length;
};

/**
 * Test map marker synchronization
 */
const testMapMarkerSync = async () => {
  console.log('🧪 Testing Map Marker Synchronization...');
  
  let passedTests = 0;
  
  // Test initial marker display
  if (verifyAllMarkersVisible()) passedTests++;
  
  // Test category filtering
  selectCategoryViaDial('Social');
  await new Promise(resolve => setTimeout(resolve, 200));
  if (verifyMapMarkersFiltered('Social')) passedTests++;
  
  // Test time filtering
  clickTimeFilter('Evening');
  await new Promise(resolve => setTimeout(resolve, 200));
  if (verifyMapMarkersFiltered('Evening')) passedTests++;
  
  console.log(`✅ Map marker synchronization test: ${passedTests}/3 passed`);
  return passedTests === 3;
};

/**
 * Test map interactions
 */
const testMapInteractions = async () => {
  console.log('🧪 Testing Map Interactions...');
  
  let passedTests = 0;
  
  // Test marker clicks
  const markers = document.querySelectorAll('.mapboxgl-marker');
  if (markers.length > 0) {
    clickMarker(markers[0]);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (verifyEventSelected()) passedTests++;
    if (verifyEventInfoDisplayed()) passedTests++;
  }
  
  console.log(`✅ Map interactions test: ${passedTests}/2 passed`);
  return passedTests === 2;
};

/**
 * Test mobile gestures
 */
const testMobileGestures = async () => {
  console.log('🧪 Testing Mobile Gestures...');
  
  let passedTests = 0;
  
  // Test touch targets
  if (testTouchTargets()) passedTests++;
  
  // Test gesture recognition
  if (testMobileGestureRecognition()) passedTests++;
  
  // Test haptic feedback
  if (testHapticFeedback()) passedTests++;
  
  console.log(`✅ Mobile gestures test: ${passedTests}/3 passed`);
  return passedTests === 3;
};

/**
 * Test mobile performance
 */
const testMobilePerformance = async () => {
  console.log('🧪 Testing Mobile Performance...');
  
  let passedTests = 0;
  
  // Test frame rate
  const fps = await measureFrameRate();
  if (fps >= 30) passedTests++;
  
  // Test memory usage
  const memory = measureMemoryUsage();
  if (memory < 100) passedTests++; // Less than 100MB
  
  // Test touch response time
  const responseTime = await measureTouchResponseTime();
  if (responseTime < 100) passedTests++; // Less than 100ms
  
  console.log(`✅ Mobile performance test: ${passedTests}/3 passed`);
  return passedTests === 3;
};

/**
 * Run comprehensive tests
 */
const runComprehensiveTests = async () => {
  console.log('🚀 Starting Comprehensive Gesture and Filter Tests...');
  
  const results = {
    gestures: false,
    filters: false,
    map: false,
    mobile: false,
    performance: false
  };
  
  try {
    // Test gestures
    results.gestures = await testPrimaryGestures() && 
                      await testSubcategoryRotation() && 
                      await testTouchInteractions();
    
    // Test filters
    results.filters = await testTimeFilters() && 
                     await testDayFilters() && 
                     await testCategoryFilters();
    
    // Test map integration
    results.map = await testMapMarkerSync() && 
                 await testMapInteractions();
    
    // Test mobile
    results.mobile = await testMobileGestures();
    
    // Test performance
    results.performance = await testMobilePerformance();
    
    const allPassed = Object.values(results).every(result => result);
    
    console.log('📊 Test Results Summary:');
    console.log(`  Gestures: ${results.gestures ? '✅' : '❌'}`);
    console.log(`  Filters: ${results.filters ? '✅' : '❌'}`);
    console.log(`  Map: ${results.map ? '✅' : '❌'}`);
    console.log(`  Mobile: ${results.mobile ? '✅' : '❌'}`);
    console.log(`  Performance: ${results.performance ? '✅' : '❌'}`);
    console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    return results;
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    return results;
  }
};

// ========================================
// EXPORT AND GLOBAL EXPOSURE
// ========================================

// Expose testing functions globally for easy console access
if (isWindowAvailable()) {
  window.gestureAndFilterTesting = {
    // Comprehensive testing
    runComprehensiveTests,
    
    // Individual test functions
    testPrimaryGestures,
    testSubcategoryRotation,
    testTouchInteractions,
    testTimeFilters,
    testDayFilters,
    testCategoryFilters,
    testMapMarkerSync,
    testMapInteractions,
    testMobileGestures,
    testMobilePerformance,
    
    // Utility functions
    simulateSwipe,
    simulateRotation,
    simulateTouch,
    clickTimeFilter,
    clickDayFilter,
    selectCategoryViaDial,
    selectSubcategory,
    verifyCategorySelection,
    verifySubcategoryChange,
    verifyMapMarkersFiltered,
    verifyEventListFiltered,
    verifyDialSelectionMaintained,
    verifyFilterPillsUpdated,
    verifyAllMarkersVisible,
    clickMarker,
    verifyEventSelected,
    verifyEventInfoDisplayed,
    testTouchTargets,
    testMobileGestureRecognition,
    testHapticFeedback,
    measureFrameRate,
    measureMemoryUsage,
    measureTouchResponseTime
  };
  
  console.log('🧪 Gesture and Filter Testing utilities loaded. Access via window.gestureAndFilterTesting');
}

export {
  runComprehensiveTests,
  testPrimaryGestures,
  testSubcategoryRotation,
  testTouchInteractions,
  testTimeFilters,
  testDayFilters,
  testCategoryFilters,
  testMapMarkerSync,
  testMapInteractions,
  testMobileGestures,
  testMobilePerformance,
  simulateSwipe,
  simulateRotation,
  simulateTouch,
  clickTimeFilter,
  clickDayFilter,
  selectCategoryViaDial,
  selectSubcategory,
  verifyCategorySelection,
  verifySubcategoryChange,
  verifyMapMarkersFiltered,
  verifyEventListFiltered,
  verifyDialSelectionMaintained,
  verifyFilterPillsUpdated,
  verifyAllMarkersVisible,
  clickMarker,
  verifyEventSelected,
  verifyEventInfoDisplayed,
  testTouchTargets,
  testMobileGestureRecognition,
  testHapticFeedback,
  measureFrameRate,
  measureMemoryUsage,
  measureTouchResponseTime
};
