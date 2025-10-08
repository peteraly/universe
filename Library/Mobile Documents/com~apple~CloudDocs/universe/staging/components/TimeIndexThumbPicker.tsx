#Context: TimeIndexThumbPicker Core Component
// Right-docked rail with coarse buckets and fine hour selection
// Part of V12.0 L1 Event Curation Hub implementation

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  toDisplayLabel, 
  toFullLabel, 
  normalizeValue, 
  toOutputString, 
  snapMinute 
} from '../lib/time/format';
import { 
  createRAFThrottle, 
  createDebounce, 
  PASSIVE_OPTIONS, 
  ACTIVE_OPTIONS,
  preventTextSelection,
  restoreTextSelection,
  batchDOMUpdates
} from '../lib/utils/raf-throttle';
import '../styles/time-index.css';

interface TimeIndexThumbPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  granularityMinutes?: number;
  format?: '12h' | '24h';
  startHour?: number;
  endHour?: number;
  handedness?: 'left' | 'right';
  compact?: boolean;
  confirmLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const TimeIndexThumbPicker: React.FC<TimeIndexThumbPickerProps> = ({
  value = '12:00',
  onChange,
  granularityMinutes = 15,
  format = '12h',
  startHour = 5,
  endHour = 23,
  handedness = 'right',
  compact = true,
  confirmLabel = 'Set Start',
  disabled = false,
  className = ''
}) => {
  // State management
  const [isDragging, setIsDragging] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showFineHours, setShowFineHours] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [coarseBucket, setCoarseBucket] = useState<'M' | 'A' | 'E' | 'N'>('A');
  const [showMinuteSheet, setShowMinuteSheet] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [dragHour, setDragHour] = useState<number>(12);
  const [dragMinute, setDragMinute] = useState<number>(0);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [announcement, setAnnouncement] = useState<string>('');
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  // Performance refs
  const isDraggingRef = useRef<boolean>(false);
  const lastUpdateTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);
  
  // Coarse bucket definitions
  const COARSE_BUCKETS = {
    M: { label: 'Morning', start: 5, end: 11, color: 'bg-orange-100 border-orange-300' },
    A: { label: 'Afternoon', start: 12, end: 17, color: 'bg-yellow-100 border-yellow-300' },
    E: { label: 'Evening', start: 18, end: 21, color: 'bg-purple-100 border-purple-300' },
    N: { label: 'Night', start: 22, end: 23, color: 'bg-blue-100 border-blue-300' }
  } as const;

  // Time calculation logic
  const calculateTimeFromPosition = useCallback((position: number): string => {
    const totalHours = endHour - startHour;
    const hour = startHour + Math.round(position * totalHours);
    const minute = snapMinute(0, granularityMinutes);
    return toOutputString(hour, minute, false);
  }, [startHour, endHour, granularityMinutes]);

  // Calculate time with hour and minute tracking
  const calculateTimeWithMinutes = useCallback((position: number, currentMinute: number = 0): { hour: number; minute: number } => {
    const totalHours = endHour - startHour;
    const hour = startHour + Math.round(position * totalHours);
    const minute = snapMinute(currentMinute, granularityMinutes);
    return { hour, minute };
  }, [startHour, endHour, granularityMinutes]);

  const calculatePositionFromTime = useCallback((time: string): number => {
    const { hour, minute } = normalizeValue(time);
    const clampedHour = Math.max(startHour, Math.min(endHour, hour));
    return (clampedHour - startHour) / (endHour - startHour);
  }, [startHour, endHour]);

  // Determine current coarse bucket
  const getCurrentCoarseBucket = useCallback((time: string): 'M' | 'A' | 'E' | 'N' => {
    const { hour } = normalizeValue(time);
    if (hour >= 5 && hour <= 11) return 'M';
    if (hour >= 12 && hour <= 17) return 'A';
    if (hour >= 18 && hour <= 21) return 'E';
    return 'N';
  }, []);

  // Haptic feedback
  const triggerHapticFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration
    }
  }, []);

  // Accessibility helpers
  const announceTime = useCallback((time: string) => {
    const { hour, minute } = normalizeValue(time);
    const fullTime = toFullLabel(hour, minute, format);
    setAnnouncement(`Selected time: ${fullTime}`);
  }, [format]);

  const getCurrentHour = useCallback(() => {
    return normalizeValue(currentValue).hour;
  }, [currentValue]);

  const getAvailableHours = useCallback(() => {
    return Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  }, [startHour, endHour]);

  const getCurrentHourIndex = useCallback(() => {
    const currentHour = getCurrentHour();
    return getAvailableHours().indexOf(currentHour);
  }, [getCurrentHour, getAvailableHours]);

  // Performance-optimized update function
  const updateTimeValue = useCallback((newTime: string, shouldAnnounce = false) => {
    const now = performance.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    
    // Throttle updates to 16ms (60fps) for smooth performance
    if (timeSinceLastUpdate < 16) {
      return;
    }
    
    lastUpdateTimeRef.current = now;
    
    batchDOMUpdates([
      () => setCurrentValue(newTime),
      () => setCoarseBucket(getCurrentCoarseBucket(newTime)),
      () => {
        if (shouldAnnounce) {
          announceTime(newTime);
        }
      }
    ]);
    
    onChange?.(newTime);
  }, [onChange, getCurrentCoarseBucket, announceTime]);

  // RAF-throttled drag handler
  const throttledDragUpdate = useCallback(
    createRAFThrottle((clientY: number, rect: DOMRect) => {
      if (!isDraggingRef.current) return;
      
      const relativeY = (clientY - rect.top) / rect.height;
      const clampedY = Math.max(0, Math.min(1, relativeY));
      const hour = Math.round(startHour + clampedY * (endHour - startHour));
      const clampedHour = Math.max(startHour, Math.min(endHour, hour));
      
      const { minute } = normalizeValue(currentValue);
      const newTime = toOutputString(clampedHour, minute, false);
      
      updateTimeValue(newTime, true);
    }),
    [startHour, endHour, currentValue, updateTimeValue]
  );

  // Debounced announcement
  const debouncedAnnouncement = useCallback(
    createDebounce((time: string) => {
      announceTime(time);
    }, 100),
    [announceTime]
  );

  // Long press detection
  const startLongPress = useCallback(() => {
    const timer = setTimeout(() => {
      setShowMinuteSheet(true);
      triggerHapticFeedback();
    }, 600);
    setLongPressTimer(timer);
  }, [triggerHapticFeedback]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  // Minute sheet handlers
  const handleMinuteSelect = useCallback((minute: number) => {
    const newTime = toOutputString(dragHour, minute, false);
    setCurrentValue(newTime);
    setDragMinute(minute);
    setShowMinuteSheet(false);
    onChange?.(newTime);
    triggerHapticFeedback();
  }, [dragHour, onChange, triggerHapticFeedback]);

  const closeMinuteSheet = useCallback(() => {
    setShowMinuteSheet(false);
  }, []);

  // Performance-optimized drag handlers
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    event.preventDefault();
    
    isDraggingRef.current = true;
    setIsPressed(true);
    setShowFineHours(true);
    
    // Prevent text selection during drag
    preventTextSelection();
    startLongPress();
    triggerHapticFeedback();
  }, [disabled, triggerHapticFeedback, startLongPress]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isPressed || disabled || !isDraggingRef.current) return;
    setIsDragging(true);
    cancelLongPress(); // Cancel long press on drag
    
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Use RAF-throttled update for smooth performance
    throttledDragUpdate(event.clientY, rect);
  }, [isPressed, disabled, throttledDragUpdate, cancelLongPress]);

  const handleMouseUp = useCallback(() => {
    if (disabled) return;
    
    isDraggingRef.current = false;
    cancelLongPress();
    setIsPressed(false);
    setIsDragging(false);
    setShowFineHours(false);
    
    // Restore text selection
    restoreTextSelection();
    
    // Snap to nearest granularity on pointerup
    const { hour, minute } = normalizeValue(currentValue);
    const snappedMinute = snapMinute(minute, granularityMinutes);
    const snappedTime = toOutputString(hour, snappedMinute, false);
    
    updateTimeValue(snappedTime, true);
    triggerHapticFeedback();
  }, [disabled, currentValue, granularityMinutes, updateTimeValue, triggerHapticFeedback, cancelLongPress]);

  // Performance-optimized touch handlers
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (disabled) return;
    event.preventDefault();
    
    isDraggingRef.current = true;
    setIsPressed(true);
    setShowFineHours(true);
    
    // Prevent text selection during drag
    preventTextSelection();
    startLongPress();
    triggerHapticFeedback();
  }, [disabled, triggerHapticFeedback, startLongPress]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isPressed || disabled || !isDraggingRef.current) return;
    setIsDragging(true);
    cancelLongPress(); // Cancel long press on drag
    
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const touch = event.touches[0];
    // Use RAF-throttled update for smooth performance
    throttledDragUpdate(touch.clientY, rect);
  }, [isPressed, disabled, throttledDragUpdate, cancelLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;
    
    isDraggingRef.current = false;
    cancelLongPress();
    setIsPressed(false);
    setIsDragging(false);
    setShowFineHours(false);
    
    // Restore text selection
    restoreTextSelection();
    
    // Snap to nearest granularity on pointerup
    const { hour, minute } = normalizeValue(currentValue);
    const snappedMinute = snapMinute(minute, granularityMinutes);
    const snappedTime = toOutputString(hour, snappedMinute, false);
    
    updateTimeValue(snappedTime, true);
    triggerHapticFeedback();
  }, [disabled, currentValue, granularityMinutes, updateTimeValue, triggerHapticFeedback, cancelLongPress]);

  // Enhanced keyboard navigation with accessibility
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;
    
    const { hour, minute } = normalizeValue(currentValue);
    let newHour = hour;
    let newMinute = minute;
    let shouldAnnounce = false;
    
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        newHour = Math.min(endHour, hour + 1);
        shouldAnnounce = true;
        break;
      case 'ArrowDown':
        event.preventDefault();
        newHour = Math.max(startHour, hour - 1);
        shouldAnnounce = true;
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newMinute = Math.max(0, minute - granularityMinutes);
        shouldAnnounce = true;
        break;
      case 'ArrowRight':
        event.preventDefault();
        newMinute = Math.min(59, minute + granularityMinutes);
        shouldAnnounce = true;
        break;
      case 'PageUp':
        event.preventDefault();
        newHour = Math.min(endHour, hour + 4);
        shouldAnnounce = true;
        break;
      case 'PageDown':
        event.preventDefault();
        newHour = Math.max(startHour, hour - 4);
        shouldAnnounce = true;
        break;
      case 'Home':
        event.preventDefault();
        newHour = startHour;
        newMinute = 0;
        shouldAnnounce = true;
        break;
      case 'End':
        event.preventDefault();
        newHour = endHour;
        newMinute = 59;
        shouldAnnounce = true;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onChange?.(currentValue);
        announceTime(currentValue);
        return;
      case 'Escape':
        event.preventDefault();
        if (showMinuteSheet) {
          closeMinuteSheet();
        } else if (showFineHours) {
          setShowFineHours(false);
        }
        return;
      default:
        return;
    }
    
    if (newHour !== hour || newMinute !== minute) {
      const newTime = toOutputString(newHour, newMinute, false);
      setCurrentValue(newTime);
      setCoarseBucket(getCurrentCoarseBucket(newTime));
      if (shouldAnnounce) {
        announceTime(newTime);
      }
      onChange?.(newTime);
      triggerHapticFeedback();
    }
  }, [disabled, currentValue, startHour, endHour, granularityMinutes, onChange, getCurrentCoarseBucket, triggerHapticFeedback, announceTime, showMinuteSheet, showFineHours, closeMinuteSheet]);

  // Performance-optimized event listeners with passive options
  useEffect(() => {
    if (isPressed) {
      // Use passive listeners for better scroll performance
      document.addEventListener('mousemove', handleMouseMove, PASSIVE_OPTIONS);
      document.addEventListener('mouseup', handleMouseUp, PASSIVE_OPTIONS);
      document.addEventListener('touchmove', handleTouchMove, ACTIVE_OPTIONS);
      document.addEventListener('touchend', handleTouchEnd, PASSIVE_OPTIONS);
      
      // Store cleanup functions
      const cleanup = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
      
      cleanupFunctionsRef.current.push(cleanup);
    } else {
      // Clean up existing listeners
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
    }
    
    return () => {
      // Cleanup on unmount
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
      
      // Cancel any pending RAF
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      
      // Restore text selection
      restoreTextSelection();
    };
  }, [isPressed, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Initialize coarse bucket
  useEffect(() => {
    setCoarseBucket(getCurrentCoarseBucket(currentValue));
  }, [currentValue, getCurrentCoarseBucket]);

  return (
        <div
          ref={containerRef}
          className={`time-index-picker ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          role="application"
          aria-label="Time picker with coarse and fine hour selection"
          aria-describedby="time-picker-instructions"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
        >
      {/* Ergonomic rail */}
      <div
        ref={railRef}
        className={`time-index-rail ${
          handedness === 'right' ? 'right-0' : 'left-0'
        } ${
          isPressed ? 'scale-105 shadow-lg' : 'shadow-md'
        } ${
          COARSE_BUCKETS[coarseBucket].color
        }`}
        role="navigation"
        aria-label="Time period selection"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Coarse bucket labels */}
        <div className="time-index-cells" role="listbox" aria-label="Time period options">
          {Object.entries(COARSE_BUCKETS).map(([key, bucket], index) => (
            <div
              key={key}
              className={`time-index-cell ${
                key === coarseBucket
                  ? 'time-index-cell-active'
                  : 'time-index-cell-inactive'
              }`}
              role="option"
              aria-selected={key === coarseBucket}
              aria-label={`${bucket.label} (${key})`}
              tabIndex={key === coarseBucket ? 0 : -1}
            >
              {key}
            </div>
          ))}
        </div>

        {/* Fine hours overlay (shown on press/drag) */}
        {showFineHours && (
          <div className="time-index-fine-hours" role="listbox" aria-label="Hour selection">
            <div className="time-index-fine-hours-content">
              {Array.from({ length: endHour - startHour + 1 }, (_, i) => {
                const hour = startHour + i;
                const isActive = normalizeValue(currentValue).hour === hour;
                return (
                  <div
                    key={hour}
                    className={`time-index-fine-hour ${
                      isActive
                        ? 'time-index-fine-hour-active'
                        : 'time-index-fine-hour-inactive'
                    }`}
                    role="option"
                    aria-selected={isActive}
                    aria-label={`${toDisplayLabel(hour, format, compact)} ${format === '12h' ? (hour >= 12 ? 'PM' : 'AM') : 'hours'}`}
                    tabIndex={isActive ? 0 : -1}
                  >
                    {toDisplayLabel(hour, format, compact)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Thumb/handle */}
        <div
          ref={thumbRef}
          className={`absolute w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-lg transition-all duration-200 ${
            isDragging ? 'scale-125 shadow-xl' : 'scale-100'
          } ${
            handedness === 'right' 
              ? 'right-0 transform translate-x-1/2' 
              : 'left-0 transform -translate-x-1/2'
          }`}
          style={{
            top: `${calculatePositionFromTime(currentValue) * 100}%`,
            transform: `translateY(-50%) ${handedness === 'right' ? 'translateX(50%)' : 'translateX(-50%)'} ${isDragging ? 'scale(1.25)' : 'scale(1)'}`
          }}
        />
      </div>

        {/* Floating bubble */}
        <div
          ref={bubbleRef}
          className={`time-index-bubble ${
            handedness === 'right' ? 'right-16' : 'left-16'
          } ${
            isDragging || isPressed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            top: `${calculatePositionFromTime(currentValue) * 100}%`,
            transform: 'translateY(-50%)'
          }}
          role="status"
          aria-live="polite"
          aria-label={`Selected time: ${toFullLabel(normalizeValue(currentValue).hour, normalizeValue(currentValue).minute, format)}`}
        >
        <div className="time-index-bubble-content">
          {toFullLabel(normalizeValue(currentValue).hour, normalizeValue(currentValue).minute, format)}
        </div>
        {/* Bubble arrow */}
        <div className={`time-index-bubble-arrow ${
          handedness === 'right' 
            ? 'time-index-bubble-arrow-right' 
            : 'time-index-bubble-arrow-left'
        }`} />
      </div>

      {/* Time display */}
      <div className={`absolute top-1/2 transform -translate-y-1/2 ${
        handedness === 'right' ? 'right-20' : 'left-20'
      }`}>
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md">
          <div className="text-lg font-semibold text-gray-900">
            {toFullLabel(normalizeValue(currentValue).hour, normalizeValue(currentValue).minute, format)}
          </div>
          <div className="text-xs text-gray-500">
            {COARSE_BUCKETS[coarseBucket].label}
          </div>
        </div>
      </div>

          {/* Sticky confirm bar */}
          {(isDragging || isPressed) && (
            <div className="time-index-confirm-bar" role="toolbar" aria-label="Time selection actions">
              <button
                className="time-index-confirm-button"
                onClick={() => {
                  setIsDragging(false);
                  setIsPressed(false);
                  setShowFineHours(false);
                  onChange?.(currentValue);
                  announceTime(currentValue);
                }}
                aria-label={`Confirm time selection: ${toFullLabel(normalizeValue(currentValue).hour, normalizeValue(currentValue).minute, format)}`}
              >
                {confirmLabel}
              </button>
            </div>
          )}

          {/* Screen reader instructions */}
          <div id="time-picker-instructions" className="sr-only">
            Use arrow keys to navigate hours and minutes. Use Page Up/Down for faster navigation. 
            Press Home/End to go to start/end of time range. Press Enter or Space to confirm selection. 
            Press Escape to cancel. Use mouse or touch to drag the thumb for fine control.
          </div>

          {/* Live announcement region */}
          {announcement && (
            <div 
              className="sr-only" 
              aria-live="polite" 
              aria-atomic="true"
            >
              {announcement}
            </div>
          )}

      {/* Minute Sheet (bottom-right) */}
      {showMinuteSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={closeMinuteSheet}
          />
          
          {/* Sheet */}
          <div className="relative bg-white rounded-t-2xl shadow-2xl max-w-sm w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Select Minutes</h3>
              <button
                onClick={closeMinuteSheet}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Minute Options */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {[0, 15, 30, 45].map((minute) => (
                  <button
                    key={minute}
                    onClick={() => handleMinuteSelect(minute)}
                    className={`h-14 w-full rounded-lg border-2 transition-all duration-200 ${
                      dragMinute === minute
                        ? 'bg-blue-500 border-blue-500 text-white scale-105'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    style={{ minHeight: '56px' }} // Ensure 56px targets
                  >
                    <div className="text-lg font-medium">
                      {minute.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs opacity-75">
                      {minute === 0 ? 'On the hour' : 
                       minute === 15 ? 'Quarter past' :
                       minute === 30 ? 'Half past' : 'Quarter to'}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Custom minute input */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Minute
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="1"
                    value={dragMinute}
                    onChange={(e) => {
                      const value = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                      setDragMinute(value);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleMinuteSelect(dragMinute)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeIndexThumbPicker;
