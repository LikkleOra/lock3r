'use client';

import React from 'react';
import { useFocusSession } from '@/hooks/useFocusSession';
import { useBlockList } from '@/hooks/useBlockList';
import { FocusTimer } from '@/components/focus/FocusTimer';
import { SessionConfig } from '@/components/focus/SessionConfig';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

export default function FocusPage() {
  const {
    activeSession,
    isLoading,
    error,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    isSessionActive,
  } = useFocusSession();

  const { stats } = useBlockList();

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs />
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Focus Session</h1>
        <p className="text-muted-foreground">
          Start a focused work session and block distracting websites
        </p>
      </div>

      {/* Blocking Status */}
      {(isSessionActive || stats.permanentBlocks > 0) && (
        <div className="mb-6 space-y-3">
          {isSessionActive && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <div>
                  <div className="font-medium text-primary">Focus Session Active</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.temporaryBlocks} sites blocked during session
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {stats.permanentBlocks > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-orange-800">Permanent Blocks Active</div>
                  <div className="text-sm text-orange-600">
                    {stats.permanentBlocks} sites permanently blocked
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border rounded-lg p-6">
          {activeSession && activeSession.isActive ? (
            <FocusTimer
              session={activeSession}
              onPause={pauseSession}
              onResume={resumeSession}
              onEnd={endSession}
            />
          ) : (
            <SessionConfig onStart={startSession} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}