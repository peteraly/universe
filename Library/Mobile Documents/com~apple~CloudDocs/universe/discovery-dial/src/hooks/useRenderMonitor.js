import { useRef, useEffect } from 'react';

// Hook to monitor render counts and detect infinite re-renders
export const useRenderMonitor = (componentName) => {
  const renderCount = useRef(0);
  const prevPropsRef = useRef();
  const prevStateRef = useRef();
  
  useEffect(() => {
    renderCount.current += 1;
    
    if (renderCount.current > 10) {
      console.warn(`🚨 ${componentName} is rendering too frequently! (${renderCount.current} renders)`);
    }
    
    if (renderCount.current > 50) {
      console.error(`💥 ${componentName} has infinite re-render loop! (${renderCount.current} renders)`);
    }
  });
  
  return renderCount.current;
};

// Hook to monitor state changes
export const useStateChangeMonitor = (state, stateName) => {
  const prevStateRef = useRef(state);
  
  useEffect(() => {
    if (prevStateRef.current !== state) {
      console.log(`📊 ${stateName} changed:`, {
        from: prevStateRef.current,
        to: state,
        timestamp: new Date().toISOString()
      });
      prevStateRef.current = state;
    }
  }, [state, stateName]);
};

// Hook to monitor prop changes
export const usePropChangeMonitor = (props, componentName) => {
  const prevPropsRef = useRef(props);
  
  useEffect(() => {
    const changedProps = {};
    let hasChanges = false;
    
    Object.keys(props).forEach(key => {
      if (prevPropsRef.current[key] !== props[key]) {
        changedProps[key] = {
          from: prevPropsRef.current[key],
          to: props[key]
        };
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      console.log(`🔄 ${componentName} props changed:`, changedProps);
    }
    
    prevPropsRef.current = props;
  });
};

// Hook to detect circular dependencies
export const useCircularDependencyDetector = (dependencies, hookName) => {
  const prevDepsRef = useRef(dependencies);
  
  useEffect(() => {
    const hasCircularDependency = dependencies.some((dep, index) => {
      if (typeof dep === 'object' && dep !== null) {
        // Check for object reference changes
        return prevDepsRef.current[index] !== dep;
      }
      return false;
    });
    
    if (hasCircularDependency) {
      console.warn(`⚠️ Potential circular dependency in ${hookName}:`, dependencies);
    }
    
    prevDepsRef.current = dependencies;
  }, dependencies);
};

export default useRenderMonitor;

