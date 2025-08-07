'use client';

import React, { useState, useEffect } from 'react';
import { analyticsEngine, AnalyticsMetrics } from '@/lib/analytics/AnalyticsEngine';
import { formatDuration } from '@/lib/utils';

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<number>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = () => {
      try {
        const weeklyMetrics = analyticsEngine.getMetrics(timeRange);
        const summary = analyticsEngine.getSummaryStats();
        setMetrics(weeklyMetrics);
        setSummaryStats(summary);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [timeRange]);

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className={`bg-card border rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics || !summaryStats) {
    return (
      <div className={`bg-card border rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
          <p className="text-muted-foreground text-sm">
            Start using FocusGuardian to see your productivity insights here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value={1}>Last 24 hours</option>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {formatDuration(metrics.totalFocusTime)}
          </div>
          <div className="text-xs text-blue-700">Total Focus Time</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {metrics.completedSessions}
          </div>
          <div className="text-xs text-green-700">Sessions Completed</div>
        </div>
        
        <div className={`text-center p-4 rounded-lg ${getProductivityColor(metrics.productivityScore)}`}>
          <div className="text-2xl font-bold">
            {metrics.productivityScore}%
          </div>
          <div className="text-xs">Productivity Score</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {metrics.challengesCompleted}
          </div>
          <div className="text-xs text-purple-700">Challenges Won</div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Focus Sessions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Focus Sessions</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completed:</span>
              <span className="font-medium text-green-600">{metrics.completedSessions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Interrupted:</span>
              <span className="font-medium text-red-600">{metrics.interruptedSessions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Average Length:</span>
              <span className="font-medium">{formatDuration(metrics.averageSessionLength)}</span>
            </div>
          </div>
        </div>

        {/* Blocking & Challenges */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Blocking & Challenges</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sites Blocked:</span>
              <span className="font-medium text-red-600">{metrics.totalBlockedAttempts}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Challenge Success:</span>
              <span className={`font-medium ${getSuccessRateColor(metrics.challengeSuccessRate)}`}>
                {Math.round(metrics.challengeSuccessRate)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Session Success Rate</span>
          <span className={`font-medium ${getSuccessRateColor(metrics.productivityScore)}`}>
            {metrics.completedSessions}/{metrics.completedSessions + metrics.interruptedSessions}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              metrics.productivityScore >= 80 ? 'bg-green-500' :
              metrics.productivityScore >= 60 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, metrics.productivityScore)}%` }}
          />
        </div>
      </div>

      {/* All-Time Summary */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">All-Time Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">{summaryStats.totalSessions}</div>
            <div className="text-xs text-gray-600">Total Sessions</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{summaryStats.totalFocusTime}</div>
            <div className="text-xs text-gray-600">Total Focus Time</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">{summaryStats.averageProductivity}%</div>
            <div className="text-xs text-gray-600">Avg Productivity</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">{summaryStats.challengesWon}</div>
            <div className="text-xs text-gray-600">Challenges Won</div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-6 pt-4 border-t">
        <button
          onClick={() => {
            const data = analyticsEngine.getSummaryStats();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `focus-guardian-analytics-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
        >
          📥 Export Analytics Data
        </button>
      </div>
    </div>
  );
}