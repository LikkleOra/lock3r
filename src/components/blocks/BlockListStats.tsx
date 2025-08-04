'use client';

import React from 'react';
import { BlockItem } from '@/models';

interface BlockListStatsProps {
  blocks: BlockItem[];
}

export function BlockListStats({ blocks }: BlockListStatsProps) {
  const totalBlocks = blocks.length;
  const permanentBlocks = blocks.filter(b => b.isPermanent).length;
  const temporaryBlocks = totalBlocks - permanentBlocks;
  const categorizedBlocks = blocks.filter(b => b.category).length;

  const stats = [
    { label: 'Total Blocks', value: totalBlocks, color: 'text-blue-600' },
    { label: 'Permanent', value: permanentBlocks, color: 'text-orange-600' },
    { label: 'Temporary', value: temporaryBlocks, color: 'text-green-600' },
    { label: 'Categorized', value: categorizedBlocks, color: 'text-purple-600' },
  ];

  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Block Statistics</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}