import { useEffect, useRef, useCallback } from 'react';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  onTimeout: () => void;
  warningMinutes?: number;
  onWarning?: () => void;
}

/**
 * Custom hook for session timeout management
 * Auto-logout after inactivity period
 */
export function useSessionTimeout({
  timeoutMinutes = 15,
  onTimeout,
  warningMinutes = 2,
  onWarning,
}: UseSessionTimeoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Set warning timer
    if (onWarning && warningMinutes > 0) {
      const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;
      warningRef.current = setTimeout(() => {
        onWarning();
      }, warningMs);
    }

    // Set timeout timer
    const timeoutMs = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, timeoutMs);
  }, [timeoutMinutes, warningMinutes, onTimeout, onWarning]);

  useEffect(() => {
    // Activity events to track
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [resetTimer]);

  return { resetTimer };
}
