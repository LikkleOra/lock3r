// Challenge management system for FocusGuardian
import {
  Challenge,
  ChallengeSystem as IChallengeSystem,
  OperationResult
} from '@/models';
import { storage } from '@/lib/storage';
import { generateId, getCurrentTimestamp, getRandomItem, shuffleArray } from '@/lib/utils';
import { CHALLENGES } from '@/lib/constants';
import { analyticsEngine } from '@/lib/analytics/AnalyticsEngine';

export class ChallengeManager implements IChallengeSystem {
  private localChallenges: Challenge[] = [];
  private lastChallengeTime: number = 0;
  private failedAttempts: Map<string, number> = new Map();

  constructor() {
    this.initializeLocalChallenges();
  }

  // Initialize local challenge bank
  private initializeLocalChallenges(): void {
    this.localChallenges = [
      // Math challenges
      {
        id: 'math_1',
        type: 'math',
        question: 'What is 17 × 23?',
        correctAnswer: 391,
        difficulty: 'medium',
        timeLimit: 60
      },
      {
        id: 'math_2',
        type: 'math',
        question: 'If a train travels 120 km in 1.5 hours, what is its speed in km/h?',
        correctAnswer: 80,
        difficulty: 'medium',
        timeLimit: 90
      },
      {
        id: 'math_3',
        type: 'math',
        question: 'What is the square root of 144?',
        correctAnswer: 12,
        difficulty: 'easy',
        timeLimit: 30
      },
      {
        id: 'math_4',
        type: 'math',
        question: 'What is 2^8 (2 to the power of 8)?',
        correctAnswer: 256,
        difficulty: 'medium',
        timeLimit: 45
      },

      // Science challenges
      {
        id: 'science_1',
        type: 'science',
        question: 'What is the chemical symbol for gold?',
        correctAnswer: 'Au',
        difficulty: 'medium',
        timeLimit: 30
      },
      {
        id: 'science_2',
        type: 'science',
        question: 'How many bones are in an adult human body?',
        correctAnswer: 206,
        difficulty: 'hard',
        timeLimit: 60
      },
      {
        id: 'science_3',
        type: 'science',
        question: 'What gas makes up approximately 78% of Earth\'s atmosphere?',
        correctAnswer: 'nitrogen',
        difficulty: 'medium',
        timeLimit: 45
      },

      // Puzzle challenges
      {
        id: 'puzzle_1',
        type: 'puzzle',
        question: 'I am not alive, but I grow; I don\'t have lungs, but I need air; I don\'t have a mouth, but water kills me. What am I?',
        correctAnswer: 'fire',
        difficulty: 'hard',
        timeLimit: 120
      },
      {
        id: 'puzzle_2',
        type: 'puzzle',
        question: 'What comes next in this sequence: 2, 6, 12, 20, 30, ?',
        correctAnswer: 42,
        difficulty: 'hard',
        timeLimit: 90
      },
      {
        id: 'puzzle_3',
        type: 'puzzle',
        question: 'A man lives on the 20th floor of an apartment building. Every morning he takes the elevator down to the ground floor. When he comes home, he takes the elevator to the 10th floor and walks the rest of the way... except on rainy days, when he takes the elevator all the way to the 20th floor. Why?',
        correctAnswer: 'he is too short to reach the button for the 20th floor',
        difficulty: 'hard',
        timeLimit: 180
      },

      // Riddle challenges
      {
        id: 'riddle_1',
        type: 'riddle',
        question: 'The more you take, the more you leave behind. What am I?',
        correctAnswer: 'footsteps',
        difficulty: 'medium',
        timeLimit: 60
      },
      {
        id: 'riddle_2',
        type: 'riddle',
        question: 'What has keys but no locks, space but no room, and you can enter but not go inside?',
        correctAnswer: 'keyboard',
        difficulty: 'medium',
        timeLimit: 90
      },

      // Multiple choice challenges
      {
        id: 'mc_1',
        type: 'puzzle',
        question: 'Which planet is known as the "Red Planet"?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 'Mars',
        difficulty: 'easy',
        timeLimit: 30
      },
      {
        id: 'mc_2',
        type: 'science',
        question: 'What is the powerhouse of the cell?',
        options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Endoplasmic Reticulum'],
        correctAnswer: 'Mitochondria',
        difficulty: 'medium',
        timeLimit: 45
      }
    ];
  }

  // Generate a challenge based on difficulty
  async generateChallenge(difficulty?: string): Promise<Challenge> {
    const targetDifficulty = difficulty || CHALLENGES.DEFAULT_DIFFICULTY;
    
    // Check cooldown period
    const now = getCurrentTimestamp();
    if (now - this.lastChallengeTime < CHALLENGES.COOLDOWN_PERIOD) {
      throw new Error('Please wait before requesting another challenge');
    }

    // Filter challenges by difficulty
    const availableChallenges = this.localChallenges.filter(
      challenge => challenge.difficulty === targetDifficulty
    );

    if (availableChallenges.length === 0) {
      // Fallback to any difficulty if none available
      const challenge = getRandomItem(this.localChallenges);
      return { ...challenge, id: generateId() };
    }

    // Select random challenge
    const selectedChallenge = getRandomItem(availableChallenges);
    
    // Create new instance with unique ID
    const challenge: Challenge = {
      ...selectedChallenge,
      id: generateId()
    };

    this.lastChallengeTime = now;
    return challenge;
  }

  // Validate user's answer
  async validateAnswer(challengeId: string, answer: string | number): Promise<boolean> {
    // Find the original challenge (this would typically be stored temporarily)
    // For now, we'll validate against the local bank
    const normalizedAnswer = typeof answer === 'string' 
      ? answer.toLowerCase().trim() 
      : answer;

    // This is a simplified validation - in a real implementation,
    // you'd store the active challenge and validate against it
    const challenge = this.localChallenges.find(c => 
      c.correctAnswer.toString().toLowerCase() === normalizedAnswer.toString().toLowerCase()
    );

    const isCorrect = !!challenge;
    
    // Track attempt
    await this.trackAttempt(challengeId, isCorrect);
    
    return isCorrect;
  }

  // Get local challenge (fallback when API unavailable)
  getLocalChallenge(): Challenge {
    const challenge = getRandomItem(this.localChallenges);
    return { ...challenge, id: generateId() };
  }

  // Track challenge attempt
  async trackAttempt(challengeId: string, wasSuccessful: boolean): Promise<void> {
    try {
      const challenge = this.findChallengeById(challengeId);
      const attempt = {
        userId: this.getUserId(),
        challengeId,
        challenge: challenge || { id: challengeId, question: 'Unknown', correctAnswer: '', difficulty: 'medium' as const, type: 'math' as const },
        wasSuccessful,
        attemptedAt: getCurrentTimestamp()
      };

      // Track in analytics
      analyticsEngine.trackChallengeAttempt(attempt);

      // Store in local storage for analytics
      const attempts = storage.getItem('challenge_attempts', []);
      attempts.push(attempt);
      
      // Keep only last 100 attempts
      const recentAttempts = attempts.slice(-100);
      storage.setItem('challenge_attempts', recentAttempts);

      // Update failure tracking
      if (!wasSuccessful) {
        const currentFailures = this.failedAttempts.get(challengeId) || 0;
        this.failedAttempts.set(challengeId, currentFailures + 1);
      } else {
        this.failedAttempts.delete(challengeId);
      }

    } catch (error) {
      console.error('Failed to track challenge attempt:', error);
    }
  }

  // Get challenge statistics
  getChallengeStats(): {
    totalAttempts: number;
    successfulAttempts: number;
    successRate: number;
    averageDifficulty: string;
  } {
    try {
      const attempts = storage.getItem('challenge_attempts', []);
      const totalAttempts = attempts.length;
      const successfulAttempts = attempts.filter((a: any) => a.wasSuccessful).length;
      const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

      return {
        totalAttempts,
        successfulAttempts,
        successRate,
        averageDifficulty: 'medium' // Simplified for now
      };
    } catch (error) {
      console.error('Failed to get challenge stats:', error);
      return {
        totalAttempts: 0,
        successfulAttempts: 0,
        successRate: 0,
        averageDifficulty: 'medium'
      };
    }
  }

  // Check if user has exceeded attempt limits
  canAttemptChallenge(): boolean {
    const now = getCurrentTimestamp();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    try {
      const attempts = storage.getItem('challenge_attempts', []);
      const recentAttempts = attempts.filter((a: any) => a.timestamp > oneHourAgo);
      
      return recentAttempts.length < CHALLENGES.MAX_ATTEMPTS_PER_HOUR;
    } catch (error) {
      console.error('Failed to check attempt limits:', error);
      return true; // Allow attempt if we can't check
    }
  }

  // Generate a challenge with adaptive difficulty
  async generateAdaptiveChallenge(): Promise<Challenge> {
    const stats = this.getChallengeStats();
    
    let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
    
    // Adjust difficulty based on success rate
    if (stats.successRate > 80) {
      difficulty = 'hard';
    } else if (stats.successRate < 40) {
      difficulty = 'easy';
    }

    return this.generateChallenge(difficulty);
  }

  // Clear old challenge data (maintenance)
  clearOldData(): void {
    try {
      const attempts = storage.getItem('challenge_attempts', []);
      const thirtyDaysAgo = getCurrentTimestamp() - (30 * 24 * 60 * 60 * 1000);
      
      const recentAttempts = attempts.filter((a: any) => a.timestamp > thirtyDaysAgo);
      storage.setItem('challenge_attempts', recentAttempts);
      
      // Clear failed attempts map
      this.failedAttempts.clear();
    } catch (error) {
      console.error('Failed to clear old challenge data:', error);
    }
  }
}

// Create singleton instance
export const challengeManager = new ChallengeManager();