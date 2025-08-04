// Local storage utilities for FocusGuardian
import { 
  User, 
  UserSettings, 
  UserStats, 
  BlockList, 
  FocusSession, 
  Challenge,
  FocusMetrics,
  StorageData,
  ValidationResult,
  OperationResult
} from '@/models';
import { 
  validateUserSettings,
  validateBlockItem,
  validateFocusSession,
  createDefaultUser,
  createEmptyBlockList,
  serializeForStorage,
  deserializeFromStorage,
  migrateUserSettings,
  migrateUserStats
} from '@/models';
import { 
  STORAGE_KEYS, 
  DEFAULT_USER_SETTINGS, 
  DEFAULT_USER_STATS 
} from './constants';
import { getCurrentTimestamp, generateId } from './utils';

// Storage wrapper with error handling
class StorageManager {
  private isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private getItem<T>(key: string, fallback: T): T {
    if (!this.isAvailable()) {
      console.warn('localStorage not available, using fallback');
      return fallback;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.error(`Failed to get item from storage: ${key}`, error);
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) {
      console.warn('localStorage not available, cannot save');
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set item in storage: ${key}`, error);
      return false;
    }
  }

  private removeItem(key: string): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove item from storage: ${key}`, error);
      return false;
    }
  }

  // User settings management
  getUserSettings(): UserSettings {
    const stored = this.getItem(STORAGE_KEYS.USER_SETTINGS, null);
    if (stored) {
      return migrateUserSettings(stored);
    }
    return { ...DEFAULT_USER_SETTINGS };
  }

  saveUserSettings(settings: UserSettings): OperationResult<UserSettings> {
    const validation = validateUserSettings(settings);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid settings: ${validation.errors.join(', ')}`
      };
    }

    const success = this.setItem(STORAGE_KEYS.USER_SETTINGS, settings);
    return {
      success,
      data: success ? settings : undefined,
      error: success ? undefined : 'Failed to save settings to storage'
    };
  }

  updateUserSettings(updates: Partial<UserSettings>): OperationResult<UserSettings> {
    const current = this.getUserSettings();
    const merged = { ...current, ...updates };
    return this.saveUserSettings(merged);
  }

  // User stats management
  getUserStats(): UserStats {
    const stored = this.getItem(STORAGE_KEYS.USER_STATS, null);
    if (stored) {
      return migrateUserStats(stored);
    }
    return { ...DEFAULT_USER_STATS };
  }

  saveUserStats(stats: UserStats): OperationResult<UserStats> {
    const success = this.setItem(STORAGE_KEYS.USER_STATS, stats);
    return {
      success,
      data: success ? stats : undefined,
      error: success ? undefined : 'Failed to save stats to storage'
    };
  }

  updateUserStats(updates: Partial<UserStats>): OperationResult<UserStats> {
    const current = this.getUserStats();
    const merged = { ...current, ...updates };
    return this.saveUserStats(merged);
  }

  // Block list management
  getBlockList(): BlockList {
    const userId = this.getUserId();
    const stored = this.getItem(STORAGE_KEYS.BLOCK_LIST, null);
    
    if (stored && stored.userId === userId) {
      return stored;
    }
    
    return createEmptyBlockList(userId);
  }

  saveBlockList(blockList: BlockList): OperationResult<BlockList> {
    // Validate all block items
    for (const item of blockList.items) {
      const validation = validateBlockItem(item);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid block item ${item.id}: ${validation.errors.join(', ')}`
        };
      }
    }

    const success = this.setItem(STORAGE_KEYS.BLOCK_LIST, blockList);
    return {
      success,
      data: success ? blockList : undefined,
      error: success ? undefined : 'Failed to save block list to storage'
    };
  }

  // Focus session management
  getActiveFocusSession(): FocusSession | null {
    const stored = this.getItem(STORAGE_KEYS.ACTIVE_SESSION, null);
    if (stored) {
      const validation = validateFocusSession(stored);
      if (validation.valid) {
        return stored;
      }
    }
    return null;
  }

  saveActiveFocusSession(session: FocusSession): OperationResult<FocusSession> {
    const validation = validateFocusSession(session);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid session: ${validation.errors.join(', ')}`
      };
    }

    const success = this.setItem(STORAGE_KEYS.ACTIVE_SESSION, session);
    return {
      success,
      data: success ? session : undefined,
      error: success ? undefined : 'Failed to save active session to storage'
    };
  }

  clearActiveFocusSession(): boolean {
    return this.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  }

  // Session history management
  getSessionHistory(): FocusSession[] {
    return this.getItem(STORAGE_KEYS.SESSION_HISTORY, []);
  }

  addToSessionHistory(session: FocusSession): OperationResult<FocusSession[]> {
    const validation = validateFocusSession(session);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid session: ${validation.errors.join(', ')}`
      };
    }

    const history = this.getSessionHistory();
    const updatedHistory = [...history, session];
    
    // Keep only last 100 sessions to prevent storage bloat
    const trimmedHistory = updatedHistory.slice(-100);
    
    const success = this.setItem(STORAGE_KEYS.SESSION_HISTORY, trimmedHistory);
    return {
      success,
      data: success ? trimmedHistory : undefined,
      error: success ? undefined : 'Failed to save session history'
    };
  }

  // Challenge bank management
  getChallengeBank(): Challenge[] {
    return this.getItem(STORAGE_KEYS.CHALLENGE_BANK, []);
  }

  saveChallengeBank(challenges: Challenge[]): OperationResult<Challenge[]> {
    const success = this.setItem(STORAGE_KEYS.CHALLENGE_BANK, challenges);
    return {
      success,
      data: success ? challenges : undefined,
      error: success ? undefined : 'Failed to save challenge bank'
    };
  }

  // Analytics data management
  getAnalyticsData(): FocusMetrics | null {
    return this.getItem(STORAGE_KEYS.ANALYTICS_DATA, null);
  }

  saveAnalyticsData(metrics: FocusMetrics): OperationResult<FocusMetrics> {
    const success = this.setItem(STORAGE_KEYS.ANALYTICS_DATA, metrics);
    return {
      success,
      data: success ? metrics : undefined,
      error: success ? undefined : 'Failed to save analytics data'
    };
  }

  // Sync management
  getLastSyncTime(): number {
    return this.getItem(STORAGE_KEYS.LAST_SYNC, 0);
  }

  setLastSyncTime(timestamp: number = getCurrentTimestamp()): boolean {
    return this.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
  }

  // User ID management (for multi-user support)
  private getUserId(): string {
    const stored = this.getItem('fg_user_id', null);
    if (stored) {
      return stored;
    }
    
    const newUserId = generateId();
    this.setItem('fg_user_id', newUserId);
    return newUserId;
  }

  // Data export/import
  exportAllData(): string {
    const data: StorageData = {
      userSettings: this.getUserSettings(),
      userStats: this.getUserStats(),
      blockList: this.getBlockList(),
      activeFocusSession: this.getActiveFocusSession() || undefined,
      focusSessionHistory: this.getSessionHistory(),
      challengeBank: this.getChallengeBank(),
      analyticsData: this.getAnalyticsData() || undefined,
      lastSync: this.getLastSyncTime(),
    };

    return serializeForStorage({
      version: '1.0.0',
      exportedAt: getCurrentTimestamp(),
      data,
    });
  }

  importAllData(jsonData: string): OperationResult<boolean> {
    try {
      const imported = JSON.parse(jsonData);
      
      if (!imported.version || !imported.data) {
        return {
          success: false,
          error: 'Invalid import format'
        };
      }

      const data = imported.data as StorageData;
      let hasErrors = false;
      const errors: string[] = [];

      // Import user settings
      if (data.userSettings) {
        const result = this.saveUserSettings(data.userSettings);
        if (!result.success) {
          hasErrors = true;
          errors.push(`Settings: ${result.error}`);
        }
      }

      // Import user stats
      if (data.userStats) {
        const result = this.saveUserStats(data.userStats);
        if (!result.success) {
          hasErrors = true;
          errors.push(`Stats: ${result.error}`);
        }
      }

      // Import block list
      if (data.blockList) {
        const result = this.saveBlockList(data.blockList);
        if (!result.success) {
          hasErrors = true;
          errors.push(`Block list: ${result.error}`);
        }
      }

      // Import session history
      if (data.focusSessionHistory) {
        const success = this.setItem(STORAGE_KEYS.SESSION_HISTORY, data.focusSessionHistory);
        if (!success) {
          hasErrors = true;
          errors.push('Failed to import session history');
        }
      }

      // Import challenge bank
      if (data.challengeBank) {
        const result = this.saveChallengeBank(data.challengeBank);
        if (!result.success) {
          hasErrors = true;
          errors.push(`Challenge bank: ${result.error}`);
        }
      }

      // Import analytics data
      if (data.analyticsData) {
        const result = this.saveAnalyticsData(data.analyticsData);
        if (!result.success) {
          hasErrors = true;
          errors.push(`Analytics: ${result.error}`);
        }
      }

      return {
        success: !hasErrors,
        data: true,
        error: hasErrors ? errors.join('; ') : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse import data'
      };
    }
  }

  // Clear all data (for reset/logout)
  clearAllData(): boolean {
    const keys = Object.values(STORAGE_KEYS);
    let success = true;

    for (const key of keys) {
      if (!this.removeItem(key)) {
        success = false;
      }
    }

    // Also clear user ID
    this.removeItem('fg_user_id');

    return success;
  }

  // Storage quota management
  getStorageInfo(): { used: number; available: number; percentage: number } {
    if (!this.isAvailable()) {
      return { used: 0, available: 0, percentage: 0 };
    }

    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Estimate available space (most browsers have 5-10MB limit)
      const estimated = 5 * 1024 * 1024; // 5MB
      const available = Math.max(0, estimated - used);
      const percentage = (used / estimated) * 100;

      return { used, available, percentage };
    } catch {
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

// Create singleton instance
export const storage = new StorageManager();

// Export individual functions for convenience
export const {
  getUserSettings,
  saveUserSettings,
  updateUserSettings,
  getUserStats,
  saveUserStats,
  updateUserStats,
  getBlockList,
  saveBlockList,
  getActiveFocusSession,
  saveActiveFocusSession,
  clearActiveFocusSession,
  getSessionHistory,
  addToSessionHistory,
  getChallengeBank,
  saveChallengeBank,
  getAnalyticsData,
  saveAnalyticsData,
  getLastSyncTime,
  setLastSyncTime,
  exportAllData,
  importAllData,
  clearAllData,
  getStorageInfo,
} = storage;