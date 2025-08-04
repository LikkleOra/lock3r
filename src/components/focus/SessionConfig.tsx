'use client';

import React, { useState } from 'react';
import { FOCUS_SESSION } from '@/lib/constants';
import { formatDuration } from '@/lib/utils';

interface SessionConfigProps {
  onStart: (duration: number) => void;
  isLoading?: boolean;
}

const PRESET_DURATIONS = [
  { label: '15 minutes', value: 15 * 60 * 1000 },
  { label: '25 minutes (Pomodoro)', value: 25 * 60 * 1000 },
  { label: '45 minutes', value: 45 * 60 * 1000 },
  { label: '1 hour', value: 60 * 60 * 1000 },
  { label: '2 hours', value: 2 * 60 * 60 * 1000 },
];

export function SessionConfig({ onStart, isLoading = false }: SessionConfigProps) {
  const [selectedDuration, setSelectedDuration] = useState(FOCUS_SESSION.DEFAULT_DURATION);
  const [customDuration, setCustomDuration] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const handleStart = () => {
    const duration = useCustom ? parseCustomDuration() : selectedDuration;
    
    if (duration < FOCUS_SESSION.MIN_DURATION || duration > FOCUS_SESSION.MAX_DURATION) {
      alert(`Duration must be between ${FOCUS_SESSION.MIN_DURATION / 60000} minutes and ${FOCUS_SESSION.MAX_DURATION / 3600000} hours`);
      return;
    }

    onStart(duration);
  };

  const parseCustomDuration = (): number => {
    const minutes = parseInt(customDuration);
    if (isNaN(minutes) || minutes <= 0) {
      return FOCUS_SESSION.DEFAULT_DURATION;
    }
    return minutes * 60 * 1000;
  };

  const getDurationToStart = (): number => {
    return useCustom ? parseCustomDuration() : selectedDuration;
  };

  return (
    <div className="max-w-md mx-auto space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Start Focus Session</h2>
        <p className="text-muted-foreground">
          Choose your focus duration and begin your productive session
        </p>
      </div>

      {/* Preset Durations */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Quick Start</h3>
        <div className="grid grid-cols-1 gap-2">
          {PRESET_DURATIONS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => {
                setSelectedDuration(preset.value);
                setUseCustom(false);
              }}
              className={`p-3 text-left border rounded-lg transition-colors ${
                !useCustom && selectedDuration === preset.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <div className="font-medium">{preset.label}</div>
              <div className="text-sm text-muted-foreground">
                {formatDuration(preset.value)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Duration */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Custom Duration</h3>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            placeholder="Minutes"
            value={customDuration}
            onChange={(e) => {
              setCustomDuration(e.target.value);
              setUseCustom(true);
            }}
            onFocus={() => setUseCustom(true)}
            className={`flex-1 px-3 py-2 border rounded-md bg-background ${
              useCustom ? 'border-primary' : 'border-border'
            }`}
            min={FOCUS_SESSION.MIN_DURATION / 60000}
            max={FOCUS_SESSION.MAX_DURATION / 60000}
          />
          <span className="text-muted-foreground">minutes</span>
        </div>
        {useCustom && customDuration && (
          <p className="text-sm text-muted-foreground">
            Duration: {formatDuration(parseCustomDuration())}
          </p>
        )}
      </div>

      {/* Session Preview */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Session Preview</h4>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>Duration: {formatDuration(getDurationToStart())}</div>
          <div>
            Estimated end time:{' '}
            {new Date(Date.now() + getDurationToStart()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={isLoading}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? 'Starting Session...' : 'Start Focus Session'}
      </button>

      {/* Tips */}
      <div className="text-center text-sm text-muted-foreground">
        <p>💡 Tip: During your session, blocked sites will be inaccessible</p>
      </div>
    </div>
  );
}