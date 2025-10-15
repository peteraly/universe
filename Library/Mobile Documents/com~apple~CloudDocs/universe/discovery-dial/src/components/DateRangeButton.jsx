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
  console.log('🚨 DateRangeButton: Component rendered with selectedRange:', selectedRange, 'onRangeChange:', !!onRangeChange);
  console.log('🚨 DateRangeButton: User agent:', navigator.userAgent);
  console.log('🚨 DateRangeButton: Is Safari:', /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent));
  console.log('🚨 DateRangeButton: Is mobile:', /Mobile|Android|iPhone|iPad/.test(navigator.userAgent));
  
  /**
   * Handle button click - cycle to next date range
   */
  const handleClick = useCallback((e) => {
    console.log('🚨 DateRangeButton: CLICK DETECTED!', selectedRange);
    console.log('🚨 DateRangeButton: Event object:', e);
    console.log('🚨 DateRangeButton: onRangeChange function:', onRangeChange);
    console.log('🚨 DateRangeButton: Event type:', e.type);
    console.log('🚨 DateRangeButton: Event target:', e.target);
    
    // Safari-specific event handling
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    const currentIndex = DATE_RANGES.indexOf(selectedRange);
    const nextIndex = (currentIndex + 1) % DATE_RANGES.length;
    const nextRange = DATE_RANGES[nextIndex];
    
    console.log('DateRangeButton: Changing from', selectedRange, 'to', nextRange);
    console.log('DateRangeButton: Current index:', currentIndex, 'Next index:', nextIndex);
    
    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    // Call parent callback with timeout for Safari
    if (onRangeChange) {
      console.log('DateRangeButton: Calling onRangeChange with:', nextRange);
      // Use setTimeout to ensure Safari processes the event
      setTimeout(() => {
        onRangeChange(nextRange);
        console.log('DateRangeButton: onRangeChange executed with timeout');
      }, 0);
    } else {
      console.error('❌ DateRangeButton: onRangeChange callback is missing!');
    }
    
    console.log('DateRangeButton: onRangeChange called with', nextRange);
  }, [selectedRange, onRangeChange]);

  // Test if framer-motion is causing issues - add fallback
  const buttonStyle = {
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
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
    outline: 'none',
    overflow: 'hidden',
    pointerEvents: 'auto', // CRITICAL: Ensure button is clickable
    // Safari-specific fixes
    WebkitAppearance: 'none',
    WebkitBorderRadius: '16px',
    // Force hardware acceleration for Safari
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    perspective: '1000px'
  };

  // Safari detection for fallback
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
  
  console.log('🚨 DateRangeButton: Using Safari fallback:', isSafari);
  console.log('🚨 DateRangeButton: Using mobile fallback:', isMobile);

  // Use regular button for Safari/mobile to avoid framer-motion issues
  if (isSafari || isMobile) {
    return (
      <button
        onClick={handleClick}
        onMouseDown={(e) => {
          console.log('🚨 DateRangeButton: MOUSE DOWN detected!');
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          console.log('🚨 DateRangeButton: TOUCH START detected!');
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          console.log('🚨 DateRangeButton: TOUCH END detected!');
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseUp={(e) => {
          console.log('🚨 DateRangeButton: MOUSE UP detected!');
          e.preventDefault();
          e.stopPropagation();
        }}
        style={buttonStyle}
        aria-label={`Date range: {selectedRange}. Click to change.`}
        role="button"
        tabIndex={0}
      >
        <span style={{
          display: 'block',
          whiteSpace: 'nowrap'
        }}>
          {selectedRange}
        </span>
      </button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      onMouseDown={(e) => {
        console.log('🚨 DateRangeButton: MOUSE DOWN detected!');
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchStart={(e) => {
        console.log('🚨 DateRangeButton: TOUCH START detected!');
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchEnd={(e) => {
        console.log('🚨 DateRangeButton: TOUCH END detected!');
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseUp={(e) => {
        console.log('🚨 DateRangeButton: MOUSE UP detected!');
        e.preventDefault();
        e.stopPropagation();
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={buttonStyle}
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

