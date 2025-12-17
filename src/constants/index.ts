// API Configuration
export const API_CONFIG = {
  BASE_URL: (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, ''),
  TIMEOUT: 30000,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  USER_MODE_PREFERENCE: 'user_mode_preference',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  NEW: '/new',
  CHAT: '/chat',
  CHAT_WITH_ID: (id: string) => `/chat/${id}`,
} as const;

// UI Configuration
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 'w-64',
  MAX_MESSAGE_LENGTH: 10000,
  TEXTAREA_MIN_HEIGHT: '48px',
  TEXTAREA_MAX_HEIGHT: '200px',
  ANIMATION_DELAY: {
    DOT_1: '0s',
    DOT_2: '0.2s',
    DOT_3: '0.4s',
  },
} as const;

// Messages & Labels
export const MESSAGES = {
  EMPTY_STATE: {
    WELCOME: '✨ Welcome back!',
    NO_CONVERSATION: 'Create a new conversation to get started',
    START_CHATTING: 'Start chatting in this conversation',
    NO_CONVERSATIONS: 'No conversations yet',
  },
  LOADING: {
    CONVERSATION: 'Loading conversation...',
    CONVERSATIONS: 'Loading...',
  },
  BUTTONS: {
    NEW_CHAT: '+ New chat',
    CREATING: 'Creating...',
    SIGN_IN: 'Sign in',
    SIGNING_IN: 'Signing in...',
    CREATE_ACCOUNT: 'Create account',
    CREATING_ACCOUNT: 'Creating account...',
    LOGOUT: 'Logout',
  },
  ERRORS: {
    DELETE_CONFIRM: 'Are you sure you want to delete this conversation?',
  },
  PLACEHOLDERS: {
    EMAIL: 'you@example.com',
    PASSWORD: '••••••••',
    MESSAGE: 'How can I help you today?',
  },
} as const;

// Validation Rules
export const VALIDATION = {
  EMAIL: {
    PATTERN: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    REQUIRED_MESSAGE: 'Email is required',
    INVALID_MESSAGE: 'Invalid email address',
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    REQUIRED_MESSAGE: 'Password is required',
    MIN_LENGTH_MESSAGE: 'Password must be at least 6 characters',
  },
} as const;