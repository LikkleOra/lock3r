'use client';

import React from 'react';
import { isConvexConfigured } from '@/lib/convex/client';

interface SyncStatusProps {
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncTime: number | null;
  onForceSync: () => void;
}

export function SyncStatus({ syncStatus, lastSyncTime, onForceSync }: SyncStatusProps) {
  if (!isConvexConfigured()) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span>Local storage only</span>
      </div>
    );
  }

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-green-600';
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Sync failed';
      default:
        return `Synced ${formatLastSync(lastSyncTime)}`;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className={`text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      <button
        onClick={onForceSync}
        disabled={syncStatus === 'syncing'}
        className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {syncStatus === 'syncing' ? 'Syncing...' : 'Sync now'}
      </button>
    </div>
  );
}