// React hooks for Convex integration
'use client';

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { 
  BlockItem, 
  FocusSession, 
  UserSettings, 
  UserStats,
  Challenge 
} from "@/models";
import { isConvexConfigured } from "./client";

// User hooks
export function useUser(userId: string) {
  const user = isConvexConfigured() ? useQuery(api.users.getUser, { userId }) : null;
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const updateSettings = useMutation(api.users.updateUserSettings);
  const updateStats = useMutation(api.users.updateUserStats);
  const incrementStats = useMutation(api.users.incrementUserStats);

  return {
    user,
    getOrCreateUser: () => isConvexConfigured() ? getOrCreateUser({ userId }) : Promise.resolve(null),
    updateSettings: (settings: Partial<UserSettings>) => 
      isConvexConfigured() ? updateSettings({ userId, settings }) : Promise.resolve(null),
    updateStats: (stats: Partial<UserStats>) => 
      isConvexConfigured() ? updateStats({ userId, stats }) : Promise.resolve(null),
    incrementStats: (focusTime?: number, sessionsCompleted?: number, challengesCompleted?: number) =>
      isConvexConfigured() ? incrementStats({ userId, focusTime, sessionsCompleted, challengesCompleted }) : Promise.resolve(null),
  };
}

// Block list hooks
export function useBlockList(userId: string) {
  const blockList = isConvexConfigured() ? useQuery(api.blocks.getBlockList, { userId }) : null;
  const blockStats = isConvexConfigured() ? useQuery(api.blocks.getBlockStats, { userId }) : null;
  const saveBlockList = useMutation(api.blocks.saveBlockList);
  const addBlockItem = useMutation(api.blocks.addBlockItem);
  const removeBlockItem = useMutation(api.blocks.removeBlockItem);
  const togglePermanent = useMutation(api.blocks.togglePermanentBlock);
  const updateAccess = useMutation(api.blocks.updateBlockItemAccess);

  return {
    blockList,
    blockStats,
    saveBlockList: (items: BlockItem[]) => 
      isConvexConfigured() ? saveBlockList({ userId, items }) : Promise.resolve(null),
    addBlock: (url: string, isPermanent?: boolean, category?: string) =>
      isConvexConfigured() ? addBlockItem({ userId, url, isPermanent, category }) : Promise.resolve(null),
    removeBlock: (itemId: string) => 
      isConvexConfigured() ? removeBlockItem({ userId, itemId }) : Promise.resolve(null),
    togglePermanent: (itemId: string) => 
      isConvexConfigured() ? togglePermanent({ userId, itemId }) : Promise.resolve(null),
    updateAccess: (itemId: string) => 
      isConvexConfigured() ? updateAccess({ userId, itemId }) : Promise.resolve(null),
    isBlocked: (url: string) => {
      return isConvexConfigured() ? useQuery(api.blocks.isUrlBlocked, { userId, url }) : null;
    },
  };
}

// Focus session hooks
export function useFocusSession(userId: string) {
  const activeSession = useQuery(api.sessions.getActiveFocusSession, { userId });
  const sessionHistory = useQuery(api.sessions.getFocusSessionHistory, { userId, limit: 50 });
  const sessionStats = useQuery(api.sessions.getFocusSessionStats, { userId });
  
  const createSession = useMutation(api.sessions.createFocusSession);
  const updateProgress = useMutation(api.sessions.updateSessionProgress);
  const endSession = useMutation(api.sessions.endFocusSession);
  const pauseSession = useMutation(api.sessions.pauseFocusSession);
  const resumeSession = useMutation(api.sessions.resumeFocusSession);

  return {
    activeSession,
    sessionHistory,
    sessionStats,
    startSession: (duration: number) => createSession({ userId, duration }),
    updateProgress: (sessionId: string, completedPercentage: number) =>
      updateProgress({ sessionId, completedPercentage }),
    endSession: (sessionId: string, completedPercentage?: number) =>
      endSession({ sessionId, completedPercentage }),
    pauseSession: (sessionId: string, reason?: string) =>
      pauseSession({ sessionId, reason }),
    resumeSession: (sessionId: string) => resumeSession({ sessionId }),
  };
}

// Challenge hooks
export function useChallenges(userId: string) {
  const challengeHistory = useQuery(api.challenges.getChallengeHistory, { userId, limit: 20 });
  const challengeStats = useQuery(api.challenges.getChallengeStats, { userId });
  const challengeTrends = useQuery(api.challenges.getChallengeTrends, { userId, days: 30 });
  const recentFailed = useQuery(api.challenges.getRecentFailedChallenges, { userId, limit: 5 });
  
  const recordAttempt = useMutation(api.challenges.recordChallengeAttempt);

  return {
    challengeHistory,
    challengeStats,
    challengeTrends,
    recentFailed,
    recordAttempt: (
      challengeId: string,
      type: Challenge['type'],
      question: string,
      correctAnswer: string | number,
      difficulty: Challenge['difficulty'],
      wasSuccessful: boolean,
      timeLimit?: number
    ) => recordAttempt({
      userId,
      challengeId,
      type,
      question,
      correctAnswer,
      difficulty,
      wasSuccessful,
      timeLimit,
    }),
  };
}

// Combined analytics hook
export function useAnalytics(userId: string) {
  const sessionStats = useQuery(api.sessions.getFocusSessionStats, { userId });
  const challengeStats = useQuery(api.challenges.getChallengeStats, { userId });
  const blockStats = useQuery(api.blocks.getBlockStats, { userId });
  const challengeTrends = useQuery(api.challenges.getChallengeTrends, { userId, days: 30 });

  return {
    sessionStats,
    challengeStats,
    blockStats,
    challengeTrends,
    isLoading: !sessionStats || !challengeStats || !blockStats || !challengeTrends,
  };
}

// Utility hook for checking if URL is blocked
export function useUrlBlockCheck(userId: string, url: string) {
  return useQuery(api.blocks.isUrlBlocked, 
    url ? { userId, url } : "skip"
  );
}

// Hook for getting user ID (would typically come from auth)
export function useUserId(): string {
  // For now, return a static user ID
  // In a real app, this would come from your authentication system
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem('fg_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('fg_user_id', userId);
    }
    return userId;
  }
  return 'default_user';
}