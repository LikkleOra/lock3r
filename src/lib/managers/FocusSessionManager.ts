// Focus session management system for FocusGuardian
import {
  FocusSession,
  Break,
  FocusSessionManager as IFocusSessionManager,
  OperationResult
} from '@/models';
import { storage } from '@/lib/storage';
import { generateId, getCurrentTimestamp, calculatePercentage } from '@/lib/utils';
import { FOCUS_SESSION } from '@/lib/constants';

export class FocusSessionManager implements IFocusSessionManager {
  private activeSession: FocusSession | null = null;
  private sessionTimer: NodeJS.Timeout | null = null;
  private progressInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadActiveSession();
  }

  private loadActiveSession(): void {
    try {
      const stored = storage.getActiveFocusSession();
      if (stored && stored.isActive) {
        this.activeSession = stored;
        this.resumeTimers();
      }
    } catch (error) {
      console.error('Failed to load active session:', error);
    }
  }

  private resumeTimers(): void {
    if (!this.activeSession) return;

    const now = getCurrentTimestamp();
    if (now >= this.activeSession.endTime) {
      this.endSession(this.activeSession.id);
      return;
    }

    this.startProgressUpdates();
    const remainingTime = this.activeSession.endTime - now;
    this.sessionTimer = setTimeout(() => {
      this.endSession(this.activeSession!.id);
    }, remainingTime);
  }

  private startProgressUpdates(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    this.progressInterval = setInterval(() => {
      if (this.activeSession && this.activeSession.isActive) {
        this.updateProgress();
      }
    }, 1000);
  }

  private updateProgress(): void {
    if (!this.activeSession) return;

    const now = getCurrentTimestamp();
    const elapsed = now - this.activeSession.startTime;
    const completedPercentage = Math.min(100, (elapsed / this.activeSession.duration) * 100);

    this.activeSession = {
      ...this.activeSession,
      completedPercentage: Math.round(completedPercentage)
    };

    storage.saveActiveFocusSession(this.activeSession);
  }

  private stopTimers(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  async startSession(duration: number): Promise<FocusSession> {
    if (duration < FOCUS_SESSION.MIN_DURATION || duration > FOCUS_SESSION.MAX_DURATION) {
      throw new Error('Invalid session duration');
    }

    if (this.activeSession && this.activeSession.isActive) {
      throw new Error('Session already active');
    }

    const now = getCurrentTimestamp();
    const newSession: FocusSession = {
      id: generateId(),
      userId: 'current-user', // TODO: Get from auth
      startTime: now,
      endTime: now + duration,
      duration,
      isActive: true,
      breaks: [],
      completedPercentage: 0
    };

    const saveResult = storage.saveActiveFocusSession(newSession);
    if (!saveResult.success) {
      throw new Error('Failed to save session');
    }

    this.activeSession = newSession;
    this.startProgressUpdates();
    
    this.sessionTimer = setTimeout(() => {
      this.endSession(newSession.id);
    }, duration);

    return newSession;
  }

  async endSession(sessionId: string): Promise<FocusSession> {
    if (!this.activeSession || this.activeSession.id !== sessionId) {
      throw new Error('No active session found');
    }

    this.stopTimers();

    const endedSession = {
      ...this.activeSession,
      endTime: getCurrentTimestamp(),
      isActive: false,
      completedPercentage: 100
    };

    storage.clearActiveFocusSession();
    await storage.addToSessionHistory(endedSession);

    this.activeSession = null;
    return endedSession;
  }

  async getActiveSession(): Promise<FocusSession | null> {
    return this.activeSession;
  }

  async pauseSession(sessionId: string, reason?: string): Promise<FocusSession> {
    if (!this.activeSession || this.activeSession.id !== sessionId) {
      throw new Error('No active session found');
    }

    const breakItem: Break = {
      id: generateId(),
      startTime: getCurrentTimestamp(),
      reason
    };

    this.activeSession = {
      ...this.activeSession,
      breaks: [...this.activeSession.breaks, breakItem]
    };

    storage.saveActiveFocusSession(this.activeSession);
    return this.activeSession;
  }

  async resumeSession(sessionId: string): Promise<FocusSession> {
    if (!this.activeSession || this.activeSession.id !== sessionId) {
      throw new Error('No active session found');
    }

    const lastBreak = this.activeSession.breaks[this.activeSession.breaks.length - 1];
    if (lastBreak && !lastBreak.endTime) {
      const now = getCurrentTimestamp();
      const breakDuration = now - lastBreak.startTime;
      
      lastBreak.endTime = now;
      
      // Extend session by break duration
      this.activeSession = {
        ...this.activeSession,
        endTime: this.activeSession.endTime + breakDuration,
        duration: this.activeSession.duration + breakDuration
      };

      storage.saveActiveFocusSession(this.activeSession);
    }

    return this.activeSession;
  }

  async getSessionHistory(): Promise<FocusSession[]> {
    return storage.getSessionHistory();
  }
}

export const focusSessionManager = new FocusSessionManager();