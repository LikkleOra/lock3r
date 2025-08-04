// Unit tests for FocusSessionManager
import { FocusSessionManager } from '../FocusSessionManager';
import { storage } from '../../storage';
import { FOCUS_SESSION } from '../../constants';

// Mock the storage module
jest.mock('../../storage', () => ({
  storage: {
    getActiveFocusSession: jest.fn(),
    saveActiveFocusSession: jest.fn(),
    clearActiveFocusSession: jest.fn(),
    addToSessionHistory: jest.fn(),
    getSessionHistory: jest.fn(),
  },
}));

// Mock utils
jest.mock('../../utils', () => ({
  generateId: jest.fn(() => 'test-session-123'),
  getCurrentTimestamp: jest.fn(() => 1234567890),
  calculatePercentage: jest.fn((current, total) => Math.round((current / total) * 100)),
}));

const mockStorage = storage as jest.Mocked<typeof storage>;

describe('FocusSessionManager', () => {
  let sessionManager: FocusSessionManager;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getActiveFocusSession.mockReturnValue(null);
    mockStorage.saveActiveFocusSession.mockReturnValue({ success: true });
    mockStorage.addToSessionHistory.mockResolvedValue({ success: true });
    mockStorage.getSessionHistory.mockReturnValue([]);
    
    sessionManager = new FocusSessionManager();
  });

  describe('startSession', () => {
    it('should start a new focus session', async () => {
      const duration = 25 * 60 * 1000; // 25 minutes
      const session = await sessionManager.startSession(duration);

      expect(session).toMatchObject({
        id: 'test-session-123',
        duration,
        isActive: true,
        completedPercentage: 0,
      });

      expect(mockStorage.saveActiveFocusSession).toHaveBeenCalledWith(session);
    });

    it('should reject invalid durations', async () => {
      await expect(sessionManager.startSession(30000)).rejects.toThrow('Invalid session duration');
      await expect(sessionManager.startSession(10 * 60 * 60 * 1000)).rejects.toThrow('Invalid session duration');
    });

    it('should reject starting session when one is already active', async () => {
      const duration = 25 * 60 * 1000;
      await sessionManager.startSession(duration);
      
      await expect(sessionManager.startSession(duration)).rejects.toThrow('Session already active');
    });
  });

  describe('endSession', () => {
    it('should end an active session', async () => {
      const duration = 25 * 60 * 1000;
      const session = await sessionManager.startSession(duration);
      
      const endedSession = await sessionManager.endSession(session.id);

      expect(endedSession.isActive).toBe(false);
      expect(endedSession.completedPercentage).toBe(100);
      expect(mockStorage.clearActiveFocusSession).toHaveBeenCalled();
      expect(mockStorage.addToSessionHistory).toHaveBeenCalledWith(endedSession);
    });

    it('should throw error when ending non-existent session', async () => {
      await expect(sessionManager.endSession('non-existent')).rejects.toThrow('No active session found');
    });
  });

  describe('getActiveSession', () => {
    it('should return null when no session is active', async () => {
      const activeSession = await sessionManager.getActiveSession();
      expect(activeSession).toBeNull();
    });

    it('should return active session when one exists', async () => {
      const duration = 25 * 60 * 1000;
      const session = await sessionManager.startSession(duration);
      
      const activeSession = await sessionManager.getActiveSession();
      expect(activeSession).toEqual(session);
    });
  });

  describe('pauseSession', () => {
    it('should pause an active session', async () => {
      const duration = 25 * 60 * 1000;
      const session = await sessionManager.startSession(duration);
      
      const pausedSession = await sessionManager.pauseSession(session.id, 'Break time');

      expect(pausedSession.breaks).toHaveLength(1);
      expect(pausedSession.breaks[0].reason).toBe('Break time');
      expect(mockStorage.saveActiveFocusSession).toHaveBeenCalledWith(pausedSession);
    });

    it('should throw error when pausing non-existent session', async () => {
      await expect(sessionManager.pauseSession('non-existent')).rejects.toThrow('No active session found');
    });
  });

  describe('resumeSession', () => {
    it('should resume a paused session', async () => {
      const duration = 25 * 60 * 1000;
      const session = await sessionManager.startSession(duration);
      await sessionManager.pauseSession(session.id, 'Break');
      
      const resumedSession = await sessionManager.resumeSession(session.id);

      expect(resumedSession.breaks[0].endTime).toBeDefined();
      expect(mockStorage.saveActiveFocusSession).toHaveBeenCalled();
    });

    it('should throw error when resuming non-existent session', async () => {
      await expect(sessionManager.resumeSession('non-existent')).rejects.toThrow('No active session found');
    });
  });

  describe('getSessionHistory', () => {
    it('should return session history from storage', async () => {
      const mockHistory = [
        {
          id: 'session-1',
          userId: 'user-1',
          startTime: 1234567890,
          endTime: 1234569890,
          duration: 25 * 60 * 1000,
          isActive: false,
          breaks: [],
          completedPercentage: 100,
        },
      ];

      mockStorage.getSessionHistory.mockReturnValue(mockHistory);

      const history = await sessionManager.getSessionHistory();
      expect(history).toEqual(mockHistory);
    });
  });

  describe('session persistence', () => {
    it('should load active session on initialization', () => {
      const mockActiveSession = {
        id: 'existing-session',
        userId: 'user-1',
        startTime: 1234567890,
        endTime: 1234569890,
        duration: 25 * 60 * 1000,
        isActive: true,
        breaks: [],
        completedPercentage: 50,
      };

      mockStorage.getActiveFocusSession.mockReturnValue(mockActiveSession);

      const newManager = new FocusSessionManager();
      expect(mockStorage.getActiveFocusSession).toHaveBeenCalled();
    });
  });
});