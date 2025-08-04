'use client';

import React from 'react';
import { useFocusSession } from '@/hooks/useFocusSession';
import { useBlockList } from '@/hooks/useBlockList';
import { FocusStatusCard } from './FocusStatusCard';
import { QuickActions } from './QuickActions';
import { StatsOverview } from './StatsOverview';
import { RecentActivity } from './RecentActivity';
import { BlockListPreview } from './BlockListPreview';

export function Dashboard() {
  const {
    activeSession,
    sessionHistory,
    isLoading: sessionLoading,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
  } = useFocusSession();

  const {
    blocks,
    stats,
    isLoading: blocksLoading,
    addBlock,
  } = useBlockList();

  const isLoading = sessionLoading || blocksLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">FocusGuardian</h1>
        <p className="text-xl text-muted-foreground">
          Your digital accountability partner
        </p>
      </div>

      {/* Focus Status */}
      <FocusStatusCard
        activeSession={activeSession}
        onEndSession={endSession}
        onPauseSession={pauseSession}
        onResumeSession={resumeSession}
      />

      {/* Quick Actions */}
      <QuickActions
        hasActiveSession={!!(activeSession && activeSession.isActive)}
        onStartSession={startSession}
        onAddBlock={addBlock}
        totalBlocks={stats.totalBlocks}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StatsOverview
          sessionStats={{
            totalSessions: sessionHistory.length,
            totalFocusTime: sessionHistory.reduce((total, session) => total + session.duration, 0),
            averageCompletion: sessionHistory.length > 0
              ? sessionHistory.reduce((total, session) => total + session.completedPercentage, 0) / sessionHistory.length
              : 0,
          }}
          blockStats={stats}
        />

        <RecentActivity
          recentSessions={sessionHistory.slice(0, 5)}
          recentBlocks={blocks.slice(-5)}
        />
      </div>

      {/* Block List Preview */}
      <BlockListPreview blocks={blocks} stats={stats} />
    </div>
  );
}