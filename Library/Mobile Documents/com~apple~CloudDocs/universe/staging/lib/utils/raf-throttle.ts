// RAF Throttle Utility
// Lightweight requestAnimationFrame throttling for smooth performance
// Part of V12.0 L1 Event Curation Hub implementation

/**
 * Creates a throttled function that only executes once per animation frame
 * @param callback - Function to throttle
 * @returns Throttled function
 */
export const createRAFThrottle = <T extends (...args: any[]) => void>(
  callback: T
): T => {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttled = ((...args: Parameters<T>) => {
    lastArgs = args;
    
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          callback(...lastArgs);
        }
        rafId = null;
        lastArgs = null;
      });
    }
  }) as T;

  // Cleanup function
  (throttled as any).cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
      lastArgs = null;
    }
  };

  return throttled;
};

/**
 * Debounced function that waits for a delay before executing
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const createDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      callback(...args);
      timeoutId = null;
    }, delay);
  }) as T;

  // Cleanup function
  (debounced as any).cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
};

/**
 * Performance-optimized event listener options
 */
export const PASSIVE_OPTIONS: AddEventListenerOptions = {
  passive: true,
  capture: false
};

export const ACTIVE_OPTIONS: AddEventListenerOptions = {
  passive: false,
  capture: false
};

/**
 * Prevents text selection during drag operations
 */
export const preventTextSelection = () => {
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';
  document.body.style.mozUserSelect = 'none';
  document.body.style.msUserSelect = 'none';
};

/**
 * Restores text selection after drag operations
 */
export const restoreTextSelection = () => {
  document.body.style.userSelect = '';
  document.body.style.webkitUserSelect = '';
  document.body.style.mozUserSelect = '';
  document.body.style.msUserSelect = '';
};

/**
 * Performance-optimized DOM updates
 */
export const batchDOMUpdates = (updates: (() => void)[]) => {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};
