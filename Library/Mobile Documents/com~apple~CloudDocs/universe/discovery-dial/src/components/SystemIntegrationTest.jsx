import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const SystemIntegrationTest = ({ isVisible, onClose }) => {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  // Test component independence
  const testComponentIndependence = useCallback(async () => {
    const results = {
      enhancedDial: false,
      enhancedEventInfo: false,
      timeSlider: false,
      errorBoundary: false
    };

    try {
      // Test EnhancedDial independence
      const dialElement = document.querySelector('.compass-dial');
      results.enhancedDial = dialElement !== null && dialElement.offsetWidth > 0;

      // Test EnhancedEventInfo independence
      const eventInfoElement = document.querySelector('.event-info-area');
      results.enhancedEventInfo = eventInfoElement !== null;

      // Test TimeSlider independence
      const timeSliderElement = document.querySelector('.time-slider');
      results.timeSlider = timeSliderElement !== null;

      // Test ErrorBoundary independence
      const errorBoundaryElement = document.querySelector('.error-boundary');
      results.errorBoundary = errorBoundaryElement === null; // Should not be visible in normal state

    } catch (error) {
      console.error('Component independence test failed:', error);
    }

    return results;
  }, []);

  // Test integration cohesion
  const testIntegrationCohesion = useCallback(async () => {
    const results = {
      categoryRotation: false,
      subcategoryDisplay: false,
      eventUpdates: false,
      recommendationClicks: false
    };

    try {
      // Test category rotation
      const categoryElements = document.querySelectorAll('.primary-category');
      results.categoryRotation = categoryElements.length === 4;

      // Test subcategory display
      const subcategoryElements = document.querySelectorAll('.subcategory-item');
      results.subcategoryDisplay = subcategoryElements.length > 0;

      // Test event updates
      const eventTitle = document.querySelector('.current-event h3');
      results.eventUpdates = eventTitle !== null && eventTitle.textContent.length > 0;

      // Test recommendation clicks
      const recommendationChips = document.querySelectorAll('.recommendation-chip');
      results.recommendationClicks = recommendationChips.length > 0;

    } catch (error) {
      console.error('Integration cohesion test failed:', error);
    }

    return results;
  }, []);

  // Test mobile optimization
  const testMobileOptimization = useCallback(async () => {
    const results = {
      touchTargets: false,
      safeAreas: false,
      viewportOptimization: false,
      hardwareAcceleration: false
    };

    try {
      // Test touch targets (44px minimum)
      const touchElements = document.querySelectorAll('.touch-target');
      const allTouchTargetsValid = Array.from(touchElements).every(el => {
        const rect = el.getBoundingClientRect();
        return rect.width >= 44 && rect.height >= 44;
      });
      results.touchTargets = allTouchTargetsValid;

      // Test safe areas
      const safeAreaElement = document.querySelector('.safe-area-inset');
      results.safeAreas = safeAreaElement !== null;

      // Test viewport optimization
      const viewport = document.querySelector('meta[name="viewport"]');
      results.viewportOptimization = viewport !== null && 
        viewport.content.includes('user-scalable=no');

      // Test hardware acceleration
      const hardwareElements = document.querySelectorAll('.hardware-accelerated');
      results.hardwareAcceleration = hardwareElements.length > 0;

    } catch (error) {
      console.error('Mobile optimization test failed:', error);
    }

    return results;
  }, []);

  // Test performance
  const testPerformance = useCallback(async () => {
    const results = {
      fps: 0,
      memoryUsage: 0,
      touchResponsiveness: 0
    };

    try {
      // Test FPS
      let frameCount = 0;
      let startTime = performance.now();
      
      const measureFPS = () => {
        frameCount++;
        if (performance.now() - startTime >= 1000) {
          results.fps = frameCount;
          return;
        }
        requestAnimationFrame(measureFPS);
      };
      
      measureFPS();

      // Test memory usage
      if (performance.memory) {
        results.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576);
      }

      // Test touch responsiveness
      const touchStartTime = performance.now();
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      document.dispatchEvent(touchEvent);
      results.touchResponsiveness = performance.now() - touchStartTime;

    } catch (error) {
      console.error('Performance test failed:', error);
    }

    return results;
  }, []);

  // Run all tests
  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setTestResults({});

    try {
      const [independence, cohesion, mobile, performance] = await Promise.all([
        testComponentIndependence(),
        testIntegrationCohesion(),
        testMobileOptimization(),
        testPerformance()
      ]);

      setTestResults({
        independence,
        cohesion,
        mobile,
        performance
      });

    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsRunning(false);
    }
  }, [testComponentIndependence, testIntegrationCohesion, testMobileOptimization, testPerformance]);

  // Auto-run tests when component becomes visible
  useEffect(() => {
    if (isVisible) {
      runAllTests();
    }
  }, [isVisible, runAllTests]);

  if (!isVisible) return null;

  const getTestStatus = (result) => {
    if (typeof result === 'boolean') {
      return result ? '✅' : '❌';
    }
    if (typeof result === 'number') {
      return result > 0 ? '✅' : '❌';
    }
    return '❓';
  };

  const getTestValue = (result) => {
    if (typeof result === 'boolean') {
      return result ? 'PASS' : 'FAIL';
    }
    if (typeof result === 'number') {
      return result.toString();
    }
    return 'UNKNOWN';
  };

  return (
    <motion.div
      className="system-integration-test"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="test-header">
        <h3>System Integration Test</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>

      <div className="test-content">
        {isRunning ? (
          <div className="test-loading">
            <div className="spinner"></div>
            <p>Running tests...</p>
          </div>
        ) : (
          <div className="test-results">
            {/* Component Independence */}
            <div className="test-section">
              <h4>Component Independence</h4>
              <div className="test-items">
                {Object.entries(testResults.independence || {}).map(([key, value]) => (
                  <div key={key} className="test-item">
                    <span className="test-icon">{getTestStatus(value)}</span>
                    <span className="test-name">{key}</span>
                    <span className="test-value">{getTestValue(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Integration Cohesion */}
            <div className="test-section">
              <h4>Integration Cohesion</h4>
              <div className="test-items">
                {Object.entries(testResults.cohesion || {}).map(([key, value]) => (
                  <div key={key} className="test-item">
                    <span className="test-icon">{getTestStatus(value)}</span>
                    <span className="test-name">{key}</span>
                    <span className="test-value">{getTestValue(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Optimization */}
            <div className="test-section">
              <h4>Mobile Optimization</h4>
              <div className="test-items">
                {Object.entries(testResults.mobile || {}).map(([key, value]) => (
                  <div key={key} className="test-item">
                    <span className="test-icon">{getTestStatus(value)}</span>
                    <span className="test-name">{key}</span>
                    <span className="test-value">{getTestValue(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance */}
            <div className="test-section">
              <h4>Performance</h4>
              <div className="test-items">
                {Object.entries(testResults.performance || {}).map(([key, value]) => (
                  <div key={key} className="test-item">
                    <span className="test-icon">{getTestStatus(value)}</span>
                    <span className="test-name">{key}</span>
                    <span className="test-value">{getTestValue(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="test-actions">
          <button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="retry-button"
          >
            {isRunning ? 'Running...' : 'Run Tests Again'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SystemIntegrationTest;

