// Application constants for FocusGuardian

// Focus session constants
export const FOCUS_SESSION = {
  MIN_DURATION: 60 * 1000, // 1 minute in milliseconds
  MAX_DURATION: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
  DEFAULT_DURATION: 25 * 60 * 1000, // 25 minutes (Pomodoro)
  DEFAULT_BREAK_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

// Block list constants
export const BLOCK_LIST = {
  MAX_ITEMS: 1000,
  DEFAULT_TEMPORARY_UNLOCK_DURATION: 10 * 60 * 1000, // 10 minutes
  URL_VALIDATION_REGEX: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  DOMAIN_VALIDATION_REGEX: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
} as const;

// Challenge system constants
export const CHALLENGES = {
  DIFFICULTY_LEVELS: ['easy', 'medium', 'hard'] as const,
  DEFAULT_DIFFICULTY: 'medium' as const,
  DEFAULT_TIME_LIMIT: 60, // seconds
  COOLDOWN_PERIOD: 30 * 1000, // 30 seconds between failed attempts
  MAX_ATTEMPTS_PER_HOUR: 10,
} as const;

// PWA constants
export const PWA = {
  CACHE_NAME: 'focus-guardian-v1',
  STATIC_CACHE: 'focus-guardian-static-v1',
  DYNAMIC_CACHE: 'focus-guardian-dynamic-v1',
  SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const;

// Storage keys
export const STORAGE_KEYS = {
  USER_SETTINGS: 'fg_user_settings',
  BLOCK_LIST: 'fg_block_list',
  ACTIVE_SESSION: 'fg_active_session',
  SESSION_HISTORY: 'fg_session_history',
  CHALLENGE_BANK: 'fg_challenge_bank',
  ANALYTICS_DATA: 'fg_analytics_data',
  LAST_SYNC: 'fg_last_sync',
} as const;

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Analytics constants
export const ANALYTICS = {
  RETENTION_DAYS: 90, // Keep analytics data for 90 days
  BATCH_SIZE: 100, // Process analytics in batches
  SYNC_THRESHOLD: 50, // Sync after 50 events
} as const;

// API constants
export const API = {
  CODEX_TIMEOUT: 10000, // 10 seconds
  CONVEX_TIMEOUT: 5000, // 5 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Performance constants
export const PERFORMANCE = {
  BLOCK_CHECK_TIMEOUT: 100, // milliseconds
  DEBOUNCE_DELAY: 300, // milliseconds for input debouncing
  THROTTLE_DELAY: 1000, // milliseconds for expensive operations
} as const;

// Default user settings
export const DEFAULT_USER_SETTINGS = {
  defaultSessionDuration: FOCUS_SESSION.DEFAULT_DURATION,
  defaultBreakDuration: FOCUS_SESSION.DEFAULT_BREAK_DURATION,
  challengeDifficulty: CHALLENGES.DEFAULT_DIFFICULTY,
  notificationsEnabled: true,
  temporaryUnlockDuration: BLOCK_LIST.DEFAULT_TEMPORARY_UNLOCK_DURATION,
  theme: THEMES.SYSTEM,
} as const;

// Default user stats
export const DEFAULT_USER_STATS = {
  totalFocusTime: 0,
  sessionsCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  challengesCompleted: 0,
  challengeSuccessRate: 0,
} as const;