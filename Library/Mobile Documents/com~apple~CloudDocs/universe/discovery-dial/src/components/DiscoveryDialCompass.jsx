import { useState, useMemo, useCallback, useEffect, memo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useRenderMonitor, useStateChangeMonitor } from '../hooks/useRenderMonitor';
import { useStableCallback, useStableEffect, useBatchedState, useStableKeys } from '../hooks/useStableCallback';
import { useComponentCleanup } from '../hooks/useComponentCleanup';
import EnhancedDial from './EnhancedDial';
import TimeSlider from './TimeSlider';
import TimeframeToggle from './TimeframeToggle';
import SwipeableEventReadout from './SwipeableEventReadout';
import EnhancedEventInfo from './EnhancedEventInfo';
import VisualFeedbackSystem, { HapticFeedback, AudioFeedback, ScreenReaderAnnouncements } from './VisualFeedbackSystem';
import SystemIntegrationTest from './SystemIntegrationTest';
import RotatingDaySelector from './RotatingDaySelector';
// Removed heavy components for performance
// import GestureTestingSuite from './GestureTestingSuite';
// import PerformanceMonitor from './PerformanceMonitor';
import { CATEGORIES, CATEGORY_ORDER, CATEGORY_ICONS } from '../data/categories';
import { TIMEFRAMES, formatTime, calculateTimeframeWindow, debounce } from '../utils/formatters';

const radiansToDeg = (r) => r * (180 / Math.PI);

const DiscoveryDialCompass = () => {
  // Render monitoring
  const renderCount = useRenderMonitor('DiscoveryDialCompass');
  
  // State management with batched updates
  const [state, setState] = useBatchedState({
    catIndex: 0, // 0..3 → N,E,S,W
    subIndex: 0, // per category
    startHour: 17, // 5AM..24
    timeframeIndex: 0, // 0..3
    eventResults: [],
    isLoading: false,
    hasSelectedPrimary: false,
    daySelectorIndex: 0
  });
  
  // Destructure state for easier access
  const { catIndex, subIndex, startHour, timeframeIndex, eventResults, isLoading, hasSelectedPrimary, daySelectorIndex } = state;
  
  // State change monitoring
  useStateChangeMonitor(catIndex, 'catIndex');
  useStateChangeMonitor(subIndex, 'subIndex');
  useStateChangeMonitor(startHour, 'startHour');
  useStateChangeMonitor(timeframeIndex, 'timeframeIndex');
  useStateChangeMonitor(eventResults.length, 'eventResults.length');
  
  // Gesture feedback state with batched updates
  const [gestureState, setGestureState] = useBatchedState({
    type: null,
    isActive: false,
    direction: null,
    categoryLabel: null,
    subcategoryLabel: null,
    eventTitle: null
  });

  // System integration test state
  const [showSystemTest, setShowSystemTest] = useState(false);
  
  // Component cleanup
  const addCleanup = useComponentCleanup();

  // Testing suite state - REMOVED FOR PERFORMANCE
  // const [showGestureTesting, setShowGestureTesting] = useState(false);
  // const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  // Motion values for dial rotation
  const rotate = useMotionValue(0);
  const snapped = useTransform(rotate, (r) => {
    const deg = ((r % 360) + 360) % 360;
    const snap = Math.round(deg / 90) * 90;
    return snap;
  });

  // Get active category and subcategory
  const activeKey = CATEGORY_ORDER[catIndex];
  const activeCategory = useMemo(
    () => CATEGORIES.find(c => c.key === activeKey),
    [activeKey]
  );

  // Haptic feedback helper
  const triggerHaptic = useCallback((type = 'light') => {
    if (navigator.vibrate) {
      const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 30;
      navigator.vibrate(duration);
    }
  }, []);

      // Stable debounced event fetching - FIXED: Use stable callback to prevent infinite loop
      const fetchEvents = useStableCallback(async (filters) => {
        setState({ isLoading: true });
        try {
          // Get current category info from filters instead of state
          const currentCategory = CATEGORIES.find(c => c.key === filters.primary);
          const currentKey = filters.primary;
        
      // Generate recommendations based on current category
      const generateRecommendations = (category) => {
        const recommendationMap = {
          social: [
            { id: 'rec-1', title: 'Networking Mixer' },
            { id: 'rec-2', title: 'Community Festival' },
            { id: 'rec-3', title: 'Cultural Night' },
            { id: 'rec-4', title: 'Volunteer Event' }
          ],
          education: [
            { id: 'rec-1', title: 'Tech Workshop' },
            { id: 'rec-2', title: 'Language Exchange' },
            { id: 'rec-3', title: 'Book Club' },
            { id: 'rec-4', title: 'Lecture Series' }
          ],
          recreation: [
            { id: 'rec-1', title: 'Hiking Group' },
            { id: 'rec-2', title: 'Sports League' },
            { id: 'rec-3', title: 'Fitness Class' },
            { id: 'rec-4', title: 'Outdoor Adventure' }
          ],
          professional: [
            { id: 'rec-1', title: 'Industry Conference' },
            { id: 'rec-2', title: 'Career Fair' },
            { id: 'rec-3', title: 'Business Meetup' },
            { id: 'rec-4', title: 'Skill Building' }
          ]
        };
        return recommendationMap[category] || [];
      };

      // Mock API call - replace with actual implementation
      const mockEvents = [
        {
          id: 'event-1', // FIXED: Stable unique key
          title: 'Jazz in the Garden',
          time: formatTime(filters.startHour),
          city: 'Washington, DC',
          distance: '2.3 mi',
          categoryLabel: currentCategory?.label || 'Event',
          categoryIcon: CATEGORY_ICONS[currentKey] || '🎯',
          recommendations: generateRecommendations(currentKey)
        },
        {
          id: 'event-2', // FIXED: Stable unique key
          title: 'Art Gallery Opening',
          time: formatTime(filters.startHour + 1),
          city: 'Washington, DC',
          distance: '1.8 mi',
          categoryLabel: currentCategory?.label || 'Event',
          categoryIcon: CATEGORY_ICONS[currentKey] || '🎯',
          recommendations: generateRecommendations(currentKey)
        },
        {
          id: 'event-3', // FIXED: Stable unique key
          title: 'Community Workshop',
          time: formatTime(filters.startHour + 2),
          city: 'Washington, DC',
          distance: '3.2 mi',
          categoryLabel: currentCategory?.label || 'Event',
          categoryIcon: CATEGORY_ICONS[currentKey] || '🎯',
          recommendations: generateRecommendations(currentKey)
        }
      ];
          setState({ eventResults: mockEvents, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch events:', error);
          setState({
            eventResults: [{
              id: 'error-event', // FIXED: Stable unique key
              title: "Can't load right now",
              time: formatTime(filters.startHour),
              city: 'Washington, DC',
              distance: null,
              categoryLabel: 'Error',
              categoryIcon: '⚠️'
            }],
            isLoading: false
          });
        }
      }, []);

      // Debounced version of fetchEvents
      const debouncedFetchEvents = useStableCallback(
        debounce(fetchEvents, 300),
        [fetchEvents]
      );

  // Enhanced gesture handlers for the new system - FIXED: Use batched state updates
  const handlePrimaryCategoryChange = useStableCallback((newIndex) => {
    // Batch all state updates
    setState({
      catIndex: newIndex,
      hasSelectedPrimary: true,
      subIndex: 0 // Reset subcategory when changing main category
    });
    
    // Set gesture feedback
    const newCategory = CATEGORIES.find(c => c.key === CATEGORY_ORDER[newIndex]);
    setGestureState({
      type: 'DIAL_VERTICAL_SWIPE',
      isActive: true,
      direction: newIndex > catIndex ? 'up' : 'down',
      categoryLabel: newCategory?.label,
      subcategoryLabel: null,
      eventTitle: null
    });
    
    // Fetch events for new category
    debouncedFetchEvents({
      primary: CATEGORY_ORDER[newIndex],
      subcategory: newCategory?.sub[0] || 'General',
      startHour,
      timeframe: TIMEFRAMES[timeframeIndex]
    });
    
    // Clear feedback after animation
    setTimeout(() => {
      setGestureState(prev => ({ ...prev, isActive: false }));
    }, 300);
  }, [catIndex, startHour, timeframeIndex, debouncedFetchEvents, setState, setGestureState]);

  // Handle day selector change - FIXED: Use stable callback
  const handleDaySelectorChange = useStableCallback((newIndex) => {
    setState({ daySelectorIndex: newIndex });
    
    // Fetch events with current state values
    const currentCategory = CATEGORIES.find(c => c.key === CATEGORY_ORDER[catIndex]);
    debouncedFetchEvents({
      primary: CATEGORY_ORDER[catIndex],
      subcategory: currentCategory?.sub[subIndex] || 'General',
      startHour,
      timeframe: TIMEFRAMES[newIndex]
    });
  }, [catIndex, subIndex, startHour, debouncedFetchEvents, setState]);

  // Handle timeframe toggle - FIXED: Use stable callback
  const handleTimeframeToggle = useStableCallback(() => {
    const newIndex = (timeframeIndex + 1) % TIMEFRAMES.length;
    setState({ timeframeIndex: newIndex });
    
    // Fetch events with current state values
    const currentCategory = CATEGORIES.find(c => c.key === CATEGORY_ORDER[catIndex]);
    debouncedFetchEvents({
      primary: CATEGORY_ORDER[catIndex],
      subcategory: currentCategory?.sub[subIndex] || 'General',
      startHour,
      timeframe: TIMEFRAMES[newIndex]
    });
  }, [catIndex, subIndex, startHour, timeframeIndex, debouncedFetchEvents, setState]);

  // Handle subcategory change with gesture feedback - FIXED: Use stable callback
  const handleSubcategoryChange = useStableCallback((newSubIndex) => {
    setState({ subIndex: newSubIndex });
    
    // Set gesture feedback
    const currentCategory = CATEGORIES.find(c => c.key === CATEGORY_ORDER[catIndex]);
    setGestureState({
      type: 'DIAL_CIRCULAR_DRAG',
      isActive: true,
      direction: newSubIndex > subIndex ? 'clockwise' : 'counterclockwise',
      categoryLabel: currentCategory?.label,
      subcategoryLabel: currentCategory?.sub[newSubIndex],
      eventTitle: null
    });
    
    // Debounced fetch for subcategory change
    debouncedFetchEvents({
      primary: CATEGORY_ORDER[catIndex],
      subcategory: currentCategory?.sub[newSubIndex] || 'General',
      startHour,
      timeframe: TIMEFRAMES[timeframeIndex]
    });
    
    // Clear feedback after animation
    setTimeout(() => {
      setGestureState(prev => ({ ...prev, isActive: false }));
    }, 300);
  }, [catIndex, subIndex, startHour, timeframeIndex, debouncedFetchEvents, setState, setGestureState]);

  // Handle time slider change - FIXED: Use stable callback
  const handleTimeSliderChange = useStableCallback((newHour) => {
    setState({ startHour: newHour });
    triggerHaptic('light');
    
    // Debounced fetch for time change - use current state values
    const currentCategory = CATEGORIES.find(c => c.key === CATEGORY_ORDER[catIndex]);
    debouncedFetchEvents({
      primary: CATEGORY_ORDER[catIndex],
      subcategory: currentCategory?.sub[subIndex] || 'General',
      startHour: newHour,
      timeframe: TIMEFRAMES[timeframeIndex]
    });
  }, [catIndex, subIndex, timeframeIndex, debouncedFetchEvents, triggerHaptic, setState]);

  // Handle event navigation with gesture feedback - FIXED: Use stable callback
  const handleEventNavigation = useStableCallback((direction) => {
    // This will be handled by SwipeableEventReadout
    // We just need to provide feedback
    const currentEvent = eventResults[0]; // Get current event
    setGestureState({
      type: 'EVENT_HORIZONTAL_SWIPE',
      isActive: true,
      direction,
      categoryLabel: null,
      subcategoryLabel: null,
      eventTitle: currentEvent?.title
    });
    
    // Clear feedback after animation
    setTimeout(() => {
      setGestureState(prev => ({ ...prev, isActive: false }));
    }, 300);
  }, [eventResults, setGestureState]);

  // Handle event readout interactions - FIXED: Use stable callbacks
  const handleEventSingleTap = useStableCallback((event) => {
    // Expand quick details (future implementation)
    console.log('Single tap on event:', event.title);
  }, []);

  const handleEventDoubleTap = useStableCallback((event) => {
    // Open full event page (future implementation)
    console.log('Double tap on event:', event.title);
  }, []);

  const handleEventChange = useStableCallback((event, index) => {
    console.log('Event changed to:', event.title, 'at index:', index);
  }, []);

  // Enhanced event info handlers - FIXED: Use stable callbacks
  const handleRecommendationClick = useStableCallback((recommendation) => {
    console.log('Recommendation clicked:', recommendation.title);
    // Future: Navigate to similar events or filter by recommendation
  }, []);

  const handleEventAction = useStableCallback((action, event) => {
    console.log('Event action:', action, 'for event:', event.title);
    switch (action) {
      case 'save':
        // Future: Save event to user's saved events
        break;
      case 'directions':
        // Future: Open maps with event location
        break;
      default:
        break;
    }
  }, []);

  // Get faded state for labels - FIXED: Use stable callback
  const getLabelClassName = useStableCallback((index) => {
    return index === catIndex ? 'text-white' : 'text-white/60';
  }, [catIndex]);

  // Keyboard shortcut for system test (Ctrl/Cmd + Shift + T) - FIXED: Use stable effect
  useStableEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setShowSystemTest(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    addCleanup(() => document.removeEventListener('keydown', handleKeyDown));
  }, [addCleanup]);

  // Prepare labels for outer ring
  const outerRingLabels = useMemo(() => [
    { pos: 'N', text: CATEGORIES.find(c => c.key === 'social').label, className: getLabelClassName(0) },
    { pos: 'E', text: CATEGORIES.find(c => c.key === 'education').label, className: getLabelClassName(1) },
    { pos: 'S', text: CATEGORIES.find(c => c.key === 'recreation').label, className: getLabelClassName(2) },
    { pos: 'W', text: CATEGORIES.find(c => c.key === 'professional').label, className: getLabelClassName(3) },
  ], [getLabelClassName]);

  return (
    <div 
      className="discovery-dial-container relative mx-auto h-screen w-full max-w-[390px] bg-white text-black overflow-hidden"
      role="application"
      aria-label="Event discovery compass"
      style={{
        backgroundColor: '#FFFFFF',
        color: '#000000',
        minHeight: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Debug indicator - temporary visual confirmation */}
      <div 
        className="absolute top-4 left-4 w-3 h-3 bg-blue-500 rounded-full z-50"
        title="Main container positioned here"
      />
      {/* Enhanced dial with three-tier gesture system */}
      <EnhancedDial
        onPrimaryCategoryChange={handlePrimaryCategoryChange}
        onSubcategoryChange={handleSubcategoryChange}
        onEventChange={handleEventNavigation}
        currentPrimaryIndex={catIndex}
        currentSubIndex={subIndex}
        hasSelectedPrimary={hasSelectedPrimary}
      />

      {/* DELETED: Category filters - now handled by dial directional swipes */}

      {/* Middle-right time slider - gesture optimized */}
      <div className="time-slider">
        <TimeSlider
          value={startHour}
          onChange={handleTimeSliderChange}
          min={5}
          max={24}
        />
      </div>

          {/* Bottom rotating day selector */}
          <div className="absolute inset-x-0 bottom-32 flex justify-center">
            <RotatingDaySelector
              currentIndex={daySelectorIndex}
              onDayChange={handleDaySelectorChange}
            />
          </div>

          {/* Enhanced event info with recommendations */}
          <EnhancedEventInfo
            currentEvent={eventResults[0] || null}
            recommendations={eventResults[0]?.recommendations || []}
            onRecommendationClick={handleRecommendationClick}
            onEventAction={handleEventAction}
          />

          {/* Swipeable event navigation - hidden but functional */}
          <div className="hidden">
            <SwipeableEventReadout 
              events={eventResults}
              onSingleTap={handleEventSingleTap}
              onDoubleTap={handleEventDoubleTap}
              onEventChange={handleEventChange}
            />
          </div>

      {/* Center event bubble removed - INTEGRATED INTO DIAL CENTER (A.3 Content Integration) */}

      {/* Loading indicator */}
      {isLoading && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}

          {/* Visual feedback system */}
          <VisualFeedbackSystem
            gestureType={gestureState.type}
            isActive={gestureState.isActive}
            direction={gestureState.direction}
            categoryLabel={gestureState.categoryLabel}
            subcategoryLabel={gestureState.subcategoryLabel}
            eventTitle={gestureState.eventTitle}
          />

          {/* Haptic feedback */}
          <HapticFeedback
            gestureType={gestureState.type}
            isActive={gestureState.isActive}
          />

          {/* Audio feedback (optional) */}
          <AudioFeedback
            gestureType={gestureState.type}
            isActive={gestureState.isActive}
          />

          {/* Screen reader announcements */}
          <ScreenReaderAnnouncements
            gestureType={gestureState.type}
            isActive={gestureState.isActive}
            categoryLabel={gestureState.categoryLabel}
            subcategoryLabel={gestureState.subcategoryLabel}
            eventTitle={gestureState.eventTitle}
          />

          {/* Testing Suite Components - REMOVED FOR PERFORMANCE */}

          {/* System Integration Test */}
          <SystemIntegrationTest
            isVisible={showSystemTest}
            onClose={() => setShowSystemTest(false)}
          />
        </div>
      );
    };

// Memoize the component to prevent unnecessary re-renders
export default memo(DiscoveryDialCompass);
