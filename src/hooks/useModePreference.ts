import { useState, useCallback } from 'react';
import { modePreference } from '../utils/modePreference';
import type { OperationalMode } from '../types';

/**
 * Hook for managing user's operational mode preference
 * 
 * Automatically loads saved preference on mount and persists changes to localStorage.
 * 
 * @example
 * ```tsx
 * const { mode, setMode } = useModePreference();
 * <ModeSelector currentMode={mode} onModeChange={setMode} />
 * ```
 */
export function useModePreference() {
  // Initialize with saved preference (or 'auto' as default)
  const [mode, setModeState] = useState<OperationalMode>(() => modePreference.get());

  // Persist changes to localStorage when mode changes
  // Empty deps array is intentional - modePreference.set is stable
  const setMode = useCallback((newMode: OperationalMode) => {
    setModeState(newMode);
    modePreference.set(newMode);
  }, []);

  return {
    mode,
    setMode,
  };
}

