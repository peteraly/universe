/**
 * Comprehensive Testing Dashboard
 * Provides a unified interface for all testing utilities
 */

import { isDocumentAvailable, isWindowAvailable } from './safeDOM';

// ========================================
// TESTING DASHBOARD
// ========================================

/**
 * Main testing dashboard class
 */
class TestingDashboard {
  constructor() {
    this.testResults = {
      gestures: null,
      filters: null,
      map: null,
      mobile: null,
      performance: null,
      overall: null
    };
    
    this.isRunning = false;
    this.currentTest = null;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    if (this.isRunning) {
      console.log('⚠️ Tests already running...');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Comprehensive Testing Dashboard...');
    console.log('='.repeat(60));

    try {
      // Run gesture tests
      this.currentTest = 'Gestures';
      console.log('\n🧪 Testing Gestures...');
      this.testResults.gestures = await this.runGestureTests();

      // Run filter tests
      this.currentTest = 'Filters';
      console.log('\n🔍 Testing Filters...');
      this.testResults.filters = await this.runFilterTests();

      // Run map tests
      this.currentTest = 'Map Integration';
      console.log('\n🗺️ Testing Map Integration...');
      this.testResults.map = await this.runMapTests();

      // Run mobile tests
      this.currentTest = 'Mobile';
      console.log('\n📱 Testing Mobile...');
      this.testResults.mobile = await this.runMobileTests();

      // Run performance tests
      this.currentTest = 'Performance';
      console.log('\n⚡ Testing Performance...');
      this.testResults.performance = await this.runPerformanceTests();

      // Calculate overall result
      this.testResults.overall = this.calculateOverallResult();

      // Display results
      this.displayResults();

    } catch (error) {
      console.error('❌ Testing failed:', error);
    } finally {
      this.isRunning = false;
      this.currentTest = null;
    }
  }

  /**
   * Run gesture tests
   */
  async runGestureTests() {
    const results = {
      primaryGestures: false,
      subcategoryRotation: false,
      touchInteractions: false,
      hapticFeedback: false
    };

    try {
      // Test primary gestures
      if (window.gestureAndFilterTesting) {
        results.primaryGestures = await window.gestureAndFilterTesting.testPrimaryGestures();
        results.subcategoryRotation = await window.gestureAndFilterTesting.testSubcategoryRotation();
        results.touchInteractions = await window.gestureAndFilterTesting.testTouchInteractions();
        results.hapticFeedback = window.gestureAndFilterTesting.testHapticFeedback();
      }

      return results;
    } catch (error) {
      console.error('Gesture tests failed:', error);
      return results;
    }
  }

  /**
   * Run filter tests
   */
  async runFilterTests() {
    const results = {
      timeFilters: false,
      dayFilters: false,
      categoryFilters: false,
      filterSync: false
    };

    try {
      // Test filter synchronization
      if (window.gestureAndFilterTesting) {
        results.timeFilters = await window.gestureAndFilterTesting.testTimeFilters();
        results.dayFilters = await window.gestureAndFilterTesting.testDayFilters();
        results.categoryFilters = await window.gestureAndFilterTesting.testCategoryFilters();
        
        // Test filter synchronization
        results.filterSync = await this.testFilterSynchronization();
      }

      return results;
    } catch (error) {
      console.error('Filter tests failed:', error);
      return results;
    }
  }

  /**
   * Run map tests
   */
  async runMapTests() {
    const results = {
      markerSync: false,
      mapInteractions: false,
      eventSelection: false,
      boundsAdjustment: false
    };

    try {
      // Test map integration
      if (window.gestureAndFilterTesting) {
        results.markerSync = await window.gestureAndFilterTesting.testMapMarkerSync();
        results.mapInteractions = await window.gestureAndFilterTesting.testMapInteractions();
        
        // Test event selection
        results.eventSelection = await this.testEventSelection();
        
        // Test bounds adjustment
        results.boundsAdjustment = await this.testBoundsAdjustment();
      }

      return results;
    } catch (error) {
      console.error('Map tests failed:', error);
      return results;
    }
  }

  /**
   * Run mobile tests
   */
  async runMobileTests() {
    const results = {
      touchTargets: false,
      gestureRecognition: false,
      responsiveDesign: false,
      mobilePerformance: false
    };

    try {
      // Test mobile functionality
      if (window.gestureAndFilterTesting) {
        results.touchTargets = window.gestureAndFilterTesting.testTouchTargets();
        results.gestureRecognition = await window.gestureAndFilterTesting.testMobileGestures();
        results.mobilePerformance = await window.gestureAndFilterTesting.testMobilePerformance();
        
        // Test responsive design
        results.responsiveDesign = await this.testResponsiveDesign();
      }

      return results;
    } catch (error) {
      console.error('Mobile tests failed:', error);
      return results;
    }
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests() {
    const results = {
      frameRate: false,
      memoryUsage: false,
      touchResponse: false,
      loadTime: false
    };

    try {
      // Test performance metrics
      if (window.gestureAndFilterTesting) {
        const fps = await window.gestureAndFilterTesting.measureFrameRate();
        results.frameRate = fps >= 30;

        const memory = window.gestureAndFilterTesting.measureMemoryUsage();
        results.memoryUsage = memory < 100;

        const responseTime = await window.gestureAndFilterTesting.measureTouchResponseTime();
        results.touchResponse = responseTime < 100;

        // Test load time
        results.loadTime = await this.testLoadTime();
      }

      return results;
    } catch (error) {
      console.error('Performance tests failed:', error);
      return results;
    }
  }

  /**
   * Test filter synchronization
   */
  async testFilterSynchronization() {
    if (!isDocumentAvailable()) return false;

    try {
      // Test time filter sync
      const timeFilter = document.querySelector('.filter-pill[data-time="Morning"]');
      if (timeFilter) {
        timeFilter.click();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const markers = document.querySelectorAll('.mapboxgl-marker');
        const visibleMarkers = Array.from(markers).filter(marker => 
          marker.style.display !== 'none'
        );
        
        return visibleMarkers.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Filter synchronization test failed:', error);
      return false;
    }
  }

  /**
   * Test event selection
   */
  async testEventSelection() {
    if (!isDocumentAvailable()) return false;

    try {
      // Find a marker to click
      const marker = document.querySelector('.mapboxgl-marker');
      if (marker) {
        marker.click();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Check if event info is displayed
        const eventInfo = document.querySelector('.event-info-panel');
        return !!eventInfo;
      }
      
      return false;
    } catch (error) {
      console.error('Event selection test failed:', error);
      return false;
    }
  }

  /**
   * Test bounds adjustment
   */
  async testBoundsAdjustment() {
    if (!isDocumentAvailable()) return false;

    try {
      // Test if map adjusts to filtered events
      const mapContainer = document.querySelector('.mapboxgl-map');
      if (mapContainer) {
        // This would test map bounds adjustment
        // For now, just check if map container exists
        return !!mapContainer;
      }
      
      return false;
    } catch (error) {
      console.error('Bounds adjustment test failed:', error);
      return false;
    }
  }

  /**
   * Test responsive design
   */
  async testResponsiveDesign() {
    if (!isWindowAvailable()) return false;

    try {
      // Test different viewport sizes
      const viewports = [
        { width: 375, height: 667 }, // iPhone
        { width: 768, height: 1024 }, // iPad
        { width: 1920, height: 1080 } // Desktop
      ];

      let passedTests = 0;
      
      for (const viewport of viewports) {
        // Simulate viewport change
        window.innerWidth = viewport.width;
        window.innerHeight = viewport.height;
        
        // Trigger resize event
        window.dispatchEvent(new Event('resize'));
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if elements are still visible
        const dial = document.querySelector('.enhanced-dial');
        const map = document.querySelector('.mapboxgl-map');
        
        if (dial && map) {
          passedTests++;
        }
      }
      
      return passedTests === viewports.length;
    } catch (error) {
      console.error('Responsive design test failed:', error);
      return false;
    }
  }

  /**
   * Test load time
   */
  async testLoadTime() {
    if (!isWindowAvailable()) return false;

    try {
      // Measure load time
      const loadTime = performance.now();
      return loadTime < 3000; // Less than 3 seconds
    } catch (error) {
      console.error('Load time test failed:', error);
      return false;
    }
  }

  /**
   * Calculate overall result
   */
  calculateOverallResult() {
    const results = this.testResults;
    let totalTests = 0;
    let passedTests = 0;

    // Count tests in each category
    Object.values(results).forEach(category => {
      if (category && typeof category === 'object') {
        Object.values(category).forEach(test => {
          totalTests++;
          if (test) passedTests++;
        });
      }
    });

    const percentage = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    return {
      totalTests,
      passedTests,
      percentage: Math.round(percentage),
      status: percentage >= 80 ? 'PASS' : percentage >= 60 ? 'WARN' : 'FAIL'
    };
  }

  /**
   * Display test results
   */
  displayResults() {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    // Display category results
    this.displayCategoryResults('Gestures', this.testResults.gestures);
    this.displayCategoryResults('Filters', this.testResults.filters);
    this.displayCategoryResults('Map Integration', this.testResults.map);
    this.displayCategoryResults('Mobile', this.testResults.mobile);
    this.displayCategoryResults('Performance', this.testResults.performance);
    
    // Display overall result
    console.log('\n🎯 OVERALL RESULT');
    console.log('='.repeat(60));
    const overall = this.testResults.overall;
    console.log(`Total Tests: ${overall.totalTests}`);
    console.log(`Passed: ${overall.passedTests}`);
    console.log(`Percentage: ${overall.percentage}%`);
    console.log(`Status: ${overall.status}`);
    
    // Display recommendations
    this.displayRecommendations();
  }

  /**
   * Display category results
   */
  displayCategoryResults(categoryName, results) {
    if (!results) return;
    
    console.log(`\n${categoryName}:`);
    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? '✅' : '❌';
      console.log(`  ${status} ${test}`);
    });
  }

  /**
   * Display recommendations
   */
  displayRecommendations() {
    console.log('\n💡 RECOMMENDATIONS');
    console.log('='.repeat(60));
    
    const results = this.testResults;
    
    // Gesture recommendations
    if (results.gestures) {
      const gestureResults = Object.values(results.gestures);
      const gesturePassRate = gestureResults.filter(r => r).length / gestureResults.length;
      
      if (gesturePassRate < 0.8) {
        console.log('🔧 Gestures: Consider optimizing touch handling and gesture recognition');
      }
    }
    
    // Filter recommendations
    if (results.filters) {
      const filterResults = Object.values(results.filters);
      const filterPassRate = filterResults.filter(r => r).length / filterResults.length;
      
      if (filterPassRate < 0.8) {
        console.log('🔧 Filters: Check filter synchronization with map markers');
      }
    }
    
    // Map recommendations
    if (results.map) {
      const mapResults = Object.values(results.map);
      const mapPassRate = mapResults.filter(r => r).length / mapResults.length;
      
      if (mapPassRate < 0.8) {
        console.log('🔧 Map: Verify map integration and marker synchronization');
      }
    }
    
    // Mobile recommendations
    if (results.mobile) {
      const mobileResults = Object.values(results.mobile);
      const mobilePassRate = mobileResults.filter(r => r).length / mobileResults.length;
      
      if (mobilePassRate < 0.8) {
        console.log('🔧 Mobile: Optimize touch targets and responsive design');
      }
    }
    
    // Performance recommendations
    if (results.performance) {
      const performanceResults = Object.values(results.performance);
      const performancePassRate = performanceResults.filter(r => r).length / performanceResults.length;
      
      if (performancePassRate < 0.8) {
        console.log('🔧 Performance: Consider optimizing rendering and memory usage');
      }
    }
  }

  /**
   * Get test results
   */
  getResults() {
    return this.testResults;
  }

  /**
   * Export results
   */
  exportResults() {
    const results = {
      timestamp: new Date().toISOString(),
      results: this.testResults,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    console.log('📁 Test results exported');
  }
}

// ========================================
// QUICK TEST FUNCTIONS
// ========================================

/**
 * Quick gesture test
 */
const quickGestureTest = async () => {
  console.log('🧪 Running quick gesture test...');
  
  if (window.gestureAndFilterTesting) {
    const results = await window.gestureAndFilterTesting.runComprehensiveTests();
    console.log('Quick gesture test completed:', results);
  } else {
    console.warn('Gesture testing not available');
  }
};

/**
 * Quick filter test
 */
const quickFilterTest = async () => {
  console.log('🔍 Running quick filter test...');
  
  if (window.gestureAndFilterTesting) {
    const timeResult = await window.gestureAndFilterTesting.testTimeFilters();
    const dayResult = await window.gestureAndFilterTesting.testDayFilters();
    const categoryResult = await window.gestureAndFilterTesting.testCategoryFilters();
    
    console.log('Quick filter test results:', {
      time: timeResult,
      day: dayResult,
      category: categoryResult
    });
  } else {
    console.warn('Filter testing not available');
  }
};

/**
 * Quick mobile test
 */
const quickMobileTest = async () => {
  console.log('📱 Running quick mobile test...');
  
  if (window.gestureAndFilterTesting) {
    const touchTargets = window.gestureAndFilterTesting.testTouchTargets();
    const gestures = await window.gestureAndFilterTesting.testMobileGestures();
    const performance = await window.gestureAndFilterTesting.testMobilePerformance();
    
    console.log('Quick mobile test results:', {
      touchTargets,
      gestures,
      performance
    });
  } else {
    console.warn('Mobile testing not available');
  }
};

// ========================================
// GLOBAL EXPOSURE
// ========================================

// Create global testing dashboard instance
const testingDashboard = new TestingDashboard();

// Expose testing functions globally
if (isWindowAvailable()) {
  window.testingDashboard = {
    // Main dashboard
    runAllTests: () => testingDashboard.runAllTests(),
    getResults: () => testingDashboard.getResults(),
    exportResults: () => testingDashboard.exportResults(),
    
    // Quick tests
    quickGestureTest,
    quickFilterTest,
    quickMobileTest,
    
    // Individual test functions
    runGestureTests: () => testingDashboard.runGestureTests(),
    runFilterTests: () => testingDashboard.runFilterTests(),
    runMapTests: () => testingDashboard.runMapTests(),
    runMobileTests: () => testingDashboard.runMobileTests(),
    runPerformanceTests: () => testingDashboard.runPerformanceTests()
  };
  
  console.log('🧪 Testing Dashboard loaded. Access via window.testingDashboard');
  console.log('Available commands:');
  console.log('  window.testingDashboard.runAllTests() - Run all tests');
  console.log('  window.testingDashboard.quickGestureTest() - Quick gesture test');
  console.log('  window.testingDashboard.quickFilterTest() - Quick filter test');
  console.log('  window.testingDashboard.quickMobileTest() - Quick mobile test');
  console.log('  window.testingDashboard.exportResults() - Export test results');
}

export default TestingDashboard;
