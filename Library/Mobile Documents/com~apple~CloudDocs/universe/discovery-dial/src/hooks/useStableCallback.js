import { useRef, useCallback, useEffect, useState } from 'react';

// Utility to check if two objects are shallow equal
const shallowEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
};

// Hook to create stable callbacks that don't cause re-renders
export const useStableCallback = (callback, deps) => {
  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);
  
  // Update callback ref when dependencies change
  if (!shallowEqual(depsRef.current, deps)) {
    callbackRef.current = callback;
    depsRef.current = deps;
  }
  
  return useCallback(callbackRef.current, []);
};

// Hook to create stable effects that don't cause infinite loops
export const useStableEffect = (effect, deps) => {
  const effectRef = useRef(effect);
  const depsRef = useRef(deps);
  
  if (!shallowEqual(depsRef.current, deps)) {
    effectRef.current = effect;
    depsRef.current = deps;
  }
  
  useEffect(() => {
    return effectRef.current();
  }, []);
};

// Hook to create stable memoized values
export const useStableMemo = (factory, deps) => {
  const factoryRef = useRef(factory);
  const depsRef = useRef(deps);
  const valueRef = useRef();
  
  if (!shallowEqual(depsRef.current, deps)) {
    factoryRef.current = factory;
    depsRef.current = deps;
    valueRef.current = factoryRef.current();
  }
  
  return valueRef.current;
};

// Hook to debounce state updates
export const useDebouncedState = (initialValue, delay) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef();
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);
  
  return [debouncedValue, setValue];
};

// Hook to batch state updates
export const useBatchedState = (initialState = {}) => {
  const [state, setState] = useState(initialState);
  
  const batchUpdate = useCallback((updates) => {
    setState(prevState => ({
      ...prevState,
      ...updates
    }));
  }, []);
  
  return [state, batchUpdate];
};

// Hook to create stable component keys
export const useStableKeys = (items) => {
  const keysRef = useRef(new Map());
  
  const getStableKey = useCallback((item, index) => {
    if (item && item.id) {
      return item.id;
    }
    
    if (!keysRef.current.has(index)) {
      keysRef.current.set(index, `stable-key-${index}-${Date.now()}`);
    }
    
    return keysRef.current.get(index);
  }, []);
  
  return getStableKey;
};

export default useStableCallback;
