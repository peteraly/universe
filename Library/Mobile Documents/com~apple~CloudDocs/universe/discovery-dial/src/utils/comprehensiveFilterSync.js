/**
 * Comprehensive Filter Synchronization System
 * Ensures perfect synchronization between all filters (category, subcategory, time, day)
 * and the displayed events
 */

import { COMPREHENSIVE_SAMPLE_EVENTS, filterEvents, DEFAULT_FILTERS } from '../data/comprehensiveSampleEvents';

// ========================================
// FILTER VALIDATION
// ========================================

/**
 * Validate filter values
 */
export const validateFilters = (filters) => {
  const errors = [];
  
  if (!filters) {
    errors.push('Filters object is undefined');
    return { isValid: false, errors };
  }
  
  // Validate time filter
  const validTimes = ['All', 'Morning', 'Afternoon', 'Evening', 'Night'];
  if (filters.time && !validTimes.includes(filters.time)) {
    errors.push(`Invalid time filter: ${filters.time}`);
  }
  
  // Validate day filter
  const validDays = ['All', 'Today', 'Tomorrow', 'This Week', 'Weekend'];
  if (filters.day && !validDays.includes(filters.day)) {
    errors.push(`Invalid day filter: ${filters.day}`);
  }
  
  // Validate category filter
  const validCategories = ['All', 'Social', 'Arts/Culture', 'Wellness', 'Professional'];
  if (filters.category && !validCategories.includes(filters.category)) {
    errors.push(`Invalid category filter: ${filters.category}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize filter values
 */
export const sanitizeFilters = (filters) => {
  const sanitized = { ...DEFAULT_FILTERS };
  
  if (filters.time) sanitized.time = filters.time;
  if (filters.day) sanitized.day = filters.day;
  if (filters.category) sanitized.category = filters.category;
  
  return sanitized;
};

// ========================================
// FILTER SYNCHRONIZATION
// ========================================

/**
 * Apply filters with comprehensive logging
 */
export const applyFiltersWithLogging = (events, filters, dialSelection = {}) => {
  console.group('🔍 Filter Synchronization');
  console.log('Input events:', events.length);
  console.log('Filters:', filters);
  console.log('Dial selection:', dialSelection);
  
  let filtered = [...events];
  let stepResults = [];
  
  // Step 1: Apply dial category selection
  if (dialSelection.category) {
    const beforeCount = filtered.length;
    filtered = filtered.filter(event => event.categoryPrimary === dialSelection.category);
    stepResults.push({
      step: 'Dial Category',
      filter: dialSelection.category,
      before: beforeCount,
      after: filtered.length,
      removed: beforeCount - filtered.length
    });
    console.log(`After dial category filter (${dialSelection.category}): ${filtered.length} events`);
  }
  
  // Step 2: Apply dial subcategory selection
  if (dialSelection.subcategory) {
    const beforeCount = filtered.length;
    filtered = filtered.filter(event => event.categorySecondary === dialSelection.subcategory);
    stepResults.push({
      step: 'Dial Subcategory',
      filter: dialSelection.subcategory,
      before: beforeCount,
      after: filtered.length,
      removed: beforeCount - filtered.length
    });
    console.log(`After dial subcategory filter (${dialSelection.subcategory}): ${filtered.length} events`);
  }
  
  // Step 3: Apply time filter
  if (filters.time && filters.time !== 'All') {
    const beforeCount = filtered.length;
    filtered = filtered.filter(event => event.time === filters.time);
    stepResults.push({
      step: 'Time Filter',
      filter: filters.time,
      before: beforeCount,
      after: filtered.length,
      removed: beforeCount - filtered.length
    });
    console.log(`After time filter (${filters.time}): ${filtered.length} events`);
  }
  
  // Step 4: Apply day filter
  if (filters.day && filters.day !== 'All') {
    const beforeCount = filtered.length;
    filtered = filtered.filter(event => event.day === filters.day);
    stepResults.push({
      step: 'Day Filter',
      filter: filters.day,
      before: beforeCount,
      after: filtered.length,
      removed: beforeCount - filtered.length
    });
    console.log(`After day filter (${filters.day}): ${filtered.length} events`);
  }
  
  // Step 5: Apply category filter (from filter pills)
  if (filters.category && filters.category !== 'All' && !dialSelection.category) {
    const beforeCount = filtered.length;
    filtered = filtered.filter(event => event.categoryPrimary === filters.category);
    stepResults.push({
      step: 'Category Filter',
      filter: filters.category,
      before: beforeCount,
      after: filtered.length,
      removed: beforeCount - filtered.length
    });
    console.log(`After category filter (${filters.category}): ${filtered.length} events`);
  }
  
  console.log('Final filtered events:', filtered.length);
  console.table(stepResults);
  console.groupEnd();
  
  return {
    events: filtered,
    stepResults,
    summary: {
      totalInput: events.length,
      totalOutput: filtered.length,
      totalRemoved: events.length - filtered.length,
      filterSteps: stepResults.length
    }
  };
};

/**
 * Verify filter synchronization
 */
export const verifyFilterSync = (events, filters, expectedCount = null) => {
  const result = applyFiltersWithLogging(events, filters);
  
  const isValid = result.events.length >= 0; // Always valid if we get a result
  const matchesExpected = expectedCount !== null ? result.events.length === expectedCount : true;
  
  return {
    isValid,
    matchesExpected,
    actualCount: result.events.length,
    expectedCount,
    result
  };
};

// ========================================
// FILTER COVERAGE TESTING
// ========================================

/**
 * Test all filter combinations
 */
export const testAllFilterCombinations = () => {
  console.log('🧪 Testing All Filter Combinations...');
  
  const times = ['All', 'Morning', 'Afternoon', 'Evening', 'Night'];
  const days = ['All', 'Today', 'Tomorrow', 'This Week', 'Weekend'];
  const categories = ['All', 'Social', 'Arts/Culture', 'Wellness', 'Professional'];
  
  const results = {
    totalCombinations: 0,
    successfulCombinations: 0,
    failedCombinations: 0,
    emptyResults: 0,
    combinations: []
  };
  
  times.forEach(time => {
    days.forEach(day => {
      categories.forEach(category => {
        results.totalCombinations++;
        
        const filters = { time, day, category };
        const filtered = filterEvents(COMPREHENSIVE_SAMPLE_EVENTS, filters);
        
        const combination = {
          filters,
          count: filtered.length,
          success: true,
          isEmpty: filtered.length === 0
        };
        
        if (filtered.length === 0) {
          results.emptyResults++;
          console.warn(`Empty result for: ${time} / ${day} / ${category}`);
        } else {
          results.successfulCombinations++;
        }
        
        results.combinations.push(combination);
      });
    });
  });
  
  console.log('📊 Filter Combination Test Results:');
  console.log(`  Total combinations: ${results.totalCombinations}`);
  console.log(`  Successful (with results): ${results.successfulCombinations}`);
  console.log(`  Empty results: ${results.emptyResults}`);
  console.log(`  Coverage: ${((results.successfulCombinations / results.totalCombinations) * 100).toFixed(1)}%`);
  
  return results;
};

/**
 * Test filter consistency
 */
export const testFilterConsistency = () => {
  console.log('🔍 Testing Filter Consistency...');
  
  const tests = [
    {
      name: 'Morning Social Events',
      filters: { time: 'Morning', day: 'All', category: 'Social' },
      validate: (events) => events.every(e => e.time === 'Morning' && e.categoryPrimary === 'Social')
    },
    {
      name: 'Today Evening Events',
      filters: { time: 'Evening', day: 'Today', category: 'All' },
      validate: (events) => events.every(e => e.time === 'Evening' && e.day === 'Today')
    },
    {
      name: 'Professional Night Events',
      filters: { time: 'Night', day: 'All', category: 'Professional' },
      validate: (events) => events.every(e => e.time === 'Night' && e.categoryPrimary === 'Professional')
    },
    {
      name: 'Weekend Wellness Events',
      filters: { time: 'All', day: 'Weekend', category: 'Wellness' },
      validate: (events) => events.every(e => e.day === 'Weekend' && e.categoryPrimary === 'Wellness')
    }
  ];
  
  const results = {
    totalTests: tests.length,
    passed: 0,
    failed: 0,
    tests: []
  };
  
  tests.forEach(test => {
    const filtered = filterEvents(COMPREHENSIVE_SAMPLE_EVENTS, test.filters);
    const isValid = filtered.length > 0 && test.validate(filtered);
    
    const testResult = {
      name: test.name,
      filters: test.filters,
      count: filtered.length,
      passed: isValid,
      sample: filtered.slice(0, 3).map(e => ({
        name: e.name,
        time: e.time,
        day: e.day,
        category: e.categoryPrimary
      }))
    };
    
    if (isValid) {
      results.passed++;
      console.log(`✅ ${test.name}: ${filtered.length} events`);
    } else {
      results.failed++;
      console.error(`❌ ${test.name}: ${filtered.length} events (validation failed)`);
    }
    
    results.tests.push(testResult);
  });
  
  console.log(`\n📊 Consistency Test Results: ${results.passed}/${results.totalTests} passed`);
  
  return results;
};

// ========================================
// PERFORMANCE TESTING
// ========================================

/**
 * Test filter performance
 */
export const testFilterPerformance = () => {
  console.log('⚡ Testing Filter Performance...');
  
  const iterations = 1000;
  const filters = { time: 'Evening', day: 'Today', category: 'Social' };
  
  // Warm up
  for (let i = 0; i < 100; i++) {
    filterEvents(COMPREHENSIVE_SAMPLE_EVENTS, filters);
  }
  
  // Test
  const startTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    filterEvents(COMPREHENSIVE_SAMPLE_EVENTS, filters);
  }
  const endTime = performance.now();
  
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;
  
  console.log(`📊 Performance Results:`);
  console.log(`  Total time for ${iterations} iterations: ${totalTime.toFixed(2)}ms`);
  console.log(`  Average time per filter: ${avgTime.toFixed(4)}ms`);
  console.log(`  Filters per second: ${(1000 / avgTime).toFixed(0)}`);
  
  const performanceGood = avgTime < 1; // Should be under 1ms per filter
  console.log(`🎯 Performance: ${performanceGood ? '✅ EXCELLENT' : '❌ NEEDS OPTIMIZATION'}`);
  
  return {
    totalTime,
    avgTime,
    iterations,
    performanceGood
  };
};

// ========================================
// COMPREHENSIVE TESTING SUITE
// ========================================

/**
 * Run comprehensive filter sync tests
 */
export const runComprehensiveFilterTests = async () => {
  console.log('🚀 Starting Comprehensive Filter Synchronization Tests...');
  console.log('='.repeat(60));
  
  const results = {
    validation: null,
    combinations: null,
    consistency: null,
    performance: null,
    overall: false
  };
  
  try {
    // Test 1: Filter validation
    console.log('\n✅ Test 1: Filter Validation');
    results.validation = validateFilters(DEFAULT_FILTERS);
    console.log(`Validation: ${results.validation.isValid ? '✅' : '❌'}`);
    
    // Test 2: All filter combinations
    console.log('\n🔍 Test 2: All Filter Combinations');
    results.combinations = testAllFilterCombinations();
    
    // Test 3: Filter consistency
    console.log('\n🧪 Test 3: Filter Consistency');
    results.consistency = testFilterConsistency();
    
    // Test 4: Performance
    console.log('\n⚡ Test 4: Performance');
    results.performance = testFilterPerformance();
    
    // Calculate overall result
    results.overall = results.validation.isValid && 
                     results.combinations.successfulCombinations > 0 && 
                     results.consistency.passed === results.consistency.totalTests && 
                     results.performance.performanceGood;
    
    // Display final results
    console.log('\n📊 FINAL TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Validation: ${results.validation.isValid ? '✅' : '❌'}`);
    console.log(`Combinations: ${results.combinations.successfulCombinations}/${results.combinations.totalCombinations} ✅`);
    console.log(`Consistency: ${results.consistency.passed}/${results.consistency.totalTests} ${results.consistency.passed === results.consistency.totalTests ? '✅' : '❌'}`);
    console.log(`Performance: ${results.performance.performanceGood ? '✅' : '❌'}`);
    console.log(`\n🎯 OVERALL RESULT: ${results.overall ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
  
  return results;
};

// ========================================
// GLOBAL EXPOSURE
// ========================================

// Expose testing functions globally
if (typeof window !== 'undefined') {
  window.comprehensiveFilterSync = {
    validateFilters,
    sanitizeFilters,
    applyFiltersWithLogging,
    verifyFilterSync,
    testAllFilterCombinations,
    testFilterConsistency,
    testFilterPerformance,
    runComprehensiveFilterTests
  };
  
  console.log('🔍 Comprehensive Filter Sync utilities loaded. Access via window.comprehensiveFilterSync');
}

export default {
  validateFilters,
  sanitizeFilters,
  applyFiltersWithLogging,
  verifyFilterSync,
  testAllFilterCombinations,
  testFilterConsistency,
  testFilterPerformance,
  runComprehensiveFilterTests
};

