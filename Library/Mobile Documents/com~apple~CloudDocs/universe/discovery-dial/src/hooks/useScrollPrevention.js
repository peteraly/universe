import { useEffect, useCallback } from 'react';

/**
 * Custom hook for complete scroll prevention
 * Prevents all scrolling behaviors that could interfere with dial gestures
 */
const useScrollPrevention = () => {
  const preventAllScrolling = useCallback(() => {
    // Prevent wheel events
    const preventWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Prevent touch events that could trigger scrolling
    const preventTouchScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Prevent keyboard scroll events
    const preventKeyboardScroll = (e) => {
      const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40]; // Space, Page Up/Down, Home, End, Arrow keys
      if (scrollKeys.includes(e.keyCode)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Prevent scroll events
    const preventScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Add event listeners to all possible scroll triggers
    document.addEventListener('wheel', preventWheel, { passive: false });
    document.addEventListener('touchstart', preventTouchScroll, { passive: false });
    document.addEventListener('touchmove', preventTouchScroll, { passive: false });
    document.addEventListener('touchend', preventTouchScroll, { passive: false });
    document.addEventListener('keydown', preventKeyboardScroll, { passive: false });
    document.addEventListener('scroll', preventScroll, { passive: false });
    
    // Safari-specific event listeners
    if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
      document.addEventListener('gesturestart', preventTouchScroll, { passive: false });
      document.addEventListener('gesturechange', preventTouchScroll, { passive: false });
      document.addEventListener('gestureend', preventTouchScroll, { passive: false });
    }
    
    // iOS Safari specific event listeners
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      document.addEventListener('gesturestart', preventTouchScroll, { passive: false });
      document.addEventListener('gesturechange', preventTouchScroll, { passive: false });
      document.addEventListener('gestureend', preventTouchScroll, { passive: false });
    }
    
    // Prevent scroll on window
    window.addEventListener('scroll', preventScroll, { passive: false });
    window.addEventListener('wheel', preventWheel, { passive: false });
    
    // Prevent scroll on document
    document.addEventListener('scroll', preventScroll, { passive: false });
    document.addEventListener('wheel', preventWheel, { passive: false });

    // Return cleanup function
    return () => {
      document.removeEventListener('wheel', preventWheel);
      document.removeEventListener('touchstart', preventTouchScroll);
      document.removeEventListener('touchmove', preventTouchScroll);
      document.removeEventListener('touchend', preventTouchScroll);
      document.removeEventListener('keydown', preventKeyboardScroll);
      document.removeEventListener('scroll', preventScroll);
      window.removeEventListener('scroll', preventScroll);
      window.removeEventListener('wheel', preventWheel);
      
      // Safari-specific cleanup
      if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        document.removeEventListener('gesturestart', preventTouchScroll);
        document.removeEventListener('gesturechange', preventTouchScroll);
        document.removeEventListener('gestureend', preventTouchScroll);
      }
      
      // iOS Safari specific cleanup
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.removeEventListener('gesturestart', preventTouchScroll);
        document.removeEventListener('gesturechange', preventTouchScroll);
        document.removeEventListener('gestureend', preventTouchScroll);
      }
    };
  }, []);

  const preventBrowserSpecificScrolling = useCallback(() => {
    // Safari momentum scrolling prevention
    if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
      document.body.style.webkitOverflowScrolling = 'auto'; // Disable momentum scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      document.body.style.touchAction = 'none';
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.bottom = '0';
      document.body.style.width = '100vw';
      document.body.style.height = '100vh';
      // Safari-specific properties
      document.body.style.webkitTransform = 'translateZ(0)';
      document.body.style.webkitBackfaceVisibility = 'hidden';
      document.body.style.webkitPerspective = '1000';
    }
    
    // iOS Safari specific prevention
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      document.body.style.webkitOverflowScrolling = 'auto';
      document.body.style.overscrollBehavior = 'none';
      document.body.style.touchAction = 'none';
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.bottom = '0';
      document.body.style.width = '100vw';
      document.body.style.height = '100vh';
    }
    
    // Chrome overscroll prevention
    if (navigator.userAgent.includes('Chrome')) {
      document.body.style.overscrollBehavior = 'none';
    }
    
    // Firefox smooth scrolling prevention
    if (navigator.userAgent.includes('Firefox')) {
      document.documentElement.style.scrollBehavior = 'auto';
    }
  }, []);

  const preventScrollingAtAllZoomLevels = useCallback(() => {
    // Get current zoom level
    const getZoomLevel = () => {
      return window.devicePixelRatio || 1;
    };
    
    // Apply scroll prevention regardless of zoom
    const applyZoomIndependentPrevention = () => {
      const zoomLevel = getZoomLevel();
      
      // Force scroll prevention at any zoom level
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100vw';
      document.body.style.height = '100vh';
      document.body.style.touchAction = 'none';
      document.body.style.overscrollBehavior = 'none';
      
      // Adjust for zoom level
      if (zoomLevel !== 1) {
        document.body.style.transform = `scale(${1/zoomLevel})`;
        document.body.style.transformOrigin = 'top left';
      }
    };
    
    // Apply on load and zoom change
    applyZoomIndependentPrevention();
    window.addEventListener('resize', applyZoomIndependentPrevention);
    
    return () => {
      window.removeEventListener('resize', applyZoomIndependentPrevention);
    };
  }, []);

  const preventProgrammaticScrolling = useCallback(() => {
    // Override window scroll methods
    const originalScrollTo = window.scrollTo;
    const originalScrollBy = window.scrollBy;
    const originalScroll = window.scroll;
    
    window.scrollTo = () => {};
    window.scrollBy = () => {};
    window.scroll = () => {};
    
    // Override element scroll methods
    const preventElementScroll = (element) => {
      if (element && typeof element.scrollTo === 'function') {
        element.scrollTo = () => {};
      }
      if (element && typeof element.scrollBy === 'function') {
        element.scrollBy = () => {};
      }
      if (element && typeof element.scroll === 'function') {
        element.scroll = () => {};
      }
    };
    
    // Apply to all existing elements
    document.querySelectorAll('*').forEach(preventElementScroll);
    
    // Apply to dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            preventElementScroll(node);
            node.querySelectorAll('*').forEach(preventElementScroll);
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Return cleanup function
    return () => {
      // Restore original methods
      window.scrollTo = originalScrollTo;
      window.scrollBy = originalScrollBy;
      window.scroll = originalScroll;
      observer.disconnect();
    };
  }, []);

  // Initialize complete scroll prevention
  useEffect(() => {
    const cleanup1 = preventAllScrolling();
    preventBrowserSpecificScrolling();
    const cleanup2 = preventScrollingAtAllZoomLevels();
    const cleanup3 = preventProgrammaticScrolling();
    
    // Reapply prevention on any DOM changes
    const observer = new MutationObserver(() => {
      preventAllScrolling();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => {
      cleanup1();
      cleanup2();
      cleanup3();
      observer.disconnect();
    };
  }, [preventAllScrolling, preventBrowserSpecificScrolling, preventScrollingAtAllZoomLevels, preventProgrammaticScrolling]);

  // Return scroll prevention utilities
  return {
    preventAllScrolling,
    preventBrowserSpecificScrolling,
    preventScrollingAtAllZoomLevels,
    preventProgrammaticScrolling
  };
};

export default useScrollPrevention;
