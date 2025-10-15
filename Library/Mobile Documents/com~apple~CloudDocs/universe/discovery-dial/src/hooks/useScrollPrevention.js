import { useEffect, useCallback } from 'react';
import { 
  safeDocumentBody, 
  safeDocumentElement, 
  isDocumentAvailable, 
  isWindowAvailable,
  safeAddEventListener,
  safeRemoveEventListener,
  safeSetStyle,
  safeSetStyles
} from '../utils/safeDOM';

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

    // Add event listeners to all possible scroll triggers (only if document is available)
    if (isDocumentAvailable()) {
      safeAddEventListener(document, 'wheel', preventWheel, { passive: false });
      safeAddEventListener(document, 'touchstart', preventTouchScroll, { passive: false });
      safeAddEventListener(document, 'touchmove', preventTouchScroll, { passive: false });
      safeAddEventListener(document, 'touchend', preventTouchScroll, { passive: false });
      safeAddEventListener(document, 'keydown', preventKeyboardScroll, { passive: false });
      safeAddEventListener(document, 'scroll', preventScroll, { passive: false });
    }
    
    // Safari-specific event listeners
    if (isDocumentAvailable() && isWindowAvailable() && navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
      safeAddEventListener(document, 'gesturestart', preventTouchScroll, { passive: false });
      safeAddEventListener(document, 'gesturechange', preventTouchScroll, { passive: false });
      safeAddEventListener(document, 'gestureend', preventTouchScroll, { passive: false });
    }
    
    // iOS Safari specific event listeners
    if (isDocumentAvailable() && isWindowAvailable() && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
      safeAddEventListener(document, 'gesturestart', preventTouchScroll, { passive: false });
      safeAddEventListener(document, 'gesturechange', preventTouchScroll, { passive: false });
      safeAddEventListener(document, 'gestureend', preventTouchScroll, { passive: false });
    }
    
    // Prevent scroll on window
    if (isWindowAvailable()) {
      safeAddEventListener(window, 'scroll', preventScroll, { passive: false });
      safeAddEventListener(window, 'wheel', preventWheel, { passive: false });
    }
    
    // Prevent scroll on document (additional safety)
    if (isDocumentAvailable()) {
      safeAddEventListener(document, 'scroll', preventScroll, { passive: false });
      safeAddEventListener(document, 'wheel', preventWheel, { passive: false });
    }

    // Return cleanup function
    return () => {
      if (isDocumentAvailable()) {
        safeRemoveEventListener(document, 'wheel', preventWheel);
        safeRemoveEventListener(document, 'touchstart', preventTouchScroll);
        safeRemoveEventListener(document, 'touchmove', preventTouchScroll);
        safeRemoveEventListener(document, 'touchend', preventTouchScroll);
        safeRemoveEventListener(document, 'keydown', preventKeyboardScroll);
        safeRemoveEventListener(document, 'scroll', preventScroll);
        
        // Safari-specific cleanup
        if (isWindowAvailable() && navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
          safeRemoveEventListener(document, 'gesturestart', preventTouchScroll);
          safeRemoveEventListener(document, 'gesturechange', preventTouchScroll);
          safeRemoveEventListener(document, 'gestureend', preventTouchScroll);
        }
        
        // iOS Safari specific cleanup
        if (isWindowAvailable() && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
          safeRemoveEventListener(document, 'gesturestart', preventTouchScroll);
          safeRemoveEventListener(document, 'gesturechange', preventTouchScroll);
          safeRemoveEventListener(document, 'gestureend', preventTouchScroll);
        }
      }
      
      // Window cleanup
      if (isWindowAvailable()) {
        safeRemoveEventListener(window, 'scroll', preventScroll);
        safeRemoveEventListener(window, 'wheel', preventWheel);
      }
    };
  }, []);

  const preventBrowserSpecificScrolling = useCallback(() => {
    // Safari momentum scrolling prevention
    if (isWindowAvailable() && isDocumentAvailable() && navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
      const body = safeDocumentBody();
      if (body) {
        safeSetStyles(body, {
          webkitOverflowScrolling: 'auto', // Disable momentum scrolling
          overflow: 'hidden',
          overscrollBehavior: 'none',
          touchAction: 'none',
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          width: '100vw',
          height: '100vh',
          webkitTransform: 'translateZ(0)',
          webkitBackfaceVisibility: 'hidden',
          webkitPerspective: '1000'
        });
      }
    }
    
    // iOS Safari specific prevention
    if (isWindowAvailable() && isDocumentAvailable() && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const body = safeDocumentBody();
      if (body) {
        safeSetStyles(body, {
          webkitOverflowScrolling: 'auto',
          overscrollBehavior: 'none',
          touchAction: 'none',
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          width: '100vw',
          height: '100vh'
        });
      }
    }
    
    // Chrome overscroll prevention
    if (isWindowAvailable() && isDocumentAvailable() && navigator.userAgent.includes('Chrome')) {
      const body = safeDocumentBody();
      if (body) {
        safeSetStyle(body, 'overscrollBehavior', 'none');
      }
    }
    
    // Firefox smooth scrolling prevention
    if (isWindowAvailable() && isDocumentAvailable() && navigator.userAgent.includes('Firefox')) {
      const documentElement = safeDocumentElement();
      if (documentElement) {
        safeSetStyle(documentElement, 'scrollBehavior', 'auto');
      }
    }
  }, []);

  const preventScrollingAtAllZoomLevels = useCallback(() => {
    // Get current zoom level
    const getZoomLevel = () => {
      return window.devicePixelRatio || 1;
    };
    
    // Apply scroll prevention regardless of zoom
    const applyZoomIndependentPrevention = () => {
      if (!isDocumentAvailable()) return;
      
      const zoomLevel = getZoomLevel();
      const body = safeDocumentBody();
      
      if (body) {
        // Force scroll prevention at any zoom level
        safeSetStyles(body, {
          overflow: 'hidden',
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          touchAction: 'none',
          overscrollBehavior: 'none'
        });
        
        // Adjust for zoom level
        if (zoomLevel !== 1) {
          safeSetStyle(body, 'transform', `scale(${1/zoomLevel})`);
          safeSetStyle(body, 'transformOrigin', 'top left');
        }
      }
    };
    
    // Apply on load and zoom change
    applyZoomIndependentPrevention();
    if (isWindowAvailable()) {
      safeAddEventListener(window, 'resize', applyZoomIndependentPrevention);
    }
    
    return () => {
      if (isWindowAvailable()) {
        safeRemoveEventListener(window, 'resize', applyZoomIndependentPrevention);
      }
    };
  }, []);

  const preventProgrammaticScrolling = useCallback(() => {
    if (!isWindowAvailable()) return;
    
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
    
    // Apply to all existing elements (only if document is available)
    if (isDocumentAvailable()) {
      try {
        document.querySelectorAll('*').forEach(preventElementScroll);
      } catch (error) {
        console.warn('useScrollPrevention: Failed to prevent element scrolling', error);
      }
    }
    
    // Apply to dynamically added elements (only if document is available)
    let observer = null;
    if (isDocumentAvailable()) {
      try {
        observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                preventElementScroll(node);
                node.querySelectorAll('*').forEach(preventElementScroll);
              }
            });
          });
        });
        
        const body = safeDocumentBody();
        if (body) {
          observer.observe(body, { childList: true, subtree: true });
        }
      } catch (error) {
        console.warn('useScrollPrevention: Failed to set up MutationObserver', error);
      }
    }
    
    // Return cleanup function
    return () => {
      if (isWindowAvailable()) {
        // Restore original methods
        window.scrollTo = originalScrollTo;
        window.scrollBy = originalScrollBy;
        window.scroll = originalScroll;
      }
      if (observer) {
        observer.disconnect();
      }
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
