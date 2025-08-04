// Blocking service that integrates focus sessions with block management
import { blockManager } from '@/lib/managers/BlockManager';
import { focusSessionManager } from '@/lib/managers/FocusSessionManager';
import { BlockItem } from '@/models';

export class BlockingService {
  private static instance: BlockingService;
  private blockedAttempts: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): BlockingService {
    if (!BlockingService.instance) {
      BlockingService.instance = new BlockingService();
    }
    return BlockingService.instance;
  }

  // Check if a URL should be blocked
  async isBlocked(url: string): Promise<{
    isBlocked: boolean;
    blockItem: BlockItem | null;
    reason: 'permanent' | 'session' | 'none';
    canUnlock: boolean;
  }> {
    try {
      const blockItem = await blockManager.getBlockedItem(url);
      
      if (!blockItem) {
        return {
          isBlocked: false,
          blockItem: null,
          reason: 'none',
          canUnlock: false,
        };
      }

      // Check permanent blocks
      if (blockItem.isPermanent) {
        return {
          isBlocked: true,
          blockItem,
          reason: 'permanent',
          canUnlock: true, // Can unlock with challenge
        };
      }

      // Check session-based blocks
      const activeSession = await focusSessionManager.getActiveSession();
      if (activeSession && activeSession.isActive) {
        // Check if currently on a break
        const lastBreak = activeSession.breaks[activeSession.breaks.length - 1];
        const isOnBreak = lastBreak && !lastBreak.endTime;
        
        if (!isOnBreak) {
          // Track blocked attempt
          this.trackBlockedAttempt(url);
          
          return {
            isBlocked: true,
            blockItem,
            reason: 'session',
            canUnlock: false, // Cannot unlock during session
          };
        }
      }

      return {
        isBlocked: false,
        blockItem,
        reason: 'none',
        canUnlock: false,
      };
    } catch (error) {
      console.error('Error checking if URL is blocked:', error);
      return {
        isBlocked: false,
        blockItem: null,
        reason: 'none',
        canUnlock: false,
      };
    }
  }

  // Track blocked attempt for analytics
  private trackBlockedAttempt(url: string): void {
    const normalizedUrl = url.toLowerCase();
    const currentCount = this.blockedAttempts.get(normalizedUrl) || 0;
    this.blockedAttempts.set(normalizedUrl, currentCount + 1);
  }

  // Get blocked attempt statistics
  getBlockedAttempts(): Record<string, number> {
    return Object.fromEntries(this.blockedAttempts);
  }

  // Clear blocked attempt statistics
  clearBlockedAttempts(): void {
    this.blockedAttempts.clear();
  }

  // Get blocking status for multiple URLs
  async checkMultipleUrls(urls: string[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    await Promise.all(
      urls.map(async (url) => {
        const result = await this.isBlocked(url);
        results[url] = result.isBlocked;
      })
    );

    return results;
  }

  // Get current blocking context
  async getBlockingContext(): Promise<{
    hasActiveSession: boolean;
    sessionTimeRemaining: number;
    isOnBreak: boolean;
    totalBlocks: number;
    permanentBlocks: number;
    sessionBlocks: number;
  }> {
    try {
      const activeSession = await focusSessionManager.getActiveSession();
      const blockStats = blockManager.getBlockStats();
      
      let sessionTimeRemaining = 0;
      let isOnBreak = false;
      
      if (activeSession && activeSession.isActive) {
        sessionTimeRemaining = Math.max(0, activeSession.endTime - Date.now());
        
        const lastBreak = activeSession.breaks[activeSession.breaks.length - 1];
        isOnBreak = !!(lastBreak && !lastBreak.endTime);
      }

      return {
        hasActiveSession: !!(activeSession && activeSession.isActive),
        sessionTimeRemaining,
        isOnBreak,
        totalBlocks: blockStats.totalBlocks,
        permanentBlocks: blockStats.permanentBlocks,
        sessionBlocks: blockStats.temporaryBlocks,
      };
    } catch (error) {
      console.error('Error getting blocking context:', error);
      return {
        hasActiveSession: false,
        sessionTimeRemaining: 0,
        isOnBreak: false,
        totalBlocks: 0,
        permanentBlocks: 0,
        sessionBlocks: 0,
      };
    }
  }

  // Create a blocking message for display
  createBlockingMessage(blockResult: Awaited<ReturnType<typeof this.isBlocked>>): {
    title: string;
    message: string;
    actionText?: string;
  } {
    const { reason, blockItem } = blockResult;
    
    switch (reason) {
      case 'permanent':
        return {
          title: 'Site Permanently Blocked',
          message: `${blockItem?.url} is permanently blocked. Complete a challengce();ce.getInstanervingS= Blockiervice blockingSt const 
exporstanceon inletngExport si// 

 }
}
 
    }     };cked.',
   urrently blos site is ce: 'Thi     messagd',
     s Deniees: 'Acc   title
       turn {    reault:
    
      def};
              n',
siot: 'End SesactionTex   ,
       ay focused!`on. St sessiour focusing y durockedurl} is blkItem?.blocge: `${ssa         me Active',
 oncus Sessitle: 'Fo       ti   turn {
        re'session':
  case     
            };
 lenge',
 alTake Chxt: 'nTe       actio  rily.`,
 it tempora unlock e to