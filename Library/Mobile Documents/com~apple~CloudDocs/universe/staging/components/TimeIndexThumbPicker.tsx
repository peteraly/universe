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
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  
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

  // Drag handlers
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    event.preventDefault();
    setIsPressed(true);
    setShowFineHours(true);
    triggerHapticFeedback();
  }, [disabled, triggerHapticFeedback]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isPressed || disabled) return;
    setIsDragging(true);
    
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const position = handedness === 'right' 
      ? (rect.right - event.clientX) / rect.width
      : (event.clientX - rect.left) / rect.width;
    
    const clampedPosition = Math.max(0, Math.min(1, position));
    const newTime = calculateTimeFromPosition(clampedPosition);
    setCurrentValue(newTime);
    setCoarseBucket(getCurrentCoarseBucket(newTime));
  }, [isPressed, disabled, handedness, calculateTimeFromPosition, getCurrentCoarseBucket]);

  const handleMouseUp = useCallback(() => {
    if (disabled) return;
    setIsPressed(false);
    setIsDragging(false);
    setShowFineHours(false);
    onChange?.(currentValue);
    triggerHapticFeedback();
  }, [disabled, currentValue, onChange, triggerHapticFeedback]);

  // Touch handlers
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (disabled) return;
    event.preventDefault();
    setIsPressed(true);
    setShowFineHours(true);
    triggerHapticFeedback();
  }, [disabled, triggerHapticFeedback]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isPressed || disabled) return;
    setIsDragging(true);
    
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const touch = event.touches[0];
    const position = handedness === 'right'
      ? (rect.right - touch.clientX) / rect.width
      : (touch.clientX - rect.left) / rect.width;
    
    const clampedPosition = Math.max(0, Math.min(1, position));
    const newTime = calculateTimeFromPosition(clampedPosition);
    setCurrentValue(newTime);
    setCoarseBucket(getCurrentCoarseBucket(newTime));
  }, [isPressed, disabled, handedness, calculateTimeFromPosition, getCurrentCoarseBucket]);

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;
    setIsPressed(false);
    setIsDragging(false);
    setShowFineHours(false);
    onChange?.(currentValue);
    triggerHapticFeedback();
  }, [disabled, currentValue, onChange, triggerHapticFeedback]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;
    
    const { hour, minute } = normalizeValue(currentValue);
    let newHour = hour;
    let newMinute = minute;
    
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        newHour = Math.min(endHour, hour + 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        newHour = Math.max(startHour, hour - 1);
        break;
      case 'PageUp':
        event.preventDefault();
        newHour = Math.min(endHour, hour + 4);
        break;
      case 'PageDown':
        event.preventDefault();
        newHour = Math.max(startHour, hour - 4);
        break;
      case 'Home':
        event.preventDefault();
        newHour = startHour;
        break;
      case 'End':
        event.preventDefault();
        newHour = endHour;
        break;
      default:
        return;
    }
    
    const newTime = toOutputString(newHour, newMinute, false);
    setCurrentValue(newTime);
    setCoarseBucket(getCurrentCoarseBucket(newTime));
    onChange?.(newTime);
    triggerHapticFeedback();
  }, [disabled, currentValue, startHour, endHour, onChange, getCurrentCoarseBucket, triggerHapticFeedback]);

  // Event listeners
  useEffect(() => {
    if (isPressed) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPressed, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Initialize coarse bucket
  useEffect(() => {
    setCoarseBucket(getCurrentCoarseBucket(currentValue));
  }, [currentValue, getCurrentCoarseBucket]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-16 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="slider"
      aria-label="Time picker"
      aria-valuenow={currentValue}
      aria-valuemin={`${startHour}:00`}
      aria-valuemax={`${endHour}:59`}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
    >
      {/* Right-docked rail */}
      <div
        ref={railRef}
        className={`absolute top-0 w-12 h-full border-2 rounded-lg transition-all duration-200 ${
          handedness === 'right' ? 'right-0' : 'left-0'
        } ${
          isPressed ? 'scale-105 shadow-lg' : 'shadow-md'
        } ${
          COARSE_BUCKETS[coarseBucket].color
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Coarse bucket labels */}
        <div className="absolute inset-0 flex flex-col justify-between p-1">
          {Object.entries(COARSE_BUCKETS).map(([key, bucket]) => (
            <div
              key={key}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-200 ${
                key === coarseBucket
                  ? 'bg-white shadow-md scale-110'
                  : 'bg-transparent'
              }`}
            >
              {key}
            </div>
          ))}
        </div>

        {/* Fine hours overlay (shown on press/drag) */}
        {showFineHours && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200">
            <div className="flex flex-col justify-between h-full p-1">
              {Array.from({ length: endHour - startHour + 1 }, (_, i) => {
                const hour = startHour + i;
                const isActive = normalizeValue(currentValue).hour === hour;
                return (
                  <div
                    key={hour}
                    className={`flex items-center justify-center w-8 h-6 text-xs font-medium rounded transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-500 text-white scale-110'
                        : 'bg-transparent text-gray-600'
                    }`}
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
        className={`absolute top-0 transition-all duration-200 ${
          handedness === 'right' ? 'right-16' : 'left-16'
        } ${
          isDragging || isPressed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          top: `${calculatePositionFromTime(currentValue) * 100}%`,
          transform: 'translateY(-50%)'
        }}
      >
        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
          {toFullLabel(normalizeValue(currentValue).hour, normalizeValue(currentValue).minute, format)}
        </div>
        {/* Bubble arrow */}
        <div className={`absolute top-1/2 w-0 h-0 border-4 border-transparent ${
          handedness === 'right' 
            ? 'right-0 border-l-gray-900 transform translate-x-full' 
            : 'left-0 border-r-gray-900 transform -translate-x-full'
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

      {/* Confirm button (shown when dragging) */}
      {(isDragging || isPressed) && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-blue-600 transition-colors duration-200"
            onClick={() => {
              setIsDragging(false);
              setIsPressed(false);
              setShowFineHours(false);
              onChange?.(currentValue);
            }}
          >
            {confirmLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default TimeIndexThumbPicker;
