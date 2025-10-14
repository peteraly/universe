import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import useGestureDetection from '../hooks/useGestureDetection';
import useDirectionalSwipeDetection from '../hooks/useDirectionalSwipeDetection';
import { CATEGORIES, CATEGORY_ORDER, CATEGORY_ICONS } from '../data/categories';
import { TIMEFRAMES, formatTime } from '../utils/formatters';
import { COMPASS_PROPORTIONS } from '../constants/compassProportions';

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

  // FIXED: Directional swipe detection for cardinal points
  const handleDirectionalSwipe = useCallback((direction) => {
    const directionMap = {
      'up': 0,    // NORTH - Social
      'right': 1, // EAST - Educational
      'down': 2,  // SOUTH - Recreational
      'left': 3   // WEST - Professional
    };
    
    const newIndex = directionMap[direction];
    if (newIndex !== undefined && newIndex !== currentPrimaryIndex) {
      onPrimaryCategoryChange(newIndex);
    }
  }, [currentPrimaryIndex, onPrimaryCategoryChange]);

  const { handleTouchStart: handleDirectionalTouchStart, handleTouchEnd: handleDirectionalTouchEnd } = useDirectionalSwipeDetection(handleDirectionalSwipe);

  // FIXED: Primary categories permanently anchored at cardinal points
  const getFixedCategoryPositions = () => {
    return [
      { key: 'social', label: 'Social', position: 'N', isActive: currentPrimaryIndex === 0 },
      { key: 'education', label: 'Educational', position: 'E', isActive: currentPrimaryIndex === 1 },
      { key: 'recreation', label: 'Recreational', position: 'S', isActive: currentPrimaryIndex === 2 },
      { key: 'professional', label: 'Professional', position: 'W', isActive: currentPrimaryIndex === 3 }
    ];
  };

  // Get subcategory positions around dial perimeter - FIXED positioning
  const getSubcategoryPosition = (subIndex, totalSubs) => {
    // Start at 0 degrees and distribute evenly around the circle
    const angle = (subIndex / totalSubs) * 360;
    const radius = 120; // Distance from center - closer to dial edge
    const angleRad = angle * Math.PI / 180;
    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;
    return { x, y, angle };
  };

  // FIXED: Primary category positions permanently anchored at cardinal points
  const getPrimaryCategoryPosition = (position) => {
    const positions = {
      'N': { angle: -90, radius: 160 }, // North - 12 o'clock - Social
      'E': { angle: 0, radius: 160 },   // East - 3 o'clock - Educational
      'S': { angle: 90, radius: 160 },  // South - 6 o'clock - Recreational
      'W': { angle: 180, radius: 160 }  // West - 9 o'clock - Professional
    };
    
    const pos = positions[position];
    // Convert angle to radians and calculate position
    const angleRad = pos.angle * Math.PI / 180;
    const x = Math.cos(angleRad) * pos.radius;
    const y = Math.sin(angleRad) * pos.radius;
    return { x, y, angle: pos.angle };
  };

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

  // Touch event handlers with proper event prevention
  const onTouchStart = useCallback((e) => {
    // Prevent default browser behaviors that interfere with dial gestures
    e.preventDefault();
    e.stopPropagation();
    
    const dialBounds = getDialBounds();
    const eventBounds = getEventAreaBounds();
    const dialCenter = dialBounds ? { x: dialBounds.centerX, y: dialBounds.centerY } : null;
    
    handleTouchStart(e, dialBounds, eventBounds, dialCenter);
  }, [handleTouchStart, getDialBounds, getEventAreaBounds]);

  const onTouchMove = useCallback((e) => {
    // Prevent default browser behaviors that interfere with dial gestures
    e.preventDefault();
    e.stopPropagation();
    
    const dialBounds = getDialBounds();
    const eventBounds = getEventAreaBounds();
    const dialCenter = dialBounds ? { x: dialBounds.centerX, y: dialBounds.centerY } : null;
    
    handleTouchMove(e, dialBounds, eventBounds, dialCenter, onGestureDetected);
  }, [handleTouchMove, getDialBounds, getEventAreaBounds, onGestureDetected]);

  const onTouchEnd = useCallback((e) => {
    // Prevent default browser behaviors that interfere with dial gestures
    e.preventDefault();
    e.stopPropagation();
    
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
    <div className="dial-container relative w-full h-full flex flex-col items-center justify-center">
      {/* Main dial cluster - VISUAL DOMINANCE MANDATE (70% of vertical space) */}
      <div 
        ref={dialRef}
        className="compass-dial enhanced-dial relative mx-auto"
        style={{
          width: COMPASS_PROPORTIONS.DIAL_SIZE,
          height: COMPASS_PROPORTIONS.DIAL_SIZE,
          minWidth: COMPASS_PROPORTIONS.DIAL_MIN_SIZE,
          maxWidth: COMPASS_PROPORTIONS.DIAL_MAX_SIZE,
          minHeight: COMPASS_PROPORTIONS.DIAL_MIN_SIZE,
          maxHeight: COMPASS_PROPORTIONS.DIAL_MAX_SIZE,
          zIndex: 100, // High z-index for visual dominance
          touchAction: 'none' // Critical: prevents all default touch behaviors
        }}
        onTouchStart={handleDirectionalTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={handleDirectionalTouchEnd}
        role="application"
        aria-label="Event discovery dial with gesture controls"
      >
        {/* Outer ring with primary categories - PERFORMANCE OPTIMIZED */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ 
            border: '1px solid rgba(0,0,0,0.3)',
            backgroundColor: 'transparent',
            boxShadow: 'none'
          }}
        >
          {/* Red pointer at top - iPhone Compass style */}
          <div className="absolute left-1/2 top-[-10px] -translate-x-1/2 z-10">
            <div 
              className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent"
              style={{
                borderBottomWidth: `${COMPASS_PROPORTIONS.POINTER_SIZE}px`,
                borderBottomColor: COMPASS_PROPORTIONS.POINTER_COLOR,
                filter: `drop-shadow(${COMPASS_PROPORTIONS.POINTER_SHADOW})`
              }}
            />
          </div>

          {/* Tick marks around the perimeter - PERFORMANCE OPTIMIZED (only major ticks) */}
          {[...Array(12)].map((_, i) => {
            const angle = i * 30; // Major ticks every 30°
            const distance = 138; // Distance from center
            
            return (
              <div
                key={`tick-${i}`}
                className="absolute left-1/2 top-1/2 origin-[0_100%]"
                style={{
                  transform: `rotate(${angle}deg) translate(-1px, -${distance}px)`,
                  width: 2,
                  height: 12,
                  backgroundColor: 'rgba(0,0,0,0.8)'
                }}
              />
            );
          })}

          {/* Primary labels at N/E/S/W - iPhone Compass positioning */}
          {outerRingLabels.map((label, idx) => {
            const distance = COMPASS_PROPORTIONS.LABEL_DISTANCE;
            
            return (
              <div
                key={`label-${label.pos}`}
                className="absolute text-center"
                style={{
                  left: '50%',
                  top: '50%',
                  fontSize: COMPASS_PROPORTIONS.LABEL_FONT_SIZE,
                  fontWeight: COMPASS_PROPORTIONS.LABEL_FONT_WEIGHT,
                  color: COMPASS_PROPORTIONS.LABEL_COLOR,
                  transform: {
                    'N': `translate(-50%, -${distance}px)`,
                    'E': `translate(${distance}px, -50%) rotate(90deg)`,
                    'S': `translate(-50%, ${distance}px) rotate(180deg)`,
                    'W': `translate(-${distance}px, -50%) rotate(-90deg)`
                  }[label.pos]
                }}
              >
                <span className="block max-w-[120px] leading-tight">{label.text}</span>
              </div>
            );
          })}
        </div>

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

        {/* Center area - CLEAN COMPASS CENTER */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center justify-center"
          style={{
            width: COMPASS_PROPORTIONS.CENTER_SIZE,
            height: COMPASS_PROPORTIONS.CENTER_SIZE,
            backgroundColor: COMPASS_PROPORTIONS.CENTER_BACKGROUND,
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '50%',
            padding: '10px'
          }}
        >
          {/* Primary Category Label */}
          <div 
            className="font-semibold mb-2"
            style={{
              fontSize: COMPASS_PROPORTIONS.CENTER_FONT_SIZE,
              color: COMPASS_PROPORTIONS.LABEL_COLOR
            }}
          >
            {activeCategory?.label || 'Select Category'}
          </div>
          
          {/* Subcategory Label */}
          {hasSelectedPrimary && activeCategory?.sub && (
            <div 
              className="mb-2"
              style={{
                fontSize: COMPASS_PROPORTIONS.LABEL_FONT_SIZE - 2,
                color: `${COMPASS_PROPORTIONS.LABEL_COLOR}80`
              }}
            >
              {activeCategory.sub[currentSubIndex]}
            </div>
          )}
        </div>

        {/* FIXED: Primary categories permanently anchored at cardinal points */}
        <div className="primary-categories-perimeter">
          {getFixedCategoryPositions().map((category, index) => {
            const pos = getPrimaryCategoryPosition(category.position);
            return (
              <div 
                key={category.key}
                className={`primary-category-perimeter ${category.isActive ? 'active' : 'faded'} touch-target no-select`}
                style={{
                  left: `calc(50% + ${pos.x}px)`,
                  top: `calc(50% + ${pos.y}px)`,
                  transform: 'translate(-50%, -50%)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  opacity: category.isActive ? 1 : 0.4,
                  fontWeight: category.isActive ? 'bold' : 'normal'
                }}
                onClick={() => onPrimaryCategoryChange(index)}
              >
                <div className="compass-category-label">
                  {category.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Subcategory ring around dial perimeter */}
        <div className="subcategory-ring-perimeter">
          {activeCategory?.sub?.map((sub, index) => {
            const pos = getSubcategoryPosition(index, activeCategory.sub.length);
            return (
              <motion.div 
                key={`subcategory-${sub}`}
                className="subcategory-item-perimeter touch-target no-select hardware-accelerated"
                style={{
                  left: `calc(50% + ${pos.x}px)`,
                  top: `calc(50% + ${pos.y}px)`,
                  transform: 'translate(-50%, -50%)',
                  touchAction: 'manipulation' // Allow tap but prevent scroll/drag
                }}
                onClick={(e) => {
                  // Prevent default browser behaviors that interfere with subcategory selection
                  e.preventDefault();
                  e.stopPropagation();
                  onSubcategoryChange(index);
                }}
                onTouchStart={(e) => {
                  // Prevent default browser behaviors that interfere with subcategory selection
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onTouchEnd={(e) => {
                  // Prevent default browser behaviors that interfere with subcategory selection
                  e.preventDefault();
                  e.stopPropagation();
                }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(230,57,70,0.1)' }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {sub}
              </motion.div>
            );
          })}
        </div>

        {/* Debug indicator - temporary visual confirmation */}
        <div 
          className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full z-20"
          title="Dial is positioned here"
        />
      </div>

      {/* Event area for horizontal swipe detection */}
      <div 
        ref={eventAreaRef}
        className="absolute inset-x-0 bottom-20 h-32 event-area"
        style={{
          touchAction: 'pan-y' // Allow only vertical scrolling in event area
        }}
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
