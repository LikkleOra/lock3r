'use client';

import React from 'react';
import { FocusSession } from '@/models';
import { formatDuration, formatDate, formatTime } from '@/lib/utils';

interface SessionHistoryProps {
  sessions: FocusSession[];
  isLoading?: boolean;
}

export function SessionHistory({ sessions, isLoading = false }: SessionHistoryProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading session history...</p>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium mb-2">No Sessions Yet</h3>
        <p className="text-muted-foreground">
          Your completed focus sessions will appear here
        </p>
      </div>
    );
  }

  // Sort sessions by start time (newest first)
  const sortedSessions = [...sessions].sort((a, b) => b.startTime - a.startTime);

  // Group sessions by date
  const groupedSessions = sortedSessions.reduce((groups, session) => {
    const date = formatDate(new Date(session.startTime));
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, FocusSession[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Session History</h2>
        <div className="text-sm text-muted-foreground">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} completed
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">
            {sessions.length}
          </div>
          <div className="text-sm text-muted-foreground">Total Sessions</div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {formatDuration(
              sessions.reduce((total, session) => total + session.duration, 0)
            )}
          </div>
          <div className="text-sm text-muted-foreground">Total Focus Time</div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {sessions.length > 0
              ? Math.round(
                  sessions.reduce((total, session) => total + session.completedPercentage, 0) /
                  sessions.length
                )
              : 0}%
          </div>
          <div className="text-sm text-muted-foreground">Average Completion</div>
        </div>
      </div>

      {/* Session List */}
      <div className="space-y-6">
        {Object.entries(groupedSessions).map(([date, dateSessions]) => (
          <div key={date} className="space-y-3">
            <h3 className="text-lg font-medium text-muted-foreground">{date}</h3>
            <div className="space-y-2">
              {dateSessions.map((session) => (
                <SessionItem key={session.id} session={session} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionItem({ session }: { session: FocusSession }) {
  const startTime = formatTime(new Date(session.startTime));
  const endTime = formatTime(new Date(session.endTime));
  const isCompleted = session.completedPercentage >= 100;
  
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              isCompleted ? 'bg-green-500' : 'bg-orange-500'
            }`} />
            <div>
              <div className="font-medium">
                {formatDuration(session.duration)} Focus Session
              </div>
              <div className="text-sm text-muted-foreground">
                {startTime} - {endTime}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-lg font-bold ${
            isCompleted ? 'text-green-600' : 'text-orange-600'
          }`}>
            {session.completedPercentage}%
          </div>
          <div className="text-sm text-muted-foreground">
            {session.breaks.length} break{session.breaks.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isCompleted ? 'bg-green-500' : 'bg-orange-500'
            }`}
            style={{ width: `${session.completedPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Break Details */}
      {session.breaks.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-sm text-muted-foreground">
            <strong>Breaks:</strong>{' '}
            {session.breaks.map((breakItem, index) => (
              <span key={breakItem.id}>
                {index > 0 && ', '}
                {breakItem.endTime
                  ? formatDuration(breakItem.endTime - breakItem.startTime)
                  : 'Ongoing'
                }
                {breakItem.reason && ` (${breakItem.reason})`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}