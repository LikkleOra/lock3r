// Core data models for FocusGuardian

export interface User {
  id: string;
  createdAt: number;
  settings: UserSettings;
  stats: UserStats;
}

export interface UserSettings {
  defaultSessionDuration: number; // in milliseconds
  defaultBreakDuration: number; // in milliseconds
  challengeDifficulty: 'easy' | 'medium' | 'hard';
  notificationsEnabled: boolean;
  temporaryUnlockDuration: number; // in milliseconds
  theme: 'light' | 'dark' | 'system';
}

export interface UserStats {
  totalFocusTime: number;
  sessionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  challengesCompleted: number;
  challengeSuccessRate: number;
}

export interface BlockItem {
  id: string;
  url: string;
  pattern: string; // URL pattern for matching
  isPermanent: boolean;
  category?: string;
  createdAt: number;
  lastAccessed?: number;
}

export interface BlockList {
  userId: string;
  items: BlockItem[];
  lastUpdated: number;
}

export interface FocusSession {
  id: string;
  userId: string;
  startTime: number;
  endTime: number;
  duration: number; // in milliseconds
  isActive: boolean;
  breaks: Break[];
  completedPercentage: number;
}

export interface Break {
  id: string;
  startTime: number;
  endTime?: number;
  reason?: string;
}

export interface Challenge {
  id: string;
  type: 'puzzle' | 'riddle' | 'math' | 'science' | 'game';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // in seconds
}

export interface ChallengeAttempt {
  userId: string;
  challengeId: string;
  challenge: Challenge;
  wasSuccessful?: boolean;
  attemptedAt?: number;
}

export interface FocusMetrics {
  totalFocusTime: number;
  sessionsCompleted: number;
  averageSessionLength: number;
  mostProductiveTimeOfDay: string;
  distractionAttempts: number;
  successfulChallenges: number;
  streakDays: number;
}

export interface ChallengeBank {
  localChallenges: Challenge[];
  lastUpdated: number;
}

export interface PWAConfig {
  cacheName: string;
  resourcesToPrecache: string[];
  offlineFallbackPage: string;
  syncInterval: number;
}

// Manager interfaces
export interface BlockManager {
  addBlockItem(url: string, isPermanent?: boolean): Promise<BlockItem>;
  removeBlockItem(id: string): Promise<void>;
  getBlockList(): Promise<BlockItem[]>;
  togglePermanentBlock(id: string): Promise<BlockItem>;
  isBlocked(url: string): Promise<boolean>;
}

export interface FocusSessionManager {
  startSession(duration: number): Promise<FocusSession>;
  endSession(sessionId: string): Promise<FocusSession>;
  getActiveSession(): Promise<FocusSession | null>;
  pauseSession(sessionId: string, reason?: string): Promise<FocusSession>;
  resumeSession(sessionId: string): Promise<FocusSession>;
  getSessionHistory(): Promise<FocusSession[]>;
}

export interface ChallengeSystem {
  generateChallenge(difficulty?: string): Promise<Challenge>;
  validateAnswer(challengeId: string, answer: string | number): Promise<boolean>;
  getLocalChallenge(): Challenge; // Fallback when API is unavailable
  trackAttempt(challengeId: string, wasSuccessful: boolean): Promise<void>;
}

export interface AnalyticsEngine {
  trackFocusSession(session: FocusSession): Promise<void>;
  trackDistraction(url: string, wasBlocked: boolean): Promise<void>;
  getDailyReport(): Promise<FocusMetrics>;
  getWeeklyReport(): Promise<FocusMetrics>;
  getRecommendations(): Promise<string[]>;
}