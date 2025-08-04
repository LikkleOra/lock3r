// Unit tests for BlockManager
import { BlockManager } from '../BlockManager';
import { storage } from '../../storage';
import { BlockItem, BlockList } from '@/models';

// Mock the storage module
jest.mock('../../storage', () => ({
  storage: {
    getBlockList: jest.fn(),
    saveBlockList: jest.fn(),
  },
}));

// Mock the utils module
jest.mock('../../utils', () => ({
  normalizeUrl: jest.fn((url: string) => url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '')),
  createUrlPattern: jest.fn((url: string) => `*://*.${url}/*`),
  generateId: jest.fn(() => 'test-id-123'),
  getCurrentTimestamp: jest.fn(() => 1234567890),
  isValidUrl: jest.fn((url: string) => url.includes('.')),
  isValidDomain: jest.fn((url: string) => url.includes('.') && !url.includes('/')),
}));

const mockStorage = storage as jest.Mocked<typeof storage>;

describe('BlockManager', () => {
  let blockManager: BlockManager;
  let mockBlockList: BlockList;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock block list
    mockBlockList = {
      userId: 'test-user',
      items: [],
      lastUpdated: 1234567890,
    };

    mockStorage.getBlockList.mockReturnValue(mockBlockList);
    mockStorage.saveBlockList.mockReturnValue({
      success: true,
      data: mockBlockList,
    });

    blockManager = new BlockManager();
  });

  describe('addBlockItem', () => {
    it('should add a valid URL to the block list', async () => {
      const url = 'example.com';
      const result = await blockManager.addBlockItem(url);

      expect(result).toMatchObject({
        id: 'test-id-123',
        url: 'example.com',
        isPermanent: false,
      });

      expect(mockStorage.saveBlockList).toHaveBeenCalled();
    });

    it('should add a permanent block item', async () => {
      const url = 'example.com';
      const result = await blockManager.addBlockItem(url, true);

      expect(result.isPermanent).toBe(true);
    });

    it('should throw error for invalid URL', async () => {
      await expect(blockManager.addBlockItem('')).rejects.toThrow('URL cannot be empty');
      await expect(blockManager.addBlockItem('invalid')).rejects.toThrow('Please enter a valid URL or domain');
    });

    it('should throw error for duplicate URL', async () => {
      mockBlockList.items = [{
        id: 'existing-id',
        url: 'example.com',
        pattern: '*://*.example.com/*',
        isPermanent: false,
        createdAt: 1234567890,
      }];

      await expect(blockManager.addBlockItem('example.com')).rejects.toThrow('This URL is already in your block list');
    });

    it('should throw error when block list is full', async () => {
      // Mock a full block list
      mockBlockList.items = new Array(1000).fill(0).map((_, i) => ({
        id: `item-${i}`,
        url: `example${i}.com`,
        pattern: `*://*.example${i}.com/*`,
        isPermanent: false,
        createdAt: 1234567890,
      }));

      await expect(blockManager.addBlockItem('newsite.com')).rejects.toThrow('Block list is full');
    });
  });

  describe('removeBlockItem', () => {
    beforeEach(() => {
      mockBlockList.items = [{
        id: 'test-item',
        url: 'example.com',
        pattern: '*://*.example.com/*',
        isPermanent: false,
        createdAt: 1234567890,
      }];
    });

    it('should remove an existing block item', async () => {
      await blockManager.removeBlockItem('test-item');
      expect(mockStorage.saveBlockList).toHaveBeenCalled();
    });

    it('should throw error for non-existent item', async () => {
      await expect(blockManager.removeBlockItem('non-existent')).rejects.toThrow('Block item not found');
    });

    it('should throw error for invalid ID', async () => {
      await expect(blockManager.removeBlockItem('')).rejects.toThrow('Block item ID is required');
    });
  });

  describe('isBlocked', () => {
    beforeEach(() => {
      mockBlockList.items = [
        {
          id: 'item-1',
          url: 'facebook.com',
          pattern: '*://*.facebook.com/*',
          isPermanent: true,
          createdAt: 1234567890,
        },
        {
          id: 'item-2',
          url: 'twitter.com',
          pattern: '*://*.twitter.com/*',
          isPermanent: false,
          createdAt: 1234567890,
        },
      ];
    });

    it('should return true for blocked URLs', async () => {
      expect(await blockManager.isBlocked('facebook.com')).toBe(true);
      expect(await blockManager.isBlocked('https://www.facebook.com')).toBe(true);
      expect(await blockManager.isBlocked('twitter.com')).toBe(true);
    });

    it('should return false for non-blocked URLs', async () => {
      expect(await blockManager.isBlocked('google.com')).toBe(false);
      expect(await blockManager.isBlocked('github.com')).toBe(false);
    });

    it('should return false for invalid URLs', async () => {
      expect(await blockManager.isBlocked('')).toBe(false);
      expect(await blockManager.isBlocked(null as any)).toBe(false);
    });

    it('should cache results for performance', async () => {
      // First call
      await blockManager.isBlocked('facebook.com');
      // Second call should use cache
      await blockManager.isBlocked('facebook.com');
      
      // Storage should only be accessed once due to caching
      expect(mockStorage.getBlockList).toHaveBeenCalledTimes(1);
    });
  });

  describe('togglePermanentBlock', () => {
    beforeEach(() => {
      mockBlockList.items = [{
        id: 'test-item',
        url: 'example.com',
        pattern: '*://*.example.com/*',
        isPermanent: false,
        createdAt: 1234567890,
      }];
    });

    it('should toggle permanent status', async () => {
      const result = await blockManager.togglePermanentBlock('test-item');
      expect(result.isPermanent).toBe(true);
      expect(mockStorage.saveBlockList).toHaveBeenCalled();
    });

    it('should throw error for non-existent item', async () => {
      await expect(blockManager.togglePermanentBlock('non-existent')).rejects.toThrow('Block item not found');
    });
  });

  describe('getBlockList', () => {
    it('should return a copy of the block list', async () => {
      mockBlockList.items = [{
        id: 'test-item',
        url: 'example.com',
        pattern: '*://*.example.com/*',
        isPermanent: false,
        createdAt: 1234567890,
      }];

      const result = await blockManager.getBlockList();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject(mockBlockList.items[0]);
      
      // Ensure it's a copy, not the original
      expect(result).not.toBe(mockBlockList.items);
    });
  });

  describe('getBlockStats', () => {
    beforeEach(() => {
      mockBlockList.items = [
        {
          id: 'item-1',
          url: 'facebook.com',
          pattern: '*://*.facebook.com/*',
          isPermanent: true,
          category: 'social',
          createdAt: 1234567890,
          lastAccessed: 1234567890,
        },
        {
          id: 'item-2',
          url: 'twitter.com',
          pattern: '*://*.twitter.com/*',
          isPermanent: false,
          createdAt: 1234567890,
        },
        {
          id: 'item-3',
          url: 'instagram.com',
          pattern: '*://*.instagram.com/*',
          isPermanent: true,
          category: 'social',
          createdAt: 1234567890,
        },
      ];
    });

    it('should return correct statistics', () => {
      const stats = blockManager.getBlockStats();
      
      expect(stats).toEqual({
        totalBlocks: 3,
        permanentBlocks: 2,
        temporaryBlocks: 1,
        categorizedBlocks: 2,
        recentlyAccessed: 1,
      });
    });
  });

  describe('searchBlocks', () => {
    beforeEach(() => {
      mockBlockList.items = [
        {
          id: 'item-1',
          url: 'facebook.com',
          pattern: '*://*.facebook.com/*',
          isPermanent: true,
          category: 'social',
          createdAt: 1234567890,
        },
        {
          id: 'item-2',
          url: 'twitter.com',
          pattern: '*://*.twitter.com/*',
          isPermanent: false,
          createdAt: 1234567890,
        },
      ];
    });

    it('should search by URL', () => {
      const results = blockManager.searchBlocks('facebook');
      expect(results).toHaveLength(1);
      expect(results[0].url).toBe('facebook.com');
    });

    it('should search by category', () => {
      const results = blockManager.searchBlocks('social');
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe('social');
    });

    it('should return empty array for no matches', () => {
      const results = blockManager.searchBlocks('nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should handle storage errors gracefully', async () => {
      mockStorage.saveBlockList.mockReturnValue({
        success: false,
        error: 'Storage error',
      });

      await expect(blockManager.addBlockItem('example.com')).rejects.toThrow('Storage error');
    });

    it('should handle missing block list gracefully', () => {
      mockStorage.getBlockList.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => blockManager.getBlockStats()).not.toThrow();
      const stats = blockManager.getBlockStats();
      expect(stats.totalBlocks).toBe(0);
    });
  });
});