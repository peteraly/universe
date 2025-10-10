import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import useGestureDetection from '../hooks/useGestureDetection';
import { CATEGORIES, CATEGORY_ORDER, CATEGORY_ICONS } from '../data/categories';
import { TIMEFRAMES, formatTime } from '../utils/formatters';

const EnhancedDial = ({ 
  onPrimaryCategoryChange, 
  onSubcategoryChange, 
  onEventChange,
  currentPrimaryIndex = 0,
  currentSubIndex = 0,
  hasSelectedPrimary = false
}) => {
  const dialRef = useRef(null);
  const eventAreaRef = useRef(null);
  
  // Motion values for dial rotation
  const rotate = useMotionValue(0);
  const snapped = useTransform(rotate, (r) => {
    const deg = ((r % 360) + 360) % 360;
    const snap = Math.round(deg / 90) * 90;
    return snap;
  });

  // Gesture detection hook
  const {
    gestureState,
    triggerHaptic,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleKeyDown
  } = useGestureDetection();

  // Get current category info
  const activeKey = CATEGORY_ORDER[currentPrimaryIndex];
  const activeCategory = CATEGORIES.find(c => c.key === activeKey);

  // Get dial bounds for gesture detection
  const getDialBounds = useCallback(() => {
    if (!dialRef.current) return null;
    const rect = dialRef.current.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2
    };
  }, []);

  // Get event area bounds
  const getEventAreaBounds = useCallback(() => {
    if (!eventAreaRef.current) return null;
    const rect = eventAreaRef.current.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom
    };
  }, []);

  // Handle primary category change (vertical swipe)
  const handlePrimaryCategoryChange = useCallback((direction) => {
    const newIndex = direction === 'up' 
      ? (currentPrimaryIndex + 1) % CATEGORY_ORDER.length
      : (currentPrimaryIndex - 1 + CATEGORY_ORDER.length) % CATEGORY_ORDER.length;
    
    onPrimaryCategoryChange?.(newIndex);
    triggerHaptic('medium');
    
    // Visual feedback: rotate dial to new position
    const newRotation = newIndex * 90;
    rotate.set(newRotation);
  }, [currentPrimaryIndex, onPrimaryCategoryChange, triggerHaptic, rotate]);

  // Handle subcategory change (circular drag)
  const handleSubcategoryChange = useCallback((direction) => {
    if (!activeCategory?.sub) return;
    
    const newIndex = direction === 'clockwise'
      ? (currentSubIndex + 1) % activeCategory.sub.length
      : (currentSubIndex - 1 + activeCategory.sub.length) % activeCategory.sub.length;
    
    onSubcategoryChange?.(newIndex);
    triggerHaptic('light');
  }, [currentSubIndex, activeCategory, onSubcategoryChange, triggerHaptic]);

  // Handle event change (horizontal swipe)
  const handleEventChange = useCallback((direction) => {
    onEventChange?.(direction);
    triggerHaptic('light');
  }, [onEventChange, triggerHaptic]);

  // Gesture detection callback
  const onGestureDetected = useCallback((gesture) => {
    switch (gesture.type) {
      case 'DIAL_VERTICAL_SWIPE':
        handlePrimaryCategoryChange(gesture.direction);
        break;
      case 'DIAL_CIRCULAR_DRAG':
        handleSubcategoryChange(gesture.direction);
        break;
      case 'EVENT_HORIZONTAL_SWIPE':
        handleEventChange(gesture.direction);
        break;
    }
  }, [handlePrimaryCategoryChange, handleSubcategoryChange, handleEventChange]);

  // Gesture completion callback
  const onGestureComplete = useCallback((gestureType) => {
    // Additional feedback on gesture completion
    console.log(`Gesture completed: ${gestureType}`);
  }, []);

  // Keyboard gesture handler
  const onKeyboardGesture = useCallback((gesture) => {
    switch (gesture) {
      case 'DIAL_VERTICAL_SWIPE_UP':
        handlePrimaryCategoryChange('up');
        break;
      case 'DIAL_VERTICAL_SWIPE_DOWN':
        handlePrimaryCategoryChange('down');
        break;
      case 'DIAL_CIRCULAR_DRAG_NEXT':
        handleSubcategoryChange('clockwise');
        break;
      case 'EVENT_HORIZONTAL_SWIPE_LEFT':
        handleEventChange('left');
        break;
      case 'EVENT_HORIZONTAL_SWIPE_RIGHT':
        handleEventChange('right');
        break;
    }
  }, [handlePrimaryCategoryChange, handleSubcategoryChange, handleEventChange]);

  // Touch event handlers
  const onTouchStart = useCallback((e) => {
    const dialBounds = getDialBounds();
    const eventBounds = getEventAreaBounds();
    const dialCenter = dialBounds ? { x: dialBounds.centerX, y: dialBounds.centerY } : null;
    
    handleTouchStart(e, dialBounds, eventBounds, dialCenter);
  }, [handleTouchStart, getDialBounds, getEventAreaBounds]);

  const onTouchMove = useCallback((e) => {
    const dialBounds = getDialBounds();
    const eventBounds = getEventAreaBounds();
    const dialCenter = dialBounds ? { x: dialBounds.centerX, y: dialBounds.centerY } : null;
    
    handleTouchMove(e, dialBounds, eventBounds, dialCenter, onGestureDetected);
  }, [handleTouchMove, getDialBounds, getEventAreaBounds, onGestureDetected]);

  const onTouchEnd = useCallback((e) => {
    handleTouchEnd(e, onGestureComplete);
  }, [handleTouchEnd, onGestureComplete]);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      handleKeyDown(e, onKeyboardGesture);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, onKeyboardGesture]);

  // Generate outer ring labels
  const outerRingLabels = CATEGORY_ORDER.map((key, index) => {
    const category = CATEGORIES.find(c => c.key === key);
    const isActive = index === currentPrimaryIndex;
    return {
      pos: ['N', 'E', 'S', 'W'][index],
      text: category?.label || key,
      className: isActive ? 'text-black font-semibold' : 'text-black/60'
    };
  });

  return (
    <div className="relative w-full h-full">
      {/* Main dial cluster */}
      <div 
        ref={dialRef}
        className="relative mx-auto mt-16 h-[280px] w-[280px]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="application"
        aria-label="Event discovery dial with gesture controls"
      >
        {/* Outer ring with primary categories */}
        <motion.div
          className="absolute inset-0 rounded-full border border-black/20"
          style={{ rotate: snapped }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.05}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        >
          {/* Red pointer at top */}
          <div className="absolute left-1/2 top-[-10px] -translate-x-1/2 z-10">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[#E63946]" />
          </div>

          {/* Tick marks around the perimeter */}
          {[...Array(180)].map((_, i) => (
            <div
              key={`tick-${i}`}
              className="absolute left-1/2 top-1/2 origin-[0_100%]"
              style={{
                transform: `rotate(${i * 2}deg) translate(-1px, -168px)`,
                width: i % 15 === 0 ? 2 : 1,
                height: i % 15 === 0 ? 12 : 6,
                backgroundColor: `rgba(0,0,0,${i % 15 === 0 ? 0.6 : 0.3})`
              }}
            />
          ))}

          {/* Primary labels at N/E/S/W */}
          {outerRingLabels.map((label, idx) => (
            <div
              key={`label-${label.pos}`}
              className={`absolute text-center text-[11px] font-medium ${label.className}`}
              style={{
                left: '50%',
                top: '50%',
                transform: {
                  'N': 'translate(-50%, -165px)',
                  'E': 'translate(150px, -50%) rotate(90deg)',
                  'S': 'translate(-50%, 150px) rotate(180deg)',
                  'W': 'translate(-165px, -50%) rotate(-90deg)'
                }[label.pos]
              }}
            >
              <span className="block max-w-[120px] leading-tight">{label.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Inner subcategory ring - only visible after primary selection */}
        {hasSelectedPrimary && activeCategory?.sub && (
          <div className="absolute inset-10 rounded-full border border-black/16">
            {activeCategory.sub.map((subcategory, i) => {
              const angle = (i / activeCategory.sub.length) * 360;
              const isActive = i === currentSubIndex;
              return (
                <button
                  key={`sub-${i}`}
                  onClick={() => onSubcategoryChange?.(i)}
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                            text-xs ${isActive ? 'text-black font-semibold' : 'text-black/70'}`}
                  style={{
                    transform: `rotate(${angle}deg) translate(0, -135px) rotate(${-angle}deg)`
                  }}
                >
                  {subcategory}
                </button>
              );
            })}
          </div>
        )}

        {/* Center category indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-[14px] font-semibold text-black">
            {activeCategory?.label || 'Select Category'}
          </div>
          {hasSelectedPrimary && activeCategory?.sub && (
            <div className="text-[10px] text-black/60 mt-1">
              {activeCategory.sub[currentSubIndex]}
            </div>
          )}
        </div>
      </div>

      {/* Event area for horizontal swipe detection */}
      <div 
        ref={eventAreaRef}
        className="absolute inset-x-0 bottom-20 h-32"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-label="Event browsing area"
      />

      {/* Gesture feedback indicators */}
      {gestureState.isProcessing && (
        <motion.div
          className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 text-white text-xs rounded-full"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {gestureState.activeGesture?.replace(/_/g, ' ').toLowerCase()}
        </motion.div>
      )}
    </div>
  );
};

export default memo(EnhancedDial);
