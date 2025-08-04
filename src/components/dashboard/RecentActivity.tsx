'use client';

import React from 'react';
import { FocusSession, BlockItem } from '@/models';
import { formatDuration, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface RecentActivityProps {
  recentSessions: FocusSession[];
  recentBlocks: BlockItem[];
}

export function RecentActivity({ recentSessions, recentBlocks }: RecentActivityProps) {
  // Combine and sort activities by timestamp
  const activities = [
    ...recentSessions.map(session => ({
      type: 'session' as const,
      timestamp: session.startTime,
      data: session,
    })),
    ...recentBlocks.map(block => ({
      type: 'block' as const,
      timestamp: block.createdAt,
      data: block,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Link
          href="/analytics"
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📱</div>
          <p className="text-muted-foreground">No recent activity</p>
          <p className="text-sm text-muted-foreground">
            Start a focus session or add blocks to see activity here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              {activity.type === 'session' ? (
                <>
                  <div className={`w-2 h-2 rounded-full ${
                    activity.data.completedPercentage >= 100 ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {activity.data.completedPercentage >= 100 ? 'Completed' : 'Started'} focus session
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDuration(activity.data.duration)} • {formatDate(new Date(activity.timestamp))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.data.completedPercentage}%
                  </div>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      Added block for {activity.data.url}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activity.data.isPermanent ? 'Permanent' : 'Session-based'} • {formatDate(new Date(activity.timestamp))}
                    </div>
                  </div>
                  {activity.data.isPermanent && (
                    <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      Permanent
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}