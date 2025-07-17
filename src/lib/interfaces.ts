// Service interfaces for FocusGuardian

import { BlockItem, FocusSession, Challenge, FocusMetrics } from '@/models';

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