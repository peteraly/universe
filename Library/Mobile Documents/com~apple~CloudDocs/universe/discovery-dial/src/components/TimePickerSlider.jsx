import { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { softTick } from '../utils/haptics';
import { TIME_MARKERS, getTimeFromPosition, formatTime, getPositionFromTime } from '../utils/timeHelpers';

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

  /**
   * Calculate persistent marker position from selectedTime
   */
  const selectedTimePosition = useMemo(() => {
    if (!containerRef.current) return 0;
    const fraction = getPositionFromTime(selectedTime.hours, selectedTime.minutes);
    return fraction * 240; // 240px is the container height
  }, [selectedTime]);

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
        right: 'max(20px, env(safe-area-inset-right))', // Increased from 8px to 20px for more space
        top: '50%',
        transform: 'translateY(-50%)',
        height: 'clamp(220px, 35vh, 300px)', // Slightly taller for easier interaction
        width: 'clamp(50px, 12vw, 70px)', // Wider for easier tap targets
        minWidth: '50px', // Increased minimum width
        maxWidth: 'calc(100vw - 80px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000, // Increased z-index to ensure it's on top
        touchAction: 'none',
        userSelect: 'none',
        paddingTop: 'max(8px, env(safe-area-inset-top))', // Increased padding
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        paddingLeft: '12px', // Added horizontal padding for breathing room
        paddingRight: '12px',
        // Subtle background for better visibility and touch area definition
        background: 'rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '28px', // Rounded edges for modern look
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        // Smooth transition for hover effects
        transition: 'all 0.2s ease'
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
            animate={isActive ? { scale: 1.15 } : { scale: 1 }}
            whileHover={{ scale: 1.05 }} // Added hover effect
            whileTap={{ scale: 0.95 }} // Added tap feedback
            transition={{ duration: 0.2 }}
            style={{
              fontSize: isActive ? 'clamp(13px, 3.2vw, 15px)' : 'clamp(11px, 2.8vw, 13px)', // Slightly larger
              fontWeight: isActive ? '700' : '600', // Bolder for better readability
              color: isActive 
                ? 'rgba(100, 150, 255, 1)'  // More vibrant blue
                : 'rgba(255, 255, 255, 0.7)', // Brighter inactive labels
              opacity: isActive ? 1 : 0.7,
              transition: 'all 0.2s',
              cursor: 'pointer',
              textAlign: 'center',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              pointerEvents: 'auto',
              minWidth: '48px', // Slightly larger touch target
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              // Subtle background for better tap target visibility
              background: isActive 
                ? 'rgba(100, 150, 255, 0.15)' 
                : 'transparent',
              borderRadius: '12px',
              WebkitTapHighlightColor: 'transparent' // Remove default tap highlight
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

      {/* PERSISTENT MARKER - Shows selected time position */}
      <motion.div
        animate={{ 
          top: `${selectedTimePosition}px`,
          scale: isDragging ? 1.2 : 1
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 25,
          duration: 0.2
        }}
        style={{
          position: 'absolute',
          right: '0px',
          transform: 'translateY(-50%)',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: 'rgba(100, 150, 255, 0.9)',
          border: '2px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 2px 8px rgba(100, 150, 255, 0.4)',
          pointerEvents: 'none',
          zIndex: 50
        }}
      />

      {/* SUBTLE TRACK LINE - Shows full range */}
      <div
        style={{
          position: 'absolute',
          right: '4px',
          top: '0',
          width: '2px',
          height: '100%',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '1px',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
    </div>
  );
}

