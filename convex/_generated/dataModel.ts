// Mock Convex data model - replace with actual generated file when Convex is set up

export type Id<T extends string> = string & { __tableName: T };

export interface DataModel {
  users: {
    _id: Id<"users">;
    createdAt: number;
    settings: {
      defaultSessionDuration: number;
      defaultBreakDuration: number;
      challengeDifficulty: "easy" | "medium" | "hard";
      notificationsEnabled: boolean;
      temporaryUnlockDuration: number;
      theme: "light" | "dark" | "system";
    };
    stats: {
      totalFocusTime: number;
      sessionsCompleted: number;
      currentStreak: number;
      longestStreak: number;
      challengesCompleted: number;
      challengeSuccessRate: number;
    };
  };
  blockLists: {
    _id: Id<"blockLists">;
    userId: string;
    items: Array<{
      id: string;
      url: string;
      pattern: string;
      isPermanent: boolean;
      category?: string;
      createdAt: number;
      lastAccessed?: number;
    }>;
    lastUpdated: number;
  };
  focusSessions: {
    _id: Id<"focusSessions">;
    userId: string;
    startTime: number;
    endTime: number;
    duration: number;
    isActive: boolean;
    breaks: Array<{
      id: string;
      startTime: number;
      endTime?: number;
      reason?: string;
    }>;
    completedPercentage: number;
  };
  challenges: {
    _id: Id<"challenges">;
    userId: string;
    challengeId: string;
    type: "puzzle" | "riddle" | "math" | "science" | "game";
    question: string;
    options?: string[];
    correctAnswer: string | number;
    difficulty: "easy" | "medium" | "hard";
    timeLimit?: number;
    wasSuccessful?: boolean;
    attemptedAt?: number;
  };
}

export type Doc<T extends keyof DataModel> = DataModel[T];