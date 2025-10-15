import React, { useEffect, useState, useCallback } from 'react';
import EventCompassFinal from './components/EventCompassFinal';
import EventDiscoveryMap from './components/EventDiscoveryMap';
import EventDiscoveryFilters from './components/EventDiscoveryFilters';
import EventInformationDisplay from './components/EventInformationDisplay';
import ErrorBoundary from './components/ErrorBoundary';
import categoriesData from './data/categories.json';
import { MOCK_EVENTS } from './data/mockEvents';
import { ENHANCED_SAMPLE_EVENTS } from './data/enhancedSampleEvents';
import useScrollPrevention from './hooks/useScrollPrevention';
import useTextSelectionPrevention from './hooks/useTextSelectionPrevention';
import useSafariScrollPrevention from './hooks/useSafariScrollPrevention';
import { useWordPressComEvents } from './hooks/useWordPressComEvents';
import { TIMEFRAMES } from './utils/formatters';
import { 
  safeDocumentBody, 
  safeDocumentElement, 
  isDocumentAvailable, 
  isWindowAvailable,
  safeAddEventListener,
  safeRemoveEventListener,
  safeSetStyle,
  safeSetStyles
} from './utils/safeDOM';
import './utils/testWordPress'; // Import test utilities
import './utils/testWordPressCom'; // Import WordPress.com test utilities
import './utils/qaTesting'; // Import QA testing utilities
import './utils/mobileUIDebug'; // Import mobile UI debug utilities
import './utils/comprehensiveQATesting'; // Import comprehensive QA testing utilities
import './utils/completeFunctionalityVerification'; // Import complete functionality verification utilities
import './utils/eventDiscoveryTesting'; // Import Event Discovery testing utilities
import './utils/gestureAndFilterTesting'; // Import gesture and filter testing utilities
import './utils/testingDashboard'; // Import testing dashboard
import './utils/mapPinSynchronization'; // Import map pin synchronization utilities

/**
 * Main application component.
 * FINAL PRODUCTION VERSION - Clean compass dial with WordPress.com integration and complete scroll prevention
 */
function App() {
  // Unified state management for map background integration
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState(ENHANCED_SAMPLE_EVENTS);
  const [activeFilters, setActiveFilters] = useState({
    time: 'All',
    day: 'All',
    category: 'All'
  });
  const [highlightedEvent, setHighlightedEvent] = useState(null);

  // Initialize complete scroll prevention
  useScrollPrevention();

  // Initialize complete text selection prevention
  useTextSelectionPrevention();

  // Initialize Safari-specific scroll prevention
  const { isSafari, isIOS } = useSafariScrollPrevention();

  // Mobile UI visibility functions
  const updateSubcategoryPosition = useCallback(() => {
    if (window.innerWidth <= 768) {
      // Mobile-specific positioning
      const subcategoryDial = document.querySelector('.subcategory-dial');
      if (subcategoryDial) {
        subcategoryDial.style.position = 'relative';
        subcategoryDial.style.maxWidth = '100vw';
        subcategoryDial.style.maxHeight = '100vh';
      }
    }
  }, []);

  const ensureButtonVisibility = useCallback(() => {
    const button = document.querySelector('.date-range-button');
    if (button && window.innerWidth <= 768) {
      button.style.position = 'fixed';
      button.style.bottom = '80px'; // Position below time selector
      button.style.right = '20px';
      button.style.zIndex = '1000';
      button.style.minWidth = '120px';
      button.style.minHeight = '44px';
    }
  }, []);

  // Mobile detection and initialization
  useEffect(() => {
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
             (window.innerWidth <= 768) ||
             ('ontouchstart' in window);
    };

    const isMobileSafari = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    };

    if (isMobile()) {
      // Add mobile device class
      if (isDocumentAvailable() && document.body) {
        document.body.classList.add('mobile-device');
      }
      
      // Apply mobile UI fixes
      updateSubcategoryPosition();
      ensureButtonVisibility();
      
      // Mobile Safari specific fixes
      if (isMobileSafari()) {
        console.log('Mobile Safari detected - applying Safari-specific fixes');
        
        // Fix viewport height issues
        const setVH = () => {
          const vh = window.innerHeight * 0.01;
          if (isDocumentAvailable()) {
            document.documentElement.style.setProperty('--vh', `${vh}px`);
          }
        };
        setVH();
        
        if (isWindowAvailable()) {
          window.addEventListener('resize', setVH);
        }
        
        // Prevent zoom on input focus
        if (isDocumentAvailable()) {
          document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
              e.preventDefault();
            }
          }, { passive: false });
        }
      }
      
      // Mobile-specific initialization
      console.log('Mobile device detected - applying mobile optimizations');
    }
  }, [updateSubcategoryPosition, ensureButtonVisibility]);

  // Handle window resize for mobile UI adjustments
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        // Apply mobile-specific styles
        if (isDocumentAvailable() && document.body) {
          document.body.classList.add('mobile-viewport');
        }
        updateSubcategoryPosition();
        ensureButtonVisibility();
      } else {
        if (isDocumentAvailable() && document.body) {
          document.body.classList.remove('mobile-viewport');
        }
      }
    };
    
    if (isWindowAvailable()) {
      window.addEventListener('resize', handleResize);
      handleResize(); // Run on mount
      
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [updateSubcategoryPosition, ensureButtonVisibility]);

  // Enhanced text selection and scroll prevention
  useEffect(() => {
    const preventSelectionAndScrolling = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    const preventScrolling = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    // Global event listeners for text selection (only if document is available)
    if (isDocumentAvailable()) {
      safeAddEventListener(document, 'selectstart', preventSelectionAndScrolling, { passive: false });
      safeAddEventListener(document, 'dragstart', preventSelectionAndScrolling, { passive: false });
      safeAddEventListener(document, 'contextmenu', preventSelectionAndScrolling, { passive: false });
      
      // Additional text selection prevention events
      safeAddEventListener(document, 'mousedown', preventSelectionAndScrolling, { passive: false });
      safeAddEventListener(document, 'mouseup', preventSelectionAndScrolling, { passive: false });
      safeAddEventListener(document, 'mousemove', preventSelectionAndScrolling, { passive: false });

      // Global event listeners for scrolling
      safeAddEventListener(document, 'wheel', preventScrolling, { passive: false });
      safeAddEventListener(document, 'touchmove', preventScrolling, { passive: false });
      safeAddEventListener(document, 'touchstart', preventScrolling, { passive: false });
      safeAddEventListener(document, 'touchend', preventScrolling, { passive: false });
      safeAddEventListener(document, 'scroll', preventScrolling, { passive: false });
      
      // Additional scroll prevention events
      safeAddEventListener(document, 'DOMMouseScroll', preventScrolling, { passive: false }); // Firefox
      safeAddEventListener(document, 'mousewheel', preventScrolling, { passive: false }); // Older browsers
      safeAddEventListener(document, 'MozMousePixelScroll', preventScrolling, { passive: false }); // Firefox
    }

    // Prevent keyboard scrolling
    const handleKeyDown = (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.code)) {
        preventScrolling(e);
      }
    };
    if (isDocumentAvailable()) {
      safeAddEventListener(document, 'keydown', handleKeyDown);
    }

    // Apply styles to prevent scrolling (only if document is available)
    if (isDocumentAvailable()) {
      const documentElement = safeDocumentElement();
      const body = safeDocumentBody();
      const root = document.getElementById('root');
      
      // Apply styles to document element
      if (documentElement) {
        safeSetStyles(documentElement, {
          overflow: 'hidden',
          overscrollBehavior: 'none',
          touchAction: 'none',
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        });
      }
      
      // Apply styles to body
      if (body) {
        safeSetStyles(body, {
          overflow: 'hidden',
          overscrollBehavior: 'none',
          touchAction: 'none',
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        });
      }
      
      // Apply styles to root element
      if (root) {
        safeSetStyles(root, {
          overflow: 'hidden',
          overscrollBehavior: 'none',
          touchAction: 'none',
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        });
      }
    }

    // Hide scrollbars for all elements (only if document is available)
    const hideScrollbars = () => {
      if (!isDocumentAvailable()) return;
      
      try {
        const style = document.createElement('style');
        style.textContent = `
          *::-webkit-scrollbar {
            display: none !important;
          }
          * {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
        `;
        if (document.head) {
          document.head.appendChild(style);
        }
      } catch (error) {
        console.warn('App: Failed to hide scrollbars', error);
      }
    };
    hideScrollbars();

    // Prevent programmatic scrolling (only if window is available)
    let originalScrollTo, originalScrollBy, originalScroll;
    if (isWindowAvailable()) {
      originalScrollTo = window.scrollTo;
      originalScrollBy = window.scrollBy;
      originalScroll = window.scroll;
      
      window.scrollTo = () => {};
      window.scrollBy = () => {};
      window.scroll = () => {};
    }
    
    // Prevent element scrolling (only if document is available)
    const preventElementScroll = (element) => {
      if (element && typeof element.scrollTo === 'function') {
        element.scrollTo = () => {};
      }
      if (element && typeof element.scrollBy === 'function') {
        element.scrollBy = () => {};
      }
      if (element && typeof element.scroll === 'function') {
        element.scroll = () => {};
      }
    };
    
    // Apply to all existing elements (only if document is available)
    if (isDocumentAvailable()) {
      try {
        document.querySelectorAll('*').forEach(preventElementScroll);
      } catch (error) {
        console.warn('App: Failed to prevent element scrolling', error);
      }
    }

    // Safari-specific scroll prevention
    let preventSafariScroll = null;
    if (isSafari || isIOS) {
      // Safari-specific scroll prevention
      preventSafariScroll = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      };

      // Safari-specific event listeners (only if document is available)
      if (isDocumentAvailable()) {
        safeAddEventListener(document, 'gesturestart', preventSafariScroll, { passive: false });
        safeAddEventListener(document, 'gesturechange', preventSafariScroll, { passive: false });
        safeAddEventListener(document, 'gestureend', preventSafariScroll, { passive: false });
      }

      // Prevent Safari's scroll restoration
      if (isWindowAvailable() && 'scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }

      // Force scroll position to top for Safari
      const safariScrollInterval = setInterval(() => {
        if (isWindowAvailable()) {
          window.scrollTo(0, 0);
        }
        if (isDocumentAvailable()) {
          const documentElement = safeDocumentElement();
          const body = safeDocumentBody();
          
          if (documentElement) {
            documentElement.scrollTop = 0;
          }
          if (body) {
            body.scrollTop = 0;
          }
        }
      }, 100);

      // Safari-specific CSS injection (only if document is available)
      let safariStyle = null;
      if (isDocumentAvailable()) {
        try {
          safariStyle = document.createElement('style');
          safariStyle.textContent = `
            /* Safari-specific scroll prevention */
            html, body, #root, .App {
              overflow: hidden !important;
              overscroll-behavior: none !important;
              -webkit-overflow-scrolling: auto !important;
              touch-action: none !important;
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              -webkit-transform: translateZ(0) !important;
              -webkit-backface-visibility: hidden !important;
              -webkit-perspective: 1000 !important;
            }
            
            /* Disable Safari's rubber band scrolling */
            body {
              overscroll-behavior-y: none !important;
              -webkit-overflow-scrolling: auto !important;
            }
          `;
          if (document.head) {
            document.head.appendChild(safariStyle);
          }
        } catch (error) {
          console.warn('App: Failed to inject Safari CSS', error);
        }
      }

      // Store references for cleanup
      if (isWindowAvailable()) {
        window.safariScrollInterval = safariScrollInterval;
        window.safariStyle = safariStyle;
      }
    }

    // Cleanup
    return () => {
      if (isDocumentAvailable()) {
        safeRemoveEventListener(document, 'selectstart', preventSelectionAndScrolling);
        safeRemoveEventListener(document, 'dragstart', preventSelectionAndScrolling);
        safeRemoveEventListener(document, 'contextmenu', preventSelectionAndScrolling);
        safeRemoveEventListener(document, 'mousedown', preventSelectionAndScrolling);
        safeRemoveEventListener(document, 'mouseup', preventSelectionAndScrolling);
        safeRemoveEventListener(document, 'mousemove', preventSelectionAndScrolling);
        safeRemoveEventListener(document, 'wheel', preventScrolling);
        safeRemoveEventListener(document, 'touchmove', preventScrolling);
        safeRemoveEventListener(document, 'touchstart', preventScrolling);
        safeRemoveEventListener(document, 'touchend', preventScrolling);
        safeRemoveEventListener(document, 'scroll', preventScrolling);
        safeRemoveEventListener(document, 'DOMMouseScroll', preventScrolling);
        safeRemoveEventListener(document, 'mousewheel', preventScrolling);
        safeRemoveEventListener(document, 'MozMousePixelScroll', preventScrolling);
        safeRemoveEventListener(document, 'keydown', handleKeyDown);
      }
      
      // Restore original scroll methods (only if window is available)
      if (isWindowAvailable()) {
        window.scrollTo = originalScrollTo;
        window.scrollBy = originalScrollBy;
        window.scroll = originalScroll;
      }
      
      // Safari-specific cleanup
      if (isSafari || isIOS) {
        // Clear Safari scroll interval
        if (isWindowAvailable() && window.safariScrollInterval) {
          clearInterval(window.safariScrollInterval);
        }
        
        // Remove Safari-specific styles
        if (isWindowAvailable() && window.safariStyle && window.safariStyle.parentNode) {
          window.safariStyle.parentNode.removeChild(window.safariStyle);
        }
        
        // Remove Safari-specific event listeners
        if (preventSafariScroll && isDocumentAvailable()) {
          safeRemoveEventListener(document, 'gesturestart', preventSafariScroll);
          safeRemoveEventListener(document, 'gesturechange', preventSafariScroll);
          safeRemoveEventListener(document, 'gestureend', preventSafariScroll);
        }
      }
    };
  }, []);

  // Initialize WordPress.com events (with fallback to local data)
  const { events: wordPressComEvents, loading, error, categories, stats } = useWordPressComEvents();

  // Timeframe state management
  const [currentTimeframe, setCurrentTimeframe] = useState(TIMEFRAMES[0]);

  // Handle timeframe change
  const handleTimeframeChange = useCallback((newTimeframe) => {
    console.log('App: Timeframe changed to', newTimeframe);
    setCurrentTimeframe(newTimeframe);
  }, []);

  // Dynamic event filtering based on dial selection and filters
  const filterEventsByDialSelection = useCallback((events, category, subcategory, filters) => {
    let filtered = events;
    
    // Filter by dial selection
    if (category) {
      filtered = filtered.filter(event => 
        event.categoryPrimary === category.name
      );
    }
    
    if (subcategory) {
      filtered = filtered.filter(event => 
        event.categorySecondary === subcategory.label
      );
    }
    
    // Apply additional filters
    if (filters.time !== 'All') {
      filtered = filtered.filter(event => event.time === filters.time);
    }
    
    if (filters.day !== 'All') {
      filtered = filtered.filter(event => event.day === filters.day);
    }
    
    if (filters.category !== 'All') {
      filtered = filtered.filter(event => event.categoryPrimary === filters.category);
    }
    
    return filtered;
  }, []);

         // Update filtered events when selections change
         useEffect(() => {
           const filtered = filterEventsByDialSelection(
             ENHANCED_SAMPLE_EVENTS, 
             selectedCategory, 
             selectedSubcategory, 
             activeFilters
           );
           setFilteredEvents(filtered);
         }, [selectedCategory, selectedSubcategory, activeFilters, filterEventsByDialSelection]);

  // Handle category selection from dial
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null); // Reset subcategory when category changes
  }, []);

  // Handle subcategory selection from dial
  const handleSubcategorySelect = useCallback((subcategory) => {
    setSelectedSubcategory(subcategory);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    setActiveFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value,
    }));
  }, []);

  // Handle event selection from map
  const handleEventSelect = useCallback((event) => {
    setHighlightedEvent(event);
  }, []);

  // Run comprehensive QA tests after app loads
  useEffect(() => {
    const runQATests = async () => {
      // Wait for app to fully load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('🚀 Starting comprehensive QA audit...');
      try {
        if (isWindowAvailable() && window.comprehensiveQATesting) {
          await window.comprehensiveQATesting.runComprehensiveTests();
        } else {
          console.warn('Comprehensive QA testing not available');
        }
      } catch (error) {
        console.error('QA testing failed:', error);
      }
    };

    runQATests();
  }, []);

  // Run complete functionality verification after app loads
  useEffect(() => {
    const runFunctionalityVerification = async () => {
      // Wait for app to fully load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('🚀 Starting complete functionality verification...');
      try {
        if (isWindowAvailable() && window.completeFunctionalityVerification) {
          await window.completeFunctionalityVerification.runCompleteVerification();
        } else {
          console.warn('Complete functionality verification not available');
        }
      } catch (error) {
        console.error('Functionality verification failed:', error);
      }
    };

    runFunctionalityVerification();
  }, []);

  // Run gesture and filter testing after app loads
  useEffect(() => {
    const runGestureAndFilterTests = async () => {
      // Wait for app to fully load and other tests to complete
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      console.log('🧪 Starting gesture and filter testing...');
      try {
        if (isWindowAvailable() && window.gestureAndFilterTesting) {
          await window.gestureAndFilterTesting.runComprehensiveTests();
        } else {
          console.warn('Gesture and filter testing not available');
        }
      } catch (error) {
        console.error('Gesture and filter testing failed:', error);
      }
    };

    runGestureAndFilterTests();
  }, []);

  // Initialize testing dashboard
  useEffect(() => {
    if (isWindowAvailable() && window.testingDashboard) {
      console.log('🧪 Testing Dashboard initialized');
      console.log('Available commands:');
      console.log('  window.testingDashboard.runAllTests() - Run comprehensive tests');
      console.log('  window.testingDashboard.quickGestureTest() - Quick gesture test');
      console.log('  window.testingDashboard.quickFilterTest() - Quick filter test');
      console.log('  window.testingDashboard.quickMobileTest() - Quick mobile test');
      console.log('  window.testingDashboard.exportResults() - Export test results');
    }
  }, []);

  // Initialize map pin synchronization testing
  useEffect(() => {
    if (isWindowAvailable() && window.mapPinSynchronization) {
      console.log('🗺️ Map Pin Synchronization utilities initialized');
      console.log('Available commands:');
      console.log('  window.mapPinSynchronization.runComprehensiveSyncTests() - Run all sync tests');
      console.log('  window.mapPinSynchronization.testSynchronizationAccuracy() - Test sync accuracy');
      console.log('  window.mapPinSynchronization.testFilterSynchronization() - Test filter sync');
      console.log('  window.mapPinSynchronization.testPinVisibility() - Test pin visibility');
      console.log('  window.mapPinSynchronization.testPinRenderingPerformance() - Test performance');
    }
  }, []);

  return (
    <ErrorBoundary name="App">
      <div className="unified-app-container">
        {/* Full-screen Map Background */}
        <div className="map-background-layer">
          <EventDiscoveryMap 
            events={filteredEvents}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onEventSelect={handleEventSelect}
          />
        </div>
        
        {/* Event Information Panel - Above Dial */}
        <div className="event-info-panel">
          <EventInformationDisplay 
            event={highlightedEvent}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
          />
        </div>
        
        {/* Repositioned Dial Interface - Bottom */}
        <div className="dial-foreground-layer">
          <EventCompassFinal
            categories={categoriesData.categories}
            wordPressEvents={wordPressComEvents}
            wordPressLoading={loading}
            wordPressError={error}
            wordPressCategories={categories}
            wordPressStats={stats}
            currentTimeframe={currentTimeframe}
            onTimeframeChange={handleTimeframeChange}
            onCategorySelect={handleCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
            highlightedEvent={highlightedEvent}
          />
        </div>
        
        {/* Time Controls - Right Side (Unchanged) */}
        <div className="time-controls-overlay">
          {/* Time picker and day toggle will be added here */}
        </div>
        
        {/* Filter Controls - Hidden (using today toggle below time filter instead) */}
        <div className="controls-overlay" style={{ display: 'none' }}>
          <EventDiscoveryFilters 
            filters={activeFilters}
            onFilterChange={handleFilterChange}
            compact={true}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
