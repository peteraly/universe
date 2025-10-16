/**
 * Demo Readiness Test System
 * Comprehensive testing to ensure the event discovery system is ready for demos
 */

import { COMPREHENSIVE_SAMPLE_EVENTS, FILTER_OPTIONS, filterEvents } from '../data/comprehensiveSampleEvents.js';
import { validateMapPinCreation, testMapPinSynchronization, testMapPinVisualProperties } from './mapPinValidation.js';

// ========================================
// DEMO READINESS TESTING
// ========================================

/**
 * Test all demo scenarios
 */
export const testDemoScenarios = () => {
  const results = {
    totalScenarios: 0,
    passedScenarios: 0,
    failedScenarios: [],
    scenarioResults: {}
  };

  // Demo scenario 1: Show all events
  const allEventsScenario = {
    name: 'Show All Events',
    filters: { time: 'All', day: 'All', category: 'All' },
    expectedMinEvents: 50
  };

  // Demo scenario 2: Filter by time
  const timeFilterScenarios = FILTER_OPTIONS.time
    .filter(time => time !== 'All')
    .map(time => ({
      name: `Filter by ${time}`,
      filters: { time, day: 'All', category: 'All' },
      expectedMinEvents: 5
    }));

  // Demo scenario 3: Filter by day
  const dayFilterScenarios = FILTER_OPTIONS.day
    .filter(day => day !== 'All')
    .map(day => ({
      name: `Filter by ${day}`,
      filters: { time: 'All', day, category: 'All' },
      expectedMinEvents: 5
    }));

  // Demo scenario 4: Filter by category
  const categoryFilterScenarios = FILTER_OPTIONS.category
    .filter(category => category !== 'All')
    .map(category => ({
      name: `Filter by ${category}`,
      filters: { time: 'All', day: 'All', category },
      expectedMinEvents: 10
    }));

  // Demo scenario 5: Combined filters
  const combinedFilterScenarios = [
    {
      name: 'Morning + Today + Social',
      filters: { time: 'Morning', day: 'Today', category: 'Social' },
      expectedMinEvents: 1
    },
    {
      name: 'Evening + Weekend + Professional',
      filters: { time: 'Evening', day: 'Weekend', category: 'Professional' },
      expectedMinEvents: 1
    },
    {
      name: 'Afternoon + This Week + Education',
      filters: { time: 'Afternoon', day: 'This Week', category: 'Education' },
      expectedMinEvents: 1
    },
    {
      name: 'Night + Tomorrow + Recreation',
      filters: { time: 'Night', day: 'Tomorrow', category: 'Recreation' },
      expectedMinEvents: 1
    }
  ];

  const allScenarios = [
    allEventsScenario,
    ...timeFilterScenarios,
    ...dayFilterScenarios,
    ...categoryFilterScenarios,
    ...combinedFilterScenarios
  ];

  allScenarios.forEach(scenario => {
    results.totalScenarios++;

    try {
      const filteredEvents = filterEvents(COMPREHENSIVE_SAMPLE_EVENTS, scenario.filters);
      const eventCount = filteredEvents.length;
      const passed = eventCount >= scenario.expectedMinEvents;

      const scenarioResult = {
        scenario: scenario.name,
        filters: scenario.filters,
        eventCount,
        expectedMin: scenario.expectedMinEvents,
        passed,
        events: filteredEvents.map(e => ({ id: e.id, name: e.name }))
      };

      results.scenarioResults[scenario.name] = scenarioResult;

      if (passed) {
        results.passedScenarios++;
      } else {
        results.failedScenarios.push({
          scenario: scenario.name,
          issue: `Expected at least ${scenario.expectedMinEvents} events, got ${eventCount}`,
          result: scenarioResult
        });
      }

    } catch (error) {
      results.failedScenarios.push({
        scenario: scenario.name,
        issue: `Error testing scenario: ${error.message}`,
        error
      });
    }
  });

  results.successRate = (results.passedScenarios / results.totalScenarios) * 100;

  return results;
};

/**
 * Test event data quality
 */
export const testEventDataQuality = () => {
  const results = {
    totalEvents: COMPREHENSIVE_SAMPLE_EVENTS.length,
    qualityChecks: {
      hasName: 0,
      hasDescription: 0,
      hasVenue: 0,
      hasCoordinates: 0,
      hasValidCoordinates: 0,
      hasCategory: 0,
      hasTime: 0,
      hasDay: 0,
      hasPrice: 0,
      hasAttendees: 0,
      hasOrganizer: 0
    },
    issues: []
  };

  COMPREHENSIVE_SAMPLE_EVENTS.forEach(event => {
    // Check required fields
    if (event.name && event.name.trim()) results.qualityChecks.hasName++;
    else results.issues.push({ id: event.id, issue: 'Missing or empty name' });

    if (event.description && event.description.trim()) results.qualityChecks.hasDescription++;
    else results.issues.push({ id: event.id, issue: 'Missing or empty description' });

    if (event.venue && event.venue.trim()) results.qualityChecks.hasVenue++;
    else results.issues.push({ id: event.id, issue: 'Missing or empty venue' });

    if (event.latitude && event.longitude) {
      results.qualityChecks.hasCoordinates++;
      const lat = parseFloat(event.latitude);
      const lng = parseFloat(event.longitude);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        results.qualityChecks.hasValidCoordinates++;
      } else {
        results.issues.push({ id: event.id, issue: 'Invalid coordinates' });
      }
    } else {
      results.issues.push({ id: event.id, issue: 'Missing coordinates' });
    }

    if (event.categoryPrimary && event.categoryPrimary.trim()) results.qualityChecks.hasCategory++;
    else results.issues.push({ id: event.id, issue: 'Missing category' });

    if (event.time && event.time.trim()) results.qualityChecks.hasTime++;
    else results.issues.push({ id: event.id, issue: 'Missing time' });

    if (event.day && event.day.trim()) results.qualityChecks.hasDay++;
    else results.issues.push({ id: event.id, issue: 'Missing day' });

    if (event.price !== undefined && event.price !== null) results.qualityChecks.hasPrice++;
    else results.issues.push({ id: event.id, issue: 'Missing price' });

    if (event.attendees !== undefined && event.attendees !== null) results.qualityChecks.hasAttendees++;
    else results.issues.push({ id: event.id, issue: 'Missing attendees' });

    if (event.organizer && event.organizer.trim()) results.qualityChecks.hasOrganizer++;
    else results.issues.push({ id: event.id, issue: 'Missing organizer' });
  });

  // Calculate quality percentages
  Object.keys(results.qualityChecks).forEach(check => {
    results.qualityChecks[check] = {
      count: results.qualityChecks[check],
      percentage: (results.qualityChecks[check] / results.totalEvents) * 100
    };
  });

  return results;
};

/**
 * Test geographic distribution
 */
export const testGeographicDistribution = () => {
  const results = {
    totalEvents: COMPREHENSIVE_SAMPLE_EVENTS.length,
    coordinateAnalysis: {
      validCoordinates: 0,
      invalidCoordinates: 0,
      coordinateRanges: {
        lat: { min: 90, max: -90 },
        lng: { min: 180, max: -180 }
      }
    },
    locationClusters: {},
    distributionIssues: []
  };

  COMPREHENSIVE_SAMPLE_EVENTS.forEach(event => {
    const lat = parseFloat(event.latitude);
    const lng = parseFloat(event.longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      results.coordinateAnalysis.validCoordinates++;
      
      // Update coordinate ranges
      results.coordinateAnalysis.coordinateRanges.lat.min = Math.min(results.coordinateAnalysis.coordinateRanges.lat.min, lat);
      results.coordinateAnalysis.coordinateRanges.lat.max = Math.max(results.coordinateAnalysis.coordinateRanges.lat.max, lat);
      results.coordinateAnalysis.coordinateRanges.lng.min = Math.min(results.coordinateAnalysis.coordinateRanges.lng.min, lng);
      results.coordinateAnalysis.coordinateRanges.lng.max = Math.max(results.coordinateAnalysis.coordinateRanges.lng.max, lng);

      // Group by approximate location (rounded to 2 decimal places)
      const clusterKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
      results.locationClusters[clusterKey] = (results.locationClusters[clusterKey] || 0) + 1;
    } else {
      results.coordinateAnalysis.invalidCoordinates++;
      results.distributionIssues.push({
        id: event.id,
        issue: 'Invalid coordinates',
        coordinates: { lat: event.latitude, lng: event.longitude }
      });
    }
  });

  // Check for geographic spread
  const latRange = results.coordinateAnalysis.coordinateRanges.lat.max - results.coordinateAnalysis.coordinateRanges.lat.min;
  const lngRange = results.coordinateAnalysis.coordinateRanges.lng.max - results.coordinateAnalysis.coordinateRanges.lng.min;

  if (latRange < 0.01) {
    results.distributionIssues.push({
      issue: 'Events too clustered in latitude',
      range: latRange
    });
  }

  if (lngRange < 0.01) {
    results.distributionIssues.push({
      issue: 'Events too clustered in longitude',
      range: lngRange
    });
  }

  return results;
};

/**
 * Run comprehensive demo readiness test
 */
export const runComprehensiveDemoReadinessTest = () => {
  console.log('🎯 Starting comprehensive demo readiness test...');

  // Test 1: Demo scenarios
  console.log('\\n📋 Testing demo scenarios...');
  const scenarioResults = testDemoScenarios();
  console.log('Demo Scenarios:', {
    total: scenarioResults.totalScenarios,
    passed: scenarioResults.passedScenarios,
    failed: scenarioResults.failedScenarios.length,
    successRate: scenarioResults.successRate.toFixed(1) + '%'
  });

  // Test 2: Event data quality
  console.log('\\n📊 Testing event data quality...');
  const qualityResults = testEventDataQuality();
  console.log('Data Quality:', {
    totalEvents: qualityResults.totalEvents,
    qualityIssues: qualityResults.issues.length,
    qualityChecks: qualityResults.qualityChecks
  });

  // Test 3: Geographic distribution
  console.log('\\n🗺️ Testing geographic distribution...');
  const geoResults = testGeographicDistribution();
  console.log('Geographic Distribution:', {
    validCoordinates: geoResults.coordinateAnalysis.validCoordinates,
    invalidCoordinates: geoResults.coordinateAnalysis.invalidCoordinates,
    coordinateRanges: geoResults.coordinateAnalysis.coordinateRanges,
    distributionIssues: geoResults.distributionIssues.length
  });

  // Test 4: Map pin validation
  console.log('\\n📍 Testing map pin validation...');
  const pinResults = validateMapPinCreation();
  const syncResults = testMapPinSynchronization();
  const visualResults = testMapPinVisualProperties();

  // Overall assessment
  const overallResults = {
    demoScenarios: {
      success: scenarioResults.successRate === 100,
      rate: scenarioResults.successRate
    },
    dataQuality: {
      success: qualityResults.issues.length === 0,
      issues: qualityResults.issues.length
    },
    geographicDistribution: {
      success: geoResults.distributionIssues.length === 0,
      issues: geoResults.distributionIssues.length
    },
    mapPins: {
      creation: pinResults.validPins === pinResults.totalEvents,
      synchronization: syncResults.successRate === 100,
      visual: visualResults.colorTests.failed === 0 && visualResults.sizeTests.failed === 0
    }
  };

  const isDemoReady = 
    overallResults.demoScenarios.success &&
    overallResults.dataQuality.success &&
    overallResults.geographicDistribution.success &&
    overallResults.mapPins.creation &&
    overallResults.mapPins.synchronization &&
    overallResults.mapPins.visual;

  console.log('\\n🎯 OVERALL DEMO READINESS ASSESSMENT:');
  console.log('Demo Scenarios:', overallResults.demoScenarios.success ? '✅ PASS' : '❌ FAIL');
  console.log('Data Quality:', overallResults.dataQuality.success ? '✅ PASS' : '❌ FAIL');
  console.log('Geographic Distribution:', overallResults.geographicDistribution.success ? '✅ PASS' : '❌ FAIL');
  console.log('Map Pin Creation:', overallResults.mapPins.creation ? '✅ PASS' : '❌ FAIL');
  console.log('Map Pin Synchronization:', overallResults.mapPins.synchronization ? '✅ PASS' : '❌ FAIL');
  console.log('Map Pin Visual Properties:', overallResults.mapPins.visual ? '✅ PASS' : '❌ FAIL');

  if (isDemoReady) {
    console.log('\\n🎉 DEMO READINESS: ✅ FULLY READY!');
    console.log('🚀 The event discovery system is ready for smooth demos!');
  } else {
    console.log('\\n⚠️ DEMO READINESS: ❌ NOT READY');
    console.log('🔧 Please address the issues above before demoing.');
  }

  return {
    scenarioResults,
    qualityResults,
    geoResults,
    pinResults,
    syncResults,
    visualResults,
    overall: overallResults,
    ready: isDemoReady
  };
};

export default {
  testDemoScenarios,
  testEventDataQuality,
  testGeographicDistribution,
  runComprehensiveDemoReadinessTest
};
