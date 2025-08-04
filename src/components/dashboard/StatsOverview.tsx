'use client';

import React from 'react';
import { formatDuration } from '@/lib/utils';

interface StatsOverviewProps {
  sessionStats: {
    totalSessions: number;
    totalFocusTime: number;
    averageCompletion: number;
  };
  blockStats: {
    totalBlocks: number;
    permanentBlocks: number;
    temporaryBlocks: number;
    categorizedBlocks: number;
  };
}

export function StatsOverview({ sessionStats, blockStats }: StatsOverviewProps) {
  const stats = [
    {
      label: 'Focus Sessions',
      value: sessionStats.totalSessions,
      subtext: 'completed',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Focus Time',
      value: formatDuration(sessionStats.totalFocusTime),
      subtext: 'total',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Completion Rate',
      value: `${Math.round(sessionStats.averageCompletion)}%`,
      subtext: 'average',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Blocked Sites',
      value: blockStats.totalBlocks,
      subtext: `${blockStats.permanentBlocks} permanent`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.bgColor} rounded-lg p-4`}>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-sm font-medium text-gray-700">
              {stat.label}
            </div>
            <div className="text-xs text-gray-500">
              {stat.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Insights */}
      <div className="mt-6 pt-4 border-t">
        <h4 className="font-medium mb-3">Insights</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          {sessionStats.totalSessions === 0 ? (
            <p>🎯 Start your first focus session to see insights here</p>
          ) : (
            <>
              {sessionStats.averageCompletion >= 80 && (
                <p>🎉 Great job! You're completing most of your sessions</p>
              )}
              {sessionStats.totalSessions >= 5 && (
                <p>🔥 You're building a consistent focus habit</p>
              )}
              {blockStats.totalBlocks >= 10 && (
                <p>🛡️ You've identified your main distractions</p>
              )}
              {blockStats.permanentBlocks > 0 && (
                <p>🔒 Permanent blocks help maintain long-term focus</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}