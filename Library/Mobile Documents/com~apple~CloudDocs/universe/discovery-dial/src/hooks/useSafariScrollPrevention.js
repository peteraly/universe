import { useEffect, useCallback, useRef } from 'react';
import { 
  safeDocumentBody, 
  isDocumentAvailable, 
  isWindowAvailable,
  safeAddEventListener,
  safeRemoveEventListener,
  safeSetStyle,
  safeSetStyles
} from '../utils/safeDOM';

/**
 * Custom hook for Safari-specific scroll prevention
 * Handles Safari's unique scroll behaviors and momentum scrolling
 */
const useSafariScrollPrevention = () => {
  const intervalRef = useRef(null);
  const observerRef = useRef(null);

  // Detect Safari browser
  const isSafari = useCallback(() => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }, []);

  // Detect iOS
  const isIOS = useCallback(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }, []);

  // Safari-specific scroll prevention
  const preventSafariScrolling = useCallback(() => {
    if (!isSafari() && !isIOS()) return;
    if (!isDocumentAvailable() || !isWindowAvailable()) return;

    // Safari-specific scroll prevention
    const preventSafariScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    // Safari-specific event listeners
    safeAddEventListener(document, 'touchstart', preventSafariScroll, { passive: false });
    safeAddEventListener(document, 'touchmove', preventSafariScroll, { passive: false });
    safeAddEventListener(document, 'touchend', preventSafariScroll, { passive: false });
    safeAddEventListener(document, 'gesturestart', preventSafariScroll, { passive: false });
    safeAddEventListener(document, 'gesturechange', preventSafariScroll, { passive: false });
    safeAddEventListener(document, 'gestureend', preventSafariScroll, { passive: false });

    // Prevent Safari's momentum scrolling
    safeAddEventListener(document, 'scroll', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isWindowAvailable()) {
        window.scrollTo(0, 0);
      }
      return false;
    }, { passive: false });

    // Override Safari's scroll methods
    if (isWindowAvailable()) {
      window.scrollTo = () => {};
      window.scrollBy = () => {};
      window.scroll = () => {};
    }

    // Prevent Safari's scroll restoration
    if (isWindowAvailable() && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Force scroll position to top
    intervalRef.current = setInterval(() => {
      if (isWindowAvailable()) {
        window.scrollTo(0, 0);
      }
      if (isDocumentAvailable()) {
        const documentElement = document.documentElement;
        const body = safeDocumentBody();
        
        if (documentElement) {
          documentElement.scrollTop = 0;
        }
        if (body) {
          body.scrollTop = 0;
        }
      }
    }, 100);

    return () => {
      safeRemoveEventListener(document, 'touchstart', preventSafariScroll);
      safeRemoveEventListener(document, 'touchmove', preventSafariScroll);
      safeRemoveEventListener(document, 'touchend', preventSafariScroll);
      safeRemoveEventListener(document, 'gesturestart', preventSafariScroll);
      safeRemoveEventListener(document, 'gesturechange', preventSafariScroll);
      safeRemoveEventListener(document, 'gestureend', preventSafariScroll);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSafari, isIOS]);

  // Safari-specific touch event handling
  const handleSafariTouchEvents = useCallback(() => {
    if (!isSafari() && !isIOS()) return;
    if (!isDocumentAvailable()) return;

    // Safari-specific touch prevention
    const preventSafariTouch = (e) => {
      // Prevent all touch-based scrolling
      if (e.touches.length > 1) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Prevent single touch scrolling
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    // Apply to all touch events
    safeAddEventListener(document, 'touchstart', preventSafariTouch, { passive: false });
    safeAddEventListener(document, 'touchmove', preventSafariTouch, { passive: false });
    safeAddEventListener(document, 'touchend', preventSafariTouch, { passive: false });
    safeAddEventListener(document, 'touchcancel', preventSafariTouch, { passive: false });

    // Prevent Safari's gesture events
    safeAddEventListener(document, 'gesturestart', preventSafariTouch, { passive: false });
    safeAddEventListener(document, 'gesturechange', preventSafariTouch, { passive: false });
    safeAddEventListener(document, 'gestureend', preventSafariTouch, { passive: false });

    return () => {
      safeRemoveEventListener(document, 'touchstart', preventSafariTouch);
      safeRemoveEventListener(document, 'touchmove', preventSafariTouch);
      safeRemoveEventListener(document, 'touchend', preventSafariTouch);
      safeRemoveEventListener(document, 'touchcancel', preventSafariTouch);
      safeRemoveEventListener(document, 'gesturestart', preventSafariTouch);
      safeRemoveEventListener(document, 'gesturechange', preventSafariTouch);
      safeRemoveEventListener(document, 'gestureend', preventSafariTouch);
    };
  }, [isSafari, isIOS]);

  // Safari-specific CSS injection
  const injectSafariCSS = useCallback(() => {
    if (!isSafari() && !isIOS()) return;
    if (!isDocumentAvailable()) return;

    try {
      const style = document.createElement('style');
      style.textContent = `
      /* Safari-specific scroll prevention */
      html, body, #root, .App {
        overflow: hidden !important;
        overscroll-behavior: none !important;
        -webkit-overflow-scrolling: auto !important;
        touch-action: none !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        -webkit-transform: translateZ(0) !important;
        -webkit-backface-visibility: hidden !important;
        -webkit-perspective: 1000 !important;
      }
      
      /* Disable Safari's rubber band scrolling */
      body {
        overscroll-behavior-y: none !important;
        -webkit-overflow-scrolling: auto !important;
      }
      
      /* Safari-specific touch prevention */
      * {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -webkit-tap-highlight-color: transparent !important;
        touch-action: none !important;
      }
      
      /* Hide Safari's scroll indicators */
      ::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
    `;
      if (document.head) {
        document.head.appendChild(style);
      }

      return () => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    } catch (error) {
      console.warn('useSafariScrollPrevention: Failed to inject CSS', error);
      return () => {};
    }
  }, [isSafari, isIOS]);

  // Safari-specific mutation observer
  const setupSafariMutationObserver = useCallback(() => {
    if (!isSafari() && !isIOS()) return;
    if (!isDocumentAvailable()) return;

    try {
      observerRef.current = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Apply Safari-specific styles to new elements
              safeSetStyle(node, 'overflow', 'hidden');
              safeSetStyle(node, 'overscrollBehavior', 'none');
              safeSetStyle(node, 'touchAction', 'none');
              safeSetStyle(node, 'webkitOverflowScrolling', 'auto');
            }
          });
        });
      });

      const body = safeDocumentBody();
      if (body) {
        observerRef.current.observe(body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class']
        });
      }

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    } catch (error) {
      console.warn('useSafariScrollPrevention: Failed to set up MutationObserver', error);
      return () => {};
    }
  }, [isSafari, isIOS]);

  // Initialize Safari-specific scroll prevention
  useEffect(() => {
    if (!isSafari() && !isIOS()) return;

    const cleanup1 = preventSafariScrolling();
    const cleanup2 = handleSafariTouchEvents();
    const cleanup3 = injectSafariCSS();
    const cleanup4 = setupSafariMutationObserver();

    return () => {
      cleanup1?.();
      cleanup2?.();
      cleanup3?.();
      cleanup4?.();
    };
  }, [preventSafariScrolling, handleSafariTouchEvents, injectSafariCSS, setupSafariMutationObserver]);

  // Return Safari detection utilities
  return {
    isSafari: isSafari(),
    isIOS: isIOS(),
    preventSafariScrolling,
    handleSafariTouchEvents,
    injectSafariCSS,
    setupSafariMutationObserver
  };
};

export default useSafariScrollPrevention;
