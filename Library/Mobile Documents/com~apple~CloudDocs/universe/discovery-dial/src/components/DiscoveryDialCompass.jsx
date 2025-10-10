import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import DialOuterRing from './DialOuterRing';
import DialInnerRing from './DialInnerRing';
import TimeSlider from './TimeSlider';
import TimeframeToggle from './TimeframeToggle';
import EventReadout from './EventReadout';
import { CATEGORIES, CATEGORY_ORDER, CATEGORY_ICONS } from '../data/categories';
import { TIMEFRAMES, formatTime, calculateTimeframeWindow, debounce } from '../utils/formatters';

const radiansToDeg = (r) => r * (180 / Math.PI);

const DiscoveryDialCompass = () => {
  // State management
  const [catIndex, setCatIndex] = useState(0); // 0..3 → N,E,S,W
  const [subIndex, setSubIndex] = useState(0); // per category
  const [startHour, setStartHour] = useState(17); // 5AM..24
  const [timeframeIndex, setTimeframeIndex] = useState(0); // 0..3
  const [selectedEvent, setSelectedEvent] = useState(null);
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

  // Debounced event fetching
  const debouncedFetchEvents = useCallback(
    debounce(async (filters) => {
      setIsLoading(true);
      try {
        // Mock API call - replace with actual implementation
        const mockEvent = {
          title: 'Jazz in the Garden',
          time: formatTime(filters.startHour),
          city: 'Washington, DC',
          distance: '2.3 mi',
          categoryLabel: activeCategory.label,
          categoryIcon: CATEGORY_ICONS[activeKey]
        };
        setSelectedEvent(mockEvent);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setSelectedEvent({
          title: "Can't load right now",
          time: formatTime(filters.startHour),
          city: 'Washington, DC',
          distance: null,
          categoryLabel: activeCategory.label,
          categoryIcon: CATEGORY_ICONS[activeKey]
        });
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [activeCategory, activeKey]
  );

  // Handle dial rotation
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
    
    // Fetch events for new category
    debouncedFetchEvents({
      primary: CATEGORY_ORDER[newCatIndex],
      subcategory: activeCategory.sub[0],
      startHour,
      timeframe: TIMEFRAMES[timeframeIndex]
    });
  }, [rotate, startHour, timeframeIndex, activeCategory, debouncedFetchEvents, triggerHaptic]);

  // Handle timeframe toggle
  const handleTimeframeToggle = useCallback(() => {
    const newIndex = (timeframeIndex + 1) % TIMEFRAMES.length;
    setTimeframeIndex(newIndex);
    
    // Immediate fetch for timeframe change
    debouncedFetchEvents({
      primary: activeKey,
      subcategory: activeCategory.sub[subIndex],
      startHour,
      timeframe: TIMEFRAMES[newIndex]
    });
  }, [timeframeIndex, activeKey, activeCategory, subIndex, startHour, debouncedFetchEvents]);

  // Handle subcategory change
  const handleSubcategoryChange = useCallback((newSubIndex) => {
    setSubIndex(newSubIndex);
    triggerHaptic('light');
    
    // Debounced fetch for subcategory change
    debouncedFetchEvents({
      primary: activeKey,
      subcategory: activeCategory.sub[newSubIndex],
      startHour,
      timeframe: TIMEFRAMES[timeframeIndex]
    });
  }, [activeKey, activeCategory, startHour, timeframeIndex, debouncedFetchEvents, triggerHaptic]);

  // Handle time slider change
  const handleTimeSliderChange = useCallback((newHour) => {
    setStartHour(newHour);
    triggerHaptic('light');
    
    // Debounced fetch for time change
    debouncedFetchEvents({
      primary: activeKey,
      subcategory: activeCategory.sub[subIndex],
      startHour: newHour,
      timeframe: TIMEFRAMES[timeframeIndex]
    });
  }, [activeKey, activeCategory, subIndex, timeframeIndex, debouncedFetchEvents, triggerHaptic]);

  // Handle event readout interactions
  const handleEventSingleTap = useCallback((event) => {
    // Expand quick details (future implementation)
    console.log('Single tap on event:', event.title);
  }, []);

  const handleEventDoubleTap = useCallback((event) => {
    // Open full event page (future implementation)
    console.log('Double tap on event:', event.title);
  }, []);

  // Get faded state for labels
  const getLabelClassName = useCallback((index) => {
    return index === catIndex ? 'text-white' : 'text-white/60';
  }, [catIndex]);

  // Default event data
  const defaultEvent = useMemo(() => ({
    title: 'Jazz in the Garden',
    time: formatTime(startHour),
    city: 'Washington, DC',
    distance: '2.3 mi',
    categoryLabel: activeCategory.label,
    categoryIcon: CATEGORY_ICONS[activeKey]
  }), [startHour, activeCategory, activeKey]);

  // Use selected event or default
  const currentEvent = selectedEvent || defaultEvent;

  // Prepare labels for outer ring
  const outerRingLabels = useMemo(() => [
    { pos: 'N', text: CATEGORIES.find(c => c.key === 'social').label, className: getLabelClassName(0) },
    { pos: 'E', text: CATEGORIES.find(c => c.key === 'education').label, className: getLabelClassName(1) },
    { pos: 'S', text: CATEGORIES.find(c => c.key === 'recreation').label, className: getLabelClassName(2) },
    { pos: 'W', text: CATEGORIES.find(c => c.key === 'professional').label, className: getLabelClassName(3) },
  ], [getLabelClassName]);

  return (
    <div 
      className="relative mx-auto h-screen w-full max-w-[390px] bg-black text-white overflow-hidden"
      role="application"
      aria-label="Event discovery compass"
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

      {/* Right vertical time slider */}
      <div className="absolute right-4 top-32">
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

      {/* Bottom event readout */}
      <div className="absolute inset-x-0 bottom-12">
        <EventReadout 
          event={currentEvent} 
          onSingleTap={handleEventSingleTap}
          onDoubleTap={handleEventDoubleTap}
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

export default DiscoveryDialCompass;
