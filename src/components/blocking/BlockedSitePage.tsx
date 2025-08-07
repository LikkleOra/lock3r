'use client';

import React, { useState, useEffect } from 'react';
import { useChallengeSystem } from '@/hooks/useChallengeSystem';
import { blockManager } from '@/lib/managers/BlockManager';
import { BlockItem } from '@/models';

interface BlockedSitePageProps {
  url: string;
  onUnblock?: () => void;
}

export function BlockedSitePage({ url, onUnblock }: BlockedSitePageProps) {
  const [blockItem, setBlockItem] = useState<BlockItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [temporaryUnlockInfo, setTemporaryUnlockInfo] = useState<{
    isUnlocked: boolean;
    unlockUntil?: number;
  }>({ isUnlocked: false });

  const { requestChallenge, isLoading: challengeLoading } = useChallengeSystem();

  useEffect(() => {
    const loadBlockInfo = async () => {
      try {
        const item = await blockManager.getBlockedItem(url);
        setBlockItem(item);
        
        const unlockInfo = blockManager.getTemporaryUnlockInfo(url);
        setTemporaryUnlockInfo(unlockInfo);
      } catch (error) {
        console.error('Failed to load block info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBlockInfo();
    
    // Check unlock status periodically
    const interval = setInterval(loadBlockInfo, 5000);
    return () => clearInterval(interval);
  }, [url]);

  const handleChallengeRequest = async () => {
    try {
      await requestChallenge(url);
    } catch (error) {
      console.error('Failed to request challenge:', error);
    }
  };

  const formatTimeRemaining = (unlockUntil: number) => {
    const remaining = unlockUntil - Date.now();
    if (remaining <= 0) return 'Expired';
    
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If temporarily unlocked, show countdown
  if (temporaryUnlockInfo.isUnlocked && temporaryUnlockInfo.unlockUntil) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🔓</div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">
            Temporary Access Granted
          </h1>
          <p className="text-green-700 mb-6">
            You have successfully unlocked access to this site.
          </p>
          
          <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800 mb-2">
              <strong>Site:</strong> {url}
            </p>
            <p className="text-sm text-green-800">
              <strong>Time remaining:</strong> {formatTimeRemaining(temporaryUnlockInfo.unlockUntil)}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onUnblock}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              Continue to Site
            </button>
            
            <p className="text-xs text-gray-500">
              Use this time wisely. The site will be blocked again when the timer expires.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-red-800 mb-2">
          Site Blocked
        </h1>
        <p className="text-red-700 mb-6">
          This site is currently blocked by FocusGuardian.
        </p>
        
        <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 mb-2">
            <strong>Blocked URL:</strong> {url}
          </p>
          {blockItem && (
            <>
              <p className="text-sm text-red-800 mb-2">
                <strong>Block Type:</strong> {blockItem.isPermanent ? 'Permanent' : 'Session-based'}
              </p>
              {blockItem.category && (
                <p className="text-sm text-red-800">
                  <strong>Category:</strong> {blockItem.category}
                </p>
              )}
            </>
          )}
        </div>

        <div className="space-y-4">
          {/* Challenge Option for Permanent Blocks */}
          {blockItem?.isPermanent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">
                🧩 Unlock with Challenge
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                Complete a cognitive challenge to temporarily unlock this site.
              </p>
              <button
                onClick={handleChallengeRequest}
                disabled={challengeLoading}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {challengeLoading ? 'Generating Challenge...' : 'Start Challenge'}
              </button>
            </div>
          )}

          {/* Session-based Block Info */}
          {!blockItem?.isPermanent && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-medium text-orange-800 mb-2">
                ⏱️ Session Block
              </h3>
              <p className="text-sm text-orange-700">
                This site is blocked during your current focus session. 
                End your session to regain access.
              </p>
            </div>
          )}

          {/* Alternative Actions */}
          <div className="space-y-2">
            <button
              onClick={() => window.history.back()}
              className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Go Back
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              🏠 Return to Dashboard
            </button>
          </div>

          {/* Motivation */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-gray-500 italic">
              "The best way to get started is to quit talking and begin doing." - Walt Disney
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}