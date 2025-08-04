'use client';

import { useState, useEffect, useCallback } from 'react';
import { BlockItem, OperationResult } from '@/models';
import { blockManager } from '@/lib/managers/BlockManager';
import { useBlockList as useConvexBlockList } from '@/lib/convex/hooks';
import { useUserId } from '@/lib/convex/hooks';
import { isConvexConfigured } from '@/lib/convex/client';

interface UseBlockListReturn {
  blocks: BlockItem[];
  isLoading: boolean;
  error: string | null;
  addBlock: (url: string, isPermanent?: boolean, category?: string) => Promise<void>;
  removeBlock: (id: string) => Promise<void>;
  togglePermanent: (id: string) => Promise<void>;
  updateCategory: (id: string, category?: string) => Promise<void>;
  isBlocked: (url: string) => Promise<boolean>;
  stats: {
    totalBlocks: number;
    permanentBlocks: number;
    temporaryBlocks: number;
    categorizedBlocks: number;
  };
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncTime: number | null;
  forcSync: () => Promise<void>;
}

export function useBlockList(): UseBlockListReturn {
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  const userId = useUserId();
  const convexBlockList = useConvexBlockList(userId);

  // Load blocks from local storage
  const loadLocalBlocks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const localBlocks = await blockManager.getBlockList();
      setBlocks(localBlocks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load blocks';
      setError(errorMessage);
      console.error('Failed to load local blocks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync with Convex (if configured)
  const syncWithConvex = useCallback(async () => {
    if (!isConvexConfigured()) {
      return;
    }

    try {
      setSyncStatus('syncing');
      
      // Get local blocks
      const localBlocks = await blockManager.getBlockList();
      
      // Save to Convex
      await convexBlockList.saveBlockList(localBlocks);
      
      setLastSyncTime(Date.now());
      setSyncStatus('idle');
    } catch (err) {
      console.error('Sync with Convex failed:', err);
      setSyncStatus('error');
    }
  }, [convexBlockList]);

  // Initial load
  useEffect(() => {
    loadLocalBlocks();
  }, [loadLocalBlocks]);

  // Auto-sync every 5 minutes if Convex is configured
  useEffect(() => {
    if (!isConvexConfigured()) {
      return;
    }

    const interval = setInterval(syncWithConvex, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [syncWithConvex]);

  // Add block
  const addBlock = useCallback(async (url: string, isPermanent: boolean = false, category?: string) => {
    try {
      setError(null);
      
      // Add to local storage
      await blockManager.addBlockItem(url, isPermanent);
      
      // Update category if provided
      if (category) {
        const localBlocks = await blockManager.getBlockList();
        const newBlock = localBlocks.find(b => b.url === url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, ''));
        if (newBlock) {
          await blockManager.updateItemCategory(newBlock.id, category);
        }
      }
      
      // Reload local blocks
      await loadLocalBlocks();
      
      // Sync with Convex if configured
      if (isConvexConfigured()) {
        await syncWithConvex();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add block';
      setError(errorMessage);
      throw err;
    }
  }, [loadLocalBlocks, syncWithConvex]);

  // Remove block
  const removeBlock = useCallback(async (id: string) => {
    try {
      setError(null);
      
      // Remove from local storage
      await blockManager.removeBlockItem(id);
      
      // Reload local blocks
      await loadLocalBlocks();
      
      // Sync with Convex if configured
      if (isConvexConfigured()) {
        await syncWithConvex();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove block';
      setError(errorMessage);
      throw err;
    }
  }, [loadLocalBlocks, syncWithConvex]);

  // Toggle permanent status
  const togglePermanent = useCallback(async (id: string) => {
    try {
      setError(null);
      
      // Toggle in local storage
      await blockManager.togglePermanentBlock(id);
      
      // Reload local blocks
      await loadLocalBlocks();
      
      // Sync with Convex if configured
      if (isConvexConfigured()) {
        await syncWithConvex();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update block';
      setError(errorMessage);
      throw err;
    }
  }, [loadLocalBlocks, syncWithConvex]);

  // Update category
  const updateCategory = useCallback(async (id: string, category?: string) => {
    try {
      setError(null);
      
      // Update in local storage
      await blockManager.updateItemCategory(id, category);
      
      // Reload local blocks
      await loadLocalBlocks();
      
      // Sync with Convex if configured
      if (isConvexConfigured()) {
        await syncWithConvex();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
      setError(errorMessage);
      throw err;
    }
  }, [loadLocalBlocks, syncWithConvex]);

  // Check if URL is blocked
  const isBlocked = useCallback(async (url: string): Promise<boolean> => {
    try {
      return await blockManager.isBlocked(url);
    } catch (err) {
      console.error('Failed to check if URL is blocked:', err);
      return false;
    }
  }, []);

  // Force sync
  const forceSync = useCallback(async () => {
    if (isConvexConfigured()) {
      await syncWithConvex();
    }
  }, [syncWithConvex]);

  // Calculate stats
  const stats = {
    totalBlocks: blocks.length,
    permanentBlocks: blocks.filter(b => b.isPermanent).length,
    temporaryBlocks: blocks.filter(b => !b.isPermanent).length,
    categorizedBlocks: blocks.filter(b => b.category).length,
  };

  return {
    blocks,
    isLoading,
    error,
    addBlock,
    removeBlock,
    togglePermanent,
    updateCategory,
    isBlocked,
    stats,
    syncStatus,
    lastSyncTime,
    forceSync,
  };
}