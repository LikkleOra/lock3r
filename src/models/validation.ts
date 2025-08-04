// Validation functions for FocusGuardian data models
import { 
  BlockItem, 
  FocusSession, 
  Challenge, 
  UserSettings,
  Break
} from './index';
import { 
  FOCUS_SESSION, 
  BLOCK_LIST, 
  CHALLENGES, 
  THEMES 
} from '@/lib/constants';
import { isValidUrl, isValidDomain, normalizeUrl } from '@/lib/utils';

// User settings validation
export function validateUserSettings(settings: Partial<UserSettings>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate session duration
  if (settings.defaultSessionDuration !== undefined) {
    if (typeof settings.defaultSessionDuration !== 'number') {
      errors.push('Session duration must be a number');
    } else if (settings.defaultSessionDuration < FOCUS_SESSION.MIN_DURATION) {
      errors.push(`Session duration must be at least ${FOCUS_SESSION.MIN_DURATION / 60000} minutes`);
    } else if (settings.defaultSessionDuration > FOCUS_SESSION.MAX_DURATION) {
      errors.push(`Session duration must be at most ${FOCUS_SESSION.MAX_DURATION / 3600000} hours`);
    }
  }

  // Validate break duration
  if (settings.defaultBreakDuration !== undefined) {
    if (typeof settings.defaultBreakDuration !== 'number') {
      errors.push('Break duration must be a number');
    } else if (settings.defaultBreakDuration < 0) {
      errors.push('Break duration must be positive');
    } else if (settings.defaultBreakDuration > FOCUS_SESSION.MAX_DURATION / 4) {
      errors.push(`Break duration must be at most ${FOCUS_SESSION.MAX_DURATION / 4 / 60000} minutes`);
    }
  }

  // Validate challenge difficulty
  if (settings.challengeDifficulty !== undefined) {
    if (!CHALLENGES.DIFFICULTY_LEVELS.includes(settings.challengeDifficulty as any)) {
      errors.push(`Challenge difficulty must be one of: ${CHALLENGES.DIFFICULTY_LEVELS.join(', ')}`);
    }
  }

  // Validate theme
  if (settings.theme !== undefined) {
    if (![THEMES.LIGHT, THEMES.DARK, THEMES.SYSTEM].includes(settings.theme as any)) {
      errors.push(`Theme must be one of: ${THEMES.LIGHT}, ${THEMES.DARK}, ${THEMES.SYSTEM}`);
    }
  }

  // Validate temporary unlock duration
  if (settings.temporaryUnlockDuration !== undefined) {
    if (typeof settings.temporaryUnlockDuration !== 'number') {
      errors.push('Temporary unlock duration must be a number');
    } else if (settings.temporaryUnlockDuration < 60000) { // At least 1 minute
      errors.push('Temporary unlock duration must be at least 1 minute');
    } else if (settings.temporaryUnlockDuration > 24 * 60 * 60 * 1000) { // At most 24 hours
      errors.push('Temporary unlock duration must be at most 24 hours');
    }
  }

  return { valid: errors.length === 0, errors };
}

// Block item validation
export function validateBlockItem(item: Partial<BlockItem>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate URL
  if (!item.url) {
    errors.push('URL is required');
  } else if (typeof item.url !== 'string') {
    errors.push('URL must be a string');
  } else {
    const trimmedUrl = item.url.trim();
    if (!trimmedUrl) {
      errors.push('URL cannot be empty');
    } else if (!isValidUrl(trimmedUrl) && !isValidDomain(trimmedUrl)) {
      errors.push('URL must be a valid URL or domain');
    }
  }

  // Validate ID
  if (item.id !== undefined && (typeof item.id !== 'string' || !item.id.trim())) {
    errors.push('ID must be a non-empty string');
  }

  // Validate pattern
  if (item.pattern !== undefined && typeof item.pattern !== 'string') {
    errors.push('Pattern must be a string');
  }

  // Validate isPermanent
  if (item.isPermanent !== undefined && typeof item.isPermanent !== 'boolean') {
    errors.push('isPermanent must be a boolean');
  }

  // Validate category
  if (item.category !== undefined && typeof item.category !== 'string') {
    errors.push('Category must be a string');
  }

  // Validate timestamps
  if (item.createdAt !== undefined) {
    if (typeof item.createdAt !== 'number') {
      errors.push('createdAt must be a number');
    } else if (item.createdAt < 0) {
      errors.push('createdAt must be a positive timestamp');
    }
  }

  if (item.lastAccessed !== undefined) {
    if (typeof item.lastAccessed !== 'number') {
      errors.push('lastAccessed must be a number');
    } else if (item.lastAccessed < 0) {
      errors.push('lastAccessed must be a positive timestamp');
    }
  }

  return { valid: errors.length === 0, errors };
}

// Focus session validation
export function validateFocusSession(session: Partial<FocusSession>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate required fields
  if (!session.id) {
    errors.push('Session ID is required');
  } else if (typeof session.id !== 'string') {
    errors.push('Session ID must be a string');
  }

  if (!session.userId) {
    errors.push('User ID is required');
  } else if (typeof session.userId !== 'string') {
    errors.push('User ID must be a string');
  }

  // Validate duration
  if (session.duration !== undefined) {
    if (typeof session.duration !== 'number') {
      errors.push('Duration must be a number');
    } else if (session.duration < FOCUS_SESSION.MIN_DURATION) {
      errors.push(`Duration must be at least ${FOCUS_SESSION.MIN_DURATION / 60000} minutes`);
    } else if (session.duration > FOCUS_SESSION.MAX_DURATION) {
      errors.push(`Duration must be at most ${FOCUS_SESSION.MAX_DURATION / 3600000} hours`);
    }
  }

  // Validate timestamps
  if (session.startTime !== undefined) {
    if (typeof session.startTime !== 'number') {
      errors.push('Start time must be a number');
    } else if (session.startTime < 0) {
      errors.push('Start time must be a positive timestamp');
    }
  }

  if (session.endTime !== undefined) {
    if (typeof session.endTime !== 'number') {
      errors.push('End time must be a number');
    } else if (session.endTime < 0) {
      errors.push('End time must be a positive timestamp');
    } else if (session.startTime && session.endTime < session.startTime) {
      errors.push('End time must be after start time');
    }
  }

  // Validate isActive
  if (session.isActive !== undefined && typeof session.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  // Validate completedPercentage
  if (session.completedPercentage !== undefined) {
    if (typeof session.completedPercentage !== 'number') {
      errors.push('Completed percentage must be a number');
    } else if (session.completedPercentage < 0 || session.completedPercentage > 100) {
      errors.push('Completed percentage must be between 0 and 100');
    }
  }

  // Validate breaks array
  if (session.breaks !== undefined) {
    if (!Array.isArray(session.breaks)) {
      errors.push('Breaks must be an array');
    } else {
      session.breaks.forEach((breakItem, index) => {
        const breakValidation = validateBreak(breakItem);
        if (!breakValidation.valid) {
          errors.push(`Break ${index + 1}: ${breakValidation.errors.join(', ')}`);
        }
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

// Break validation
export function validateBreak(breakItem: Partial<Break>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate ID
  if (!breakItem.id) {
    errors.push('Break ID is required');
  } else if (typeof breakItem.id !== 'string') {
    errors.push('Break ID must be a string');
  }

  // Validate start time
  if (breakItem.startTime !== undefined) {
    if (typeof breakItem.startTime !== 'number') {
      errors.push('Start time must be a number');
    } else if (breakItem.startTime < 0) {
      errors.push('Start time must be a positive timestamp');
    }
  }

  // Validate end time
  if (breakItem.endTime !== undefined) {
    if (typeof breakItem.endTime !== 'number') {
      errors.push('End time must be a number');
    } else if (breakItem.endTime < 0) {
      errors.push('End time must be a positive timestamp');
    } else if (breakItem.startTime && breakItem.endTime < breakItem.startTime) {
      errors.push('End time must be after start time');
    }
  }

  // Validate reason
  if (breakItem.reason !== undefined && typeof breakItem.reason !== 'string') {
    errors.push('Reason must be a string');
  }

  return { valid: errors.length === 0, errors };
}

// Challenge validation
export function validateChallenge(challenge: Partial<Challenge>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate ID
  if (!challenge.id) {
    errors.push('Challenge ID is required');
  } else if (typeof challenge.id !== 'string') {
    errors.push('Challenge ID must be a string');
  }

  // Validate type
  if (!challenge.type) {
    errors.push('Challenge type is required');
  } else if (!['puzzle', 'riddle', 'math', 'science', 'game'].includes(challenge.type)) {
    errors.push('Challenge type must be one of: puzzle, riddle, math, science, game');
  }

  // Validate question
  if (!challenge.question) {
    errors.push('Challenge question is required');
  } else if (typeof challenge.question !== 'string') {
    errors.push('Challenge question must be a string');
  } else if (challenge.question.trim().length < 5) {
    errors.push('Challenge question must be at least 5 characters long');
  }

  // Validate difficulty
  if (!challenge.difficulty) {
    errors.push('Challenge difficulty is required');
  } else if (!CHALLENGES.DIFFICULTY_LEVELS.includes(challenge.difficulty as any)) {
    errors.push(`Challenge difficulty must be one of: ${CHALLENGES.DIFFICULTY_LEVELS.join(', ')}`);
  }

  // Validate correct answer
  if (challenge.correctAnswer === undefined || challenge.correctAnswer === null) {
    errors.push('Correct answer is required');
  } else if (typeof challenge.correctAnswer !== 'string' && typeof challenge.correctAnswer !== 'number') {
    errors.push('Correct answer must be a string or number');
  }

  // Validate options (if provided)
  if (challenge.options !== undefined) {
    if (!Array.isArray(challenge.options)) {
      errors.push('Options must be an array');
    } else if (challenge.options.length < 2) {
      errors.push('Options must contain at least 2 choices');
    } else if (challenge.options.some(option => typeof option !== 'string')) {
      errors.push('All options must be strings');
    }
  }

  // Validate time limit
  if (challenge.timeLimit !== undefined) {
    if (typeof challenge.timeLimit !== 'number') {
      errors.push('Time limit must be a number');
    } else if (challenge.timeLimit < 5) {
      errors.push('Time limit must be at least 5 seconds');
    } else if (challenge.timeLimit > 600) {
      errors.push('Time limit must be at most 10 minutes');
    }
  }

  return { valid: errors.length === 0, errors };
}

// URL sanitization and normalization
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove leading/trailing whitespace
  let sanitized = url.trim();

  // Remove protocol if present for normalization
  sanitized = sanitized.replace(/^https?:\/\//, '');

  // Remove www. prefix
  sanitized = sanitized.replace(/^www\./, '');

  // Convert to lowercase
  sanitized = sanitized.toLowerCase();

  // Remove trailing slash
  sanitized = sanitized.replace(/\/$/, '');

  return sanitized;
}

// Data transformation utilities
export function createBlockItemFromUrl(url: string, isPermanent: boolean = false): BlockItem {
  const sanitizedUrl = sanitizeUrl(url);
  const timestamp = Date.now();
  
  return {
    id: `block_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
    url: sanitizedUrl,
    pattern: `*://*.${sanitizedUrl}/*`,
    isPermanent,
    createdAt: timestamp,
  };
}

export function createFocusSession(userId: string, duration: number): FocusSession {
  const timestamp = Date.now();
  
  return {
    id: `session_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    startTime: timestamp,
    endTime: timestamp + duration,
    duration,
    isActive: true,
    breaks: [],
    completedPercentage: 0,
  };
}

export function createBreak(reason?: string): Break {
  const timestamp = Date.now();
  
  return {
    id: `break_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
    startTime: timestamp,
    reason,
  };
}