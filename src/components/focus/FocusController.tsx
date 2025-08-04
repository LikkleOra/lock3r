'use client';

import React, { useState, useEffect } from 'react';
import { FocusSession } from '@/models';
import { focusSessionManager } from '@/lib/managers/FocusSessionManager';
import { FocusTimer } from './FocusTimer';
import { SessionConfig } from './SessionConfig';

export function FocusController() {
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActiveSession();
  }, []);

  const loadActiveSession = async () => {
    try {
      const session = await focusSessionManager.getActiveSession();
      setActiveSession(session);
    } catch (err) {
      console.error('Failed to load active session:', err);
    }
  };

  const handleStartSession = async (duration: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newSession = await focusSessionManager.startSession(duration);
      setActiveSession(newSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    try {
      await focusSessionManager.endSession(activeSession.id);
      setActiveSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end session');
    }
  };

  const handlePauseSession = async (reason?: string) => {
    if (!activeSession) return;

    try {
      const pausedSession = await focusSessionManager.pauseSession(activeSession.id, reason);
      setActiveSession(pausedSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause session');
    }
  };

  const handleResumeSession = async () => {
    if (!activeSession) return;

    try {
      const resumedSession = await focusSessionManager.resumeSession(activeSession.id);
      setActiveSession(resumedSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume session');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="bg-card border rounded-lg p-6">
        {activeSession && activeSession.isActive ? (
          <FocusTimer
            session={activeSession}
            onPause={handlePauseSession}
            onResume={handleResumeSession}
            onEnd={handleEndSession}
          />
        ) : (
          <SessionConfig onStart={handleStartSession} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}