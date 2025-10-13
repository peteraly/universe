import { useState, useCallback, useMemo } from 'react';
import { parseEventTime, isAtOrAfter, getCurrentTime } from '../utils/timeHelpers';

/**
 * useTimeFilter - Combines time-based and category-based event filtering
 * 
 * Filters events using logical AND:
 * - Time: Event starts at or after selected time
 * - Category: Event matches active primary category
 * - Subcategory: Event matches active subcategory
 * 
 * @param {Array} events - All events with { startTime, primaryCategory, subcategory, ... }
 * @param {Object} dialState - Current dial state from useEventCompassState
 * @returns {Object} { selectedTime, filteredEvents, onTimeChange }
 * 
 * @example
 * const { selectedTime, filteredEvents, onTimeChange } = useTimeFilter(events, dialState);
 * <TimePickerSlider selectedTime={selectedTime} onTimeChange={onTimeChange} />
 * <EventReadout activeEvent={filteredEvents[0]} />
 */
export default function useTimeFilter(events = [], dialState) {
  // Initialize with current time (or 6PM if after 11PM)
  const getDefaultTime = useCallback(() => {
    const now = getCurrentTime();
    // If it's after 11PM, default to 6PM for next day discovery
    if (now.hours >= 23) {
      return { hours: 18, minutes: 0 }; // 6PM
    }
    return now;
  }, []);

  const [selectedTime, setSelectedTime] = useState(getDefaultTime);

  /**
   * Filter events by time AND category
   */
  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    if (!dialState || !dialState.activePrimary) return events;

    return events.filter(event => {
      // TIME FILTER: Event starts at or after selected time
      const eventTime = parseEventTime(event.startTime);
      const timeMatch = isAtOrAfter(eventTime, selectedTime);

      // CATEGORY FILTER: Matches active primary category
      const categoryMatch = 
        event.primaryCategory === dialState.activePrimary?.label;

      // SUBCATEGORY FILTER: Matches active subcategory (if present)
      const subcategoryMatch = dialState.activeSub
        ? event.subcategory === dialState.activeSub?.label
        : true; // If no subcategory selected, match all

      // LOGICAL AND: All filters must pass
      return timeMatch && categoryMatch && subcategoryMatch;
    });
  }, [events, selectedTime, dialState]);

  /**
   * Handle time change from picker
   */
  const handleTimeChange = useCallback((newTime) => {
    setSelectedTime(newTime);
  }, []);

  return {
    selectedTime,
    filteredEvents,
    onTimeChange: handleTimeChange
  };
}

