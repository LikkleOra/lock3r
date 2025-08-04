// Convex functions for focus session management
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Create a new focus session
export const createFocusSession = mutation({
  args: {
    userId: v.string(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if user already has an active session
    const activeSession = await ctx.db
      .query("focusSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (activeSession) {
      throw new Error("User already has an active focus session");
    }

    const now = Date.now();
    const sessionData = {
      userId: args.userId,
      startTime: now,
      endTime: now + args.duration,
      duration: args.duration,
      isActive: true,
      breaks: [],
      completedPercentage: 0,
    };

    const sessionId = await ctx.db.insert("focusSessions", sessionData);
    return await ctx.db.get(sessionId);
  },
});

// Get active focus session
export const getActiveFocusSession = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("focusSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
  },
});

// Update focus session progress
export const updateSessionProgress = mutation({
  args: {
    sessionId: v.string(),
    completedPercentage: v.number(),
  },
  handler: async (ctx, args) => {
    const sessionId = args.sessionId as Id<"focusSessions">;
    const session = await ctx.db.get(sessionId);
    
    if (!session) {
      throw new Error("Session not found");
    }

    if (!session.isActive) {
      throw new Error("Session is not active");
    }

    await ctx.db.patch(sessionId, {
      completedPercentage: Math.min(100, Math.max(0, args.completedPercentage)),
    });

    return await ctx.db.get(sessionId);
  },
});

// End focus session
export const endFocusSession = mutation({
  args: {
    sessionId: v.string(),
    completedPercentage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sessionId = args.sessionId as Id<"focusSessions">;
    const session = await ctx.db.get(sessionId);
    
    if (!session) {
      throw new Error("Session not found");
    }

    const now = Date.now();
    const finalPercentage = args.completedPercentage ?? 
      Math.min(100, Math.round(((now - session.startTime) / session.duration) * 100));

    await ctx.db.patch(sessionId, {
      endTime: now,
      isActive: false,
      completedPercentage: finalPercentage,
    });

    // Update user stats if session was completed
    if (finalPercentage >= 100) {
      const user = await ctx.db.get(session.userId as Id<"users">);
      if (user) {
        const updatedStats = {
          ...user.stats,
          totalFocusTime: user.stats.totalFocusTime + session.duration,
          sessionsCompleted: user.stats.sessionsCompleted + 1,
        };

        await ctx.db.patch(session.userId as Id<"users">, {
          stats: updatedStats,
        });
      }
    }

    return await ctx.db.get(sessionId);
  },
});

// Pause focus session
export const pauseFocusSession = mutation({
  args: {
    sessionId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionId = args.sessionId as Id<"focusSessions">;
    const session = await ctx.db.get(sessionId);
    
    if (!session) {
      throw new Error("Session not found");
    }

    if (!session.isActive) {
      throw new Error("Session is not active");
    }

    const now = Date.now();
    const breakItem = {
      id: `break_${now}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: now,
      reason: args.reason,
    };

    const updatedBreaks = [...session.breaks, breakItem];

    await ctx.db.patch(sessionId, {
      breaks: updatedBreaks,
    });

    return await ctx.db.get(sessionId);
  },
});

// Resume focus session
export const resumeFocusSession = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const sessionId = args.sessionId as Id<"focusSessions">;
    const session = await ctx.db.get(sessionId);
    
    if (!session) {
      throw new Error("Session not found");
    }

    if (!session.isActive) {
      throw new Error("Session is not active");
    }

    const now = Date.now();
    const lastBreak = session.breaks[session.breaks.length - 1];
    
    if (lastBreak && !lastBreak.endTime) {
      // End the current break
      const updatedBreaks = [...session.breaks];
      updatedBreaks[updatedBreaks.length - 1] = {
        ...lastBreak,
        endTime: now,
      };

      // Extend session duration by break time
      const breakDuration = now - lastBreak.startTime;
      const newEndTime = session.endTime + breakDuration;
      const newDuration = session.duration + breakDuration;

      await ctx.db.patch(sessionId, {
        breaks: updatedBreaks,
        endTime: newEndTime,
        duration: newDuration,
      });
    }

    return await ctx.db.get(sessionId);
  },
});

// Get focus session history
export const getFocusSessionHistory = query({
  args: { 
    userId: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const offset = args.offset || 0;

    const sessions = await ctx.db
      .query("focusSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit + offset);

    // Apply offset manually since Convex doesn't have built-in offset
    return sessions.slice(offset, offset + limit);
  },
});

// Get focus session statistics
export const getFocusSessionStats = query({
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

    const sessions = await ctx.db
      .query("focusSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("startTime"), startTime))
      .collect();

    const completedSessions = sessions.filter(s => !s.isActive && s.completedPercentage >= 100);
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

    // Calculate streak (simplified - just consecutive days with sessions)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streakDays = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < 365; i++) { // Max 365 days to prevent infinite loop
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
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      totalFocusTime,
      averageSessionLength,
      mostProductiveTimeOfDay,
      streakDays,
      completionRate: sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0,
    };
  },
});

// Clean up old inactive sessions (maintenance function)
export const cleanupOldSessions = mutation({
  args: { 
    userId: v.string(),
    olderThanDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysToKeep = args.olderThanDays || 90; // Default 90 days
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    const oldSessions = await ctx.db
      .query("focusSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.and(
        q.eq(q.field("isActive"), false),
        q.lt(q.field("startTime"), cutoffTime)
      ))
      .collect();

    let deletedCount = 0;
    for (const session of oldSessions) {
      await ctx.db.delete(session._id);
      deletedCount++;
    }

    return { deletedCount };
  },
});