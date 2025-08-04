// Type guards and utility types for FocusGuardian
import { 
  User, 
  UserSettings, 
  UserStats, 
  BlockItem, 
  BlockList, 
  FocusSession, 
  Break, 
  Challenge, 
  ChallengeAttempt,
  FocusMetrics 
} from './index';

// Type guards for runtime type checking
export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.createdAt === 'number' &&
    isUserSettings(obj.settings) &&
    isUserStats(obj.stats)
  );
}

export function isUserSettings(obj: any): obj is UserSettings {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.defaultSessionDuration === 'number' &&
    typeof obj.defaultBreakDuration === 'number' &&
    ['easy', 'medium', 'hard'].includes(obj.challengeDifficulty) &&
    typeof obj.notificationsEnabled === 'boolean' &&
    typeof obj.temporaryUnlockDuration === 'number' &&
    ['light', 'dark', 'system'].includes(obj.theme)
  );
}

export function isUserStats(obj: any): obj is UserStats {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.totalFocusTime === 'number' &&
    typeof obj.sessionsCompleted === 'number' &&
    typeof obj.currentStreak === 'number' &&
    typeof obj.longestStreak === 'number' &&
    typeof obj.challengesCompleted === 'number' &&
    typeof obj.challengeSuccessRate === 'number'
  );
}

export function isBlockItem(obj: any): obj is BlockItem {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.url === 'string' &&
    typeof obj.pattern === 'string' &&
    typeof obj.isPermanent === 'boolean' &&
    typeof obj.createdAt === 'number' &&
    (obj.category === undefined || typeof obj.category === 'string') &&
    (obj.lastAccessed === undefined || typeof obj.lastAccessed === 'number')
  );
}

export function isBlockList(obj: any): obj is BlockList {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.userId === 'string' &&
    Array.isArray(obj.items) &&
    obj.items.every(isBlockItem) &&
    typeof obj.lastUpdated === 'number'
  );
}

export function isFocusSession(obj: any): obj is FocusSession {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.userId === 'string' &&
    typeof obj.startTime === 'number' &&
    typeof obj.endTime === 'number' &&
    typeof obj.duration === 'number' &&
    typeof obj.isActive === 'boolean' &&
    Array.isArray(obj.breaks) &&
    obj.breaks.every(isBreak) &&
    typeof obj.completedPercentage === 'number'
  );
}

export function isBreak(obj: any): obj is Break {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.startTime === 'number' &&
    (obj.endTime === undefined || typeof obj.endTime === 'number') &&
    (obj.reason === undefined || typeof obj.reason === 'string')
  );
}

export function isChallenge(obj: any): obj is Challenge {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    ['puzzle', 'riddle', 'math', 'science', 'game'].includes(obj.type) &&
    typeof obj.question === 'string' &&
    (typeof obj.correctAnswer === 'string' || typeof obj.correctAnswer === 'number') &&
    ['easy', 'medium', 'hard'].includes(obj.difficulty) &&
    (obj.options === undefined || (Array.isArray(obj.options) && obj.options.every((opt: any) => typeof opt === 'string'))) &&
    (obj.timeLimit === undefined || typeof obj.timeLimit === 'number')
  );
}

export function isChallengeAttempt(obj: any): obj is ChallengeAttempt {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.userId === 'string' &&
    typeof obj.challengeId === 'string' &&
    isChallenge(obj.challenge) &&
    (obj.wasSuccessful === undefined || typeof obj.wasSuccessful === 'boolean') &&
    (obj.attemptedAt === undefined || typeof obj.attemptedAt === 'number')
  );
}

export function isFocusMetrics(obj: any): obj is FocusMetrics {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.totalFocusTime === 'number' &&
    typeof obj.sessionsCompleted === 'number' &&
    typeof obj.averageSessionLength === 'number' &&
    typeof obj.mostProductiveTimeOfDay === 'string' &&
    typeof obj.distractionAttempts === 'number' &&
    typeof obj.successfulChallenges === 'number' &&
    typeof obj.streakDays === 'number'
  );
}

// Utility types for partial updates
export type UserSettingsUpdate = Partial<UserSettings>;
export type UserStatsUpdate = Partial<UserStats>;
export type BlockItemUpdate = Partial<Omit<BlockItem, 'id' | 'createdAt'>>;
export type FocusSessionUpdate = Partial<Omit<FocusSession, 'id' | 'userId' | 'createdAt'>>;

// Result types for operations
export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export type OperationResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Storage types
export type StorageData = {
  userSettings?: UserSettings;
  userStats?: UserStats;
  blockList?: BlockList;
  activeFocusSession?: FocusSession;
  focusSessionHistory?: FocusSession[];
  challengeBank?: Challenge[];
  analyticsData?: FocusMetrics;
  lastSync?: number;
};

// Event types for analytics
export type AnalyticsEvent = {
  type: 'session_started' | 'session_completed' | 'session_paused' | 'session_resumed' | 
        'block_added' | 'block_removed' | 'challenge_attempted' | 'challenge_completed' |
        'distraction_blocked' | 'temporary_unlock';
  timestamp: number;
  data?: Record<string, any>;
};

// Filter and sort types
export type BlockItemFilter = {
  isPermanent?: boolean;
  category?: string;
  searchTerm?: string;
};

export type BlockItemSort = 'createdAt' | 'lastAccessed' | 'url' | 'category';

export type FocusSessionFilter = {
  isActive?: boolean;
  dateRange?: {
    start: number;
    end: number;
  };
  minDuration?: number;
  maxDuration?: number;
};

export type FocusSessionSort = 'startTime' | 'duration' | 'completedPercentage';

// API response types
export type ConvexQueryResult<T> = T | null;
export type ConvexMutationResult<T> = T;

// Error types
export type FocusGuardianError = {
  code: 'VALIDATION_ERROR' | 'STORAGE_ERROR' | 'NETWORK_ERROR' | 'API_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  details?: Record<string, any>;
};

// Hook return types
export type UseBlockListReturn = {
  blockList: BlockItem[];
  isLoading: boolean;
  error: string | null;
  addBlock: (url: string, isPermanent?: boolean) => Promise<void>;
  removeBlock: (id: string) => Promise<void>;
  togglePermanent: (id: string) => Promise<void>;
  isBlocked: (url: string) => boolean;
};

export type UseFocusSessionReturn = {
  activeSession: FocusSession | null;
  sessionHistory: FocusSession[];
  isLoading: boolean;
  error: string | null;
  startSession: (duration: number) => Promise<void>;
  endSession: () => Promise<void>;
  pauseSession: (reason?: string) => Promise<void>;
  resumeSession: () => Promise<void>;
};

export type UseChallengeReturn = {
  currentChallenge: Challenge | null;
  isLoading: boolean;
  error: string | null;
  generateChallenge: (difficulty?: string) => Promise<void>;
  submitAnswer: (answer: string | number) => Promise<boolean>;
  skipChallenge: () => void;
};

export type UseAnalyticsReturn = {
  metrics: FocusMetrics | null;
  isLoading: boolean;
  error: string | null;
  refreshMetrics: () => Promise<void>;
  getDailyReport: () => Promise<FocusMetrics>;
  getWeeklyReport: () => Promise<FocusMetrics>;
};

// Component prop types
export type BlockListItemProps = {
  item: BlockItem;
  onRemove: (id: string) => void;
  onTogglePermanent: (id: string) => void;
  onEdit?: (id: string, updates: BlockItemUpdate) => void;
};

export type FocusTimerProps = {
  session: FocusSession;
  onPause: (reason?: string) => void;
  onResume: () => void;
  onEnd: () => void;
};

export type ChallengeModalProps = {
  challenge: Challenge;
  isOpen: boolean;
  onSubmit: (answer: string | number) => void;
  onSkip: () => void;
  onClose: () => void;
};

// Configuration types
export type AppConfig = {
  features: {
    challenges: boolean;
    analytics: boolean;
    notifications: boolean;
    sync: boolean;
  };
  limits: {
    maxBlockItems: number;
    maxSessionDuration: number;
    maxChallengeAttempts: number;
  };
  defaults: {
    sessionDuration: number;
    challengeDifficulty: Challenge['difficulty'];
    theme: UserSettings['theme'];
  };
};