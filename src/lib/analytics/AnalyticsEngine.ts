// Analytics engine for FocusGuardian
import { FocusSession, BlockItem, ChallengeAttempt } from '@/models';
import { getCurrentTimestamp, formatDuration } from '@/lib/utils';

export interface AnalyticsMetrics {
  totalFocusTime: number;
  averageSessionLength: number;
  completedSessions: number;
  interruptedSessions: number;
  totalBlockedAttempts: number;
  challengesCompleted: number;
  challengeSuccessRate: number;
  productivityScore: number;
}

export class AnalyticsEngine {
  private focusSessions: FocusSession[] = [];
  private blockAttempts: any[] = [];
  private challengeAttempts: ChallengeAttempt[] = [];

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    try {
      this.focusSessions = JSON.parse(localStorage.getItem('fg_focus_sessions') || '[]');
      this.blockAttempts = JSON.parse(localStorage.getItem('fg_block_attempts') || '[]');
      this.challengeAttempts = JSON.parse(localStorage.getItem('fg_challenge_attempts') || '[]');
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  }

  private saveData(): void {
    try {
      localStorage.setItem('fg_focus_sessions', JSON.stringify(this.focusSessions.slice(-1000)));
      localStorage.setItem('fg_block_attempts', JSON.stringify(this.blockAttempts.slice(-5000)));
      localStorage.setItem('fg_challenge_attempts', JSON.stringify(this.challengeAttempts.slice(-1000)));
    } catch (error) {
      console.error('Failed to save analytics data:', error);
    }
  }

  trackFocusSession(session: FocusSession): void {
    this.focusSessions.push(session);
    this.saveData();
  }

  trackBlockAttempt(url: string, wasBlocked: boolean, blockItem?: BlockItem): void {
    this.blockAttempts.push({
      url,
      wasBlocked,
      blockItem,
      timestamp: getCurrentTimestamp()
    });
    this.saveData();
  }

  trackChallengeAttempt(attempt: ChallengeAttempt): void {
    this.challengeAttempts.push(attempt);
    this.saveData();
  }

  getMetrics(days: number = 7): AnalyticsMetrics {
    const cutoff = getCurrentTimestamp() - (days * 24 * 60 * 60 * 1000);
    
    const recentSessions = this.focusSessions.filter(s => s.startTime >= cutoff);
    const recentBlocks = this.blockAttempts.filter(a => a.timestamp >= cutoff);
    const recentChallenges = this.challengeAttempts.filter(a => a.attemptedAt >= cutoff);
    
    const completed = recentSessions.filter(s => s.status === 'completed');
    const interrupted = recentSessions.filter(s => s.status === 'interrupted');
    const totalFocusTime = recentSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0);
    
    const blockedAttempts = recentBlocks.filter(a => a.wasBlocked);
    const successfulChallenges = recentChallenges.filter(c => c.wasSuccessful);
    
    return {
      totalFocusTime,
      averageSessionLength: completed.length > 0 ? totalFocusTime / completed.length : 0,
      completedSessions: completed.length,
      interruptedSessions: interrupted.length,
      totalBlockedAttempts: blockedAttempts.length,
      challengesCompleted: successfulChallenges.length,
      challengeSuccessRate: recentChallenges.length > 0 ? (successfulChallenges.length / recentChallenges.length) * 100 : 0,
      productivityScore: recentSessions.length > 0 ? Math.round((completed.length / recentSessions.length) * 100) : 0
    };
  }

  getSummaryStats(): {
    totalSessions: number;
    totalFocusTime: string;
    averageProductivity: number;
    challengesWon: number;
  } {
    const totalFocusTime = this.focusSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0);
    const completedSessions = this.focusSessions.filter(s => s.status === 'completed');
    const challengesWon = this.challengeAttempts.filter(c => c.wasSuccessful).length;
    
    return {
      totalSessions: this.focusSessions.length,
      totalFocusTime: formatDuration(totalFocusTime),
      averageProductivity: this.focusSessions.length > 0 ? Math.round((completedSessions.length / this.focusSessions.length) * 100) : 0,
      challengesWon
    };
  }

  clearData(): void {
    this.focusSessions = [];
    this.blockAttempts = [];
    this.challengeAttempts = [];
    this.saveData();
  }
}

export const analyticsEngine = new AnalyticsEngine();