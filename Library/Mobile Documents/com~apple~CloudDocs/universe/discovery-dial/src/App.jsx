import React, { useEffect, useState, useCallback } from 'react';
import EventCompassFinal from './components/EventCompassFinal';
import EventDiscoveryMap from './components/EventDiscoveryMap';
import EventDiscoveryFilters from './components/EventDiscoveryFilters';
import EventInformationDisplay from './components/EventInformationDisplay';
import EventDisplayCard from './components/EventDisplayCard';
import ErrorBoundary from './components/ErrorBoundary';
import categoriesData from './data/categories.json';
import { COMPREHENSIVE_SAMPLE_EVENTS } from './data/comprehensiveSampleEvents';
import useScrollPrevention from './hooks/useScrollPrevention';
import useTextSelectionPrevention from './hooks/useTextSelectionPrevention';
import useSafariScrollPrevention from './hooks/useSafariScrollPrevention';
import { useWordPressComEvents } from './hooks/useWordPressComEvents';
import { TIMEFRAMES } from './utils/formatters';
import { 
  parseEventTime, 
  getDateRangeBounds, 
  isDateInRange,
  getTodayDate
} from './utils/timeHelpers';
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
import './utils/gestureDebug'; // Import gesture debug utilities
import './utils/mobileGestureTest'; // Import mobile gesture test utilities
import './utils/comprehensiveFilterSync'; // Import comprehensive filter synchronization utilities

/**
 * Main application component.
 * FINAL PRODUCTION VERSION - Clean compass dial with WordPress.com integration and complete scroll prevention
 */
function App() {
  // Debug: Log events on app start
  console.log('🚀 App starting with events:', {
    totalEvents: COMPREHENSIVE_SAMPLE_EVENTS.length,
    firstEvent: COMPREHENSIVE_SAMPLE_EVENTS[0],
    categories: COMPREHENSIVE_SAMPLE_EVENTS.map(e => e.categoryPrimary).slice(0, 5)
  });

  // Mobile debugging
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  console.log('📱 Mobile Debug Info:', {
    isMobile,
    userAgent: navigator.userAgent.substring(0, 100) + '...',
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    connection: navigator.connection?.effectiveType || 'unknown',
    memory: navigator.deviceMemory || 'unknown',
    cores: navigator.hardwareConcurrency || 'unknown'
  });

  // Unified state management for map background integration
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState(COMPREHENSIVE_SAMPLE_EVENTS);
  const [activeFilters, setActiveFilters] = useState({
    time: 'All',
    day: 'All',
    category: 'All'
  });
  const [highlightedEvent, setHighlightedEvent] = useState(null);
  
  // Event display state
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [displayedEvent, setDisplayedEvent] = useState(null);
  const [highlightedEventId, setHighlightedEventId] = useState(null);

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
    
    // Also update activeFilters to trigger event filtering
    setActiveFilters(prevFilters => ({
      ...prevFilters,
      time: newTimeframe,
      day: newTimeframe // Assuming timeframe includes day info
    }));
  }, []);

  // Dynamic event filtering based on dial selection and filters
  const filterEventsByDialSelection = useCallback((events, category, subcategory, filters) => {
    // SAFETY CHECK: Ensure events array exists
    if (!events || events.length === 0) {
      console.error('❌ CRITICAL: No events array provided to filter!', { events });
      return [];
    }
    
    console.log('🔍 Starting filter pipeline:', {
      totalEvents: events.length,
      category: category?.label || 'None',
      subcategory: subcategory?.label || 'None',
      filters: filters
    });
    
    let filtered = [...events]; // Create copy to avoid mutation
    let step = 0;
    
    // 1. CATEGORY FILTER (from dial)
    if (category && category.label) {
      step++;
      const beforeCount = filtered.length;
      filtered = filtered.filter(event => event.categoryPrimary === category.label);
      console.log(`Step ${step} - Category filter (${category.label}): ${beforeCount} → ${filtered.length} events`);
      
      if (filtered.length === 0) {
        console.error(`❌ ZERO EVENTS after category filter!`);
        console.log('📊 Available categories in data:', [...new Set(events.map(e => e.categoryPrimary))]);
        console.log(`⚠️ Looking for: "${category.label}"`);
        return []; // Early exit to prevent further filtering
      }
    }
    
    // 2. SUBCATEGORY FILTER (from dial)
    if (subcategory && subcategory.label) {
      step++;
      const beforeCount = filtered.length;
      filtered = filtered.filter(event => event.categorySecondary === subcategory.label);
      console.log(`Step ${step} - Subcategory filter (${subcategory.label}): ${beforeCount} → ${filtered.length} events`);
      
      if (filtered.length === 0) {
        console.error(`❌ ZERO EVENTS after subcategory filter!`);
        console.log('📊 Available subcategories for', category?.label, ':', 
          [...new Set(events.filter(e => e.categoryPrimary === category?.label).map(e => e.categorySecondary))]);
        console.log(`⚠️ Looking for: "${subcategory.label}"`);
        return [];
      }
    }
    
    // 3. TIME FILTER (from TimePickerSlider)
    if (filters.time && filters.time !== 'All') {
      step++;
      const beforeCount = filtered.length;
      
      try {
        if (typeof filters.time === 'object' && filters.time.hours !== undefined) {
          // Specific time object { hours: 18, minutes: 0 }
          filtered = filtered.filter(event => {
            const eventTime = parseEventTime(event.time || event.startTime);
            const filterMinutes = filters.time.hours * 60 + filters.time.minutes;
            const eventMinutes = eventTime.hours * 60 + eventTime.minutes;
            return eventMinutes >= filterMinutes;
          });
          console.log(`Step ${step} - Time filter (${filters.time.hours}:${String(filters.time.minutes).padStart(2, '0')}): ${beforeCount} → ${filtered.length} events`);
        } else {
          // Time range string (Morning, Afternoon, Evening, Night)
          const timeRanges = {
            'Morning': { start: 6, end: 12 },
            'Afternoon': { start: 12, end: 18 },
            'Evening': { start: 18, end: 22 },
            'Night': { start: 22, end: 6 }
          };
          const range = timeRanges[filters.time];
          if (range) {
            filtered = filtered.filter(event => {
              const eventTime = parseEventTime(event.time || event.startTime);
              if (filters.time === 'Night') {
                return eventTime.hours >= 22 || eventTime.hours < 6;
              }
              return eventTime.hours >= range.start && eventTime.hours < range.end;
            });
            console.log(`Step ${step} - Time range filter (${filters.time}): ${beforeCount} → ${filtered.length} events`);
          }
        }
        
        if (filtered.length === 0) {
          console.warn(`⚠️ ZERO EVENTS after time filter (${JSON.stringify(filters.time)})`);
        }
      } catch (error) {
        console.error('❌ Time filter error:', error);
        // Don't filter if error - keep previous results
        filtered = events.slice(0, beforeCount);
      }
    }
    
    // 4. DAY/DATE RANGE FILTER (from DateRangeButton)
    if (filters.day && filters.day !== 'All') {
      step++;
      const beforeCount = filtered.length;
      
      try {
        const today = getTodayDate();
        const { startDate, endDate } = getDateRangeBounds(filters.day);
        
        filtered = filtered.filter(event => {
          const eventDate = event.date || today;
          return isDateInRange(eventDate, startDate, endDate);
        });
        console.log(`Step ${step} - Day filter (${filters.day}): ${beforeCount} → ${filtered.length} events`);
        
        if (filtered.length === 0) {
          console.warn(`⚠️ ZERO EVENTS after day filter (${filters.day})`);
          console.log('📊 Available days:', [...new Set(events.map(e => e.day))]);
        }
      } catch (error) {
        console.error('❌ Day filter error:', error);
        // Don't filter if error
        filtered = events.slice(0, beforeCount);
      }
    }
    
    // 5. CATEGORY TYPE FILTER (if using filter pills at top)
    if (filters.category && filters.category !== 'All') {
      step++;
      const beforeCount = filtered.length;
      filtered = filtered.filter(event => event.categoryPrimary === filters.category);
      console.log(`Step ${step} - Category type filter (${filters.category}): ${beforeCount} → ${filtered.length} events`);
    }
    
    console.log(`✅ Filter pipeline complete: ${filtered.length} events (from ${events.length} total)`);
    
    if (filtered.length === 0) {
      console.error('❌ NO EVENTS FOUND after all filters!');
      console.log('💡 Try resetting filters or checking event data matches filter criteria');
    }
    
    return filtered;
  }, []);

         // Update filtered events when selections change
         useEffect(() => {
         const filtered = filterEventsByDialSelection(
           COMPREHENSIVE_SAMPLE_EVENTS, 
           selectedCategory, 
           selectedSubcategory, 
           activeFilters
         );
         
         console.log('🔍 Event filtering debug:', {
           totalEvents: COMPREHENSIVE_SAMPLE_EVENTS.length,
             selectedCategory: selectedCategory?.label,
             selectedSubcategory: selectedSubcategory?.label,
             activeFilters: activeFilters,
             filteredCount: filtered.length,
             filteredEvents: filtered.slice(0, 3).map(e => ({ name: e.name, category: e.categoryPrimary, subcategory: e.categorySecondary }))
           });
           
          // Use filtered events directly (no fallback to all events)
          const finalEvents = filtered;
          console.log('Final events to display:', finalEvents.length);
          console.log('Final events sample:', finalEvents.slice(0, 3).map(e => ({ name: e.name, category: e.categoryPrimary, subcategory: e.categorySecondary })));
          
          setFilteredEvents(finalEvents);
         }, [selectedCategory, selectedSubcategory, activeFilters, filterEventsByDialSelection]);

  // Update displayed event when filtered events change
  useEffect(() => {
    if (filteredEvents.length > 0) {
      // Reset to first event when filters change
      setCurrentEventIndex(0);
      setDisplayedEvent(filteredEvents[0]);
      setHighlightedEventId(filteredEvents[0]?.id || null);
    } else {
      setDisplayedEvent(null);
      setHighlightedEventId(null);
    }
  }, [filteredEvents]);

  // Event navigation handlers
  const handleSwipeLeft = useCallback(() => {
    if (currentEventIndex < filteredEvents.length - 1) {
      const newIndex = currentEventIndex + 1;
      setCurrentEventIndex(newIndex);
      setDisplayedEvent(filteredEvents[newIndex]);
      setHighlightedEventId(filteredEvents[newIndex]?.id || null);
    }
  }, [currentEventIndex, filteredEvents]);

  const handleSwipeRight = useCallback(() => {
    if (currentEventIndex > 0) {
      const newIndex = currentEventIndex - 1;
      setCurrentEventIndex(newIndex);
      setDisplayedEvent(filteredEvents[newIndex]);
      setHighlightedEventId(filteredEvents[newIndex]?.id || null);
    }
  }, [currentEventIndex, filteredEvents]);

  const handleEventSelect = useCallback((event) => {
    console.log('🎯 Event selected:', event);
    setHighlightedEvent(event);
  }, []);

  // Handle category selection from dial
  const handleCategorySelect = useCallback((category) => {
    console.log('🎯 Category selected:', category);
    setSelectedCategory(category);
    setSelectedSubcategory(null); // Reset subcategory when category changes
  }, []);

  // Handle subcategory selection from dial
  const handleSubcategorySelect = useCallback((subcategory) => {
    console.log('🎯 Subcategory selected:', subcategory);
    setSelectedSubcategory(subcategory);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    setActiveFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value,
    }));
  }, []);

  // Handle time change from TimePickerSlider
  const handleTimeChange = useCallback((newTime) => {
    console.log('🕐 Time changed:', newTime);
    setActiveFilters(prevFilters => ({
      ...prevFilters,
      time: newTime
    }));
  }, []);

  // Handle date range change from DateRangeButton
  const handleDateRangeChange = useCallback((newDateRange) => {
    console.log('📅 Date range changed:', newDateRange);
    setActiveFilters(prevFilters => ({
      ...prevFilters,
      day: newDateRange
    }));
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

  // Initialize gesture debug utilities
  useEffect(() => {
    if (isWindowAvailable() && window.gestureDebug) {
      console.log('🧪 Gesture Debug utilities initialized');
      console.log('Available commands:');
      console.log('  window.gestureDebug.runGestureDiagnostics() - Run all gesture diagnostics');
      console.log('  window.gestureDebug.testGestureDetection() - Test touch event capture');
      console.log('  window.gestureDebug.testDialElements() - Test dial element detection');
      console.log('  window.gestureDebug.testGestureState() - Test gesture state');
    }
  }, []);

  // Initialize mobile gesture test utilities
  useEffect(() => {
    if (isWindowAvailable() && window.mobileGestureTest) {
      console.log('📱 Mobile Gesture Test utilities initialized');
      console.log('Available commands:');
      console.log('  window.mobileGestureTest.runMobileGestureTests() - Run all mobile gesture tests');
      console.log('  window.mobileGestureTest.testMobileGestures() - Test device and touch support');
      console.log('  window.mobileGestureTest.testTouchEvents() - Test touch event capture');
      console.log('  window.mobileGestureTest.testGestureDetection() - Test gesture detection');
    }
  }, []);

  // Initialize comprehensive filter sync utilities
  useEffect(() => {
    if (isWindowAvailable() && window.comprehensiveFilterSync) {
      console.log('🔍 Comprehensive Filter Sync utilities initialized');
      console.log('Available commands:');
      console.log('  window.comprehensiveFilterSync.runComprehensiveFilterTests() - Run all filter sync tests');
      console.log('  window.comprehensiveFilterSync.testAllFilterCombinations() - Test all filter combinations');
      console.log('  window.comprehensiveFilterSync.testFilterConsistency() - Test filter consistency');
      console.log('  window.comprehensiveFilterSync.testFilterPerformance() - Test filter performance');
      console.log('  window.comprehensiveFilterSync.applyFiltersWithLogging() - Apply filters with detailed logging');
    }
  }, []);

  // Comprehensive component rendering debug
  useEffect(() => {
    const debugComponents = () => {
      const components = {
        dial: document.querySelector('.enhanced-dial'),
        subcategoryDial: document.querySelector('.subcategory-dial'),
        subcategoryItems: document.querySelectorAll('.subcategory-dial > *'),
        eventDisplay: document.querySelector('[data-testid="event-display"]'),
        filterPills: document.querySelectorAll('.filter-pill'),
        map: document.querySelector('.event-discovery-map')
      };

      console.log('🔍 Component rendering debug:', {
        dial: {
          found: !!components.dial,
          visible: components.dial ? components.dial.offsetWidth > 0 : false,
          dimensions: components.dial ? `${components.dial.offsetWidth}x${components.dial.offsetHeight}` : '0x0'
        },
        subcategoryDial: {
          found: !!components.subcategoryDial,
          visible: components.subcategoryDial ? components.subcategoryDial.offsetWidth > 0 : false,
          dimensions: components.subcategoryDial ? `${components.subcategoryDial.offsetWidth}x${components.subcategoryDial.offsetHeight}` : '0x0',
          items: components.subcategoryItems.length
        },
        eventDisplay: {
          found: !!components.eventDisplay,
          visible: components.eventDisplay ? components.eventDisplay.offsetWidth > 0 : false,
          dimensions: components.eventDisplay ? `${components.eventDisplay.offsetWidth}x${components.eventDisplay.offsetHeight}` : '0x0'
        },
        filterPills: {
          found: components.filterPills.length,
          visible: Array.from(components.filterPills).filter(pill => pill.offsetWidth > 0).length,
          dimensions: Array.from(components.filterPills).map(pill => `${pill.offsetWidth}x${pill.offsetHeight}`)
        },
        map: {
          found: !!components.map,
          visible: components.map ? components.map.offsetWidth > 0 : false,
          dimensions: components.map ? `${components.map.offsetWidth}x${components.map.offsetHeight}` : '0x0'
        }
      });
    };

    // Run debug after components mount
    setTimeout(debugComponents, 1000);
  }, []);

  // Map visibility debugging
  useEffect(() => {
    const debugMapVisibility = () => {
      const mapLayer = document.querySelector('.map-background-layer');
      const fallbackMap = document.querySelector('.fallback-map');
      const eventDiscoveryMap = document.querySelector('.event-discovery-map');
      
      console.log('🗺️ Map visibility debug:', {
        mapLayer: {
          found: !!mapLayer,
          visible: mapLayer ? mapLayer.offsetWidth > 0 : false,
          dimensions: mapLayer ? `${mapLayer.offsetWidth}x${mapLayer.offsetHeight}` : '0x0',
          zIndex: mapLayer ? window.getComputedStyle(mapLayer).zIndex : 'none',
          opacity: mapLayer ? window.getComputedStyle(mapLayer).opacity : 'none',
          background: mapLayer ? window.getComputedStyle(mapLayer).background : 'none'
        },
        fallbackMap: {
          found: !!fallbackMap,
          visible: fallbackMap ? fallbackMap.offsetWidth > 0 : false,
          dimensions: fallbackMap ? `${fallbackMap.offsetWidth}x${fallbackMap.offsetHeight}` : '0x0'
        },
        eventDiscoveryMap: {
          found: !!eventDiscoveryMap,
          visible: eventDiscoveryMap ? eventDiscoveryMap.offsetWidth > 0 : false,
          dimensions: eventDiscoveryMap ? `${eventDiscoveryMap.offsetWidth}x${eventDiscoveryMap.offsetHeight}` : '0x0'
        }
      });
    };

    setTimeout(debugMapVisibility, 1500);
  }, []);

  return (
    <ErrorBoundary name="App">
      <div className="unified-app-container">
        {/* Full-screen Map Background */}
       <div 
         className="map-background-layer"
         style={{
           zIndex: 1
         }}
       >
          <EventDiscoveryMap 
            events={filteredEvents}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onEventSelect={handleEventSelect}
            highlightedEventId={displayedEvent?.id || highlightedEventId}
          />
        </div>
        
        {/* Event Information Panel - Above Dial */}
       <div 
         className="event-info-panel"
         style={{
           zIndex: 10
         }}
       >
          <EventDisplayCard 
            event={displayedEvent}
            currentIndex={currentEventIndex}
            totalEvents={filteredEvents.length}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onEventSelect={handleEventSelect}
            isLoading={false}
          />
        </div>
        
        {/* Repositioned Dial Interface - Bottom */}
       <div 
         className="dial-foreground-layer"
         style={{
           zIndex: 15
         }}
       >
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
            selectedTime={activeFilters.time}
            onTimeChange={handleTimeChange}
            selectedDateRange={activeFilters.day}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>
        
        {/* Time Controls - Right Side (Unchanged) */}
        <div className="time-controls-overlay">
          {/* Time picker and day toggle will be added here */}
        </div>
        
        {/* Filter Controls - Visible for testing */}
        <div className="controls-overlay" style={{ display: 'block' }}>
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
