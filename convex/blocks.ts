// Convex functions for block list management
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Get user's block list
export const getBlockList = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const blockList = await ctx.db
      .query("blockLists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!blockList) {
      // Return empty block list structure
      return {
        userId: args.userId,
        items: [],
        lastUpdated: Date.now(),
      };
    }

    return blockList;
  },
});

// Create or update block list
export const saveBlockList = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const existingBlockList = await ctx.db
      .query("blockLists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const blockListData = {
      userId: args.userId,
      items: args.items,
      lastUpdated: Date.now(),
    };

    if (existingBlockList) {
      // Update existing block list
      await ctx.db.patch(existingBlockList._id, blockListData);
      return await ctx.db.get(existingBlockList._id);
    } else {
      // Create new block list
      const newBlockListId = await ctx.db.insert("blockLists", blockListData);
      return await ctx.db.get(newBlockListId);
    }
  },
});

// Add single block item
export const addBlockItem = mutation({
  args: {
    userId: v.string(),
    url: v.string(),
    isPermanent: v.optional(v.boolean()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const blockList = await ctx.db
      .query("blockLists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Create URL pattern
    const normalizedUrl = args.url.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();
    const pattern = `*://*.${normalizedUrl}/*`;

    const newItem = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: normalizedUrl,
      pattern,
      isPermanent: args.isPermanent || false,
      category: args.category,
      createdAt: Date.now(),
    };

    if (blockList) {
      // Check if URL already exists
      const existingItem = blockList.items.find(item => item.url === normalizedUrl);
      if (existingItem) {
        throw new Error("URL already in block list");
      }

      // Add to existing block list
      const updatedItems = [...blockList.items, newItem];
      await ctx.db.patch(blockList._id, {
        items: updatedItems,
        lastUpdated: Date.now(),
      });
    } else {
      // Create new block list with this item
      await ctx.db.insert("blockLists", {
        userId: args.userId,
        items: [newItem],
        lastUpdated: Date.now(),
      });
    }

    return newItem;
  },
});

// Remove block item
export const removeBlockItem = mutation({
  args: {
    userId: v.string(),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    const blockList = await ctx.db
      .query("blockLists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!blockList) {
      throw new Error("Block list not found");
    }

    const updatedItems = blockList.items.filter(item => item.id !== args.itemId);
    
    await ctx.db.patch(blockList._id, {
      items: updatedItems,
      lastUpdated: Date.now(),
    });

    return { success: true, removedItemId: args.itemId };
  },
});

// Toggle permanent block status
export const togglePermanentBlock = mutation({
  args: {
    userId: v.string(),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    const blockList = await ctx.db
      .query("blockLists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!blockList) {
      throw new Error("Block list not found");
    }

    const updatedItems = blockList.items.map(item => 
      item.id === args.itemId 
        ? { ...item, isPermanent: !item.isPermanent }
        : item
    );

    await ctx.db.patch(blockList._id, {
      items: updatedItems,
      lastUpdated: Date.now(),
    });

    const updatedItem = updatedItems.find(item => item.id === args.itemId);
    return updatedItem;
  },
});

// Update block item access time
export const updateBlockItemAccess = mutation({
  args: {
    userId: v.string(),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    const blockList = await ctx.db
      .query("blockLists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!blockList) {
      return null;
    }

    const updatedItems = blockList.items.map(item => 
      item.id === args.itemId 
        ? { ...item, lastAccessed: Date.now() }
        : item
    );

    await ctx.db.patch(blockList._id, {
      items: updatedItems,
      lastUpdated: Date.now(),
    });

    return { success: true };
  },
});

// Check if URL is blocked
export const isUrlBlocked = query({
  args: { 
    userId: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const blockList = await ctx.db
      .query("blockLists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!blockList) {
      return { isBlocked: false, item: null };
    }

    // Normalize the URL for comparison
    const normalizedUrl = args.url.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();
    
    // Check if any block item matches
    const matchingItem = blockList.items.find(item => {
      // Simple domain matching - check if the URL contains the blocked domain
      return normalizedUrl.includes(item.url) || item.url.includes(normalizedUrl);
    });

    return {
      isBlocked: !!matchingItem,
      item: matchingItem || null,
    };
  },
});

// Get block statistics
export const getBlockStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const blockList = await ctx.db
      .query("blockLists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!blockList) {
      return {
        totalBlocks: 0,
        permanentBlocks: 0,
        temporaryBlocks: 0,
        categorizedBlocks: 0,
        recentlyAccessed: 0,
      };
    }

    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    return {
      totalBlocks: blockList.items.length,
      permanentBlocks: blockList.items.filter(item => item.isPermanent).length,
      temporaryBlocks: blockList.items.filter(item => !item.isPermanent).length,
      categorizedBlocks: blockList.items.filter(item => item.category).length,
      recentlyAccessed: blockList.items.filter(item => 
        item.lastAccessed && item.lastAccessed > oneDayAgo
      ).length,
    };
  },
});