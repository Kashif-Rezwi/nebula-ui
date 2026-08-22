import { STORAGE_KEYS } from '../constants';
import type { User } from '../types';

/**
 * Safe localStorage wrapper that gracefully handles private browsing mode
 * or environments where localStorage access is restricted.
 */
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore quota or private browsing errors
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  },
};

/**
 * Typed application storage utilities
 */
export const storage = {
  getToken: (): string | null => {
    return safeStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setToken: (token: string): void => {
    safeStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  removeToken: (): void => {
    safeStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  getUser: (): User | null => {
    const userStr = safeStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    safeStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  removeUser: (): void => {
    safeStorage.removeItem(STORAGE_KEYS.USER);
  },

  clearAuth: (): void => {
    safeStorage.removeItem(STORAGE_KEYS.TOKEN);
    safeStorage.removeItem(STORAGE_KEYS.USER);
  },
};
