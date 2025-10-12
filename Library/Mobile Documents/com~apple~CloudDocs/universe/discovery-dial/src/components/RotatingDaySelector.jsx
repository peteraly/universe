import { motion, AnimatePresence } from 'framer-motion';
import { memo, useCallback } from 'react';
import useHapticFeedback from '../hooks/useHapticFeedback';

const DAY_OPTIONS = [
  { key: 'today', label: 'Today', short: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow', short: 'Tomorrow' },
  { key: 'this_week', label: 'This Week', short: 'This Week' },
  { key: 'this_month', label: 'This Month', short: 'This Month' }
];

const RotatingDaySelector = ({ currentIndex = 0, onDayChange }) => {
  const { triggerHaptic } = useHapticFeedback();

  const handleClick = useCallback(() => {
    const nextIndex = (currentIndex + 1) % DAY_OPTIONS.length;
    onDayChange(nextIndex);
    triggerHaptic('light');
  }, [currentIndex, onDayChange, triggerHaptic]);

  const currentDay = DAY_OPTIONS[currentIndex];

  return (
    <motion.button
      className="rotating-day-selector touch-target no-select"
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      aria-label={`Current: ${currentDay.label}. Click to change.`}
    >
      <div className="day-selector-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDay.key}
            className="day-label"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentDay.short}
          </motion.div>
        </AnimatePresence>
        
        <div className="day-indicator">
          <div className="day-dots">
            {DAY_OPTIONS.map((_, index) => (
              <div
                key={index}
                className={`day-dot ${index === currentIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default memo(RotatingDaySelector);
