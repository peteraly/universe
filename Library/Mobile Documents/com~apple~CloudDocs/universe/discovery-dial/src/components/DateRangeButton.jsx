import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { softTick } from '../utils/haptics';

const DATE_RANGES = ['TODAY', 'TOMORROW', 'THIS WEEK', 'THIS MONTH'];

/**
 * DateRangeButton - Rotating date range selector
 * 
 * Single button that cycles through date range options:
 * TODAY → TOMORROW → THIS WEEK → THIS MONTH → (loop back)
 * 
 * @param {Object} props
 * @param {string} props.selectedRange - Current selected range
 * @param {Function} props.onRangeChange - Callback when range changes
 */
export default function DateRangeButton({ selectedRange, onRangeChange }) {
  /**
   * Handle button click - cycle to next date range
   */
  const handleClick = useCallback(() => {
    const currentIndex = DATE_RANGES.indexOf(selectedRange);
    const nextIndex = (currentIndex + 1) % DATE_RANGES.length;
    const nextRange = DATE_RANGES[nextIndex];
    
    softTick(); // Haptic feedback
    onRangeChange(nextRange);
  }, [selectedRange, onRangeChange]);

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        position: 'fixed',
        right: '8px',
        bottom: '28%',
        width: '88px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0',
        background: 'rgba(100, 150, 255, 0.15)',
        border: '1px solid rgba(100, 150, 255, 0.3)',
        borderRadius: '16px',
        color: 'white',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        cursor: 'pointer',
        zIndex: 45,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        outline: 'none',
        overflow: 'hidden'
      }}
      aria-label={`Date range: ${selectedRange}. Click to change.`}
      role="button"
      tabIndex={0}
    >
      {/* Text with fade transition */}
      <AnimatePresence mode="wait">
        <motion.span
          key={selectedRange}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          style={{
            display: 'block',
            whiteSpace: 'nowrap'
          }}
        >
          {selectedRange}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

