// Data transformation utilities for FocusGuardian
import { 
  User, 
  UserSettings, 
  UserStats, 
  BlockItem, 
  BlockList, 
  FocusSession, 
  Challenge,
  FocusMetrics 
} from './index';
import { 
  DEFAULT_USER_SETTINGS, 
  DEFAULT_USER_STATS 
} from '@/lib/constants';
import { getCurrentTimestamp } from '@/lib/utils';

// User data transformers
export function createDefaultUser(id: string): User {
  return {
    id,
    createdAt: getCurrentTimestamp(),
    settings: { ...DEFAULT_USER_SETTINGS },
    stats: { ...DEFAULT_USER_STATS },
  };
}

export function mergeUserSettings(current: UserSettings, updates: Partial<UserSettings>): UserSettings {
  return {
    ...current,
    ...updates,
  };
}

export function updateUserStats(current: UserStats, updates: Partial<UserStats>): UserStats {
  return {
    ...current,
    ...updates,
  };
}

// Block list transformers
export function createEmptyBlockList(userId: string): BlockList {
  return {
    userId,
    items: [],
    lastUpdated: getCurrentTimestamp(),
  };
}

export function addItemToBlockList(blockList: BlockList, item: BlockItem): BlockList {
  // Check if item already exists (by URL)
  const existingIndex = blockList.items.findIndex(
    existing => existing.url === item.url
  );

  let updatedItems: BlockItem[];
  
  if (existingIndex >= 0) {
    // Update existing item
    updatedItems = [...blockList.items];
    updatedItems[existingIndex] = { ...updatedItems[existingIndex], ...item };
  } else {
    // Add new item
    updatedItems = [...blockList.items, item];
  }

  return {
    ...blockList,
    items: updatedItems,
    lastUpdated: getCurrentTimestamp(),
  };
}

export function removeItemFromBlockList(blockList: BlockList, itemId: string): BlockList {
  return {
    ...blockList,
    items: blockList.items.filter(item => item.id !== itemId),
    lastUpdated: getCurrentTimestamp(),
  };
}

export function togglePermanentBlock(blockList: BlockList, itemId: string): BlockList {
  const updatedItems = blockList.items.map(item => 
    item.id === itemId 
      ? { ...item, isPermanent: !item.isPermanent }
      : item
  );

  return {
    ...blockList,
    items: updatedItems,
    lastUpdated: getCurrentTimestamp(),
  };
}

export function updateBlockItemAccess(blockList: BlockList, itemId: string): BlockList {
  const updatedItems = blockList.items.map(item => 
    item.id === itemId 
      ? { ...item, lastAccessed: getCurrentTimestamp() }
      : item
  );

  return {
    ...blockList,
    items: updatedItems,
    lastUpdated: getCurrentTimestamp(),
  };
}

// Focus session transformers
export function updateSessionProgress(session: FocusSession): FocusSession {
  const now = getCurrentTimestamp();
  const elapsed = now - session.startTime;
  const completedPercentage = Math.min(100, Math.round((elapsed / session.duration) * 100));

  return {
    ...session,
    completedPercentage,
  };
}

export function endFocusSession(session: FocusSession): FocusSession {
  const now = getCurrentTimestamp();
  
  return {
    ...session,
    endTime: now,
    isActive: false,
    completedPercentage: 100,
  };
}

export function pauseFocusSession(session: FocusSession, reason?: string): FocusSession {
  const now = getCurrentTimestamp();
  const breakItem = {
    id: `break_${now}_${Math.random().toString(36).substr(2, 9)}`,
    startTime: now,
    reason,
  };

  return {
    ...session,
    breaks: [...session.breaks, breakItem],
  };
}

export function resumeFocusSession(session: FocusSession): FocusSession {
  const now = getCurrentTimestamp();
  const lastBreak = session.breaks[session.breaks.length - 1];
  
  if (lastBreak && !lastBreak.endTime) {
    const updatedBreaks = [...session.breaks];
    updatedBreaks[updatedBreaks.length - 1] = {
      ...lastBreak,
      endTime: now,
    };

    // Extend session duration by break time
    const breakDuration = now - lastBreak.startTime;
    
    return {
      ...session,
      breaks: updatedBreaks,
      endTime: session.endTime + breakDuration,
      duration: session.duration + breakDuration,
    };
  }

  return session;
}

// Analytics transformers
export function calculateSessionMetrics(sessions: FocusSession[]): FocusMetrics {
  const completedSessions = sessions.filter(s => !s.isActive && s.completedPercentage === 100);
  const totalFocusTime = completedSessions.reduce((sum, s) => sum + s.duration, 0);
  const averageSessionLength = completedSessions.length > 0 
    ? totalFocusTime / completedSessions.length 
    : 0;

  // Calculate most productive time of day
  const hourCounts = new Array(24).fill(0);
  completedSessions.forEach(session => {
    const hour = new Date(session.startTime).getHours();
    hourCounts[hour] += session.duration;
  });
  
  const mostProductiveHour = hourCounts.indexOf(Math.max(...hourCounts));
  const mostProductiveTimeOfDay = `${mostProductiveHour.toString().padStart(2, '0')}:00`;

  // Calculate streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streakDays = 0;
  let currentDate = new Date(today);
  
  while (true) {
    const dayStart = currentDate.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    
    const hasSessionThisDay = completedSessions.some(session => 
      session.startTime >= dayStart && session.startTime < dayEnd
    );
    
    if (hasSessionThisDay) {
      streakDays++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    totalFocusTime,
    sessionsCompleted: completedSessions.length,
    averageSessionLength,
    mostProductiveTimeOfDay,
    distractionAttempts: 0, // Will be calculated from challenge attempts
    successfulChallenges: 0, // Will be calculated from challenge attempts
    streakDays,
  };
}

// Challenge transformers
export function createLocalChallenge(
  type: Challenge['type'],
  question: string,
  correctAnswer: string | number,
  difficulty: Challenge['difficulty'],
  options?: string[],
  timeLimit?: number
): Challenge {
  const timestamp = getCurrentTimestamp();
  
  return {
    id: `challenge_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    question,
    correctAnswer,
    difficulty,
    options,
    timeLimit,
  };
}

// Data serialization helpers
export function serializeForStorage<T>(data: T): string {
  try {
    return JSON.stringify(data, null, 0);
  } catch (error) {
    console.error('Failed to serialize data:', error);
    return '{}';
  }
}

export function deserializeFromStorage<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to deserialize data:', error);
    return fallback;
  }
}

// Data migration helpers
export function migrateUserSettings(settings: any): UserSettings {
  return {
    defaultSessionDuration: settings.defaultSessionDuration ?? DEFAULT_USER_SETTINGS.defaultSessionDuration,
    defaultBreakDuration: settings.defaultBreakDuration ?? DEFAULT_USER_SETTINGS.defaultBreakDuration,
    challengeDifficulty: settings.challengeDifficulty ?? DEFAULT_USER_SETTINGS.challengeDifficulty,
    notificationsEnabled: settings.notificationsEnabled ?? DEFAULT_USER_SETTINGS.notificationsEnabled,
    temporaryUnlockDuration: settings.temporaryUnlockDuration ?? DEFAULT_USER_SETTINGS.temporaryUnlockDuration,
    theme: settings.theme ?? DEFAULT_USER_SETTINGS.theme,
  };
}

export function migrateUserStats(stats: any): UserStats {
  return {
    totalFocusTime: stats.totalFocusTime ?? DEFAULT_USER_STATS.totalFocusTime,
    sessionsCompleted: stats.sessionsCompleted ?? DEFAULT_USER_STATS.sessionsCompleted,
    currentStreak: stats.currentStreak ?? DEFAULT_USER_STATS.currentStreak,
    longestStreak: stats.longestStreak ?? DEFAULT_USER_STATS.longestStreak,
    challengesCompleted: stats.challengesCompleted ?? DEFAULT_USER_STATS.challengesCompleted,
    challengeSuccessRate: stats.challengeSuccessRate ?? DEFAULT_USER_STATS.challengeSuccessRate,
  };
}

// Export/Import helpers
export function exportUserData(user: User, blockList: BlockList, sessions: FocusSession[]): string {
  const exportData = {
    version: '1.0.0',
    exportedAt: getCurrentTimestamp(),
    user: {
      settings: user.settings,
      stats: user.stats,
    },
    blockList: blockList.items,
    sessions: sessions.filter(s => !s.isActive), // Only export completed sessions
  };

  return serializeForStorage(exportData);
}

export function importUserData(jsonData: string): {
  settings?: UserSettings;
  stats?: UserStats;
  blockItems?: BlockItem[];
  sessions?: FocusSession[];
  errors: string[];
} {
  const errors: string[] = [];
  
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.version) {
      errors.push('Invalid export format: missing version');
    }
    
    const result: any = { errors };
    
    if (data.user?.settings) {
      result.settings = migrateUserSettings(data.user.settings);
    }
    
    if (data.user?.stats) {
      result.stats = migrateUserStats(data.user.stats);
    }
    
    if (Array.isArray(data.blockList)) {
      result.blockItems = data.blockList;
    }
    
    if (Array.isArray(data.sessions)) {
      result.sessions = data.sessions;
    }
    
    return result;
  } catch (error) {
    errors.push('Failed to parse import data');
    return { errors };
  }
}