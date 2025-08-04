'use client';

import React from 'react';
import { useFocusSession } from '@/hooks/useFocusSession';
import { useBlockList } from '@/hooks/useBlockList';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { SessionHistory } from '@/components/focus/SessionHistory';
import { formatDuration } from '@/lib/utils';

export default function AnalyticsPage() {
  const { sessionHistory } = useFocusSession();
  const { blocks, stats } = useBlockList();

  // Calculate analytics
  const totalFocusTime = sessionHistory.reduce((total, session) => total + session.duration, 0);
  const completedSessions = sessionHistory.filter(s => s.completedPercentage >= 100);
  const averageCompletion = sessionHistory.length > 0 
    ? sessionHistory.reduce((total, session) => total + session.completedPercentage, 0) / sessionHistory.length 
    : 0;

  const thisWeek = sessionHistory.filter(session => {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return session.startTime > weekAgo;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs />
      
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Track your focus progress and productivity insights
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {sessionHistory.length}
            </div>
            <div className="text-sm font-medium text-gray-700">Total Sessions</div>
            <div className="text-xs text-muted-foreground">
              {completedSessions.length} completed
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatDuration(totalFocusTime)}
            </div>
            <div className="text-sm font-medium text-gray-700">Total Focus Time</div>
            <div className="text-xs text-muted-foreground">
              {Math.round(totalFocusTime / (1000 * 60 * 60))} hours
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round(averageCompletion)}%
            </div>
            <div className="text-sm font-medium text-gray-700">Completion Rate</div>
            <div className="text-xs text-muted-foreground">
              Average across all sessions
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stats.totalBlocks}
            </div>
            <div className="text-sm font-medium text-gray-700">Blocked Sites</div>
            <div className="text-xs text-muted-foreground">
              {stats.permanentBlocks} permanent
            </div>
          </div>
        </div>

        {/* This Week */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">This Week</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {thisWeek.length}
              </div>
              <div className="text-sm text-muted-foreground">Sessions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatDuration(thisWeek.reduce((total, session) => total + session.duration, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Focus Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {thisWeek.length > 0 
                  ? Math.round(thisWeek.reduce((total, session) => total + session.completedPercentage, 0) / thisWeek.length)
                  : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Completion</div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Insights</h2>
          <div className="space-y-3">
            {sessionHistory.length === 0 ? (
              <p className="text-muted-foreground">
                🎯 Start your first focus session to see insights here
              </p>
            ) : (
              <>
                {averageCompletion >= 80 && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="text-green-600">🎉</span>
                    <span className="text-green-800">
                      Excellent! You're completing most of your sessions
                    </span>
                  </div>
                )}
                
                {sessionHistory.length >= 5 && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-600">🔥</span>
                    <span className="text-blue-800">
                      Great consistency! You're building a strong focus habit
                    </span>
                  </div>
                )}
                
                {stats.totalBlocks >= 10 && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-600">🛡️</span>
                    <span className="text-purple-800">
                      You've identified your main distractions - well done!
                    </span>
                  </div>
                )}
                
                {thisWeek.length >= 3 && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <span className="text-orange-600">📈</span>
                    <span className="text-orange-800">
                      Strong week! You're staying consistent with your focus practice
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Session History */}
        <SessionHistory sessions={sessionHistory} />
      </div>
    </div>
  );
}