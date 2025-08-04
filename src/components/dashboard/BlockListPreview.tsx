'use client';

import React from 'react';
import { BlockItem } from '@/models';
import Link from 'next/link';

interface BlockListPreviewProps {
  blocks: BlockItem[];
  stats: {
    totalBlocks: number;
    permanentBlocks: number;
    temporaryBlocks: number;
    categorizedBlocks: number;
  };
}

export function BlockListPreview({ blocks, stats }: BlockListPreviewProps) {
  const recentBlocks = blocks.slice(-6);

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Block List</h3>
        <Link
          href="/block-list"
          className="text-sm text-primary hover:underline"
        >
          Manage all blocks
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalBlocks}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.permanentBlocks}</div>
          <div className="text-xs text-muted-foreground">Permanent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.temporaryBlocks}</div>
          <div className="text-xs text-muted-foreground">Session</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.categorizedBlocks}</div>
          <div className="text-xs text-muted-foreground">Categorized</div>
        </div>
      </div>

      {/* Recent Blocks */}
      {recentBlocks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🚫</div>
          <p className="text-muted-foreground mb-2">No blocks added yet</p>
          <Link
            href="/block-list"
            className="text-sm text-primary hover:underline"
          >
            Add your first block
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground mb-3">
            Recent Blocks
          </h4>
          {recentBlocks.map((block) => (
            <div key={block.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  block.isPermanent ? 'bg-orange-500' : 'bg-blue-500'
                }`} />
                <div>
                  <div className="font-medium text-sm">{block.url}</div>
                  {block.category && (
                    <div className="text-xs text-muted-foreground">{block.category}</div>
                  )}
                </div>
              </div>
              {block.isPermanent && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  Permanent
                </span>
              )}
            </div>
          ))}
          
          {blocks.length > 6 && (
            <div className="text-center pt-2">
              <Link
                href="/block-list"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                +{blocks.length - 6} more blocks
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}