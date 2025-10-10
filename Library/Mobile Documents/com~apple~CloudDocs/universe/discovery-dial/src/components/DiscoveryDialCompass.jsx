import { useState, useMemo, useCallback, useEffect, memo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import DialOuterRing from './DialOuterRing';
import DialInnerRing from './DialInnerRing';
import TimeSlider from './TimeSlider';
import TimeframeToggle from './TimeframeToggle';
import SwipeableEventReadout from './SwipeableEventReadout';
import { CATEGORIES, CATEGORY_ORDER, CATEGORY_ICONS } from '../data/categories';
import { TIMEFRAMES, formatTime, calculateTimeframeWindow, debounce } from '../utils/formatters';

const radiansToDeg = (r) => r * (180 / Math.PI);

const DiscoveryDialCompass = () => {
  // State management
  const [catIndex, setCatIndex] = useState(0); // 0..3 → N,E,S,W
  const [subIndex, setSubIndex] = useState(0); // per category
  const [startHour, setStartHour] = useState(17); // 5AM..24
  const [timeframeIndex, setTimeframeIndex] = useState(0); // 0..3
  const [eventResults, setEventResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSelectedPrimary, setHasSelectedPrimary] = useState(false);

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

  // Stable debounced event fetching - FIXED: Remove dependencies to prevent infinite loop
  const debouncedFetchEvents = useCallback(
    debounce(async (filters) => {
      setIsLoading(true);
      try {
        // Get current category info from filters instead of state
        const currentCategory = CATEGORIES.find(c => c.key === filters.primary);
        const currentKey = filters.primary;
        
        // Mock API call - replace with actual implementation
        const mockEvents = [
          {
            id: 'event-1', // FIXED: Stable unique key
            title: 'Jazz in the Garden',
            time: formatTime(filters.startHour),
            city: 'Washington, DC',
            distance: '2.3 mi',
            categoryLabel: currentCategory?.label || 'Event',
            categoryIcon: CATEGORY_ICONS[currentKey] || '🎯'
          },
          {
            id: 'event-2', // FIXED: Stable unique key
            title: 'Art Gallery Opening',
            time: formatTime(filters.startHour + 1),
            city: 'Washington, DC',
            distance: '1.8 mi',
            categoryLabel: currentCategory?.label || 'Event',
            categoryIcon: CATEGORY_ICONS[currentKey] || '🎯'
          },
          {
            id: 'event-3', // FIXED: Stable unique key
            title: 'Community Workshop',
            time: formatTime(filters.startHour + 2),
            city: 'Washington, DC',
            distance: '3.2 mi',
            categoryLabel: currentCategory?.label || 'Event',
            categoryIcon: CATEGORY_ICONS[currentKey] || '🎯'
          }
        ];
        setEventResults(mockEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setEventResults([{
          id: 'error-event', // FIXED: Stable unique key
          title: "Can't load right now",
          time: formatTime(filters.startHour),
          city: 'Washington, DC',
          distance: null,
          categoryLabel: 'Error',
          categoryIcon: '⚠️'
        }]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [] // FIXED: Empty dependency array to prevent infinite recreation
  );

  // Handle dial rotation - FIXED: Remove dependencies to prevent infinite loop
  const onDragEnd = useCallback((_, info) => {
    const deltaDeg = radiansToDeg(info.delta.rotate ?? 0) || (info.velocity.x / 10);
    const current = ((rotate.get() + deltaDeg) % 360 + 360) % 360;
    const snap = Math.round(current / 90) % 4;
    const newCatIndex = (4 - snap) % 4; // clockwise → index
    
    setCatIndex(newCatIndex);
    setHasSelectedPrimary(true);
    rotate.set(snap * 90);
    setSubIndex(0); // Reset subcategory when changing main category
    
    // Haptic feedback
    triggerHaptic('light');
    
    // Fetch events for new category - use current state values
    const newCategory = CATEGORIES.find(c => c.key === CATEGORY_ORDER[newCatIndex]);
    debouncedFetchEvents({
      primary: CATEGORY_ORDER[newCatIndex],
      subcategory: newCategory?.sub[0] || 'General',
      startHour,
      timeframe: TIMEFRAMES[timeframeIndex]
    });
  }, [rotate, triggerHaptic, debouncedFetchEvents]); // FIXED: Minimal dependencies

  // Handle timeframe toggle - FIXED: Remove dependencies to prevent infinite loop
  const handleTimeframeToggle = useCallback(() => {
    setTimeframeIndex(prev => {
      const newIndex = (prev + 1) % TIMEFRAMES.length;
      
      // Fetch events with current state values
      const currentCategory = CATEGORIES.find(c => c.key === CATEGORY_ORDER[catIndex]);
      debouncedFetchEvents({
        primary: CATEGORY_ORDER[catIndex],
        subcategory: currentCategory?.sub[subIndex] || 'General',
        startHour,
        timeframe: TIMEFRAMES[newIndex]
      });
      
      return newIndex;
    });
  }, [catIndex, subIndex, startHour, debouncedFetchEvents]); // FIXED: Minimal dependencies

  // Handle subcategory change - FIXED: Remove dependencies to prevent infinite loop
  const handleSubcategoryChange = useCallback((newSubIndex) => {
    setSubIndex(newSubIndex);
    triggerHaptic('light');
    
    // Debounced fetch for subcategory change - use current state values
    const currentCategory = CATEGORIES.find(c => c.key === CATEGORY_ORDER[catIndex]);
    debouncedFetchEvents({
      primary: CATEGORY_ORDER[catIndex],
      subcategory: currentCategory?.sub[newSubIndex] || 'General',
      startHour,
      timeframe: TIMEFRAMES[timeframeIndex]
    });
  }, [catIndex, startHour, timeframeIndex, debouncedFetchEvents, triggerHaptic]); // FIXED: Minimal dependencies

  // Handle time slider change - FIXED: Remove dependencies to prevent infinite loop
  const handleTimeSliderChange = useCallback((newHour) => {
    setStartHour(newHour);
    triggerHaptic('light');
    
    // Debounced fetch for time change - use current state values
    const currentCategory = CATEGORIES.find(c => c.key === CATEGORY_ORDER[catIndex]);
    debouncedFetchEvents({
      primary: CATEGORY_ORDER[catIndex],
      subcategory: currentCategory?.sub[subIndex] || 'General',
      startHour: newHour,
      timeframe: TIMEFRAMES[timeframeIndex]
    });
  }, [catIndex, subIndex, timeframeIndex, debouncedFetchEvents, triggerHaptic]); // FIXED: Minimal dependencies

  // Handle event readout interactions
  const handleEventSingleTap = useCallback((event) => {
    // Expand quick details (future implementation)
    console.log('Single tap on event:', event.title);
  }, []);

  const handleEventDoubleTap = useCallback((event) => {
    // Open full event page (future implementation)
    console.log('Double tap on event:', event.title);
  }, []);

  const handleEventChange = useCallback((event, index) => {
    console.log('Event changed to:', event.title, 'at index:', index);
  }, []);

  // Get faded state for labels
  const getLabelClassName = useCallback((index) => {
    return index === catIndex ? 'text-white' : 'text-white/60';
  }, [catIndex]);

  // Prepare labels for outer ring
  const outerRingLabels = useMemo(() => [
    { pos: 'N', text: CATEGORIES.find(c => c.key === 'social').label, className: getLabelClassName(0) },
    { pos: 'E', text: CATEGORIES.find(c => c.key === 'education').label, className: getLabelClassName(1) },
    { pos: 'S', text: CATEGORIES.find(c => c.key === 'recreation').label, className: getLabelClassName(2) },
    { pos: 'W', text: CATEGORIES.find(c => c.key === 'professional').label, className: getLabelClassName(3) },
  ], [getLabelClassName]);

  return (
    <div 
      className="relative mx-auto h-screen w-full max-w-[390px] bg-white text-black overflow-hidden"
      role="application"
      aria-label="Event discovery compass"
      style={{
        backgroundColor: '#FFFFFF',
        color: '#000000',
        minHeight: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Main dial cluster */}
      <div className="relative mx-auto mt-16 h-[280px] w-[280px]">
        {/* Outer ring with primary categories */}
        <DialOuterRing
          rotate={snapped}
          labels={outerRingLabels}
          onDragEnd={onDragEnd}
        />
        
        {/* Inner subcategory ring - only visible after primary selection */}
        <DialInnerRing
          items={activeCategory.sub}
          activeIndex={subIndex}
          onChange={handleSubcategoryChange}
          isVisible={hasSelectedPrimary}
        />
      </div>

      {/* Category filters - top horizontal row */}
      <div className="category-filters">
        {CATEGORIES.map((category, index) => (
          <div
            key={`category-${category.key}`} // FIXED: Stable unique key
            className={`category-filter-chip ${catIndex === index ? 'active' : ''}`}
            onClick={() => setCatIndex(index)}
          >
            {category.label.split(' ')[0]}
          </div>
        ))}
      </div>

      {/* Middle-right time slider - gesture optimized */}
      <div className="time-slider">
        <TimeSlider
          value={startHour}
          onChange={handleTimeSliderChange}
          min={5}
          max={24}
        />
      </div>

      {/* Bottom timeframe toggle */}
      <div className="absolute inset-x-0 bottom-32 flex justify-center">
        <TimeframeToggle
          label={TIMEFRAMES[timeframeIndex]}
          onNext={handleTimeframeToggle}
        />
      </div>

      {/* Bottom event readout with swipe navigation */}
      <div className="event-readout">
        <SwipeableEventReadout 
          events={eventResults}
          onSingleTap={handleEventSingleTap}
          onDoubleTap={handleEventDoubleTap}
          onEventChange={handleEventChange}
        />
      </div>

      {/* Center event bubble (translucent overlay) - only visible after primary selection */}
      {hasSelectedPrimary && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     w-16 h-16 rounded-full bg-white/8 backdrop-blur-sm
                     border border-white/20 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-white/80 text-xs font-medium text-center leading-tight">
            {activeCategory.sub[subIndex]}
          </span>
        </motion.div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(DiscoveryDialCompass);
