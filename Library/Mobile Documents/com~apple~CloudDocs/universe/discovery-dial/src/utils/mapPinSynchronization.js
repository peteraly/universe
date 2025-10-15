/**
 * Map Pin Synchronization System
 * Ensures perfect synchronization between events and map pins
 */

import { ALL_SAMPLE_EVENTS } from '../data/enhancedSampleEvents';

// Category color mapping for visual distinction
const CATEGORY_COLORS = {
  'Social': '#ff6b6b',      // Red
  'Education': '#4ecdc4',   // Teal
  'Recreation': '#45b7d1',  // Blue
  'Professional': '#96ceb4' // Green
};

// Event size mapping based on attendees
const getEventSize = (attendees) => {
  if (attendees < 20) return 'small';
  if (attendees < 50) return 'medium';
  return 'large';
};

// Pin size mapping
const PIN_SIZES = {
  small: { width: 12, height: 12 },
  medium: { width: 16, height: 16 },
  large: { width: 20, height: 20 }
};

/**
 * Create map pins from events
 */
export const createMapPins = (events = ALL_SAMPLE_EVENTS) => {
  console.log(`🗺️ Creating ${events.length} map pins from events...`);
  
  const pins = events.map(event => {
    const pin = {
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
      color: CATEGORY_COLORS[event.categoryPrimary] || '#666666',
      size: getEventSize(event.attendees),
      pinSize: PIN_SIZES[getEventSize(event.attendees)],
      visible: true,
      event: event // Store reference to original event
    };
    
    return pin;
  });
  
  console.log(`✅ Created ${pins.length} map pins successfully`);
  return pins;
};

/**
 * Filter pins based on criteria
 */
export const filterMapPins = (pins, filters = {}) => {
  let filteredPins = [...pins];
  
  // Filter by category
  if (filters.category && filters.category !== 'All') {
    filteredPins = filteredPins.filter(pin => pin.category === filters.category);
  }
  
  // Filter by subcategory
  if (filters.subcategory && filters.subcategory !== 'All') {
    filteredPins = filteredPins.filter(pin => pin.subcategory === filters.subcategory);
  }
  
  // Filter by time
  if (filters.time && filters.time !== 'All') {
    filteredPins = filteredPins.filter(pin => pin.time === filters.time);
  }
  
  // Filter by day
  if (filters.day && filters.day !== 'All') {
    filteredPins = filteredPins.filter(pin => pin.day === filters.day);
  }
  
  // Filter by location bounds (if provided)
  if (filters.bounds) {
    const { north, south, east, west } = filters.bounds;
    filteredPins = filteredPins.filter(pin => {
      const [lng, lat] = pin.position;
      return lat >= south && lat <= north && lng >= west && lng <= east;
    });
  }
  
  return filteredPins;
};

/**
 * Update pin visibility based on filters
 */
export const updatePinVisibility = (pins, filters = {}) => {
  const filteredPins = filterMapPins(pins, filters);
  const visiblePinIds = new Set(filteredPins.map(pin => pin.id));
  
  return pins.map(pin => ({
    ...pin,
    visible: visiblePinIds.has(pin.id)
  }));
};

/**
 * Get pins by category
 */
export const getPinsByCategory = (pins, category) => {
  return pins.filter(pin => pin.category === category);
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

/**
 * Get visible pins
 */
export const getVisiblePins = (pins) => {
  return pins.filter(pin => pin.visible);
};

/**
 * Calculate map bounds from pins
 */
export const calculateMapBounds = (pins) => {
  if (pins.length === 0) {
    return {
      north: 37.7849,
      south: 37.7849,
      east: -122.4094,
      west: -122.4094
    };
  }
  
  const lats = pins.map(pin => pin.position[1]);
  const lngs = pins.map(pin => pin.position[0]);
  
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs)
  };
};

/**
 * Get pin statistics
 */
export const getPinStatistics = (pins) => {
  const visiblePins = getVisiblePins(pins);
  
  const categoryCounts = {};
  const timeCounts = {};
  const dayCounts = {};
  
  visiblePins.forEach(pin => {
    categoryCounts[pin.category] = (categoryCounts[pin.category] || 0) + 1;
    timeCounts[pin.time] = (timeCounts[pin.time] || 0) + 1;
    dayCounts[pin.day] = (dayCounts[pin.day] || 0) + 1;
  });
  
  return {
    total: pins.length,
    visible: visiblePins.length,
    hidden: pins.length - visiblePins.length,
    visibilityRate: (visiblePins.length / pins.length * 100).toFixed(1),
    categoryCounts,
    timeCounts,
    dayCounts
  };
};

/**
 * Synchronization verification system
 */
export const verifyEventMapSync = (events = ALL_SAMPLE_EVENTS, pins = null) => {
  console.log('🧪 Verifying Event-Map Pin Synchronization...');
  
  const mapPins = pins || createMapPins(events);
  
  const syncResults = {
    totalEvents: events.length,
    totalPins: mapPins.length,
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
    const pin = mapPins.find(pin => pin.id === event.id);
    if (pin) {
      syncResults.syncedPins++;
      
      // Verify location accuracy
      const locationMatch = Math.abs(pin.position[1] - event.latitude) < 0.0001 &&
                           Math.abs(pin.position[0] - event.longitude) < 0.0001;
      if (locationMatch) syncResults.locationMatches++;
      
      // Verify category match
      if (pin.category === event.categoryPrimary) syncResults.categoryMatches++;
      
      // Verify time match
      if (pin.time === event.time) syncResults.timeMatches++;
      
      // Verify day match
      if (pin.day === event.day) syncResults.dayMatches++;
    } else {
      syncResults.missingPins.push(event.id);
    }
  });
  
  // Check for extra pins
  mapPins.forEach(pin => {
    const event = events.find(event => event.id === pin.id);
    if (!event) {
      syncResults.extraPins.push(pin.id);
    }
  });
  
  // Calculate sync percentage
  syncResults.syncPercentage = (syncResults.syncedPins / syncResults.totalEvents) * 100;
  
  // Log results
  console.log(`📊 Sync Results:`);
  console.log(`  Total Events: ${syncResults.totalEvents}`);
  console.log(`  Total Pins: ${syncResults.totalPins}`);
  console.log(`  Synced Pins: ${syncResults.syncedPins}`);
  console.log(`  Sync Percentage: ${syncResults.syncPercentage.toFixed(1)}%`);
  console.log(`  Location Matches: ${syncResults.locationMatches}/${syncResults.totalEvents}`);
  console.log(`  Category Matches: ${syncResults.categoryMatches}/${syncResults.totalEvents}`);
  console.log(`  Time Matches: ${syncResults.timeMatches}/${syncResults.totalEvents}`);
  console.log(`  Day Matches: ${syncResults.dayMatches}/${syncResults.totalEvents}`);
  
  if (syncResults.missingPins.length > 0) {
    console.log(`❌ Missing Pins: ${syncResults.missingPins.join(', ')}`);
  }
  
  if (syncResults.extraPins.length > 0) {
    console.log(`❌ Extra Pins: ${syncResults.extraPins.join(', ')}`);
  }
  
  const overallSync = syncResults.syncPercentage === 100 && 
                     syncResults.locationMatches === syncResults.totalEvents &&
                     syncResults.categoryMatches === syncResults.totalEvents &&
                     syncResults.timeMatches === syncResults.totalEvents &&
                     syncResults.dayMatches === syncResults.totalEvents;
  
  console.log(`🎯 Overall Synchronization: ${overallSync ? '✅ PERFECT SYNC' : '❌ SYNC ISSUES DETECTED'}`);
  
  return syncResults;
};

/**
 * Test pin visibility
 */
export const testPinVisibility = (pins) => {
  console.log('👁️ Testing Map Pin Visibility...');
  
  const visiblePins = getVisiblePins(pins);
  const stats = getPinStatistics(pins);
  
  console.log(`📌 Total pins: ${stats.total}`);
  console.log(`👀 Visible pins: ${stats.visible}`);
  console.log(`🔍 Visibility rate: ${stats.visibilityRate}%`);
  
  console.log('📊 Category distribution:');
  Object.entries(stats.categoryCounts).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} pins`);
  });
  
  console.log('⏰ Time distribution:');
  Object.entries(stats.timeCounts).forEach(([time, count]) => {
    console.log(`  ${time}: ${count} pins`);
  });
  
  console.log('📅 Day distribution:');
  Object.entries(stats.dayCounts).forEach(([day, count]) => {
    console.log(`  ${day}: ${count} pins`);
  });
  
  return stats;
};

/**
 * Test filter synchronization
 */
export const testFilterSynchronization = (pins, filters) => {
  console.log('🔍 Testing Filter Synchronization...');
  
  const filteredPins = filterMapPins(pins, filters);
  const visiblePins = getVisiblePins(filteredPins);
  
  console.log(`📊 Filter Results:`);
  console.log(`  Applied Filters:`, filters);
  console.log(`  Total Pins: ${pins.length}`);
  console.log(`  Filtered Pins: ${filteredPins.length}`);
  console.log(`  Visible Pins: ${visiblePins.length}`);
  
  // Test category filter
  if (filters.category && filters.category !== 'All') {
    const categoryPins = getPinsByCategory(pins, filters.category);
    console.log(`  Category "${filters.category}": ${categoryPins.length} pins`);
  }
  
  // Test time filter
  if (filters.time && filters.time !== 'All') {
    const timePins = getPinsByTime(pins, filters.time);
    console.log(`  Time "${filters.time}": ${timePins.length} pins`);
  }
  
  // Test day filter
  if (filters.day && filters.day !== 'All') {
    const dayPins = getPinsByDay(pins, filters.day);
    console.log(`  Day "${filters.day}": ${dayPins.length} pins`);
  }
  
  return {
    totalPins: pins.length,
    filteredPins: filteredPins.length,
    visiblePins: visiblePins.length,
    filters
  };
};

/**
 * Comprehensive synchronization test
 */
export const runComprehensiveSyncTest = () => {
  console.log('🚀 Running Comprehensive Synchronization Test...');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Create pins from events
    console.log('\n1️⃣ Creating map pins from events...');
    const pins = createMapPins();
    
    // Test 2: Verify synchronization
    console.log('\n2️⃣ Verifying event-pin synchronization...');
    const syncResults = verifyEventMapSync(ALL_SAMPLE_EVENTS, pins);
    
    // Test 3: Test pin visibility
    console.log('\n3️⃣ Testing pin visibility...');
    const visibilityStats = testPinVisibility(pins);
    
    // Test 4: Test filter synchronization
    console.log('\n4️⃣ Testing filter synchronization...');
    const filterTests = [
      { category: 'Social' },
      { time: 'Evening' },
      { day: 'Today' },
      { category: 'Education', time: 'Morning' },
      { category: 'Professional', day: 'Weekend' }
    ];
    
    filterTests.forEach((filters, index) => {
      console.log(`\n   Test ${index + 1}:`, filters);
      testFilterSynchronization(pins, filters);
    });
    
    // Test 5: Calculate map bounds
    console.log('\n5️⃣ Calculating map bounds...');
    const bounds = calculateMapBounds(pins);
    console.log(`   Map Bounds:`, bounds);
    
    // Overall results
    console.log('\n🎯 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Events: ${ALL_SAMPLE_EVENTS.length}`);
    console.log(`✅ Pins Created: ${pins.length}`);
    console.log(`✅ Sync Rate: ${syncResults.syncPercentage.toFixed(1)}%`);
    console.log(`✅ Visibility Rate: ${visibilityStats.visibilityRate}%`);
    console.log(`✅ Location Accuracy: ${syncResults.locationMatches}/${syncResults.totalEvents}`);
    console.log(`✅ Category Accuracy: ${syncResults.categoryMatches}/${syncResults.totalEvents}`);
    console.log(`✅ Time Accuracy: ${syncResults.timeMatches}/${syncResults.totalEvents}`);
    console.log(`✅ Day Accuracy: ${syncResults.dayMatches}/${syncResults.totalEvents}`);
    
    const overallSuccess = syncResults.syncPercentage === 100 && 
                          syncResults.locationMatches === syncResults.totalEvents &&
                          syncResults.categoryMatches === syncResults.totalEvents &&
                          syncResults.timeMatches === syncResults.totalEvents &&
                          syncResults.dayMatches === syncResults.totalEvents;
    
    console.log(`\n🏆 OVERALL RESULT: ${overallSuccess ? '✅ PERFECT SYNCHRONIZATION' : '❌ ISSUES DETECTED'}`);
    
    return {
      success: overallSuccess,
      pins,
      syncResults,
      visibilityStats,
      bounds
    };
    
  } catch (error) {
    console.error('❌ Comprehensive sync test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export all functions for global access
export const mapPinSynchronization = {
  createMapPins,
  filterMapPins,
  updatePinVisibility,
  getPinsByCategory,
  getPinsByTime,
  getPinsByDay,
  getVisiblePins,
  calculateMapBounds,
  getPinStatistics,
  verifyEventMapSync,
  testPinVisibility,
  testFilterSynchronization,
  runComprehensiveSyncTest,
  CATEGORY_COLORS,
  PIN_SIZES
};

// Expose globally for testing
if (typeof window !== 'undefined') {
  window.mapPinSynchronization = mapPinSynchronization;
  console.log('🗺️ Map Pin Synchronization system loaded. Access via window.mapPinSynchronization');
}

export default mapPinSynchronization;
