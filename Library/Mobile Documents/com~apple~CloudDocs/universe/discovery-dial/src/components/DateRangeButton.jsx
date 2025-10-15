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
    console.log('DateRangeButton: Click detected, current range:', selectedRange);
    
    const currentIndex = DATE_RANGES.indexOf(selectedRange);
    const nextIndex = (currentIndex + 1) % DATE_RANGES.length;
    const nextRange = DATE_RANGES[nextIndex];
    
    console.log('DateRangeButton: Changing from', selectedRange, 'to', nextRange);
    
    softTick(); // Haptic feedback
    onRangeChange(nextRange);
    
    console.log('DateRangeButton: onRangeChange called with', nextRange);
  }, [selectedRange, onRangeChange]);

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        position: 'fixed',
        right: 'max(8px, env(safe-area-inset-right))',
        bottom: 'clamp(18%, 20%, 22%)', // Moved further from time picker
        width: 'clamp(80px, 20vw, 100px)',
        height: 'clamp(28px, 8vw, 40px)',
        minWidth: '44px',  // WCAG minimum touch target
        minHeight: '44px', // WCAG minimum touch target
        maxWidth: 'calc(100vw - env(safe-area-inset-right) - 20px)', // Prevent overflow
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(6px, 2vw, 10px) clamp(10px, 3vw, 14px)',
        background: 'rgba(100, 150, 255, 0.15)',
        border: '1px solid rgba(100, 150, 255, 0.3)',
        borderRadius: '16px',
        color: 'white',
        fontSize: 'clamp(10px, 2.5vw, 13px)',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        cursor: 'pointer',
        zIndex: 40, // Below time picker
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

