import { motion, AnimatePresence } from 'framer-motion';
import EventCounter from './EventCounter';
import useSwipeNavigation from '../hooks/useSwipeNavigation';
import useHapticFeedback from '../hooks/useHapticFeedback';

const SwipeableEventReadout = ({ 
  events = [], 
  onSingleTap, 
  onDoubleTap,
  onEventChange 
}) => {
  const {
    currentIndex,
    currentEvent,
    totalEvents,
    isSwipeActive,
    swipeDirection,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleSwipe,
    canSwipeLeft,
    canSwipeRight
  } = useSwipeNavigation(events, onEventChange);

  const { triggerHaptic, triggerError } = useHapticFeedback();

  // Handle tap zones for accessibility
  const handlePreviousTap = () => {
    if (canSwipeRight) {
      handleSwipe('right');
      triggerHaptic('light');
    } else {
      triggerError();
    }
  };

  const handleNextTap = () => {
    if (canSwipeLeft) {
      handleSwipe('left');
      triggerHaptic('light');
    } else {
      triggerError();
    }
  };

  // Handle main event tap
  const handleEventTap = () => {
    onSingleTap?.(currentEvent);
  };

  const handleEventDoubleTap = () => {
    onDoubleTap?.(currentEvent);
  };

  // Empty state
  if (!currentEvent) {
    return (
      <motion.div
        className="text-center py-8 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-white/60 mb-4">No events in this window</div>
        <div className="flex justify-center space-x-4">
          <button className="px-4 py-2 bg-white/10 rounded text-sm hover:bg-white/15 transition-colors">
            Try Earlier
          </button>
          <button className="px-4 py-2 bg-white/10 rounded text-sm hover:bg-white/15 transition-colors">
            Try Later
          </button>
          <button className="px-4 py-2 bg-white/10 rounded text-sm hover:bg-white/15 transition-colors">
            This Week
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      {/* Swipeable area */}
      <motion.div
        className="text-center px-4 cursor-pointer relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleEventTap}
        onDoubleClick={handleEventDoubleTap}
        role="button"
        tabIndex={0}
        aria-label={`Event: ${currentEvent.title}. ${currentEvent.time} in ${currentEvent.city}. ${currentEvent.distance} away. Category: ${currentEvent.categoryLabel}`}
        aria-live="polite"
        aria-atomic="true"
        whileTap={{ scale: 0.98 }}
        animate={{
          scale: isSwipeActive ? 1.02 : 1,
          x: swipeDirection === 'left' ? -10 : swipeDirection === 'right' ? 10 : 0
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Event content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: swipeDirection === 'left' ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: swipeDirection === 'left' ? -50 : 50 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <motion.h2
              className="text-[24px] font-semibold text-white mb-1 leading-tight"
              style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {currentEvent.title}
            </motion.h2>
            
            <motion.div
              className="text-[14px] text-white/70 mb-1"
            >
              {currentEvent.time} • {currentEvent.city}
            </motion.div>
            
            <motion.div
              className="text-[13px] text-white/60 flex items-center justify-center gap-1"
            >
              <span>{currentEvent.distance || '— mi'}</span>
              <span>•</span>
              <span>{currentEvent.categoryIcon} {currentEvent.categoryLabel}</span>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Swipe indicators */}
        <AnimatePresence>
          {isSwipeActive && (
            <motion.div
              className="absolute inset-0 flex items-center justify-between px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                animate={{ scale: swipeDirection === 'right' ? 1.2 : 1 }}
              >
                <span className="text-white/60 text-sm">‹</span>
              </motion.div>
              <motion.div
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                animate={{ scale: swipeDirection === 'left' ? 1.2 : 1 }}
              >
                <span className="text-white/60 text-sm">›</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Invisible tap zones for accessibility */}
      <div className="absolute inset-0 flex">
        <button
          className="w-11 h-22 opacity-0 cursor-pointer"
          onClick={handlePreviousTap}
          aria-label="Previous event"
        />
        <div className="flex-1" />
        <button
          className="w-11 h-22 opacity-0 cursor-pointer"
          onClick={handleNextTap}
          aria-label="Next event"
        />
      </div>

      {/* Event counter */}
      <EventCounter 
        current={currentIndex} 
        total={totalEvents}
        isVisible={totalEvents > 1}
      />

      {/* Edge indicators */}
      <AnimatePresence>
        {!canSwipeRight && (
          <motion.div
            className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Start of results
          </motion.div>
        )}
        {!canSwipeLeft && (
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            End of results
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwipeableEventReadout;
