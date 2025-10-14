import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for responsive design management
 * Handles dynamic radius calculation, text positioning, and touch target optimization
 */
const useResponsiveDesign = () => {
  const [dialRadius, setDialRadius] = useState(0);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const resizeTimeoutRef = useRef(null);

  // Calculate dial radius based on container size
  const calculateDialRadius = useCallback((containerElement) => {
    if (!containerElement) return 0;
    
    const rect = containerElement.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    return size / 2;
  }, []);

  // Update text positions based on dynamic radius
  const updateTextPositions = useCallback((radius) => {
    if (radius === 0) return;
    
    const offset = radius * 0.8; // 80% of radius for text placement
    
    // Update compass label positions
    document.querySelectorAll('.compass-label').forEach(label => {
      const classList = Array.from(label.classList);
      const directionClass = classList.find(cls => cls.startsWith('compass-label-'));
      
      if (directionClass) {
        const direction = directionClass.split('-')[2]; // north, east, south, west
        
        switch(direction) {
          case 'north':
            label.style.top = `${radius - offset}px`;
            break;
          case 'east':
            label.style.right = `${radius - offset}px`;
            break;
          case 'south':
            label.style.bottom = `${radius - offset}px`;
            break;
          case 'west':
            label.style.left = `${radius - offset}px`;
            break;
        }
      }
    });

    // Update primary category positions
    document.querySelectorAll('.primary-category-item').forEach(item => {
      const angle = parseFloat(item.dataset.angle) || 0;
      const radians = (angle * Math.PI) / 180;
      const x = Math.cos(radians) * (radius * 0.7);
      const y = Math.sin(radians) * (radius * 0.7);
      
      item.style.transform = `translate(${x}px, ${y}px)`;
    });

    // Update subcategory positions
    document.querySelectorAll('.subcategory-item').forEach(item => {
      const angle = parseFloat(item.dataset.angle) || 0;
      const radians = (angle * Math.PI) / 180;
      const x = Math.cos(radians) * (radius * 0.5);
      const y = Math.sin(radians) * (radius * 0.5);
      
      item.style.transform = `translate(${x}px, ${y}px)`;
    });
  }, []);

  // Ensure touch targets are appropriately sized
  const updateTouchTargets = useCallback((radius) => {
    const minTouchTarget = 44; // iOS/Android minimum touch target
    const scaleFactor = Math.max(1, minTouchTarget / (radius * 0.1));
    
    document.querySelectorAll('.subcategory-item').forEach(item => {
      item.style.minWidth = `${minTouchTarget}px`;
      item.style.minHeight = `${minTouchTarget}px`;
      item.style.fontSize = `${Math.max(12, 14 * scaleFactor)}px`;
    });

    document.querySelectorAll('.primary-category-item').forEach(item => {
      item.style.minWidth = `${minTouchTarget}px`;
      item.style.minHeight = `${minTouchTarget}px`;
      item.style.fontSize = `${Math.max(14, 16 * scaleFactor)}px`;
    });
  }, []);

  // Handle responsive changes
  const handleResponsiveChanges = useCallback(() => {
    const dialContainer = document.querySelector('.dial-container');
    if (dialContainer) {
      const radius = calculateDialRadius(dialContainer);
      setDialRadius(radius);
      updateTextPositions(radius);
      updateTouchTargets(radius);
    }

    // Update viewport size
    setViewportSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, [calculateDialRadius, updateTextPositions, updateTouchTargets]);

  // Debounced resize handler
  const handleResize = useCallback(() => {
    clearTimeout(resizeTimeoutRef.current);
    resizeTimeoutRef.current = setTimeout(handleResponsiveChanges, 100);
  }, [handleResponsiveChanges]);

  // Handle zoom changes
  const handleZoom = useCallback(() => {
    handleResponsiveChanges();
  }, [handleResponsiveChanges]);

  // Initialize responsive design
  useEffect(() => {
    // Initial setup
    handleResponsiveChanges();

    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResponsiveChanges);
    
    // Handle zoom changes (browser zoom)
    const mediaQuery = window.matchMedia('(min-resolution: 1dppx)');
    mediaQuery.addEventListener('change', handleZoom);

    // Cleanup
    return () => {
      clearTimeout(resizeTimeoutRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResponsiveChanges);
      mediaQuery.removeEventListener('change', handleZoom);
    };
  }, [handleResize, handleResponsiveChanges, handleZoom]);

  // Return responsive design utilities
  return {
    dialRadius,
    viewportSize,
    calculateDialRadius,
    updateTextPositions,
    updateTouchTargets,
    handleResponsiveChanges
  };
};

export default useResponsiveDesign;
