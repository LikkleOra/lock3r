// Convex functions for user management
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Get or create user
export const getOrCreateUser = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId as Id<"users">))
      .first();

    if (existingUser) {
      return existingUser;
    }

    // Create new user with default settings
    const newUser = await ctx.db.insert("users", {
      createdAt: Date.now(),
      settings: {
        defaultSessionDuration: 25 * 60 * 1000, // 25 minutes
        defaultBreakDuration: 5 * 60 * 1000, // 5 minutes
        challengeDifficulty: "medium",
        notificationsEnabled: true,
        temporaryUnlockDuration: 10 * 60 * 1000, // 10 minutes
        theme: "system",
      },
      stats: {
        totalFocusTime: 0,
        sessionsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        challengesCompleted: 0,
        challengeSuccessRate: 0,
      },
    });

    return await ctx.db.get(newUser);
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId as Id<"users">);
  },
});

// Update user settings
export const updateUserSettings = mutation({
  args: {
    userId: v.string(),
    settings: v.object({
      defaultSessionDuration: v.optional(v.number()),
      defaultBreakDuration: v.optional(v.number()),
      challengeDifficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
      notificationsEnabled: v.optional(v.boolean()),
      temporaryUnlockDuration: v.optional(v.number()),
      theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId as Id<"users">);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedSettings = {
      ...user.settings,
      ...args.settings,
    };

    await ctx.db.patch(args.userId as Id<"users">, {
      settings: updatedSettings,
    });

    return await ctx.db.get(args.userId as Id<"users">);
  },
});

// Update user stats
export const updateUserStats = mutation({
  args: {
    userId: v.string(),
    stats: v.object({
      totalFocusTime: v.optional(v.number()),
      sessionsCompleted: v.optional(v.number()),
      currentStreak: v.optional(v.number()),
      longestStreak: v.optional(v.number()),
      challengesCompleted: v.optional(v.number()),
      challengeSuccessRate: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId as Id<"users">);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedStats = {
      ...user.stats,
      ...args.stats,
    };

    await ctx.db.patch(args.userId as Id<"users">, {
      stats: updatedStats,
    });

    return await ctx.db.get(args.userId as Id<"users">);
  },
});

// Increment user stats (for common operations)
export const incrementUserStats = mutation({
  args: {
    userId: v.string(),
    focusTime: v.optional(v.number()),
    sessionsCompleted: v.optional(v.number()),
    challengesCompleted: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId as Id<"users">);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedStats = {
      ...user.stats,
      totalFocusTime: user.stats.totalFocusTime + (args.focusTime || 0),
      sessionsCompleted: user.stats.sessionsCompleted + (args.sessionsCompleted || 0),
      challengesCompleted: user.stats.challengesCompleted + (args.challengesCompleted || 0),
    };

    // Recalculate challenge success rate if needed
    if (args.challengesCompleted && user.stats.challengesCompleted > 0) {
      // This would need additional logic to track successful vs total attempts
      // For now, we'll keep the existing rate
    }

    await ctx.db.patch(args.userId as Id<"users">, {
      stats: updatedStats,
    });

    return await ctx.db.get(args.userId as Id<"users">);
  },
});

// Delete user (for GDPR compliance)
export const deleteUser = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userId = args.userId as Id<"users">;
    
    // Delete user's block lists
    const blockLists = await ctx.db
      .query("blockLists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const blockList of blockLists) {
      await ctx.db.delete(blockList._id);
    }

    // Delete user's focus sessions
    const sessions = await ctx.db
      .query("focusSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    // Delete user's challenges
    const challenges = await ctx.db
      .query("challenges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const challenge of challenges) {
      await ctx.db.delete(challenge._id);
    }

    // Finally delete the user
    await ctx.db.delete(userId);
    
    return { success: true };
  },
});