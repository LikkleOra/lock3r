'use client';

import React, { useState } from 'react';
import { BlockItem } from '@/models';
import { formatDate } from '@/lib/utils';

interface BlockItemProps {
  item: BlockItem;
  onRemove: (id: string) => void;
  onTogglePermanent: (id: string) => void;
}

export function BlockItemComponent({ 
  item, 
  onRemove, 
  onTogglePermanent
}: BlockItemProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRemove = () => {
    if (showConfirm) {
      onRemove(item.id);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <div className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">{item.url}</h4>
            {item.isPermanent && (
              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                Permanent
              </span>
            )}
          </div>
          
          <div className="mt-1 text-sm text-muted-foreground">
            Added {formatDate(new Date(item.createdAt))}
          </div>

          {item.category && (
            <div className="mt-2">
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {item.category}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onTogglePermanent(item.id)}
            className="px-3 py-1 text-sm border rounded-md hover:bg-muted"
          >
            {item.isPermanent ? 'Make Temporary' : 'Make Permanent'}
          </button>
          
          {showConfirm ? (
            <div className="flex gap-2">
              <button
                onClick={handleRemove}
                className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded-md"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1 text-sm border rounded-md"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleRemove}
              className="px-3 py-1 text-sm text-destructive border border-destructive/20 rounded-md hover:bg-destructive/10"
            >
              Remove
            </button>
          )}
        <}
  );
div>
    </ </div>/div>
     