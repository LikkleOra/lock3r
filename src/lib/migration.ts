// Data migration utilities for FocusGuardian
import { storage } from './storage';
import { DEFAULT_USER_SETTINGS, DEFAULT_USER_STATS } from './constants';
import { getCurrentTimestamp } from './utils';

// Version management
const CURRENT_VERSION = '1.0.0';
const VERSION_KEY = 'fg_data_version';

// Get current data version
function getCurrentDataVersion(): string {
  try {
    return localStorage.getItem(VERSION_KEY) || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

// Set data version
function setDataVersion(version: string): boolean {
  try {
    localStorage.setItem(VERSION_KEY, version);
    return true;
  } catch {
    return false;
  }
}

// Migration from initial version to 1.0.0
async function migrateTo1_0_0(): Promise<boolean> {
  try {
    console.log('Migrating to version 1.0.0...');
    
    // Ensure user settings exist with defaults
    const settings = storage.getUserSettings();
    const settingsResult = storage.saveUserSettings({
      ...DEFAULT_USER_SETTINGS,
      ...settings,
    });
    
    if (!settingsResult.success) {
      console.error('Failed to migrate user settings:', settingsResult.error);
      return false;
    }

    // Ensure user stats exist with defaults
    const stats = storage.getUserStats();
    const statsResult = storage.saveUserStats({
      ...DEFAULT_USER_STATS,
      ...stats,
    });
    
    if (!statsResult.success) {
      console.error('Failed to migrate user stats:', statsResult.error);
      return false;
    }

    console.log('Migration to 1.0.0 completed successfully');
    return true;
  } catch (error) {
    console.error('Migration to 1.0.0 failed:', error);
    return false;
  }
}

// Run migrations
export async function runMigrations() {
  const currentVersion = getCurrentDataVersion();
  
  if (currentVersion === '0.0.0') {
    const success = await migrateTo1_0_0();
    if (success) {
      setDataVersion('1.0.0');
    }
    return success;
  }
  
  return true;
}

// Export data
export function exportUserData(): string {
  return storage.exportAllData();
}

// Import data
export function importUserData(data: string) {
  return storage.importAllData(data);
}