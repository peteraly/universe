import { useCallback } from 'react';

const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type = 'light') => {
    if (!navigator.vibrate) return;
    
    const patterns = {
      light: [10],           // Light pulse for acknowledgments
      medium: [20],          // Medium tick for commits
      strong: [30],          // Strong pulse for errors
      double: [5, 10, 5],    // Double tick for invalid actions
      selection: [15],       // Selection feedback
      success: [10, 5, 10],  // Success confirmation
      error: [50, 25, 50]    // Error indication
    };
    
    const pattern = patterns[type] || patterns.light;
    navigator.vibrate(pattern);
  }, []);

  const triggerSelection = useCallback(() => {
    triggerHaptic('selection');
  }, [triggerHaptic]);

  const triggerCommit = useCallback(() => {
    triggerHaptic('medium');
  }, [triggerHaptic]);

  const triggerError = useCallback(() => {
    triggerHaptic('error');
  }, [triggerHaptic]);

  const triggerSuccess = useCallback(() => {
    triggerHaptic('success');
  }, [triggerHaptic]);

  return {
    triggerHaptic,
    triggerSelection,
    triggerCommit,
    triggerError,
    triggerSuccess
  };
};

export default useHapticFeedback;
