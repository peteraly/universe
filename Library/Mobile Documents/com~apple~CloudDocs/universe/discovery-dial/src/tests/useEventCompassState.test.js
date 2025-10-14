import { renderHook, act } from '@testing-library/react';
import useEventCompassState from '../hooks/useEventCompassState';

// Mock data for testing
const mockCategories = [
  {
    id: 'professional',
    label: 'Professional',
    direction: 'north',
    subcategories: [
      {
        id: 'talks',
        label: 'Talks',
        events: [
          { id: 'e1', name: 'Event 1' },
          { id: 'e2', name: 'Event 2' },
          { id: 'e3', name: 'Event 3' }
        ]
      },
      {
        id: 'workshops',
        label: 'Workshops',
        events: [
          { id: 'e4', name: 'Event 4' }
        ]
      }
    ]
  },
  {
    id: 'social',
    label: 'Social',
    direction: 'east',
    subcategories: [
      {
        id: 'parties',
        label: 'Parties',
        events: [
          { id: 'e5', name: 'Event 5' }
        ]
      }
    ]
  },
  {
    id: 'arts',
    label: 'Arts/Culture',
    direction: 'south',
    subcategories: []
  },
  {
    id: 'wellness',
    label: 'Wellness',
    direction: 'west',
    subcategories: []
  }
];

describe('useEventCompassState', () => {
  describe('Initial State', () => {
    it('initializes with first primary, sub, and event', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      expect(result.current.state.primaryIndex).toBe(0);
      expect(result.current.state.subIndex).toBe(0);
      expect(result.current.state.eventIndex).toBe(0);
      expect(result.current.state.activePrimary.id).toBe('professional');
      expect(result.current.state.activeSub.id).toBe('talks');
      expect(result.current.state.activeEvent.id).toBe('e1');
    });

    it('returns null active items when categories are empty', () => {
      const { result } = renderHook(() => useEventCompassState([]));
      
      expect(result.current.state.activePrimary).toBeNull();
      expect(result.current.state.activeSub).toBeNull();
      expect(result.current.state.activeEvent).toBeNull();
    });
  });

  describe('setPrimaryByDirection', () => {
    it('changes primary category by direction', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      act(() => {
        result.current.actions.setPrimaryByDirection('east');
      });
      
      expect(result.current.state.primaryIndex).toBe(1);
      expect(result.current.state.activePrimary.id).toBe('social');
    });

    it('resets sub and event indices when changing primary', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      // Set to non-zero indices
      act(() => {
        result.current.actions.rotateSub(1);
        result.current.actions.nextEvent();
      });
      
      expect(result.current.state.subIndex).toBe(1);
      expect(result.current.state.eventIndex).toBe(1);
      
      // Change primary
      act(() => {
        result.current.actions.setPrimaryByDirection('east');
      });
      
      expect(result.current.state.subIndex).toBe(0);
      expect(result.current.state.eventIndex).toBe(0);
    });

    it('does nothing if direction not found', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      act(() => {
        result.current.actions.setPrimaryByDirection('invalid');
      });
      
      expect(result.current.state.primaryIndex).toBe(0);
    });

    it('does nothing if already at target direction', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      act(() => {
        result.current.actions.setPrimaryByDirection('north');
      });
      
      expect(result.current.state.primaryIndex).toBe(0);
    });
  });

  describe('rotateSub', () => {
    it('rotates forward through subcategories', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      act(() => {
        result.current.actions.rotateSub(1);
      });
      
      expect(result.current.state.subIndex).toBe(1);
      expect(result.current.state.activeSub.id).toBe('workshops');
    });

    it('rotates backward through subcategories', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      // Move forward first
      act(() => {
        result.current.actions.rotateSub(1);
      });
      
      expect(result.current.state.subIndex).toBe(1);
      
      // Move backward
      act(() => {
        result.current.actions.rotateSub(-1);
      });
      
      expect(result.current.state.subIndex).toBe(0);
    });

    it('clamps to max subcategory index', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      act(() => {
        result.current.actions.rotateSub(10);
      });
      
      expect(result.current.state.subIndex).toBe(1); // Max is 1 for professional
    });

    it('clamps to min subcategory index (0)', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      act(() => {
        result.current.actions.rotateSub(-10);
      });
      
      expect(result.current.state.subIndex).toBe(0);
    });

    it('resets event index when subcategory changes', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      // Navigate to second event
      act(() => {
        result.current.actions.nextEvent();
      });
      
      expect(result.current.state.eventIndex).toBe(1);
      
      // Rotate subcategory
      act(() => {
        result.current.actions.rotateSub(1);
      });
      
      expect(result.current.state.eventIndex).toBe(0);
    });

    it('rounds to nearest subcategory (snapping)', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      // Fractional step should round
      act(() => {
        result.current.actions.rotateSub(0.6);
      });
      
      expect(result.current.state.subIndex).toBe(1);
    });

    it('does nothing if no subcategories', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      // Switch to category with no subcategories
      act(() => {
        result.current.actions.setPrimaryByDirection('south');
      });
      
      const initialSubIndex = result.current.state.subIndex;
      
      act(() => {
        result.current.actions.rotateSub(1);
      });
      
      expect(result.current.state.subIndex).toBe(initialSubIndex);
    });
  });

  describe('nextEvent / prevEvent', () => {
    it('navigates to next event', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      act(() => {
        result.current.actions.nextEvent();
      });
      
      expect(result.current.state.eventIndex).toBe(1);
      expect(result.current.state.activeEvent.id).toBe('e2');
    });

    it('navigates to previous event', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      // Move forward first
      act(() => {
        result.current.actions.nextEvent();
      });
      
      expect(result.current.state.eventIndex).toBe(1);
      
      // Move backward
      act(() => {
        result.current.actions.prevEvent();
      });
      
      expect(result.current.state.eventIndex).toBe(0);
    });

    it('wraps to first event when at end', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      // Navigate to last event (index 2)
      act(() => {
        result.current.actions.nextEvent();
        result.current.actions.nextEvent();
      });
      
      expect(result.current.state.eventIndex).toBe(2);
      
      // Next should wrap to 0
      act(() => {
        result.current.actions.nextEvent();
      });
      
      expect(result.current.state.eventIndex).toBe(0);
    });

    it('wraps to last event when at beginning', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      expect(result.current.state.eventIndex).toBe(0);
      
      // Previous should wrap to last (index 2)
      act(() => {
        result.current.actions.prevEvent();
      });
      
      expect(result.current.state.eventIndex).toBe(2);
    });

    it('does nothing if no events', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      // Switch to category with single event subcategory
      act(() => {
        result.current.actions.setPrimaryByDirection('east');
      });
      
      const initialEventIndex = result.current.state.eventIndex;
      
      act(() => {
        result.current.actions.nextEvent();
      });
      
      // Should wrap back to 0
      expect(result.current.state.eventIndex).toBe(0);
    });
  });

  describe('selectEventByIndex', () => {
    it('directly selects event by index', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      act(() => {
        result.current.actions.selectEventByIndex(2);
      });
      
      expect(result.current.state.eventIndex).toBe(2);
      expect(result.current.state.activeEvent.id).toBe('e3');
    });

    it('clamps to max event index', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      act(() => {
        result.current.actions.selectEventByIndex(100);
      });
      
      expect(result.current.state.eventIndex).toBe(2); // Max is 2 for talks
    });

    it('clamps to min event index (0)', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      act(() => {
        result.current.actions.selectEventByIndex(-5);
      });
      
      expect(result.current.state.eventIndex).toBe(0);
    });
  });

  describe('reset', () => {
    it('resets all indices to 0', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      // Set to non-zero indices
      act(() => {
        result.current.actions.setPrimaryByDirection('east');
        result.current.actions.nextEvent();
      });
      
      expect(result.current.state.primaryIndex).toBe(1);
      
      // Reset
      act(() => {
        result.current.actions.reset();
      });
      
      expect(result.current.state.primaryIndex).toBe(0);
      expect(result.current.state.subIndex).toBe(0);
      expect(result.current.state.eventIndex).toBe(0);
    });
  });

  describe('positionLabels', () => {
    it('maps categories to compass positions', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      expect(result.current.state.positionLabels.north.label).toBe('Professional');
      expect(result.current.state.positionLabels.east.label).toBe('Social');
      expect(result.current.state.positionLabels.south.label).toBe('Arts/Culture');
      expect(result.current.state.positionLabels.west.label).toBe('Wellness');
    });

    it('marks active category in position labels', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      expect(result.current.state.positionLabels.north.isActive).toBe(true);
      expect(result.current.state.positionLabels.east.isActive).toBe(false);
      
      act(() => {
        result.current.actions.setPrimaryByDirection('east');
      });
      
      expect(result.current.state.positionLabels.north.isActive).toBe(false);
      expect(result.current.state.positionLabels.east.isActive).toBe(true);
    });
  });

  describe('state counts', () => {
    it('provides subCount for active primary', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      expect(result.current.state.subCount).toBe(2);
      
      act(() => {
        result.current.actions.setPrimaryByDirection('east');
      });
      
      expect(result.current.state.subCount).toBe(1);
    });

    it('provides eventCount for active subcategory', () => {
      const { result } = renderHook(() => useEventCompassState(mockCategories));
      
      expect(result.current.state.eventCount).toBe(3);
      
      act(() => {
        result.current.actions.rotateSub(1);
      });
      
      expect(result.current.state.eventCount).toBe(1);
    });
  });
});


