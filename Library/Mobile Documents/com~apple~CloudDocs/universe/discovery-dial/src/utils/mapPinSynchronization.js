/**
 * Map Pin Synchronization System
 * Ensures perfect synchronization between events and map pins
 */

import { COMPREHENSIVE_SAMPLE_EVENTS } from '../data/comprehensiveSampleEvents';

// ========================================
// MAP PIN CREATION AND MANAGEMENT
// ========================================

// Get category color
const getCategoryColor = (category) => {
  const colors = {
    'Social': '#e63946',
    'Arts/Culture': '#7209b7',
    'Wellness': '#06d6a0',
    'Professional': '#3a86ff',
    'Music': '#e63946',
    'Food': '#f77f00',
    'Sports': '#2a9d8f',
    'Art': '#7209b7',
    'Tech': '#3a86ff',
    'Outdoor': '#06d6a0',
    'Nightlife': '#f72585',
    'Family': '#ffbe0b'
  };
  return colors[category] || '#6c757d';
};

// Get event size based on attendees
const getEventSize = (attendees) => {
  const safeAttendees = typeof attendees === 'string' ? attendees : String(attendees || '0');
  const count = parseInt(safeAttendees.replace(/\D/g, ''));
  if (isNaN(count)) return 'small';
  if (count > 1000) return 'large';
  if (count > 100) return 'medium';
  return 'small';
};

/**
 * Create map pins from events
 */
export const createMapPins = (events) => {
  return events.map(event => ({
    id: event.id,
    position: [event.longitude, event.latitude],
    popup: {
      title: event.name,
      description: event.description,
      venue: event.venue,
      time: event.time,
      day: event.day,
      price: event.price,
      attendees: event.attendees,
      organizer: event.organizer,
      website: event.website
    },
    category: event.categoryPrimary,
    subcategory: event.categorySecondary,
    time: event.time,
    day: event.day,
    color: getCategoryColor(event.categoryPrimary),
    size: getEventSize(event.attendees),
    visible: true,
    event: event // Store reference to original event
  }));
};

/**
 * Update map pins based on filters
 */
export const updateMapPins = (pins, filters) => {
  return pins.map(pin => {
    let visible = true;
    
    // Filter by category
    if (filters.category && filters.category !== 'All' && pin.category !== filters.category) {
      visible = false;
    }
    
    // Filter by subcategory
    if (filters.subcategory && filters.subcategory !== 'All' && pin.subcategory !== filters.subcategory) {
      visible = false;
    }
    
    // Filter by time
    if (filters.time && filters.time !== 'All' && pin.time !== filters.time) {
      visible = false;
    }
    
    // Filter by day
    if (filters.day && filters.day !== 'All' && pin.day !== filters.day) {
      visible = false;
    }
    
    return {
      ...pin,
      visible
    };
  });
};

/**
 * Get visible pins
 */
export const getVisiblePins = (pins) => {
  return pins.filter(pin => pin.visible);
};

/**
 * Get pins by category
 */
export const getPinsByCategory = (pins, category) => {
  return pins.filter(pin => pin.category === category);
};

/**
 * Get pins by subcategory
 */
export const getPinsBySubcategory = (pins, subcategory) => {
  return pins.filter(pin => pin.subcategory === subcategory);
};

/**
 * Get pins by time
 */
export const getPinsByTime = (pins, time) => {
  return pins.filter(pin => pin.time === time);
};

/**
 * Get pins by day
 */
export const getPinsByDay = (pins, day) => {
  return pins.filter(pin => pin.day === day);
};

// ========================================
// SYNCHRONIZATION VERIFICATION
// ========================================

/**
 * Verify event-map pin synchronization
 */
export const verifyEventMapSync = (events, pins) => {
  const results = {
    totalEvents: events.length,
    totalPins: pins.length,
    syncedPins: 0,
    missingPins: [],
    extraPins: [],
    syncPercentage: 0,
    locationMatches: 0,
    categoryMatches: 0,
    timeMatches: 0,
    dayMatches: 0
  };
  
  // Check each event has corresponding pin
  events.forEach(event => {
    const pin = pins.find(pin => pin.id === event.id);
    if (pin) {
      results.syncedPins++;
      
      // Check location accuracy
      const locationMatch = Math.abs(pin.position[1] - event.latitude) < 0.0001 &&
                           Math.abs(pin.position[0] - event.longitude) < 0.0001;
      if (locationMatch) results.locationMatches++;
      
      // Check category match
      if (pin.category === event.categoryPrimary) results.categoryMatches++;
      
      // Check time match
      if (pin.time === event.time) results.timeMatches++;
      
      // Check day match
      if (pin.day === event.day) results.dayMatches++;
    } else {
      results.missingPins.push(event.id);
    }
  });
  
  // Check for extra pins
  pins.forEach(pin => {
    const event = events.find(event => event.id === pin.id);
    if (!event) {
      results.extraPins.push(pin.id);
    }
  });
  
  results.syncPercentage = results.totalEvents > 0 ? 
    (results.syncedPins / results.totalEvents) * 100 : 0;
  
  return results;
};

/**
 * Test synchronization accuracy
 */
export const testSynchronizationAccuracy = () => {
  console.log('🧪 Testing Event-Map Pin Synchronization...');
  
  const events = COMPREHENSIVE_SAMPLE_EVENTS;
  const pins = createMapPins(events);
  const syncResults = verifyEventMapSync(events, pins);
  
  // Test 1: Count verification
  const countMatch = events.length === pins.length;
  console.log(`📊 Event count: ${events.length}, Pin count: ${pins.length}, Match: ${countMatch ? '✅' : '❌'}`);
  
  // Test 2: ID verification
  const eventIds = events.map(e => e.id);
  const pinIds = pins.map(p => p.id);
  const idMatch = eventIds.every(id => pinIds.includes(id));
  console.log(`🆔 All event IDs have corresponding pins: ${idMatch ? '✅' : '❌'}`);
  
  // Test 3: Location verification
  const locationMatch = events.every(event => {
    const pin = pins.find(p => p.id === event.id);
    return pin && 
           Math.abs(pin.position[1] - event.latitude) < 0.0001 &&
           Math.abs(pin.position[0] - event.longitude) < 0.0001;
  });
  console.log(`📍 All locations match: ${locationMatch ? '✅' : '❌'}`);
  
  // Test 4: Category verification
  const categoryMatch = events.every(event => {
    const pin = pins.find(p => p.id === event.id);
    return pin && pin.category === event.categoryPrimary;
  });
  console.log(`🏷️ All categories match: ${categoryMatch ? '✅' : '❌'}`);
  
  // Test 5: Time/Day verification
  const timeMatch = events.every(event => {
    const pin = pins.find(p => p.id === event.id);
    return pin && pin.time === event.time && pin.day === event.day;
  });
  console.log(`⏰ All time/day match: ${timeMatch ? '✅' : '❌'}`);
  
  const overallSync = countMatch && idMatch && locationMatch && categoryMatch && timeMatch;
  console.log(`🎯 Overall synchronization: ${overallSync ? '✅ PERFECT SYNC' : '❌ SYNC ISSUES DETECTED'}`);
  
  // Detailed results
  console.log('📊 Detailed Sync Results:', {
    totalEvents: syncResults.totalEvents,
    totalPins: syncResults.totalPins,
    syncedPins: syncResults.syncedPins,
    syncPercentage: syncResults.syncPercentage.toFixed(1) + '%',
    locationMatches: syncResults.locationMatches,
    categoryMatches: syncResults.categoryMatches,
    timeMatches: syncResults.timeMatches,
    dayMatches: syncResults.dayMatches,
    missingPins: syncResults.missingPins.length,
    extraPins: syncResults.extraPins.length
  });
  
  return {
    countMatch,
    idMatch,
    locationMatch,
    categoryMatch,
    timeMatch,
    overallSync,
    syncResults
  };
};

// ========================================
// PIN VISIBILITY TESTING
// ========================================

/**
 * Test pin visibility
 */
export const testPinVisibility = (pins) => {
  console.log('👁️ Testing Map Pin Visibility...');
  
  const visiblePins = pins.filter(pin => pin.visible);
  
  console.log(`📌 Total pins: ${pins.length}`);
  console.log(`👀 Visible pins: ${visiblePins.length}`);
  console.log(`🔍 Visibility rate: ${(visiblePins.length / pins.length * 100).toFixed(1)}%`);
  
  // Test category distribution
  const categoryCounts = {};
  visiblePins.forEach(pin => {
    categoryCounts[pin.category] = (categoryCounts[pin.category] || 0) + 1;
  });
  
  console.log('📊 Category distribution:');
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} pins`);
  });
  
  return {
    totalPins: pins.length,
    visiblePins: visiblePins.length,
    visibilityRate: (visiblePins.length / pins.length * 100),
    categoryCounts
  };
};

/**
 * Test filter synchronization
 */
export const testFilterSynchronization = () => {
  console.log('🔍 Testing Filter Synchronization...');
  
  const events = COMPREHENSIVE_SAMPLE_EVENTS;
  const pins = createMapPins(events);
  
  // Test category filtering
  const categories = ['Social', 'Arts/Culture', 'Wellness', 'Professional'];
  let categoryTestsPassed = 0;
  
  categories.forEach(category => {
    const filteredEvents = events.filter(event => event.categoryPrimary === category);
    const filteredPins = updateMapPins(pins, { category });
    const visiblePins = getVisiblePins(filteredPins);
    
    const testPassed = filteredEvents.length === visiblePins.length;
    console.log(`🏷️ Category ${category}: ${filteredEvents.length} events, ${visiblePins.length} visible pins - ${testPassed ? '✅' : '❌'}`);
    
    if (testPassed) categoryTestsPassed++;
  });
  
  // Test time filtering
  const times = ['Morning', 'Afternoon', 'Evening', 'Night'];
  let timeTestsPassed = 0;
  
  times.forEach(time => {
    const filteredEvents = events.filter(event => event.time === time);
    const filteredPins = updateMapPins(pins, { time });
    const visiblePins = getVisiblePins(filteredPins);
    
    const testPassed = filteredEvents.length === visiblePins.length;
    console.log(`⏰ Time ${time}: ${filteredEvents.length} events, ${visiblePins.length} visible pins - ${testPassed ? '✅' : '❌'}`);
    
    if (testPassed) timeTestsPassed++;
  });
  
  // Test day filtering
  const days = ['Today', 'Tomorrow', 'This Week', 'Weekend'];
  let dayTestsPassed = 0;
  
  days.forEach(day => {
    const filteredEvents = events.filter(event => event.day === day);
    const filteredPins = updateMapPins(pins, { day });
    const visiblePins = getVisiblePins(filteredPins);
    
    const testPassed = filteredEvents.length === visiblePins.length;
    console.log(`📅 Day ${day}: ${filteredEvents.length} events, ${visiblePins.length} visible pins - ${testPassed ? '✅' : '❌'}`);
    
    if (testPassed) dayTestsPassed++;
  });
  
  const overallFilterSync = categoryTestsPassed === categories.length && 
                           timeTestsPassed === times.length && 
                           dayTestsPassed === days.length;
  
  console.log(`🎯 Overall filter synchronization: ${overallFilterSync ? '✅ PERFECT SYNC' : '❌ SYNC ISSUES DETECTED'}`);
  
  return {
    categoryTestsPassed,
    timeTestsPassed,
    dayTestsPassed,
    overallFilterSync
  };
};

// ========================================
// PERFORMANCE TESTING
// ========================================

/**
 * Test pin rendering performance
 */
export const testPinRenderingPerformance = () => {
  console.log('⚡ Testing Pin Rendering Performance...');
  
  const events = COMPREHENSIVE_SAMPLE_EVENTS;
  const startTime = performance.now();
  
  // Create pins
  const pins = createMapPins(events);
  const creationTime = performance.now() - startTime;
  
  // Test filtering performance
  const filterStartTime = performance.now();
  const filteredPins = updateMapPins(pins, { category: 'Social', time: 'Evening' });
  const filterTime = performance.now() - filterStartTime;
  
  // Test visibility check performance
  const visibilityStartTime = performance.now();
  const visiblePins = getVisiblePins(filteredPins);
  const visibilityTime = performance.now() - visibilityStartTime;
  
  console.log(`📊 Performance Results:`);
  console.log(`  Pin creation: ${creationTime.toFixed(2)}ms`);
  console.log(`  Filtering: ${filterTime.toFixed(2)}ms`);
  console.log(`  Visibility check: ${visibilityTime.toFixed(2)}ms`);
  console.log(`  Total time: ${(creationTime + filterTime + visibilityTime).toFixed(2)}ms`);
  
  const performanceGood = creationTime < 100 && filterTime < 50 && visibilityTime < 10;
  console.log(`🎯 Performance: ${performanceGood ? '✅ EXCELLENT' : '❌ NEEDS OPTIMIZATION'}`);
  
  return {
    creationTime,
    filterTime,
    visibilityTime,
    totalTime: creationTime + filterTime + visibilityTime,
    performanceGood
  };
};

// ========================================
// COMPREHENSIVE TESTING SUITE
// ========================================

/**
 * Run comprehensive synchronization tests
 */
export const runComprehensiveSyncTests = async () => {
  console.log('🚀 Starting Comprehensive Map Pin Synchronization Tests...');
  console.log('='.repeat(60));
  
  const results = {
    synchronization: null,
    visibility: null,
    filtering: null,
    performance: null,
    overall: false
  };
  
  try {
    // Test 1: Synchronization accuracy
    console.log('\n🧪 Test 1: Synchronization Accuracy');
    results.synchronization = testSynchronizationAccuracy();
    
    // Test 2: Pin visibility
    console.log('\n👁️ Test 2: Pin Visibility');
    const events = COMPREHENSIVE_SAMPLE_EVENTS;
    const pins = createMapPins(events);
    results.visibility = testPinVisibility(pins);
    
    // Test 3: Filter synchronization
    console.log('\n🔍 Test 3: Filter Synchronization');
    results.filtering = testFilterSynchronization();
    
    // Test 4: Performance
    console.log('\n⚡ Test 4: Performance');
    results.performance = testPinRenderingPerformance();
    
    // Calculate overall result
    results.overall = results.synchronization.overallSync && 
                     results.visibility.visibilityRate === 100 && 
                     results.filtering.overallFilterSync && 
                     results.performance.performanceGood;
    
    // Display final results
    console.log('\n📊 FINAL TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Synchronization: ${results.synchronization.overallSync ? '✅' : '❌'}`);
    console.log(`Visibility: ${results.visibility.visibilityRate === 100 ? '✅' : '❌'}`);
    console.log(`Filtering: ${results.filtering.overallFilterSync ? '✅' : '❌'}`);
    console.log(`Performance: ${results.performance.performanceGood ? '✅' : '❌'}`);
    console.log(`\n🎯 OVERALL RESULT: ${results.overall ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
  
  return results;
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get all events
 */
export const getAllEvents = () => {
  return COMPREHENSIVE_SAMPLE_EVENTS;
};

/**
 * Get all map pins
 */
export const getAllMapPins = () => {
  return createMapPins(COMPREHENSIVE_SAMPLE_EVENTS);
};

/**
 * Get event by ID
 */
export const getEventById = (id) => {
  return COMPREHENSIVE_SAMPLE_EVENTS.find(event => event.id === id);
};

/**
 * Get pin by ID
 */
export const getPinById = (id) => {
  const pins = createMapPins(COMPREHENSIVE_SAMPLE_EVENTS);
  return pins.find(pin => pin.id === id);
};

/**
 * Get events by bounds
 */
export const getEventsByBounds = (bounds) => {
  return COMPREHENSIVE_SAMPLE_EVENTS.filter(event => {
    const lat = event.latitude;
    const lng = event.longitude;
    return lat >= bounds.south && lat <= bounds.north && 
           lng >= bounds.west && lng <= bounds.east;
  });
};

/**
 * Get pins by bounds
 */
export const getPinsByBounds = (bounds) => {
  const events = getEventsByBounds(bounds);
  return createMapPins(events);
};

// ========================================
// GLOBAL EXPOSURE
// ========================================

// Expose testing functions globally
if (typeof window !== 'undefined') {
  window.mapPinSynchronization = {
    runComprehensiveSyncTests,
    testSynchronizationAccuracy,
    testPinVisibility,
    testFilterSynchronization,
    testPinRenderingPerformance,
    createMapPins,
    updateMapPins,
    getVisiblePins,
    verifyEventMapSync,
    getAllEvents,
    getAllMapPins,
    getEventById,
    getPinById,
    getEventsByBounds,
    getPinsByBounds
  };
  
  console.log('🗺️ Map Pin Synchronization utilities loaded. Access via window.mapPinSynchronization');
}

export default {
  createMapPins,
  updateMapPins,
  getVisiblePins,
  verifyEventMapSync,
  testSynchronizationAccuracy,
  testPinVisibility,
  testFilterSynchronization,
  testPinRenderingPerformance,
  runComprehensiveSyncTests,
  getAllEvents,
  getAllMapPins,
  getEventById,
  getPinById,
  getEventsByBounds,
  getPinsByBounds
};
