import { useEffect, useCallback, useRef } from 'react';

const useMobilePerformance = () => {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsRef = useRef(60);
  const memoryIntervalRef = useRef(null);

  // Monitor frame rate
  const measureFPS = useCallback(() => {
    frameCountRef.current++;
    const currentTime = performance.now();
    
    if (currentTime - lastTimeRef.current >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
      fpsRef.current = fps;
      
      if (fps < 30) {
        console.warn('Low FPS detected:', fps);
        // Trigger performance optimization
        document.body.classList.add('low-performance');
      } else {
        document.body.classList.remove('low-performance');
      }
      
      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }
    
    requestAnimationFrame(measureFPS);
  }, []);

  // Monitor memory usage
  const monitorMemory = useCallback(() => {
    if (performance.memory) {
      const memory = performance.memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
      
      console.log('Memory usage:', {
        used: usedMB + ' MB',
        total: totalMB + ' MB',
        limit: limitMB + ' MB',
        percentage: Math.round((usedMB / limitMB) * 100) + '%'
      });
      
      // Warn if memory usage is high
      if ((usedMB / limitMB) > 0.8) {
        console.warn('High memory usage detected:', Math.round((usedMB / limitMB) * 100) + '%');
      }
    }
  }, []);

  // Monitor touch responsiveness
  const monitorTouchResponsiveness = useCallback(() => {
    let touchStartTime = 0;
    let touchEndTime = 0;
    
    const handleTouchStart = () => {
      touchStartTime = performance.now();
    };
    
    const handleTouchEnd = () => {
      touchEndTime = performance.now();
      const responseTime = touchEndTime - touchStartTime;
      
      if (responseTime > 100) {
        console.warn('Slow touch response:', responseTime + 'ms');
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    // Start FPS monitoring
    measureFPS();
    
    // Start memory monitoring
    memoryIntervalRef.current = setInterval(monitorMemory, 5000);
    
    // Start touch responsiveness monitoring
    const cleanupTouch = monitorTouchResponsiveness();
    
    return () => {
      if (memoryIntervalRef.current) {
        clearInterval(memoryIntervalRef.current);
      }
      cleanupTouch();
    };
  }, [measureFPS, monitorMemory, monitorTouchResponsiveness]);

  // Get current performance metrics
  const getPerformanceMetrics = useCallback(() => {
    return {
      fps: fpsRef.current,
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      } : null
    };
  }, []);

  return {
    getPerformanceMetrics,
    currentFPS: fpsRef.current
  };
};

export default useMobilePerformance;


