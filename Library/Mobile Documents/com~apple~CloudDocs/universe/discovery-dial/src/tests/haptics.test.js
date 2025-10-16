import {
  tick,
  softTick,
  hardTick,
  isHapticSupported,
  customPattern
} from '../utils/haptics';

describe('Haptics Utilities', () => {
  let mockVibrate;
  let originalNavigator;

  beforeEach(() => {
    // Save original navigator
    originalNavigator = global.navigator;
    
    // Create mock vibrate function
    mockVibrate = jest.fn();
    
    // Mock navigator with vibrate support
    global.navigator = {
      vibrate: mockVibrate
    };
  });

  afterEach(() => {
    // Restore original navigator
    global.navigator = originalNavigator;
    jest.clearAllMocks();
  });

  describe('tick', () => {
    it('triggers soft tick (5ms) by default', () => {
      tick();
      expect(mockVibrate).toHaveBeenCalledWith(5);
    });

    it('triggers soft tick (5ms) when kind is "soft"', () => {
      tick('soft');
      expect(mockVibrate).toHaveBeenCalledWith(5);
    });

    it('triggers hard tick (12ms) when kind is "hard"', () => {
      tick('hard');
      expect(mockVibrate).toHaveBeenCalledWith(12);
    });

    it('does not crash when vibrate API is unavailable', () => {
      global.navigator = {};
      expect(() => tick()).not.toThrow();
      expect(() => tick('soft')).not.toThrow();
      expect(() => tick('hard')).not.toThrow();
    });

    it('does not crash when navigator is undefined', () => {
      global.navigator = undefined;
      expect(() => tick()).not.toThrow();
      expect(() => tick('soft')).not.toThrow();
      expect(() => tick('hard')).not.toThrow();
    });
  });

  describe('softTick', () => {
    it('triggers a soft tick (5ms)', () => {
      softTick();
      expect(mockVibrate).toHaveBeenCalledWith(5);
    });

    it('is equivalent to tick("soft")', () => {
      softTick();
      const softTickCall = mockVibrate.mock.calls[0];
      
      mockVibrate.mockClear();
      
      tick('soft');
      const tickSoftCall = mockVibrate.mock.calls[0];
      
      expect(softTickCall).toEqual(tickSoftCall);
    });
  });

  describe('hardTick', () => {
    it('triggers a hard tick (12ms)', () => {
      hardTick();
      expect(mockVibrate).toHaveBeenCalledWith(12);
    });

    it('is equivalent to tick("hard")', () => {
      hardTick();
      const hardTickCall = mockVibrate.mock.calls[0];
      
      mockVibrate.mockClear();
      
      tick('hard');
      const tickHardCall = mockVibrate.mock.calls[0];
      
      expect(hardTickCall).toEqual(tickHardCall);
    });
  });

  describe('isHapticSupported', () => {
    it('returns true when vibrate API is available', () => {
      global.navigator = {
        vibrate: jest.fn()
      };
      expect(isHapticSupported()).toBe(true);
    });

    it('returns false when vibrate is not a function', () => {
      global.navigator = {
        vibrate: 'not a function'
      };
      expect(isHapticSupported()).toBe(false);
    });

    it('returns false when navigator is undefined', () => {
      global.navigator = undefined;
      expect(isHapticSupported()).toBe(false);
    });

    it('returns false when vibrate property is missing', () => {
      global.navigator = {};
      expect(isHapticSupported()).toBe(false);
    });
  });

  describe('customPattern', () => {
    it('triggers custom vibration pattern', () => {
      const pattern = [10, 50, 10];
      customPattern(pattern);
      expect(mockVibrate).toHaveBeenCalledWith(pattern);
    });

    it('handles complex patterns', () => {
      const pattern = [100, 30, 100, 30, 100];
      customPattern(pattern);
      expect(mockVibrate).toHaveBeenCalledWith(pattern);
    });

    it('does not crash when vibrate API is unavailable', () => {
      global.navigator = {};
      expect(() => customPattern([10, 50, 10])).not.toThrow();
    });

    it('does not crash when navigator is undefined', () => {
      global.navigator = undefined;
      expect(() => customPattern([10, 50, 10])).not.toThrow();
    });
  });

  describe('Usage Scenarios', () => {
    it('supports primary category change workflow', () => {
      // Primary category change → hard tick
      tick('hard');
      expect(mockVibrate).toHaveBeenCalledWith(12);
    });

    it('supports subcategory snap workflow', () => {
      // Subcategory snap → soft tick
      tick('soft');
      expect(mockVibrate).toHaveBeenCalledWith(5);
    });

    it('supports event navigation workflow', () => {
      // Event next/prev → soft tick
      softTick();
      expect(mockVibrate).toHaveBeenCalledWith(5);
      
      mockVibrate.mockClear();
      
      softTick();
      expect(mockVibrate).toHaveBeenCalledWith(5);
    });

    it('gracefully degrades when haptics not supported', () => {
      global.navigator = undefined;
      
      // Should not crash or throw
      expect(() => {
        tick('hard');  // Primary category change
        tick('soft');  // Subcategory snap
        softTick();    // Event next
        softTick();    // Event prev
      }).not.toThrow();
    });
  });

  describe('Browser Compatibility', () => {
    it('works with standard vibrate API', () => {
      global.navigator = {
        vibrate: mockVibrate
      };
      
      tick('soft');
      expect(mockVibrate).toHaveBeenCalled();
    });

    it('handles missing API gracefully (desktop browsers)', () => {
      global.navigator = {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)'
      };
      
      expect(() => tick('soft')).not.toThrow();
    });

    it('handles partial navigator object', () => {
      global.navigator = {
        platform: 'MacIntel',
        // vibrate not defined
      };
      
      expect(() => tick('soft')).not.toThrow();
    });
  });
});



