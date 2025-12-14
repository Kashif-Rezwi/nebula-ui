import { STORAGE_KEYS } from '../constants';
import type { OperationalMode } from '../types';

/**
 * Safe localStorage wrapper with error handling
 * Prevents crashes in private browsing mode or restricted environments
 */
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('[ModePreference] LocalStorage read failed:', e);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('[ModePreference] LocalStorage write failed:', e);
    }
  },
};

/**
 * Valid operational modes
 */
const VALID_MODES: readonly OperationalMode[] = ['fast', 'thinking', 'auto'] as const;

/**
 * Validates if a string is a valid operational mode
 * Uses proper type narrowing instead of type assertion
 */
function isValidMode(value: string | null): value is OperationalMode {
  if (value === null) return false;
  // Type-safe check: TypeScript narrows the type correctly
  return VALID_MODES.some(validMode => validMode === value);
}

/**
 * Mode preference utilities
 * Centralized management of user's operational mode preference
 */
export const modePreference = {
  /**
   * Get the user's saved mode preference
   * @returns The saved mode or 'auto' as default
   */
  get: (): OperationalMode => {
    const saved = safeStorage.getItem(STORAGE_KEYS.USER_MODE_PREFERENCE);
    return isValidMode(saved) ? saved : 'auto';
  },

  /**
   * Save the user's mode preference
   * @param mode - The mode to save ('fast' | 'thinking' | 'auto')
   * Note: TypeScript ensures type safety at compile time, so runtime validation is not needed
   */
  set: (mode: OperationalMode): void => {
    safeStorage.setItem(STORAGE_KEYS.USER_MODE_PREFERENCE, mode);
  },

  /**
   * Get the current mode for API requests
   * Returns undefined if mode is 'auto' (server will decide)
   * @returns The mode override for API or undefined
   */
  getModeOverride: (): OperationalMode | undefined => {
    const mode = modePreference.get();
    return mode !== 'auto' ? mode : undefined;
  },
};

