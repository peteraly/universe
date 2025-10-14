import { useEffect, useCallback, useRef } from 'react';

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

    // Safari-specific scroll prevention
    const preventSafariScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    // Safari-specific event listeners
    document.addEventListener('touchstart', preventSafariScroll, { passive: false });
    document.addEventListener('touchmove', preventSafariScroll, { passive: false });
    document.addEventListener('touchend', preventSafariScroll, { passive: false });
    document.addEventListener('gesturestart', preventSafariScroll, { passive: false });
    document.addEventListener('gesturechange', preventSafariScroll, { passive: false });
    document.addEventListener('gestureend', preventSafariScroll, { passive: false });

    // Prevent Safari's momentum scrolling
    document.addEventListener('scroll', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.scrollTo(0, 0);
      return false;
    }, { passive: false });

    // Override Safari's scroll methods
    window.scrollTo = () => {};
    window.scrollBy = () => {};
    window.scroll = () => {};

    // Prevent Safari's scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Force scroll position to top
    intervalRef.current = setInterval(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);

    return () => {
      document.removeEventListener('touchstart', preventSafariScroll);
      document.removeEventListener('touchmove', preventSafariScroll);
      document.removeEventListener('touchend', preventSafariScroll);
      document.removeEventListener('gesturestart', preventSafariScroll);
      document.removeEventListener('gesturechange', preventSafariScroll);
      document.removeEventListener('gestureend', preventSafariScroll);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSafari, isIOS]);

  // Safari-specific touch event handling
  const handleSafariTouchEvents = useCallback(() => {
    if (!isSafari() && !isIOS()) return;

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
    document.addEventListener('touchstart', preventSafariTouch, { passive: false });
    document.addEventListener('touchmove', preventSafariTouch, { passive: false });
    document.addEventListener('touchend', preventSafariTouch, { passive: false });
    document.addEventListener('touchcancel', preventSafariTouch, { passive: false });

    // Prevent Safari's gesture events
    document.addEventListener('gesturestart', preventSafariTouch, { passive: false });
    document.addEventListener('gesturechange', preventSafariTouch, { passive: false });
    document.addEventListener('gestureend', preventSafariTouch, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventSafariTouch);
      document.removeEventListener('touchmove', preventSafariTouch);
      document.removeEventListener('touchend', preventSafariTouch);
      document.removeEventListener('touchcancel', preventSafariTouch);
      document.removeEventListener('gesturestart', preventSafariTouch);
      document.removeEventListener('gesturechange', preventSafariTouch);
      document.removeEventListener('gestureend', preventSafariTouch);
    };
  }, [isSafari, isIOS]);

  // Safari-specific CSS injection
  const injectSafariCSS = useCallback(() => {
    if (!isSafari() && !isIOS()) return;

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
    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [isSafari, isIOS]);

  // Safari-specific mutation observer
  const setupSafariMutationObserver = useCallback(() => {
    if (!isSafari() && !isIOS()) return;

    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Apply Safari-specific styles to new elements
            node.style.overflow = 'hidden';
            node.style.overscrollBehavior = 'none';
            node.style.touchAction = 'none';
            node.style.webkitOverflowScrolling = 'auto';
          }
        });
      });
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
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
