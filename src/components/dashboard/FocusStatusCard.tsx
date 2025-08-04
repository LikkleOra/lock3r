'use client';

import React, { useState, useEffect } from 'react';
import { FocusSession } from '@/models';
import { formatDuration } from '@/lib/utils';
import Link from 'next/link';

interface FocusStatusCardProps {
  activeSession: FocusSession | null;
  onEndSession: () => void;
  onPauseSession: (reason?: string) => void;
  onResumeSession: () => void;
}

export function FocusStatusCard({
  activeSession,
  onEndSession,
  onPauseSession,
  onResumeSession,
}: FocusStatusCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!activeSession || !activeSession.isActive) return;

    const updateTime = () => {
      const remaining = Math.max(0, activeSession.endTime - Date.now());
      setTimeRemaining(remaining);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession || !activeSession.isActive) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold mb-2">Ready to Focus?</h2>
          <p className="text-muted-foreground mb-6">
            Start a focus session to block distractions and boost productivity
          </p>
          <Link
            href="/focus"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Start Focus Session
          </Link>
        </div>
      </div>
    );
  }

  const isOnBreak = activeSession.breaks.length > 0 && 
    !activeSession.breaks[activeSession.breaks.length - 1].endTime;

  const progressPercentage = activeSession.completedPercentage;

  return (
    <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-lg p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Session Info */}
        <div className="text-center md:text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              isOnBreak ? 'bg-orange-500 animate-pulse' : 'bg-green-500 animate-pulse'
            }`} />
            <h2 className="text-2xl font-bold">
              {isOnBreak ? 'On Break' : 'Focus Session Active'}
            </h2>
          </div>
          
          <div className="space-y-1 text-muted-foreground">
            <p>{formatDuration(timeRemaining)} remaining</p>
            <p>{progressPercentage}% complete • {activeSession.breaks.length} breaks taken</p>
          </div>
        </div>

        {/* Progress Circle */}
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-muted"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercentage / 100)}`}
              className={`transition-all duration-1000 ${
                isOnBreak ? 'text-orange-500' : 'text-primary'
              }`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{progressPercentage}%</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2">
          {isOnBreak ? (
            <button
              onClick={onResumeSession}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={() => onPauseSession('Dashboard break')}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Take Break
            </button>
          )}
          
          <button
            onClick={onEndSession}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
          >
            End Session
          </button>
          
          <Link
            href="/focus"
            className="px-4 py-2 text-center border rounded-lg hover:bg-muted transition-colors text-sm"
          >
            Full View
          </Link>
        </div>
      </div>
    </div>
  );
}