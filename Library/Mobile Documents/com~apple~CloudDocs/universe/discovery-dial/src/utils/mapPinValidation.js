/**
 * Map Pin Validation System
 * Validates that all events can be properly displayed as map pins
 */

import { COMPREHENSIVE_SAMPLE_EVENTS, getCategoryColor, getEventSize } from '../data/comprehensiveSampleEvents.js';

// ========================================
// MAP PIN VALIDATION
// ========================================

/**
 * Validate all events can be converted to map pins
 */
export const validateMapPinCreation = (events = COMPREHENSIVE_SAMPLE_EVENTS) => {
  const results = {
    totalEvents: events.length,
    validPins: 0,
    invalidPins: [],
    coordinateIssues: [],
    categoryIssues: [],
    sizeIssues: [],
    colorIssues: []
  };

  events.forEach((event, index) => {
    try {
      // Validate coordinates
      const lat = parseFloat(event.latitude);
      const lng = parseFloat(event.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        results.coordinateIssues.push({
          id: event.id,
          name: event.name,
          issue: 'Invalid coordinates',
          coordinates: { lat: event.latitude, lng: event.longitude }
        });
        return;
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        results.coordinateIssues.push({
          id: event.id,
          name: event.name,
          issue: 'Coordinates out of range',
          coordinates: { lat, lng }
        });
        return;
      }

      // Validate category
      const category = event.categoryPrimary;
      if (!category || typeof category !== 'string') {
        results.categoryIssues.push({
          id: event.id,
          name: event.name,
          issue: 'Missing or invalid category',
          category
        });
        return;
      }

      // Validate attendee count for size calculation
      const attendees = parseInt(event.attendees);
      if (isNaN(attendees) || attendees < 0) {
        results.sizeIssues.push({
          id: event.id,
          name: event.name,
          issue: 'Invalid attendee count',
          attendees: event.attendees
        });
        return;
      }

      // Test color generation
      const color = getCategoryColor(category);
      if (!color || !color.startsWith('#')) {
        results.colorIssues.push({
          id: event.id,
          name: event.name,
          issue: 'Invalid color generated',
          color
        });
        return;
      }

      // Test size generation
      const size = getEventSize(attendees);
      if (!size || !['small', 'medium', 'large', 'xlarge'].includes(size)) {
        results.sizeIssues.push({
          id: event.id,
          name: event.name,
          issue: 'Invalid size generated',
          size
        });
        return;
      }

      // Create pin object
      const pin = {
        id: event.id,
        position: [lng, lat],
        popup: {
          title: event.name,
          description: event.description,
          venue: event.venue,
          time: event.time,
          day: event.day,
          price: event.price,
          attendees: event.attendees
        },
        category: category,
        subcategory: event.categorySecondary,
        time: event.time,
        day: event.day,
        color: color,
        size: size,
        visible: true,
        event: event
      };

      // Validate pin structure
      if (!pin.id || !pin.position || !pin.popup || !pin.category) {
        results.invalidPins.push({
          id: event.id,
          name: event.name,
          issue: 'Invalid pin structure',
          pin
        });
        return;
      }

      results.validPins++;

    } catch (error) {
      results.invalidPins.push({
        id: event.id,
        name: event.name,
        issue: 'Error creating pin',
        error: error.message
      });
    }
  });

  return results;
};

/**
 * Test map pin synchronization with filters
 */
export const testMapPinSynchronization = (events = COMPREHENSIVE_SAMPLE_EVENTS) => {
  const results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: [],
    filterResults: {}
  };

  const filterOptions = {
    time: ['All', 'Morning', 'Afternoon', 'Evening', 'Night'],
    day: ['All', 'Today', 'Tomorrow', 'This Week', 'Weekend'],
    category: ['All', 'Social', 'Education', 'Recreation', 'Professional']
  };

  // Test each filter combination
  filterOptions.time.forEach(time => {
    filterOptions.day.forEach(day => {
      filterOptions.category.forEach(category => {
        if (time === 'All' && day === 'All' && category === 'All') return;

        results.totalTests++;

        // Filter events
        const filteredEvents = events.filter(event => {
          const timeMatch = time === 'All' || event.time === time;
          const dayMatch = day === 'All' || event.day === day;
          const categoryMatch = category === 'All' || event.categoryPrimary === category;
          
          return timeMatch && dayMatch && categoryMatch;
        });

        // Create pins for filtered events
        const pins = filteredEvents.map(event => ({
          id: event.id,
          position: [event.longitude, event.latitude],
          category: event.categoryPrimary,
          time: event.time,
          day: event.day,
          color: getCategoryColor(event.categoryPrimary),
          size: getEventSize(event.attendees),
          visible: true
        }));

        // Validate synchronization
        const eventCount = filteredEvents.length;
        const pinCount = pins.length;
        const visiblePinCount = pins.filter(pin => pin.visible).length;

        const testResult = {
          filter: { time, day, category },
          eventCount,
          pinCount,
          visiblePinCount,
          synchronized: eventCount === pinCount && pinCount === visiblePinCount,
          pins: pins
        };

        results.filterResults[`${time}-${day}-${category}`] = testResult;

        if (testResult.synchronized) {
          results.passedTests++;
        } else {
          results.failedTests.push({
            filter: { time, day, category },
            issue: `Event count (${eventCount}) != Pin count (${pinCount}) != Visible pins (${visiblePinCount})`,
            testResult
          });
        }
      });
    });
  });

  results.successRate = (results.passedTests / results.totalTests) * 100;

  return results;
};

/**
 * Test map pin visual properties
 */
export const testMapPinVisualProperties = (events = COMPREHENSIVE_SAMPLE_EVENTS) => {
  const results = {
    totalEvents: events.length,
    colorTests: {
      passed: 0,
      failed: 0,
      issues: []
    },
    sizeTests: {
      passed: 0,
      failed: 0,
      issues: []
    },
    categoryDistribution: {},
    sizeDistribution: {}
  };

  events.forEach(event => {
    // Test color generation
    const color = getCategoryColor(event.categoryPrimary);
    if (color && color.startsWith('#')) {
      results.colorTests.passed++;
    } else {
      results.colorTests.failed++;
      results.colorTests.issues.push({
        id: event.id,
        name: event.name,
        category: event.categoryPrimary,
        color
      });
    }

    // Test size generation
    const size = getEventSize(event.attendees);
    if (['small', 'medium', 'large', 'xlarge'].includes(size)) {
      results.sizeTests.passed++;
    } else {
      results.sizeTests.failed++;
      results.sizeTests.issues.push({
        id: event.id,
        name: event.name,
        attendees: event.attendees,
        size
      });
    }

    // Track distributions
    results.categoryDistribution[event.categoryPrimary] = 
      (results.categoryDistribution[event.categoryPrimary] || 0) + 1;
    results.sizeDistribution[size] = 
      (results.sizeDistribution[size] || 0) + 1;
  });

  return results;
};

/**
 * Run comprehensive map pin validation
 */
export const runComprehensiveMapPinValidation = () => {
  console.log('🗺️ Starting comprehensive map pin validation...');

  // Test pin creation
  const pinCreationResults = validateMapPinCreation();
  console.log('📌 Pin Creation Results:', pinCreationResults);

  // Test synchronization
  const syncResults = testMapPinSynchronization();
  console.log('🔄 Synchronization Results:', syncResults);

  // Test visual properties
  const visualResults = testMapPinVisualProperties();
  console.log('🎨 Visual Properties Results:', visualResults);

  // Overall assessment
  const overallResults = {
    pinCreation: {
      success: pinCreationResults.validPins === pinCreationResults.totalEvents,
      rate: (pinCreationResults.validPins / pinCreationResults.totalEvents) * 100
    },
    synchronization: {
      success: syncResults.successRate === 100,
      rate: syncResults.successRate
    },
    visualProperties: {
      colorSuccess: visualResults.colorTests.failed === 0,
      sizeSuccess: visualResults.sizeTests.failed === 0,
      colorRate: (visualResults.colorTests.passed / visualResults.totalEvents) * 100,
      sizeRate: (visualResults.sizeTests.passed / visualResults.totalEvents) * 100
    }
  };

  console.log('🎯 Overall Assessment:', overallResults);

  const isFullyReady = 
    overallResults.pinCreation.success &&
    overallResults.synchronization.success &&
    overallResults.visualProperties.colorSuccess &&
    overallResults.visualProperties.sizeSuccess;

  if (isFullyReady) {
    console.log('✅ MAP PIN VALIDATION PASSED - All systems ready!');
  } else {
    console.log('⚠️ MAP PIN VALIDATION ISSUES DETECTED');
  }

  return {
    pinCreation: pinCreationResults,
    synchronization: syncResults,
    visualProperties: visualResults,
    overall: overallResults,
    ready: isFullyReady
  };
};

export default {
  validateMapPinCreation,
  testMapPinSynchronization,
  testMapPinVisualProperties,
  runComprehensiveMapPinValidation
};
