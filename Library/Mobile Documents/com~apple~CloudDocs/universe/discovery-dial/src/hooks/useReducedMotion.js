import { useState, useEffect } from 'react';

/**
 * Hook to detect user's reduced motion preference.
 * Respects prefers-reduced-motion media query for accessibility.
 * 
 * @returns {boolean} True if user prefers reduced motion
 * 
 * @example
 * const prefersReducedMotion = useReducedMotion();
 * 
 * transition={prefersReducedMotion ? {
 *   duration: 0
 * } : {
 *   type: 'spring',
 *   stiffness: 260
 * }}
 */
export default function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if media query is supported
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Get transition config with reduced motion support.
 * Helper to quickly create accessible transitions.
 * 
 * @param {boolean} prefersReducedMotion - Reduced motion preference
 * @param {Object} normalConfig - Transition config for normal motion
 * @returns {Object} Transition config
 * 
 * @example
 * const transition = getTransition(prefersReducedMotion, {
 *   type: 'spring',
 *   stiffness: 260,
 *   damping: 18
 * });
 */
export function getTransition(prefersReducedMotion, normalConfig) {
  return prefersReducedMotion ? { duration: 0 } : normalConfig;
}



