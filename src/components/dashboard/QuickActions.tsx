'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface QuickActionsProps {
  hasActiveSession: boolean;
  onStartSession: (duration: number) => void;
  onAddBlock: (url: string, isPermanent?: boolean) => void;
  totalBlocks: number;
}

export function QuickActions({
  hasActiveSession,
  onStartSession,
  onAddBlock,
  totalBlocks,
}: QuickActionsProps) {
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [newBlockUrl, setNewBlockUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickStart = (minutes: number) => {
    onStartSession(minutes * 60 * 1000);
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockUrl.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddBlock(newBlockUrl.trim());
      setNewBlockUrl('');
      setShowAddBlock(false);
    } catch (error) {
      // Error handling is done by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Quick Start Sessions */}
      {!hasActiveSession && (
        <>
          <button
            onClick={() => handleQuickStart(15)}
            className="p-4 bg-card border rounded-lg hover:bg-muted transition-colors text-left"
          >
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-medium">Quick Focus</div>
            <div className="text-sm text-muted-foreground">15 minutes</div>
          </button>

          <button
            onClick={() => handleQuickStart(25)}
            className="p-4 bg-card border rounded-lg hover:bg-muted transition-colors text-left"
          >
            <div className="text-2xl mb-2">🍅</div>
            <div className="font-medium">Pomodoro</div>
            <div className="text-sm text-muted-foreground">25 minutes</div>
          </button>
        </>
      )}

      {/* Add Block */}
      <div className="p-4 bg-card border rounded-lg">
        {showAddBlock ? (
          <form onSubmit={handleAddBlock} className="space-y-3">
            <input
              type="text"
              placeholder="Enter URL to block"
              value={newBlockUrl}
              onChange={(e) => setNewBlockUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background"
              disabled={isSubmitting}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newBlockUrl.trim() || isSubmitting}
                className="flex-1 px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddBlock(false);
                  setNewBlockUrl('');
                }}
                className="px-3 py-1 text-sm border rounded-md hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddBlock(true)}
            className="w-full text-left"
          >
            <div className="text-2xl mb-2">🚫</div>
            <div className="font-medium">Add Block</div>
            <div className="text-sm text-muted-foreground">
              {totalBlocks} sites blocked
            </div>
          </button>
        )}
      </div>

      {/* Manage Blocks */}
      <Link
        href="/block-list"
        className="p-4 bg-card border rounded-lg hover:bg-muted transition-colors text-left"
      >
        <div className="text-2xl mb-2">📋</div>
        <div className="font-medium">Manage Blocks</div>
        <div className="text-sm text-muted-foreground">
          View all {totalBlocks} blocks
        </div>
      </Link>

      {/* Analytics */}
      <Link
        href="/analytics"
        className="p-4 bg-card border rounded-lg hover:bg-muted transition-colors text-left"
      >
        <div className="text-2xl mb-2">📊</div>
        <div className="font-medium">Analytics</div>
        <div className="text-sm text-muted-foreground">View insights</div>
      </Link>
    </div>
  );
}