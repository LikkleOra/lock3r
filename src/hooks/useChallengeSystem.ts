'use client';

import { useState, useCallback } from 'react';
import { Challenge } from '@/models';
import { challengeManager } from '@/lib/managers/ChallengeManager';
import { blockManager } from '@/lib/managers/BlockManager';

interface UseChallengeSystemReturn {
  currentChallenge: Challenge | null;
  isLoading: boolean;
  error: string | null;
  showChallengeModal: boolean;
  showResultModal: boolean;
  challengeResult: {
    isCorrect: boolean;
    userAnswer: string | number;
  } | null;
  blockedUrl: string | null;
  temporaryUnlockDuration: number;
  
  // Actions
  requestChallenge: (url: string, difficulty?: string) => Promise<void>;
  submitAnswer: (answer: string | number) => Promise<void>;
  skipChallenge: () => void;
  tryAgain: () => Promise<void>;
  closeChallengeModal: () => void;
  closeResultModal: () => void;
}

export function useChallengeSystem(): UseChallengeSystemReturn {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [challengeResult, setChallengeResult] = useState<{
    isCorrect: boolean;
    userAnswer: string | number;
  } | null>(null);
  const [blockedUrl, setBlockedUrl] = useState<string | null>(null);
  const [temporaryUnlockDuration] = useState(10 * 60 * 1000); // 10 minutes

  // Grant temporary unlock for a URL
  const grantTemporaryUnlock = useCallback(async (url: string) => {
    try {
      const unlockUntil = Date.now() + temporaryUnlockDuration;
      
      // Store temporary unlock in localStorage
      const tempUnlocks = JSON.parse(localStorage.getItem('fg_temp_unlocks') || '{}');
      tempUnlocks[url] = unlockUntil;
      localStorage.setItem('fg_temp_unlocks', JSON.stringify(tempUnlocks));
      
      // Also update the block manager
      await blockManager.setTemporaryUnlock(url, unlockUntil);
      
      console.log(`Granted temporary unlock for ${url} until ${new Date(unlockUntil).toLocaleTimeString()}`);
    } catch (error) {
      console.error('Failed to grant temporary unlock:', error);
    }
  }, [temporaryUnlockDuration]);

  // Request a challenge for a blocked URL
  const requestChallenge = useCallback(async (url: string, difficulty?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setBlockedUrl(url);

      // Check if the URL is actually permanently blocked
      const blockItem = await blockManager.getBlockedItem(url);
      if (!blockItem || !blockItem.isPermanent) {
        throw new Error('This URL is not permanently blocked');
      }

      // Generate a challenge
      const challenge = await challengeManager.generateChallenge(
        difficulty || challengeManager.getRecommendedDifficulty()
      );
      
      setCurrentChallenge(challenge);
      setShowChallengeModal(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate challenge';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (answer: string | number) => {
    if (!currentChallenge) {
      setError('No active challenge');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const isCorrect = await challengeManager.validateAnswer(currentChallenge.id, answer);
      
      setChallengeResult({
        isCorrect,
        userAnswer: answer
      });

      if (isCorrect && blockedUrl) {
        await grantTemporaryUnlock(blockedUrl);
      }

      setShowChallengeModal(false);
      setShowResultModal(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate answer';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentChallenge, blockedUrl, grantTemporaryUnlock]);

  const skipChallenge = useCallback(() => {
    if (currentChallenge) {
      challengeManager.trackAttempt(currentChallenge.id, false);
    }
    
    setShowChallengeModal(false);
    setCurrentChallenge(null);
    setBlockedUrl(null);
    setError(null);
  }, [currentChallenge]);

  const tryAgain = useCallback(async () => {
    if (!blockedUrl) return;
    
    setShowResultModal(false);
    setChallengeResult(null);
    
    const recommendedDifficulty = challengeManager.getRecommendedDifficulty();
    await requestChallenge(blockedUrl, recommendedDifficulty);
  }, [blockedUrl, requestChallenge]);

  const closeChallengeModal = useCallback(() => {
    setShowChallengeModal(false);
    setCurrentChallenge(null);
    setBlockedUrl(null);
    setError(null);
  }, []);

  const closeResultModal = useCallback(() => {
    setShowResultModal(false);
    setChallengeResult(null);
    setCurrentChallenge(null);
    setBlockedUrl(null);
    setError(null);
  }, []);

  return {
    currentChallenge,
    isLoading,
    error,
    showChallengeModal,
    showResultModal,
    challengeResult,
    blockedUrl,
    temporaryUnlockDuration,
    requestChallenge,
    submitAnswer,
    skipChallenge,
    tryAgain,
    closeChallengeModal,
    closeResultModal,
  };
}