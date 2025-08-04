'use client';

import { useState, useEffect, useCallback } from 'react';
import { FocusSession } from '@/models';
import { focusSessionManager } from '@/lib/managers/FocusSessionManager';
import { blockManager } from '@/lib/managers/BlockManager';

interface UseFocusSessionReturn {
  activeSession: FocusSession | null;
  sessionHistory: FocusSession[];
  isLoading: boolean;
  error: string | null;
  startSession: (duration: number) => Promise<void>;
  endSession: () => Promise<void>;
  pauseSession: (reason?: string) => Promise<void>;
  resumeSession: () => Promise<void>;
  isBlocked: (url: string) => Promise<boolean>;
  isSessionActive: boolean;
}

export function useFocusSession(): UseFocusSessionReturn {
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<FocusSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadActiveSession();
    loadSessionHistory();
  }, []);

  // Set up session progress updates
  useEffect(() => {
    if (!activeSession || !activeSession.isActive) return;

    const interval = setInterval(async () => {
      try {
        const currentSession = await focusSessionManager.getActiveSession();
        if (currentSession) {
          setActiveSession(currentSession);
        } else {
          // Session ended
          setActiveSession(null);
          await loadSessionHistory();
        }
      } catch (err) {
        console.error('Failed to update session:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const loadActiveSession = async () => {
    try {
      const session = await focusSessionManager.getActiveSession();
      setActiveSession(session);
    } catch (err) {
      console.error('Failed to load active session:', err);
    }
  };

  const loadSessionHistory = async () => {
    try {
      const history = await focusSessionManager.getSessionHistory();
      setSessionHistory(history);
    } catch (err) {
      console.error('Failed to load session history:', err);
    }
  };

  const startSession = useCallback(async (duration: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const newSession = await focusSessionManager.startSession(duration);
      setActiveSession(newSession);

      // Notify user that blocking is now active
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus Session Started', {
          body: 'Blocked sites are now restricted. Stay focused!',
          icon: '/icons/icon-192x192.png',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const endSession = useCallback(async () => {
    if (!activeSession) return;

    try {
      setError(null);

      const endedSession = await focusSessionManager.endSession(activeSession.id);
      setActiveSession(null);
      await loadSessionHistory();

      // Notify user that session ended
      if ('Notification' in window && Notification.permission === 'granted') {
        const completionRate = endedSession.completedPercentage;
        const message = completionRate >= 100 
          ? 'Great job! You completed your focus session.' 
          : `Session ended at ${completionRate}% completion.`;
        
        new Notification('Focus Session Complete', {
          body: message,
          icon: '/icons/icon-192x192.png',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end session';
      setError(errorMessage);
      throw err;
    }
  }, [activeSession]);

  const pauseSession = useCallback(async (reason?: string) => {
    if (!activeSession) return;

    try {
      setError(null);

      const pausedSession = await focusSessionManager.pauseSession(activeSession.id, reason);
      setActiveSession(pausedSession);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause session';
      setError(errorMessage);
      throw err;
    }
  }, [activeSession]);

  const resumeSession = useCallback(async () => {
    if (!activeSession) return;

    try {
      setError(null);

      const resumedSession = await focusSessionManager.resumeSession(activeSession.id);
      setActiveSession(resumedSession);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume session';
      setError(errorMessage);
      throw err;
    }
  }, [activeSession]);

  // Enhanced blocking check that considers session state
  const isBlocked = useCallback(async (url: string): Promise<boolean> => {
    try {
      // Always check permanent blocks
      const blockItem = await blockManager.getBlockedItem(url);
      if (blockItem && blockItem.isPermanent) {
        return true;
      }

      // Check temporary blocks only during active sessions
      if (activeSession && activeSession.isActive) {
        // Check if currently on a break
        const lastBreak = activeSession.breaks[activeSession.breaks.length - 1];
        const isOnBreak = lastBreak && !lastBreak.endTime;
        
        if (!isOnBreak && blockItem && !blockItem.isPermanent) {
          // Update access time for analytics
          await blockManager.updateItemAccess(blockItem.id);
          return true;
        }
      }

      return false;
    } catch (err) {
      console.error('Failed to check if URL is blocked:', err);
      return false;
    }
  }, [activeSession]);

  return {
    activeSession,
    sessionHistory,
    isLoading,
    error,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    isBlocked,
    isSessionActive: !!(activeSession && activeSession.isActive),
  };
}