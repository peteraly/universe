import {
  clamp,
  wrapIndex,
  stepFromDelta,
  lerp,
  normalize,
  angleFromCenter,
  snapToStep,
  distance
} from '../utils/math';

describe('Math Utilities', () => {
  describe('clamp', () => {
    it('returns value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it('clamps to minimum when value is too low', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(-100, 0, 10)).toBe(0);
    });

    it('clamps to maximum when value is too high', () => {
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(100, 0, 10)).toBe(10);
    });

    it('handles negative ranges', () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(0, -10, -1)).toBe(-1);
    });

    it('handles fractional values', () => {
      expect(clamp(5.5, 0, 10)).toBe(5.5);
      expect(clamp(0.1, 0, 1)).toBe(0.1);
    });
  });

  describe('wrapIndex', () => {
    it('returns index when within bounds', () => {
      expect(wrapIndex(0, 5)).toBe(0);
      expect(wrapIndex(2, 5)).toBe(2);
      expect(wrapIndex(4, 5)).toBe(4);
    });

    it('wraps forward at boundary', () => {
      expect(wrapIndex(5, 5)).toBe(0);
      expect(wrapIndex(6, 5)).toBe(1);
      expect(wrapIndex(10, 5)).toBe(0);
    });

    it('wraps backward for negative indices', () => {
      expect(wrapIndex(-1, 5)).toBe(4);
      expect(wrapIndex(-2, 5)).toBe(3);
      expect(wrapIndex(-5, 5)).toBe(0);
      expect(wrapIndex(-6, 5)).toBe(4);
    });

    it('handles zero length array', () => {
      expect(wrapIndex(0, 0)).toBe(0);
      expect(wrapIndex(5, 0)).toBe(0);
    });

    it('handles large positive wraps', () => {
      expect(wrapIndex(15, 5)).toBe(0);
      expect(wrapIndex(17, 5)).toBe(2);
    });

    it('handles large negative wraps', () => {
      expect(wrapIndex(-15, 5)).toBe(0);
      expect(wrapIndex(-17, 5)).toBe(3);
    });
  });

  describe('stepFromDelta', () => {
    it('calculates steps for exact multiples', () => {
      expect(stepFromDelta(140, 140)).toBe(1);
      expect(stepFromDelta(280, 140)).toBe(2);
      expect(stepFromDelta(0, 140)).toBe(0);
    });

    it('rounds to nearest step', () => {
      expect(stepFromDelta(70, 140)).toBe(1);   // 0.5 → 1
      expect(stepFromDelta(210, 140)).toBe(2);  // 1.5 → 2
      expect(stepFromDelta(30, 140)).toBe(0);   // 0.21 → 0
      expect(stepFromDelta(100, 140)).toBe(1);  // 0.71 → 1
    });

    it('handles negative deltas', () => {
      expect(stepFromDelta(-140, 140)).toBe(-1);
      expect(stepFromDelta(-280, 140)).toBe(-2);
      expect(stepFromDelta(-70, 140)).toBe(-1);  // -0.5 → -1
    });

    it('handles zero sensitivity', () => {
      expect(stepFromDelta(100, 0)).toBe(0);
    });

    it('handles different sensitivity values', () => {
      expect(stepFromDelta(100, 100)).toBe(1);
      expect(stepFromDelta(100, 50)).toBe(2);
      expect(stepFromDelta(100, 200)).toBe(1);  // 0.5 → 1
    });
  });

  describe('lerp', () => {
    it('interpolates between values', () => {
      expect(lerp(0, 100, 0.5)).toBe(50);
      expect(lerp(0, 100, 0.25)).toBe(25);
      expect(lerp(0, 100, 0.75)).toBe(75);
    });

    it('returns start value at t=0', () => {
      expect(lerp(0, 100, 0)).toBe(0);
      expect(lerp(50, 150, 0)).toBe(50);
    });

    it('returns end value at t=1', () => {
      expect(lerp(0, 100, 1)).toBe(100);
      expect(lerp(50, 150, 1)).toBe(150);
    });

    it('handles negative values', () => {
      expect(lerp(-100, 100, 0.5)).toBe(0);
      expect(lerp(-50, -10, 0.5)).toBe(-30);
    });

    it('allows extrapolation (t > 1 or t < 0)', () => {
      expect(lerp(0, 100, 1.5)).toBe(150);
      expect(lerp(0, 100, -0.5)).toBe(-50);
    });
  });

  describe('normalize', () => {
    it('normalizes value from one range to another', () => {
      expect(normalize(5, 0, 10, 0, 100)).toBe(50);
      expect(normalize(0, 0, 10, 0, 100)).toBe(0);
      expect(normalize(10, 0, 10, 0, 100)).toBe(100);
    });

    it('handles different input/output ranges', () => {
      expect(normalize(50, 0, 100, 0, 1)).toBe(0.5);
      expect(normalize(25, 0, 100, 0, 1)).toBe(0.25);
    });

    it('handles negative ranges', () => {
      expect(normalize(0, -10, 10, 0, 100)).toBe(50);
      expect(normalize(-10, -10, 10, 0, 100)).toBe(0);
    });
  });

  describe('angleFromCenter', () => {
    it('calculates angle to right (0°)', () => {
      expect(angleFromCenter(0, 0, 1, 0)).toBe(0);
      expect(angleFromCenter(0, 0, 10, 0)).toBe(0);
    });

    it('calculates angle down (90°)', () => {
      expect(angleFromCenter(0, 0, 0, 1)).toBe(90);
      expect(angleFromCenter(0, 0, 0, 10)).toBe(90);
    });

    it('calculates angle to left (180°)', () => {
      expect(angleFromCenter(0, 0, -1, 0)).toBe(180);
      expect(angleFromCenter(0, 0, -10, 0)).toBe(180);
    });

    it('calculates angle up (270°)', () => {
      expect(angleFromCenter(0, 0, 0, -1)).toBe(270);
      expect(angleFromCenter(0, 0, 0, -10)).toBe(270);
    });

    it('calculates diagonal angles', () => {
      expect(angleFromCenter(0, 0, 1, 1)).toBe(45);
      expect(angleFromCenter(0, 0, -1, 1)).toBe(135);
      expect(angleFromCenter(0, 0, -1, -1)).toBe(225);
      expect(angleFromCenter(0, 0, 1, -1)).toBe(315);
    });

    it('handles non-origin centers', () => {
      expect(angleFromCenter(5, 5, 6, 5)).toBe(0);
      expect(angleFromCenter(5, 5, 5, 6)).toBe(90);
    });
  });

  describe('snapToStep', () => {
    it('snaps to nearest step', () => {
      expect(snapToStep(7, 5)).toBe(5);
      expect(snapToStep(8, 5)).toBe(10);
      expect(snapToStep(12, 5)).toBe(10);
      expect(snapToStep(13, 5)).toBe(15);
    });

    it('handles exact steps', () => {
      expect(snapToStep(10, 5)).toBe(10);
      expect(snapToStep(15, 5)).toBe(15);
      expect(snapToStep(0, 5)).toBe(0);
    });

    it('handles negative values', () => {
      expect(snapToStep(-7, 5)).toBe(-5);
      expect(snapToStep(-8, 5)).toBe(-10);
    });

    it('handles zero step', () => {
      expect(snapToStep(7, 0)).toBe(7);
    });

    it('handles fractional steps', () => {
      expect(snapToStep(0.7, 0.5)).toBe(0.5);
      expect(snapToStep(0.8, 0.5)).toBe(1);
    });
  });

  describe('distance', () => {
    it('calculates distance between points', () => {
      expect(distance(0, 0, 3, 4)).toBe(5);
      expect(distance(0, 0, 0, 0)).toBe(0);
      expect(distance(0, 0, 1, 0)).toBe(1);
      expect(distance(0, 0, 0, 1)).toBe(1);
    });

    it('handles negative coordinates', () => {
      expect(distance(0, 0, -3, -4)).toBe(5);
      expect(distance(-1, -1, -4, -5)).toBe(5);
    });

    it('is commutative', () => {
      expect(distance(0, 0, 3, 4)).toBe(distance(3, 4, 0, 0));
      expect(distance(1, 2, 5, 6)).toBe(distance(5, 6, 1, 2));
    });
  });
});


