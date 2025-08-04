'use client';

import React, { useState, useEffect } from 'react';
import { FocusSession } from '@/models';
import { formatDuration } from '@/lib/utils';

interface FocusTimerProps {
  session: FocusSession;
  onPause: (reason?: string) => void;
  onResume: () => void;
  onEnd: () => void;
}

export function FocusTimer({ session, onPause, onResume, onEnd }: FocusTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Calculate time remaining
  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, session.endTime - now);
      setTimeRemaining(remaining);

      // Check if session should end
      if (remaining === 0 && session.isActive) {
        onEnd();
      }
    };

    // Check if currently paused
    const lastBreak = session.breaks[session.breaks.length - 1];
    setIsPaused(lastBreak && !lastBreak.endTime ? true : false);

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [session, onEnd]);

  const handlePause = () => {
    onPause('User requested break');
  };

  const handleResume = () => {
    onResume();
  };

  const handleEnd = () => {
    if (window.confirm('Are you sure you want to end this focus session?')) {
      onEnd();
    }
  };

  const progressPercentage = session.completedPercentage;
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-6 p-8">
      {/* Circular Progress Timer */}
      <div className="relative">
        <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ${
              isPaused ? 'text-orange-500' : 'text-primary'
            }`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Time display in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-foreground">
            {formatDuration(timeRemaining)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {isPaused ? 'Paused' : 'Remaining'}
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Focus Session</h2>
        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <span>{progressPercentage}% Complete</span>
          <span>•</span>
          <span>{session.breaks.length} breaks taken</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        {isPaused ? (
          <button
            onClick={handleResume}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Resume
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Take Break
          </button>
        )}
        
        <button
          onClick={handleEnd}
          className="px-6 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
        >
          End Session
        </button>
      </div>

      {/* Break History */}
      {session.breaks.length > 0 && (
        <div className="w-full max-w-md">
          <h3 className="text-lg font-medium mb-3">Breaks Taken</h3>
          <div className="space-y-2">
            {session.breaks.map((breakItem, index) => (
              <div
                key={breakItem.id}
                className="flex justify-between items-center p-3 bg-muted rounded-lg"
              >
                <span className="text-sm">
                  Break {index + 1}
                  {breakItem.reason && `: ${breakItem.reason}`}
                </span>
                <span className="text-sm text-muted-foreground">
                  {breakItem.endTime
                    ? formatDuration(breakItem.endTime - breakItem.startTime)
                    : 'Ongoing'
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}