import { useRef, useEffect, useCallback } from 'react';

// Hook to manage component cleanup functions
export const useComponentCleanup = () => {
  const cleanupRef = useRef([]);
  
  const addCleanup = useCallback((cleanupFn) => {
    if (typeof cleanupFn === 'function') {
      cleanupRef.current.push(cleanupFn);
    }
  }, []);
  
  useEffect(() => {
    return () => {
      cleanupRef.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.error('Cleanup function error:', error);
        }
      });
      cleanupRef.current = [];
    };
  }, []);
  
  return addCleanup;
};

// Hook to manage event listeners with automatic cleanup
export const useEventListener = (event, handler, element = window) => {
  const addCleanup = useComponentCleanup();
  
  useEffect(() => {
    if (!element || !handler) return;
    
    element.addEventListener(event, handler);
    
    addCleanup(() => {
      element.removeEventListener(event, handler);
    });
  }, [event, handler, element, addCleanup]);
};

// Hook to manage timers with automatic cleanup
export const useTimer = (callback, delay) => {
  const addCleanup = useComponentCleanup();
  const timeoutRef = useRef();
  
  useEffect(() => {
    if (delay === null || delay === undefined) return;
    
    timeoutRef.current = setTimeout(callback, delay);
    
    addCleanup(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    });
  }, [callback, delay, addCleanup]);
  
  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  return clearTimer;
};

// Hook to manage intervals with automatic cleanup
export const useInterval = (callback, delay) => {
  const addCleanup = useComponentCleanup();
  const intervalRef = useRef();
  
  useEffect(() => {
    if (delay === null || delay === undefined) return;
    
    intervalRef.current = setInterval(callback, delay);
    
    addCleanup(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    });
  }, [callback, delay, addCleanup]);
  
  const clearInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  return clearInterval;
};

// Hook to manage animation frames with automatic cleanup
export const useAnimationFrame = (callback) => {
  const addCleanup = useComponentCleanup();
  const frameRef = useRef();
  
  useEffect(() => {
    const animate = () => {
      callback();
      frameRef.current = requestAnimationFrame(animate);
    };
    
    frameRef.current = requestAnimationFrame(animate);
    
    addCleanup(() => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    });
  }, [callback, addCleanup]);
};

// Hook to manage subscriptions with automatic cleanup
export const useSubscription = (subscribe, unsubscribe) => {
  const addCleanup = useComponentCleanup();
  
  useEffect(() => {
    if (!subscribe) return;
    
    const subscription = subscribe();
    
    if (subscription && typeof subscription.unsubscribe === 'function') {
      addCleanup(() => subscription.unsubscribe());
    } else if (unsubscribe) {
      addCleanup(unsubscribe);
    }
  }, [subscribe, unsubscribe, addCleanup]);
};

export default useComponentCleanup;
