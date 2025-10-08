#Context: StartTimeField Wrapper Component
// Controlled wrapper for TimeIndexThumbPicker in L1_Curation workflow
// Part of V12.0 L1 Event Curation Hub implementation

import React, { useState, useCallback, useEffect } from 'react';
import { TimeIndexThumbPicker } from '../../../components/TimeIndexThumbPicker';
import { normalizeValue, toFullLabel } from '../../../lib/time/format';

interface StartTimeFieldProps {
  value?: string;
  onChange?: (time: string) => void;
  onTimeSelected?: (time: string, formattedTime: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  // TimeIndexThumbPicker props
  granularityMinutes?: number;
  format?: '12h' | '24h';
  handedness?: 'left' | 'right';
  startHour?: number;
  endHour?: number;
}

interface EventDraft {
  id?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  venue?: string;
  tags?: string[];
  status?: 'draft' | 'pending' | 'approved' | 'published';
  createdAt?: string;
  updatedAt?: string;
}

export const StartTimeField: React.FC<StartTimeFieldProps> = ({
  value = '12:00',
  onChange,
  onTimeSelected,
  label = 'Start Time',
  placeholder = 'Select start time',
  disabled = false,
  required = false,
  className = '',
  granularityMinutes = 15,
  format = '12h',
  handedness = 'right',
  startHour = 5,
  endHour = 23
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Sync with external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Handle time selection with dispatch to event draft
  const handleTimeChange = useCallback((newTime: string) => {
    setInternalValue(newTime);
    onChange?.(newTime);
    
    // Dispatch to event draft form (no production writes)
    if (onTimeSelected) {
      const { hour, minute } = normalizeValue(newTime);
      const formattedTime = toFullLabel(hour, minute, format);
      onTimeSelected(newTime, formattedTime);
    }
  }, [onChange, onTimeSelected, format]);

  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Format display value
  const displayValue = React.useMemo(() => {
    if (!internalValue) return placeholder;
    const { hour, minute } = normalizeValue(internalValue);
    return toFullLabel(hour, minute, format);
  }, [internalValue, format, placeholder]);

  return (
    <div className={`start-time-field ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Time Picker Container */}
      <div 
        className={`relative bg-white border rounded-lg transition-all duration-200 ${
          isFocused 
            ? 'border-blue-500 ring-2 ring-blue-200' 
            : 'border-gray-300 hover:border-gray-400'
        } ${
          disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={disabled ? -1 : 0}
      >
        {/* Display Value */}
        <div className="p-4 min-h-[60px] flex items-center justify-between">
          <div className="flex-1">
            <div className={`text-lg font-medium ${
              internalValue ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {displayValue}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {format === '12h' ? '12-hour format' : '24-hour format'}
            </div>
          </div>
          
          {/* Time Icon */}
          <div className="ml-4 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* TimeIndexThumbPicker */}
        <div className={`time-picker-container ${isFocused ? 'block' : 'hidden'}`}>
          <TimeIndexThumbPicker
            value={internalValue}
            onChange={handleTimeChange}
            granularityMinutes={granularityMinutes}
            format={format}
            handedness={handedness}
            startHour={startHour}
            endHour={endHour}
            disabled={disabled}
            confirmLabel="Set Start Time"
            className="w-full"
          />
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-2 text-xs text-gray-500">
        Use the time picker to select your event start time. 
        Drag the thumb or use keyboard navigation for precise control.
      </div>
    </div>
  );
};

// Hook for easy integration with event draft forms
export const useStartTimeField = (initialValue?: string) => {
  const [value, setValue] = useState(initialValue || '12:00');
  const [eventDraft, setEventDraft] = useState<EventDraft>({
    startTime: value,
    status: 'draft'
  });

  const handleTimeSelected = useCallback((time: string, formattedTime: string) => {
    setValue(time);
    setEventDraft(prev => ({
      ...prev,
      startTime: time,
      updatedAt: new Date().toISOString()
    }));
    
    // Log to console for development (no production writes)
    console.log('Event Draft Updated:', {
      startTime: time,
      formattedTime,
      timestamp: new Date().toISOString()
    });
  }, []);

  return {
    value,
    setValue,
    eventDraft,
    handleTimeSelected
  };
};

// Example usage component for curation page
export const StartTimeFieldExample: React.FC = () => {
  const { value, handleTimeSelected } = useStartTimeField('09:00');

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Event Start Time</h3>
      <StartTimeField
        value={value}
        onTimeSelected={handleTimeSelected}
        label="When does your event start?"
        required
        format="12h"
        granularityMinutes={15}
      />
    </div>
  );
};

export default StartTimeField;
