import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    createdAt: v.number(),
    settings: v.object({
      defaultSessionDuration: v.number(),
      defaultBreakDuration: v.number(),
      challengeDifficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
      notificationsEnabled: v.boolean(),
      temporaryUnlockDuration: v.number(),
      theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    }),
    stats: v.object({
      totalFocusTime: v.number(),
      sessionsCompleted: v.number(),
      currentStreak: v.number(),
      longestStreak: v.number(),
      challengesCompleted: v.number(),
      challengeSuccessRate: v.number(),
    }),
  }),

  blockLists: defineTable({
    userId: v.string(),
    items: v.array(v.object({
      id: v.string(),
      url: v.string(),
      pattern: v.string(),
      isPermanent: v.boolean(),
      category: v.optional(v.string()),
      createdAt: v.number(),
      lastAccessed: v.optional(v.number()),
    })),
    lastUpdated: v.number(),
  }).index("by_user", ["userId"]),

  focusSessions: defineTable({
    userId: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    duration: v.number(),
    isActive: v.boolean(),
    breaks: v.array(v.object({
      id: v.string(),
      startTime: v.number(),
      endTime: v.optional(v.number()),
      reason: v.optional(v.string()),
    })),
    completedPercentage: v.number(),
  }).index("by_user", ["userId"]).index("by_active", ["isActive"]),

  challenges: defineTable({
    userId: v.string(),
    challengeId: v.string(),
    type: v.union(v.literal("puzzle"), v.literal("riddle"), v.literal("math"), v.literal("science"), v.literal("game")),
    question: v.string(),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.union(v.string(), v.number()),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    timeLimit: v.optional(v.number()),
    wasSuccessful: v.optional(v.boolean()),
    attemptedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),
});