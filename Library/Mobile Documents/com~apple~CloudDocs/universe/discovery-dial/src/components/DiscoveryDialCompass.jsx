import { useState, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import DialOuterRing from './DialOuterRing';
import DialInnerRing from './DialInnerRing';
import TimeSlider from './TimeSlider';
import TimeframeToggle from './TimeframeToggle';
import EventReadout from './EventReadout';
import { CATEGORIES, CATEGORY_ORDER, CATEGORY_ICONS } from '../data/categories';
import { TIMEFRAMES, formatTime } from '../utils/formatters';

const radiansToDeg = (r) => r * (180 / Math.PI);

const DiscoveryDialCompass = () => {
  // State management
  const [catIndex, setCatIndex] = useState(0); // 0..3 → N,E,S,W
  const [subIndex, setSubIndex] = useState(0); // per category
  const [startHour, setStartHour] = useState(17); // 5AM..24
  const [timeframeIndex, setTimeframeIndex] = useState(0); // 0..3

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

  // Handle dial rotation
  const onDragEnd = useCallback((_, info) => {
    const deltaDeg = radiansToDeg(info.delta.rotate ?? 0) || (info.velocity.x / 10);
    const current = ((rotate.get() + deltaDeg) % 360 + 360) % 360;
    const snap = Math.round(current / 90) % 4;
    setCatIndex((4 - snap) % 4); // clockwise → index
    rotate.set(snap * 90);
    setSubIndex(0); // Reset subcategory when changing main category
  }, [rotate]);

  // Handle timeframe toggle
  const handleTimeframeToggle = useCallback(() => {
    setTimeframeIndex((prev) => (prev + 1) % TIMEFRAMES.length);
  }, []);

  // Handle subcategory change
  const handleSubcategoryChange = useCallback((newSubIndex) => {
    setSubIndex(newSubIndex);
  }, []);

  // Get faded state for labels
  const getLabelClassName = useCallback((index) => {
    return index === catIndex ? 'text-white' : 'text-white/60';
  }, [catIndex]);

  // Mock selected event data
  const selectedEvent = useMemo(() => ({
    title: 'Jazz in the Garden',
    time: formatTime(startHour),
    city: 'Washington, DC',
    distance: '2.3 mi',
    categoryLabel: activeCategory.label,
    categoryIcon: CATEGORY_ICONS[activeKey]
  }), [startHour, activeCategory, activeKey]);

  // Prepare labels for outer ring
  const outerRingLabels = useMemo(() => [
    { pos: 'N', text: CATEGORIES.find(c => c.key === 'social').label, className: getLabelClassName(0) },
    { pos: 'E', text: CATEGORIES.find(c => c.key === 'education').label, className: getLabelClassName(1) },
    { pos: 'S', text: CATEGORIES.find(c => c.key === 'recreation').label, className: getLabelClassName(2) },
    { pos: 'W', text: CATEGORIES.find(c => c.key === 'professional').label, className: getLabelClassName(3) },
  ], [getLabelClassName]);

  return (
    <div className="relative mx-auto h-screen w-full max-w-[390px] bg-black text-white overflow-hidden">
      {/* Main dial cluster */}
      <div className="relative mx-auto mt-16 h-[360px] w-[360px]">
        {/* Outer ring with primary categories */}
        <DialOuterRing
          rotate={snapped}
          labels={outerRingLabels}
          onDragEnd={onDragEnd}
        />
        
        {/* Inner subcategory ring */}
        <DialInnerRing
          items={activeCategory.sub}
          activeIndex={subIndex}
          onChange={handleSubcategoryChange}
        />
      </div>

      {/* Right vertical time slider */}
      <div className="absolute right-4 top-32">
        <TimeSlider
          value={startHour}
          onChange={setStartHour}
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
        <EventReadout event={selectedEvent} />
      </div>

      {/* Center event bubble (translucent overlay) */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   w-24 h-24 rounded-full bg-white/8 backdrop-blur-sm
                   border border-white/20 flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className="text-white/80 text-xs font-medium text-center">
          {activeCategory.sub[subIndex]}
        </span>
      </motion.div>
    </div>
  );
};

export default DiscoveryDialCompass;
