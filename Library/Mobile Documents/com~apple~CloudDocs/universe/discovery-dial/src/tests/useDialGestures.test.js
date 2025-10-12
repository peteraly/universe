import { renderHook, act } from '@testing-library/react';
import useDialGestures from '../hooks/useDialGestures';

// Mock actions from state hook
const createMockActions = () => ({
  setPrimaryByDirection: jest.fn(),
  rotateSub: jest.fn(),
  nextEvent: jest.fn(),
  prevEvent: jest.fn()
});

// Helper to create pointer events
const createPointerEvent = (type, x, y) => ({
  type,
  clientX: x,
  clientY: y,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn()
});

describe('useDialGestures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    it('returns binding props and hover state', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions));

      expect(result.current.bindDialAreaProps).toBeDefined();
      expect(result.current.bindLowerAreaProps).toBeDefined();
      expect(result.current.hoverSubIndex).toBeNull();
    });

    it('includes touch-action: none in binding props', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions));

      expect(result.current.bindDialAreaProps.style.touchAction).toBe('none');
      expect(result.current.bindLowerAreaProps.style.touchAction).toBe('none');
    });
  });

  describe('Primary Category Swipe - Dial Area', () => {
    it('detects upward swipe as north', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions));

      // Start gesture
      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 200));
      });

      // Move up significantly
      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 100, 150));
      });

      // Release with velocity
      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindDialAreaProps.onPointerUp(createPointerEvent('pointerup', 100, 150));
      });

      expect(actions.setPrimaryByDirection).toHaveBeenCalledWith('north');
    });

    it('detects downward swipe as south', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions));

      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 100, 150));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindDialAreaProps.onPointerUp(createPointerEvent('pointerup', 100, 150));
      });

      expect(actions.setPrimaryByDirection).toHaveBeenCalledWith('south');
    });

    it('detects rightward swipe as east', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions));

      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 150, 100));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindDialAreaProps.onPointerUp(createPointerEvent('pointerup', 150, 100));
      });

      expect(actions.setPrimaryByDirection).toHaveBeenCalledWith('east');
    });

    it('detects leftward swipe as west', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions));

      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 50, 100));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindDialAreaProps.onPointerUp(createPointerEvent('pointerup', 50, 100));
      });

      expect(actions.setPrimaryByDirection).toHaveBeenCalledWith('west');
    });

    it('ignores swipe if distance too small', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions, { minSwipeDistance: 40 }));

      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      // Small movement (less than threshold)
      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 100, 110));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindDialAreaProps.onPointerUp(createPointerEvent('pointerup', 100, 110));
      });

      expect(actions.setPrimaryByDirection).not.toHaveBeenCalled();
    });

    it('ignores swipe if velocity too low', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions, { minSwipeVelocity: 0.3 }));

      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 100, 150));
      });

      // Very slow release (low velocity)
      act(() => {
        jest.advanceTimersByTime(500);
        result.current.bindDialAreaProps.onPointerUp(createPointerEvent('pointerup', 100, 150));
      });

      expect(actions.setPrimaryByDirection).not.toHaveBeenCalled();
    });
  });

  describe('Subcategory Rotation - Dial Area', () => {
    it('detects horizontal drag as rotation gesture', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions, { dialSensitivity: 140 }));

      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      // Horizontal drag (rotation)
      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 240, 105));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindDialAreaProps.onPointerUp(createPointerEvent('pointerup', 240, 105));
      });

      // 140px delta / 140 sensitivity = 1 step
      expect(actions.rotateSub).toHaveBeenCalledWith(1);
    });

    it('calculates rotation steps based on sensitivity', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions, { dialSensitivity: 100 }));

      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      // 300px horizontal drag
      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 400, 100));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindDialAreaProps.onPointerUp(createPointerEvent('pointerup', 400, 100));
      });

      // 300px / 100 sensitivity = 3 steps
      expect(actions.rotateSub).toHaveBeenCalledWith(3);
    });

    it('provides hoverSubIndex during rotation', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions, { dialSensitivity: 140 }));

      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      // Move enough to trigger rotation detection
      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 130, 100));
      });

      // Hover index should still be null (not enough movement)
      expect(result.current.hoverSubIndex).toBeNull();

      // Move more
      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 240, 100));
      });

      // Should show hover index (1 step)
      expect(result.current.hoverSubIndex).toBe(1);
    });

    it('clears hoverSubIndex on release', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions, { dialSensitivity: 140 }));

      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 240, 100));
      });

      expect(result.current.hoverSubIndex).toBe(1);

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindDialAreaProps.onPointerUp(createPointerEvent('pointerup', 240, 100));
      });

      expect(result.current.hoverSubIndex).toBeNull();
    });

    it('supports negative rotation (left drag)', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions, { dialSensitivity: 140 }));

      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 200, 100));
      });

      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 60, 100));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindDialAreaProps.onPointerUp(createPointerEvent('pointerup', 60, 100));
      });

      // -140px / 140 = -1 step
      expect(actions.rotateSub).toHaveBeenCalledWith(-1);
    });

    it('rounds to nearest step', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions, { dialSensitivity: 140 }));

      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      // 210px = 1.5 steps, should round to 2
      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 310, 100));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindDialAreaProps.onPointerUp(createPointerEvent('pointerup', 310, 100));
      });

      expect(actions.rotateSub).toHaveBeenCalledWith(2);
    });
  });

  describe('Gesture Conflict Prevention', () => {
    it('prioritizes swipe over rotation for vertical movement', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions));

      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      // Mixed diagonal movement (more vertical)
      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 120, 160));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindDialAreaProps.onPointerUp(createPointerEvent('pointerup', 120, 160));
      });

      // Should detect as vertical swipe (south), not rotation
      expect(actions.setPrimaryByDirection).toHaveBeenCalledWith('south');
      expect(actions.rotateSub).not.toHaveBeenCalled();
    });

    it('prioritizes rotation over swipe for horizontal movement', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions));

      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      // Horizontal movement (rotation indicator)
      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 240, 110));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindDialAreaProps.onPointerUp(createPointerEvent('pointerup', 240, 110));
      });

      // Should detect as rotation, not swipe
      expect(actions.rotateSub).toHaveBeenCalled();
      expect(actions.setPrimaryByDirection).not.toHaveBeenCalled();
    });
  });

  describe('Event Browsing - Lower Area', () => {
    it('detects left swipe as next event', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions));

      act(() => {
        result.current.bindLowerAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      act(() => {
        result.current.bindLowerAreaProps.onPointerMove(createPointerEvent('pointermove', 50, 100));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindLowerAreaProps.onPointerUp(createPointerEvent('pointerup', 50, 100));
      });

      expect(actions.nextEvent).toHaveBeenCalled();
    });

    it('detects right swipe as previous event', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions));

      act(() => {
        result.current.bindLowerAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      act(() => {
        result.current.bindLowerAreaProps.onPointerMove(createPointerEvent('pointermove', 150, 100));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindLowerAreaProps.onPointerUp(createPointerEvent('pointerup', 150, 100));
      });

      expect(actions.prevEvent).toHaveBeenCalled();
    });

    it('requires quick swipe (within duration threshold)', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions, { eventSwipeDuration: 250 }));

      act(() => {
        result.current.bindLowerAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      act(() => {
        result.current.bindLowerAreaProps.onPointerMove(createPointerEvent('pointermove', 150, 100));
      });

      // Too slow (over duration threshold)
      act(() => {
        jest.advanceTimersByTime(300);
        result.current.bindLowerAreaProps.onPointerUp(createPointerEvent('pointerup', 150, 100));
      });

      expect(actions.prevEvent).not.toHaveBeenCalled();
    });

    it('requires minimum distance', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions, { eventSwipeDistance: 24 }));

      act(() => {
        result.current.bindLowerAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      // Small swipe (below threshold)
      act(() => {
        result.current.bindLowerAreaProps.onPointerMove(createPointerEvent('pointermove', 110, 100));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindLowerAreaProps.onPointerUp(createPointerEvent('pointerup', 110, 100));
      });

      expect(actions.nextEvent).not.toHaveBeenCalled();
      expect(actions.prevEvent).not.toHaveBeenCalled();
    });

    it('requires horizontal gesture (not vertical)', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions));

      act(() => {
        result.current.bindLowerAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      // Vertical swipe (should be ignored in lower area)
      act(() => {
        result.current.bindLowerAreaProps.onPointerMove(createPointerEvent('pointermove', 100, 150));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindLowerAreaProps.onPointerUp(createPointerEvent('pointerup', 100, 150));
      });

      expect(actions.nextEvent).not.toHaveBeenCalled();
      expect(actions.prevEvent).not.toHaveBeenCalled();
    });
  });

  describe('Pointer Cancel', () => {
    it('resets gesture state on dial area cancel', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions));

      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 240, 100));
      });

      expect(result.current.hoverSubIndex).toBe(1);

      act(() => {
        result.current.bindDialAreaProps.onPointerCancel();
      });

      expect(result.current.hoverSubIndex).toBeNull();
    });

    it('resets gesture state on lower area cancel', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions));

      act(() => {
        result.current.bindLowerAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      act(() => {
        result.current.bindLowerAreaProps.onPointerCancel();
      });

      // Should not crash or call actions
      expect(actions.nextEvent).not.toHaveBeenCalled();
    });
  });

  describe('Configuration Options', () => {
    it('respects custom minSwipeDistance', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions, { minSwipeDistance: 100 }));

      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      // 50px movement (below custom threshold)
      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 100, 150));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindDialAreaProps.onPointerUp(createPointerEvent('pointerup', 100, 150));
      });

      expect(actions.setPrimaryByDirection).not.toHaveBeenCalled();
    });

    it('respects custom dialSensitivity', () => {
      const actions = createMockActions();
      const { result } = renderHook(() => useDialGestures(actions, { dialSensitivity: 200 }));

      act(() => {
        result.current.bindDialAreaProps.onPointerDown(createPointerEvent('pointerdown', 100, 100));
      });

      act(() => {
        result.current.bindDialAreaProps.onPointerMove(createPointerEvent('pointermove', 300, 100));
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current.bindDialAreaProps.onPointerUp(createPointerEvent('pointerup', 300, 100));
      });

      // 200px / 200 sensitivity = 1 step
      expect(actions.rotateSub).toHaveBeenCalledWith(1);
    });
  });
});

