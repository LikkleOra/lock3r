// Block management system for FocusGuardian
import { 
  BlockItem, 
  BlockList, 
  BlockManager as IBlockManager,
  OperationResult,
  ValidationResult
} from '@/models';
import { 
  validateBlockItem,
  createBlockItemFromUrl,
  addItemToBlockList,
  removeItemFromBlockList,
  togglePermanentBlock,
  updateBlockItemAccess
} from '@/models';
import { storage } from '@/lib/storage';
import { 
  isValidUrl, 
  isValidDomain, 
  normalizeUrl, 
  createUrlPattern,
  generateId,
  getCurrentTimestamp
} from '@/lib/utils';
import { BLOCK_LIST, PERFORMANCE } from '@/lib/constants';
import { analyticsEngine } from '@/lib/analytics/AnalyticsEngine';

export class BlockManager implements IBlockManager {
  private blockList: BlockList | null = null;
  private lastLoadTime: number = 0;
  private urlPatternCache: Map<string, boolean> = new Map();
  private temporaryUnlocks: Map<string, number> = new Map(); // URL -> unlock until timestamp

  constructor() {
    this.loadBlockList();
  }

  // Load block list from storage
  private loadBlockList(): void {
    try {
      this.blockList = storage.getBlockList();
      this.lastLoadTime = getCurrentTimestamp();
      this.clearPatternCache();
    } catch (error) {
      console.error('Failed to load block list:', error);
      this.blockList = null;
    }
  }

  // Ensure block list is loaded and fresh
  private ensureBlockListLoaded(): BlockList {
    if (!this.blockList || (getCurrentTimestamp() - this.lastLoadTime) > 30000) { // Refresh every 30 seconds
      this.loadBlockList();
    }
    
    if (!this.blockList) {
      throw new Error('Failed to load block list');
    }
    
    return this.blockList;
  }

  // Clear URL pattern cache
  private clearPatternCache(): void {
    this.urlPatternCache.clear();
  }

  // Save block list to storage
  private async saveBlockList(blockList: BlockList): Promise<OperationResult<BlockList>> {
    const result = storage.saveBlockList(blockList);
    if (result.success) {
      this.blockList = result.data!;
      this.lastLoadTime = getCurrentTimestamp();
      this.clearPatternCache();
    }
    return result;
  }

  // Validate and normalize URL
  private validateAndNormalizeUrl(url: string): OperationResult<string> {
    if (!url || typeof url !== 'string') {
      return {
        success: false,
        error: 'URL is required and must be a string'
      };
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      return {
        success: false,
        error: 'URL cannot be empty'
      };
    }

    // Check if it's a valid URL or domain
    if (!isValidUrl(trimmedUrl) && !isValidDomain(trimmedUrl)) {
      return {
        success: false,
        error: 'Please enter a valid URL or domain (e.g., example.com or https://example.com)'
      };
    }

    const normalizedUrl = normalizeUrl(trimmedUrl);
    return {
      success: true,
      data: normalizedUrl
    };
  }

  // Check if URL matches any block patterns
  private matchesBlockPattern(url: string, blockItem: BlockItem): boolean {
    const normalizedUrl = normalizeUrl(url);
    const blockUrl = blockItem.url;

    // Exact match
    if (normalizedUrl === blockUrl) {
      return true;
    }

    // Domain and subdomain matching
    if (normalizedUrl.includes(blockUrl) || blockUrl.includes(normalizedUrl)) {
      return true;
    }

    // Pattern matching (if pattern is more specific)
    if (blockItem.pattern && blockItem.pattern !== `*://*.${blockUrl}/*`) {
      // Simple wildcard pattern matching
      const patternRegex = blockItem.pattern
        .replace(/\*/g, '.*')
        .replace(/\./g, '\\.');
      
      try {
        const regex = new RegExp(patternRegex, 'i');
        return regex.test(url) || regex.test(normalizedUrl);
      } catch {
        // If pattern is invalid, fall back to simple matching
        return false;
      }
    }

    return false;
  }

  // Add block item
  async addBlockItem(url: string, isPermanent: boolean = false): Promise<BlockItem> {
    const urlValidation = this.validateAndNormalizeUrl(url);
    if (!urlValidation.success) {
      throw new Error(urlValidation.error);
    }

    const normalizedUrl = urlValidation.data!;
    const blockList = this.ensureBlockListLoaded();

    // Check if URL already exists
    const existingItem = blockList.items.find(item => item.url === normalizedUrl);
    if (existingItem) {
      throw new Error('This URL is already in your block list');
    }

    // Check block list size limit
    if (blockList.items.length >= BLOCK_LIST.MAX_ITEMS) {
      throw new Error(`Block list is full. Maximum ${BLOCK_LIST.MAX_ITEMS} items allowed.`);
    }

    // Create new block item
    const newItem = createBlockItemFromUrl(normalizedUrl, isPermanent);
    
    // Validate the new item
    const validation = validateBlockItem(newItem);
    if (!validation.valid) {
      throw new Error(`Invalid block item: ${validation.errors.join(', ')}`);
    }

    // Add to block list
    const updatedBlockList = addItemToBlockList(blockList, newItem);
    const saveResult = await this.saveBlockList(updatedBlockList);
    
    if (!saveResult.success) {
      throw new Error(saveResult.error || 'Failed to save block item');
    }

    return newItem;
  }

  // Remove block item
  async removeBlockItem(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new Error('Block item ID is required');
    }

    const blockList = this.ensureBlockListLoaded();
    const itemExists = blockList.items.some(item => item.id === id);
    
    if (!itemExists) {
      throw new Error('Block item not found');
    }

    const updatedBlockList = removeItemFromBlockList(blockList, id);
    const saveResult = await this.saveBlockList(updatedBlockList);
    
    if (!saveResult.success) {
      throw new Error(saveResult.error || 'Failed to remove block item');
    }
  }

  // Get block list
  async getBlockList(): Promise<BlockItem[]> {
    const blockList = this.ensureBlockListLoaded();
    return [...blockList.items]; // Return a copy to prevent external modification
  }

  // Toggle permanent block status
  async togglePermanentBlock(id: string): Promise<BlockItem> {
    if (!id || typeof id !== 'string') {
      throw new Error('Block item ID is required');
    }

    const blockList = this.ensureBlockListLoaded();
    const item = blockList.items.find(item => item.id === id);
    
    if (!item) {
      throw new Error('Block item not found');
    }

    const updatedBlockList = togglePermanentBlock(blockList, id);
    const saveResult = await this.saveBlockList(updatedBlockList);
    
    if (!saveResult.success) {
      throw new Error(saveResult.error || 'Failed to update block item');
    }

    const updatedItem = updatedBlockList.items.find(item => item.id === id);
    if (!updatedItem) {
      throw new Error('Failed to find updated block item');
    }

    return updatedItem;
  }

  // Check if URL is blocked
  async isBlocked(url: string): Promise<boolean> {
    if (!url || typeof url !== 'string') {
      return false;
    }

    // Check for temporary unlock first
    if (this.hasTemporaryUnlock(url)) {
      return false;
    }

    // Check cache first for performance
    const cacheKey = normalizeUrl(url);
    if (this.urlPatternCache.has(cacheKey)) {
      return this.urlPatternCache.get(cacheKey)!;
    }

    try {
      const blockList = this.ensureBlockListLoaded();
      
      // Check against all block items
      const isBlocked = blockList.items.some(item => 
        this.matchesBlockPattern(url, item)
      );

      // Cache the result
      this.urlPatternCache.set(cacheKey, isBlocked);
      
      // Track block attempt in analytics
      if (isBlocked) {
        const blockItem = blockList.items.find(item => this.matchesBlockPattern(url, item));
        analyticsEngine.trackBlockAttempt(url, true, blockItem);
      }
      
      // Limit cache size to prevent memory issues
      if (this.urlPatternCache.size > 1000) {
        const firstKey = this.urlPatternCache.keys().next().value;
        this.urlPatternCache.delete(firstKey);
      }

      return isBlocked;
    } catch (error) {
      console.error('Error checking if URL is blocked:', error);
      return false; // Fail open - don't block if there's an error
    }
  }

  // Get blocked item for URL (useful for getting block details)
  async getBlockedItem(url: string): Promise<BlockItem | null> {
    if (!url || typeof url !== 'string') {
      return null;
    }

    try {
      const blockList = this.ensureBlockListLoaded();
      
      const blockedItem = blockList.items.find(item => 
        this.matchesBlockPattern(url, item)
      );

      return blockedItem || null;
    } catch (error) {
      console.error('Error getting blocked item:', error);
      return null;
    }
  }

  // Update block item access time (for analytics)
  async updateItemAccess(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      return;
    }

    try {
      const blockList = this.ensureBlockListLoaded();
      const updatedBlockList = updateBlockItemAccess(blockList, id);
      await this.saveBlockList(updatedBlockList);
    } catch (error) {
      console.error('Error updating item access:', error);
      // Don't throw error for analytics updates
    }
  }

  // Get block statistics
  getBlockStats(): {
    totalBlocks: number;
    permanentBlocks: number;
    temporaryBlocks: number;
    categorizedBlocks: number;
    recentlyAccessed: number;
  } {
    try {
      const blockList = this.ensureBlockListLoaded();
      const now = getCurrentTimestamp();
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
    } catch (error) {
      console.error('Error getting block stats:', error);
      return {
        totalBlocks: 0,
        permanentBlocks: 0,
        temporaryBlocks: 0,
        categorizedBlocks: 0,
        recentlyAccessed: 0,
      };
    }
  }

  // Search block items
  searchBlocks(query: string): BlockItem[] {
    if (!query || typeof query !== 'string') {
      return [];
    }

    try {
      const blockList = this.ensureBlockListLoaded();
      const searchTerm = query.toLowerCase().trim();
      
      return blockList.items.filter(item => 
        item.url.toLowerCase().includes(searchTerm) ||
        (item.category && item.category.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('Error searching blocks:', error);
      return [];
    }
  }

  // Filter blocks by category
  filterByCategory(category: string): BlockItem[] {
    try {
      const blockList = this.ensureBlockListLoaded();
      
      if (!category) {
        return blockList.items.filter(item => !item.category);
      }
      
      return blockList.items.filter(item => item.category === category);
    } catch (error) {
      console.error('Error filtering blocks by category:', error);
      return [];
    }
  }

  // Get all categories
  getCategories(): string[] {
    try {
      const blockList = this.ensureBlockListLoaded();
      const categories = new Set<string>();
      
      blockList.items.forEach(item => {
        if (item.category) {
          categories.add(item.category);
        }
      });
      
      return Array.from(categories).sort();
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  // Update block item category
  async updateItemCategory(id: string, category: string | undefined): Promise<BlockItem> {
    if (!id || typeof id !== 'string') {
      throw new Error('Block item ID is required');
    }

    const blockList = this.ensureBlockListLoaded();
    const itemIndex = blockList.items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      throw new Error('Block item not found');
    }

    const updatedItems = [...blockList.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      category: category?.trim() || undefined,
    };

    const updatedBlockList = {
      ...blockList,
      items: updatedItems,
      lastUpdated: getCurrentTimestamp(),
    };

    const saveResult = await this.saveBlockList(updatedBlockList);
    
    if (!saveResult.success) {
      throw new Error(saveResult.error || 'Failed to update block item category');
    }

    return updatedItems[itemIndex];
  }

  // Clear all blocks (with confirmation)
  async clearAllBlocks(): Promise<void> {
    const blockList = this.ensureBlockListLoaded();
    
    const clearedBlockList = {
      ...blockList,
      items: [],
      lastUpdated: getCurrentTimestamp(),
    };

    const saveResult = await this.saveBlockList(clearedBlockList);
    
    if (!saveResult.success) {
      throw new Error(saveResult.error || 'Failed to clear block list');
    }
  }

  // Import blocks from array
  async importBlocks(items: BlockItem[]): Promise<OperationResult<number>> {
    if (!Array.isArray(items)) {
      return {
        success: false,
        error: 'Items must be an array'
      };
    }

    const blockList = this.ensureBlockListLoaded();
    let importedCount = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        // Validate item
        const validation = validateBlockItem(item);
        if (!validation.valid) {
          errors.push(`Invalid item ${item.url}: ${validation.errors.join(', ')}`);
          continue;
        }

        // Check if already exists
        const exists = blockList.items.some(existing => existing.url === item.url);
        if (exists) {
          errors.push(`Item ${item.url} already exists`);
          continue;
        }

        // Check size limit
        if (blockList.items.length + importedCount >= BLOCK_LIST.MAX_ITEMS) {
          errors.push(`Block list size limit reached (${BLOCK_LIST.MAX_ITEMS} items)`);
          break;
        }

        blockList.items.push({
          ...item,
          id: item.id || generateId(),
          createdAt: item.createdAt || getCurrentTimestamp(),
        });
        
        importedCount++;
      } catch (error) {
        errors.push(`Error importing ${item.url}: ${error}`);
      }
    }

    if (importedCount > 0) {
      const updatedBlockList = {
        ...blockList,
        lastUpdated: getCurrentTimestamp(),
      };

      const saveResult = await this.saveBlockList(updatedBlockList);
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error || 'Failed to save imported blocks'
        };
      }
    }

    return {
      success: true,
      data: importedCount,
      error: errors.length > 0 ? errors.join('; ') : undefined
    };
  }

  // Add temporary unlock for a URL
  async addTemporaryUnlock(url: string, unlockUntil: number): Promise<void> {
    const normalizedUrl = normalizeUrl(url);
    this.temporaryUnlocks.set(normalizedUrl, unlockUntil);
    
    // Clean up expired unlocks
    this.cleanupExpiredUnlocks();
    
    // Clear cache for this URL since it's now unlocked
    this.urlPatternCache.delete(normalizedUrl);
  }

  // Set temporary unlock (alias for addTemporaryUnlock for compatibility)
  async setTemporaryUnlock(url: string, unlockUntil: number): Promise<void> {
    return this.addTemporaryUnlock(url, unlockUntil);
  }

  // Check if URL has temporary unlock
  private hasTemporaryUnlock(url: string): boolean {
    const normalizedUrl = normalizeUrl(url);
    const unlockUntil = this.temporaryUnlocks.get(normalizedUrl);
    
    if (!unlockUntil) {
      return false;
    }
    
    // Check if unlock has expired
    if (Date.now() > unlockUntil) {
      this.temporaryUnlocks.delete(normalizedUrl);
      return false;
    }
    
    return true;
  }

  // Clean up expired temporary unlocks
  private cleanupExpiredUnlocks(): void {
    const now = Date.now();
    for (const [url, unlockUntil] of this.temporaryUnlocks.entries()) {
      if (now > unlockUntil) {
        this.temporaryUnlocks.delete(url);
        // Clear cache for expired unlock
        this.urlPatternCache.delete(url);
      }
    }
  }

  // Get temporary unlock info for a URL
  getTemporaryUnlockInfo(url: string): { isUnlocked: boolean; unlockUntil?: number } {
    const normalizedUrl = normalizeUrl(url);
    const unlockUntil = this.temporaryUnlocks.get(normalizedUrl);
    
    if (!unlockUntil || Date.now() > unlockUntil) {
      return { isUnlocked: false };
    }
    
    return { isUnlocked: true, unlockUntil };
  }

  // Remove temporary unlock
  removeTemporaryUnlock(url: string): void {
    const normalizedUrl = normalizeUrl(url);
    this.temporaryUnlocks.delete(normalizedUrl);
    this.urlPatternCache.delete(normalizedUrl);
  }

  // Get all active temporary unlocks
  getActiveTemporaryUnlocks(): Array<{ url: string; unlockUntil: number }> {
    this.cleanupExpiredUnlocks();
    return Array.from(this.temporaryUnlocks.entries()).map(([url, unlockUntil]) => ({
      url,
      unlockUntil
    }));
  }
}

// Create singleton instance
export const blockManager = new BlockManager();