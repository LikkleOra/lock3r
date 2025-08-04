'use client';

import React, { useState } from 'react';
import { useBlockList } from '@/hooks/useBlockList';
import { AddBlockForm } from './AddBlockForm';
import { BlockListStats } from './BlockListStats';
import { SyncStatus } from './SyncStatus';

export function BlockManager() {
  const {
    blocks,
    isLoading,
    error,
    addBlock,
    removeBlock,
    togglePermanent,
    stats,
    syncStatus,
    lastSyncTime,
    forceSync,
  } = useBlockList();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter blocks based on search
  const filteredBlocks = blocks.filter(block =>
    block.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (block.category && block.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blocks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Block List</h1>
          <p className="text-muted-foreground">
            Manage websites you want to block during focus sessions
          </p>
        </div>
        <SyncStatus
          syncStatus={syncStatus}
          lastSyncTime={lastSyncTime}
          onForceSync={forceSync}
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Add block form */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Block</h2>
        <AddBlockForm onAdd={addBlock} />
      </div>

      {/* Search */}
      {blocks.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <input
            type="text"
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          />
        </div>
      )}

      {/* Block list */}
      <div className="bg-card border rounded-lg">
        {filteredBlocks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">
              {blocks.length === 0
                ? "No blocks added yet. Add your first blocked site above."
                : "No blocks match your search criteria."
              }
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredBlocks.map((block) => (
              <BlockItem
                key={block.id}
                item={block}
                onRemove={removeBlock}
                onTogglePermanent={togglePermanent}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {blocks.length > 0 && <BlockListStats blocks={blocks} />}
    </div>
  );
}

// Block item component
function BlockItem({
  item,
  onRemove,
  onTogglePermanent,
}: {
  item: any;
  onRemove: (id: string) => void;
  onTogglePermanent: (id: string) => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{item.url}</h3>
            {item.isPermanent && (
              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                Permanent
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Added {new Date(item.createdAt).toLocaleDateString()}
          </p>
          {item.category && (
            <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {item.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onTogglePermanent(item.id)}
            className="px-3 py-1 text-sm border rounded-md hover:bg-muted transition-colors"
          >
            {item.isPermanent ? 'Make Temporary' : 'Make Permanent'}
          </button>

          {showConfirm ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onRemove(item.id);
                  setShowConfirm(false);
                }}
                className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1 text-sm border rounded-md hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-3 py-1 text-sm text-destructive border border-destructive/20 rounded-md hover:bg-destructive/10 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}