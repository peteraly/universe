import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { softTick } from '../utils/haptics';
import { TIME_MARKERS, getTimeFromPosition, formatTime } from '../utils/timeHelpers';

/**
 * TimePickerSlider - Minimalist 24-hour time picker for Discovery Dial
 * 
 * Positioned on center-right edge, provides vertical scrubbing gesture
 * for precise time selection (12:00 AM to 11:30 PM in 30-minute increments).
 * 
 * @param {Object} props
 * @param {{ hours: number, minutes: number }} props.selectedTime - Current selected time
 * @param {Function} props.onTimeChange - Callback when time changes
 */
export default function TimePickerSlider({ selectedTime, onTimeChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const containerRef = useRef(null);
  const prevSlotRef = useRef(0);

  /**
   * Handle pointer down - start scrubbing
   */
  const handlePointerDown = useCallback((e) => {
    e.stopPropagation(); // Prevent dial gestures
    setIsDragging(true);
    updateTimeFromPosition(e.clientY);
  }, []);

  /**
   * Handle pointer move - continue scrubbing
   */
  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    e.stopPropagation(); // Prevent dial gestures
    updateTimeFromPosition(e.clientY);
  }, [isDragging]);

  /**
   * Handle pointer up - end scrubbing
   */
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    prevSlotRef.current = 0;
  }, []);

  /**
   * Update time based on vertical position
   */
  const updateTimeFromPosition = useCallback((clientY) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const { hours, minutes, slotIndex } = getTimeFromPosition(
      clientY,
      rect.top,
      rect.height
    );

    // Haptic feedback on slot change (every 30 minutes)
    if (slotIndex !== prevSlotRef.current) {
      softTick();
      prevSlotRef.current = slotIndex;
    }

    setDragY(clientY - rect.top);
    onTimeChange({ hours, minutes });
  }, [onTimeChange]);

  /**
   * Handle tap on marker - jump to that time
   */
  const handleMarkerTap = useCallback((marker) => {
    onTimeChange({ hours: marker.hours, minutes: marker.minutes });
    softTick();
  }, [onTimeChange]);

  return (
    <div
      ref={containerRef}
      className="time-picker-slider"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'fixed',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        height: '240px',
        width: '44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 45,
        touchAction: 'none',
        userSelect: 'none',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {/* Time markers */}
      {TIME_MARKERS.map((marker) => {
        const isActive = 
          selectedTime.hours === marker.hours && 
          selectedTime.minutes === marker.minutes;

        return (
          <motion.div
            key={marker.label}
            onClick={() => handleMarkerTap(marker)}
            animate={isActive ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              fontSize: isActive ? '13px' : '11px',
              fontWeight: isActive ? '700' : '500',
              color: isActive 
                ? 'rgba(100, 150, 255, 0.8)'  // Blue accent (matches primary swipe)
                : 'rgba(255, 255, 255, 0.5)', // Faded white (matches inactive labels)
              opacity: isActive ? 1 : 0.5,
              transition: 'all 0.2s',
              cursor: 'pointer',
              textAlign: 'center',
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              pointerEvents: 'auto'
            }}
          >
            {marker.label}
          </motion.div>
        );
      })}

      {/* Floating time bubble during drag */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              left: '-70px',
              top: `${dragY}px`,
              transform: 'translateY(-50%)',
              background: 'rgba(0, 0, 0, 0.95)',
              color: 'white',
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '15px',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            {formatTime(selectedTime.hours, selectedTime.minutes)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrub indicator line (subtle visual aid) */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            left: '-4px',
            top: `${dragY}px`,
            width: '52px',
            height: '2px',
            background: 'rgba(100, 150, 255, 0.6)',
            borderRadius: '1px',
            pointerEvents: 'none',
            transform: 'translateY(-50%)'
          }}
        />
      )}
    </div>
  );
}

