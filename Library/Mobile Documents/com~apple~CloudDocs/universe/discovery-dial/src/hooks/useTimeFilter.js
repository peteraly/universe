import { useState, useCallback, useMemo } from 'react';
import { 
  parseEventTime, 
  isAtOrAfter, 
  getCurrentTime,
  getTodayDate,
  shouldShowEvent
} from '../utils/timeHelpers';

/**
 * useTimeFilter - Combines time-based and category-based event filtering
 * 
 * Filters events using logical AND:
 * - Date & Time: Event is today/this week and starts at or after selected time
 * - Category: Event matches active primary category
 * - Subcategory: Event matches active subcategory
 * 
 * Default behavior (no time selected):
 * - Shows events happening today and this week
 * - Prioritizes events starting soon
 * 
 * @param {Array} events - All events with { startTime, date, primaryCategory, subcategory, ... }
 * @param {Object} dialState - Current dial state from useEventCompassState
 * @returns {Object} { selectedTime, filteredEvents, onTimeChange, totalMatches }
 * 
 * @example
 * const { selectedTime, filteredEvents, onTimeChange, totalMatches } = useTimeFilter(events, dialState);
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
   * Filter events by date, time, AND category
   */
  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    if (!dialState || !dialState.activePrimary) return events;

    const today = getTodayDate();

    const filtered = events.filter(event => {
      // DATE & TIME FILTER: Event is happening at or after selected time
      const eventTime = parseEventTime(event.startTime);
      const eventDate = event.date || today; // Fallback to today if no date
      
      const dateTimeMatch = shouldShowEvent(
        eventDate,
        eventTime,
        today,
        selectedTime
      );

      // CATEGORY FILTER: Matches active primary category
      const categoryMatch = 
        event.primaryCategory === dialState.activePrimary?.label;

      // SUBCATEGORY FILTER: Matches active subcategory (if present)
      const subcategoryMatch = dialState.activeSub
        ? event.subcategory === dialState.activeSub?.label
        : true; // If no subcategory selected, match all

      // LOGICAL AND: All filters must pass
      return dateTimeMatch && categoryMatch && subcategoryMatch;
    });

    // Sort by date, then by time (earliest first)
    return filtered.sort((a, b) => {
      // Compare dates first
      if (a.date !== b.date) {
        return a.date < b.date ? -1 : 1;
      }
      
      // Same date, compare times
      const timeA = parseEventTime(a.startTime);
      const timeB = parseEventTime(b.startTime);
      const totalMinutesA = timeA.hours * 60 + timeA.minutes;
      const totalMinutesB = timeB.hours * 60 + timeB.minutes;
      
      return totalMinutesA - totalMinutesB;
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
    onTimeChange: handleTimeChange,
    totalMatches: filteredEvents.length
  };
}

