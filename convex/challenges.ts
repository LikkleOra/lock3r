// Convex functions for challenge management
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Record a challenge attempt
export const recordChallengeAttempt = mutation({
  args: {
    userId: v.string(),
    challengeId: v.string(),
    type: v.union(v.literal("puzzle"), v.literal("riddle"), v.literal("math"), v.literal("science"), v.literal("game")),
    question: v.string(),
    correctAnswer: v.union(v.string(), v.number()),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    wasSuccessful: v.boolean(),
    timeLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const challengeData = {
      userId: args.userId,
      challengeId: args.challengeId,
      type: args.type,
      question: args.question,
      correctAnswer: args.correctAnswer,
      difficulty: args.difficulty,
      timeLimit: args.timeLimit,
      wasSuccessful: args.wasSuccessful,
      attemptedAt: Date.now(),
    };

    const challengeAttemptId = await ctx.db.insert("challenges", challengeData);

    // Update user stats
    const user = await ctx.db.get(args.userId as Id<"users">);
    if (user) {
      const totalChallenges = user.stats.challengesCompleted + 1;
      const successfulChallenges = args.wasSuccessful 
        ? Math.round(user.stats.challengeSuccessRate * user.stats.challengesCompleted / 100) + 1
        : Math.round(user.stats.challengeSuccessRate * user.stats.challengesCompleted / 100);
      
      const newSuccessRate = totalChallenges > 0 ? (successfulChallenges / totalChallenges) * 100 : 0;

      await ctx.db.patch(args.userId as Id<"users">, {
        stats: {
          ...user.stats,
          challengesCompleted: totalChallenges,
          challengeSuccessRate: newSuccessRate,
        },
      });
    }

    return await ctx.db.get(challengeAttemptId);
  },
});

// Get challenge history for user
export const getChallengeHistory = query({
  args: { 
    userId: v.string(),
    limit: v.optional(v.number()),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    let query = ctx.db
      .query("challenges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc");

    if (args.difficulty) {
      query = query.filter((q) => q.eq(q.field("difficulty"), args.difficulty));
    }

    return await query.take(limit);
  },
});

// Get challenge statistics
export const getChallengeStats = query({
  args: { 
    userId: v.string(),
    timeRange: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let startTime = 0;

    // Calculate time range
    switch (args.timeRange) {
      case "day":
        startTime = now - (24 * 60 * 60 * 1000);
        break;
      case "week":
        startTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = 0; // All time
    }

    const challenges = await ctx.db
      .query("challenges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("attemptedAt"), startTime))
      .collect();

    const totalAttempts = challenges.length;
    const successfulAttempts = challenges.filter(c => c.wasSuccessful).length;
    const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

    // Group by difficulty
    const byDifficulty = {
      easy: challenges.filter(c => c.difficulty === "easy"),
      medium: challenges.filter(c => c.difficulty === "medium"),
      hard: challenges.filter(c => c.difficulty === "hard"),
    };

    // Group by type
    const byType = {
      puzzle: challenges.filter(c => c.type === "puzzle"),
      riddle: challenges.filter(c => c.type === "riddle"),
      math: challenges.filter(c => c.type === "math"),
      science: challenges.filter(c => c.type === "science"),
      game: challenges.filter(c => c.type === "game"),
    };

    return {
      totalAttempts,
      successfulAttempts,
      successRate,
      byDifficulty: {
        easy: {
          total: byDifficulty.easy.length,
          successful: byDifficulty.easy.filter(c => c.wasSuccessful).length,
          successRate: byDifficulty.easy.length > 0 
            ? (byDifficulty.easy.filter(c => c.wasSuccessful).length / byDifficulty.easy.length) * 100 
            : 0,
        },
        medium: {
          total: byDifficulty.medium.length,
          successful: byDifficulty.medium.filter(c => c.wasSuccessful).length,
          successRate: byDifficulty.medium.length > 0 
            ? (byDifficulty.medium.filter(c => c.wasSuccessful).length / byDifficulty.medium.length) * 100 
            : 0,
        },
        hard: {
          total: byDifficulty.hard.length,
          successful: byDifficulty.hard.filter(c => c.wasSuccessful).length,
          successRate: byDifficulty.hard.length > 0 
            ? (byDifficulty.hard.filter(c => c.wasSuccessful).length / byDifficulty.hard.length) * 100 
            : 0,
        },
      },
      byType: {
        puzzle: byType.puzzle.length,
        riddle: byType.riddle.length,
        math: byType.math.length,
        science: byType.science.length,
        game: byType.game.length,
      },
      recentActivity: challenges
        .filter(c => c.attemptedAt > now - (7 * 24 * 60 * 60 * 1000)) // Last 7 days
        .length,
    };
  },
});

// Get challenge performance trends
export const getChallengeTrends = query({
  args: { 
    userId: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const now = Date.now();
    const startTime = now - (days * 24 * 60 * 60 * 1000);

    const challenges = await ctx.db
      .query("challenges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("attemptedAt"), startTime))
      .collect();

    // Group challenges by day
    const dailyStats: Record<string, { total: number; successful: number; date: string }> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000));
      const dateKey = date.toISOString().split('T')[0];
      dailyStats[dateKey] = { total: 0, successful: 0, date: dateKey };
    }

    challenges.forEach(challenge => {
      const date = new Date(challenge.attemptedAt).toISOString().split('T')[0];
      if (dailyStats[date]) {
        dailyStats[date].total++;
        if (challenge.wasSuccessful) {
          dailyStats[date].successful++;
        }
      }
    });

    // Convert to array and sort by date
    const trends = Object.values(dailyStats)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(day => ({
        ...day,
        successRate: day.total > 0 ? (day.successful / day.total) * 100 : 0,
      }));

    return trends;
  },
});

// Clean up old challenge attempts (maintenance function)
export const cleanupOldChallenges = mutation({
  args: { 
    userId: v.string(),
    olderThanDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysToKeep = args.olderThanDays || 90; // Default 90 days
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    const oldChallenges = await ctx.db
      .query("challenges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.lt(q.field("attemptedAt"), cutoffTime))
      .collect();

    let deletedCount = 0;
    for (const challenge of oldChallenges) {
      await ctx.db.delete(challenge._id);
      deletedCount++;
    }

    return { deletedCount };
  },
});

// Get recent failed challenges (for adaptive difficulty)
export const getRecentFailedChallenges = query({
  args: { 
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

    return await ctx.db
      .query("challenges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.and(
        q.eq(q.field("wasSuccessful"), false),
        q.gte(q.field("attemptedAt"), oneDayAgo)
      ))
      .order("desc")
      .take(limit);
  },
});