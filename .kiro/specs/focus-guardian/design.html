# Design Document: FocusGuardian

## Overview

FocusGuardian is a Progressive Web App designed to serve as an accountability partner for users struggling with digital distractions. The application helps users maintain focus during work or study sessions by managing access to potentially distracting websites and applications, while providing analytics, positive reinforcement, and cognitive challenges to encourage mindful internet usage.

This design document outlines the architecture, components, data models, and implementation strategies for the FocusGuardian MVP.

## Architecture

FocusGuardian follows a hybrid architecture that combines client-side and server-side components to provide a seamless user experience with offline capabilities while maintaining data synchronization across devices.

### High-Level Architecture

```mermaid
graph TD
    Client[Client Application] --> ServiceWorker[Service Worker]
    Client --> LocalStorage[Local Storage]
    Client --> ConvexClient[Convex Client]
    ConvexClient --> ConvexBackend[Convex Backend]
    ServiceWorker --> NetworkRequests[Network Requests]
    ServiceWorker --> CacheAPI[Cache API]
    
    subgraph "Client-Side"
        Client
        ServiceWorker
        LocalStorage
        ConvexClient
        NetworkRequests
        CacheAPI
    end
    
    subgraph "Server-Side"
        ConvexBackend
        CodexAPI[Codex API]
    end
    
    ConvexBackend --> CodexAPI
```

### Key Architectural Components

1. **Next.js Frontend**: Provides the user interface and client-side logic using the App Router for efficient routing and server components.
2. **Service Worker**: Enables offline functionality, manages caching, and handles site blocking mechanisms.
3. **Convex Backend**: Manages data synchronization, user authentication, and server-side logic.
4. **Local Storage**: Provides offline data persistence for user settings and block lists.
5. **Codex API Integration**: Generates and validates cognitive challenges.

## Components and Interfaces

### Core Components

#### 1. Block Manager

Responsible for managing the user's block list, including adding, removing, and categorizing blocked sites.

**Key Functions:**
- Add site to block list
- Remove site from block list
- Toggle permanent blocking
- Validate URL formats
- Categorize blocked sites

**Interfaces:**
```typescript
interface BlockItem {
  id: string;
  url: string;
  pattern: string; // URL pattern for matching
  isPermanent: boolean;
  category?: string;
  createdAt: number;
  lastAccessed?: number;
}

interface BlockManager {
  addBlockItem(url: string, isPermanent?: boolean): Promise<BlockItem>;
  removeBlockItem(id: string): Promise<void>;
  getBlockList(): Promise<BlockItem[]>;
  togglePermanentBlock(id: string): Promise<BlockItem>;
  isBlocked(url: string): Promise<boolean>;
}
```

#### 2. Focus Session Manager

Handles the creation, tracking, and management of focus sessions.

**Key Functions:**
- Start focus session
- End focus session
- Track session progress
- Manage session settings
- Resume interrupted sessions

**Interfaces:**
```typescript
interface FocusSession {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // in milliseconds
  isActive: boolean;
  breaks: Break[];
  completedPercentage: number;
}

interface Break {
  id: string;
  startTime: number;
  endTime?: number;
  reason?: string;
}

interface FocusSessionManager {
  startSession(duration: number): Promise<FocusSession>;
  endSession(sessionId: string): Promise<FocusSession>;
  getActiveSession(): Promise<FocusSession | null>;
  pauseSession(sessionId: string, reason?: string): Promise<FocusSession>;
  resumeSession(sessionId: string): Promise<FocusSession>;
  getSessionHistory(): Promise<FocusSession[]>;
}
```

#### 3. Challenge System

Generates and validates cognitive challenges when users attempt to access blocked sites.

**Key Functions:**
- Generate challenges
- Validate user responses
- Manage difficulty levels
- Track challenge history
- Handle API fallbacks

**Interfaces:**
```typescript
interface Challenge {
  id: string;
  type: 'puzzle' | 'riddle' | 'math' | 'science' | 'game';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // in seconds
}

interface ChallengeSystem {
  generateChallenge(difficulty?: string): Promise<Challenge>;
  validateAnswer(challengeId: string, answer: string | number): Promise<boolean>;
  getLocalChallenge(): Challenge; // Fallback when API is unavailable
  trackAttempt(challengeId: string, wasSuccessful: boolean): Promise<void>;
}
```

#### 4. Analytics Engine

Collects and analyzes user focus data to provide insights and track progress.

**Key Functions:**
- Track focus metrics
- Generate reports
- Identify patterns
- Provide recommendations
- Visualize progress

**Interfaces:**
```typescript
interface FocusMetrics {
  totalFocusTime: number;
  sessionsCompleted: number;
  averageSessionLength: number;
  mostProductiveTimeOfDay: string;
  distractionAttempts: number;
  successfulChallenges: number;
  streakDays: number;
}

interface AnalyticsEngine {
  trackFocusSession(session: FocusSession): Promise<void>;
  trackDistraction(url: string, wasBlocked: boolean): Promise<void>;
  getDailyReport(): Promise<FocusMetrics>;
  getWeeklyReport(): Promise<FocusMetrics>;
  getRecommendations(): Promise<string[]>;
}
```

#### 5. PWA Service Worker

Manages the Progressive Web App functionality, including offline support and installation.

**Key Functions:**
- Cache application resources
- Intercept network requests
- Handle offline mode
- Manage PWA installation
- Sync data when online

**Interfaces:**
```typescript
interface PWAConfig {
  cacheName: string;
  resourcesToPrecache: string[];
  offlineFallbackPage: string;
  syncInterval: number;
}

// Service Worker will implement standard service worker lifecycle events
// and custom message handling
```

### UI Components

#### 1. Dashboard

The main interface showing focus status, quick actions, and summary statistics.

**Key Elements:**
- Current focus status
- Quick start/stop session buttons
- Daily focus summary
- Recent activity
- Quick access to block list

#### 2. Block List Manager

Interface for managing blocked sites and applications.

**Key Elements:**
- List of blocked items
- Add/remove controls
- Permanent block toggles
- Category filters
- Search functionality

#### 3. Focus Session Controller

Interface for starting, configuring, and monitoring focus sessions.

**Key Elements:**
- Timer display
- Session configuration options
- Progress indicators
- Break controls
- Session history

#### 4. Challenge Interface

Presents cognitive challenges when users attempt to access blocked sites.

**Key Elements:**
- Challenge presentation
- Input mechanisms
- Feedback display
- Difficulty indicators
- Time remaining (if applicable)

#### 5. Analytics Dashboard

Visualizes focus data and provides insights on productivity patterns.

**Key Elements:**
- Focus time charts
- Productivity trends
- Distraction attempts
- Success metrics
- Recommendations

## Data Models

### Core Data Models

#### 1. User

```typescript
interface User {
  id: string;
  createdAt: number;
  settings: UserSettings;
  stats: UserStats;
}

interface UserSettings {
  defaultSessionDuration: number; // in milliseconds
  defaultBreakDuration: number; // in milliseconds
  challengeDifficulty: 'easy' | 'medium' | 'hard';
  notificationsEnabled: boolean;
  temporaryUnlockDuration: number; // in milliseconds
  theme: 'light' | 'dark' | 'system';
}

interface UserStats {
  totalFocusTime: number;
  sessionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  challengesCompleted: number;
  challengeSuccessRate: number;
}
```

#### 2. BlockList

```typescript
interface BlockList {
  userId: string;
  items: BlockItem[];
  lastUpdated: number;
}
```

#### 3. FocusHistory

```typescript
interface FocusHistory {
  userId: string;
  sessions: FocusSession[];
  lastUpdated: number;
}
```

#### 4. ChallengeBank

```typescript
interface ChallengeBank {
  localChallenges: Challenge[];
  lastUpdated: number;
}
```

### Data Storage Strategy

1. **Local Storage**:
   - User settings
   - Block list
   - Active focus session
   - Local challenge bank
   - Offline analytics data

2. **Convex Database**:
   - User profiles
   - Synchronized block lists
   - Focus session history
   - Challenge history
   - Analytics data

3. **Cache Storage**:
   - Application shell
   - Static assets
   - Offline fallback pages

## Error Handling

### Error Categories

1. **Network Errors**:
   - Offline detection
   - API timeout handling
   - Synchronization conflicts

2. **User Input Errors**:
   - Invalid URL formats
   - Invalid session durations
   - Incorrect challenge responses

3. **Application Errors**:
   - Service worker registration failures
   - Storage quota exceeded
   - API integration failures

### Error Handling Strategy

1. **Graceful Degradation**:
   - Fall back to local functionality when network is unavailable
   - Use cached data when Convex is unreachable
   - Provide local challenges when Codex API fails

2. **User Feedback**:
   - Clear error messages
   - Suggested actions
   - Automatic retry mechanisms

3. **Error Logging**:
   - Client-side error tracking
   - Synchronization of error logs when online
   - Critical error alerts

## Testing Strategy

### Testing Levels

1. **Unit Testing**:
   - Core business logic components
   - Data model validation
   - Utility functions

2. **Integration Testing**:
   - Component interactions
   - API integrations
   - Storage mechanisms

3. **End-to-End Testing**:
   - User flows
   - PWA functionality
   - Offline capabilities

### Testing Tools and Approaches

1. **Unit Tests**:
   - Jest for JavaScript/TypeScript testing
   - React Testing Library for component testing

2. **Integration Tests**:
   - MSW (Mock Service Worker) for API mocking
   - Testing Library for component integration

3. **End-to-End Tests**:
   - Playwright for cross-browser testing
   - Lighthouse for PWA compliance testing

4. **Manual Testing Checklist**:
   - Cross-browser compatibility
   - Responsive design verification
   - Offline functionality
   - PWA installation flow

## Security Considerations

1. **Data Privacy**:
   - Minimize data collection
   - Local-first approach
   - Clear privacy policy

2. **Service Worker Security**:
   - Proper scope configuration
   - Secure cache management
   - HTTPS enforcement

3. **API Security**:
   - Rate limiting
   - Authentication for Convex endpoints
   - Input validation

## Performance Optimization

1. **Initial Load Performance**:
   - Code splitting
   - Critical CSS inlining
   - Asset optimization

2. **Runtime Performance**:
   - Efficient block list checking algorithms
   - Optimized local storage access
   - Background synchronization

3. **Battery and Resource Usage**:
   - Efficient service worker patterns
   - Throttled background processes
   - Optimized network requests

## Implementation Considerations

### Progressive Enhancement

The application will follow a progressive enhancement approach:

1. **Core Functionality**: Basic site blocking and focus timer will work without JavaScript or service workers.
2. **Enhanced Experience**: Full PWA features, offline support, and analytics require modern browser capabilities.
3. **Optimal Experience**: Real-time synchronization and advanced features require network connectivity and Convex backend.

### Browser Compatibility

The application will target:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

Mobile browsers will be fully supported with responsive design and touch-optimized interfaces.

### Accessibility

The application will follow WCAG 2.1 AA standards, including:
- Proper semantic HTML
- ARIA attributes where necessary
- Keyboard navigation
- Screen reader compatibility
- Sufficient color contrast
- Focus management

## Future Expansion Considerations

While not part of the MVP, the architecture will be designed to accommodate future features:

1. **Cross-Device Synchronization**: Full synchronization of settings and block lists across devices.
2. **Social Accountability**: Friend connections and shared focus goals.
3. **Browser Extension Integration**: Deeper integration with browser APIs for enhanced blocking.
4. **AI-Powered Insights**: Advanced analytics and personalized recommendations.
5. **Gamification Elements**: Achievements, streaks, and rewards for maintaining focus.

## Folder Structure

```
/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   ├── dashboard/            # Dashboard page
│   ├── settings/             # Settings page
│   ├── analytics/            # Analytics page
│   ├── block-list/           # Block list management page
│   ├── challenge/            # Challenge page
│   └── layout.tsx            # Root layout
├── components/               # Shared components
│   ├── ui/                   # UI components
│   ├── blocks/               # Block list components
│   ├── focus/                # Focus session components
│   ├── challenges/           # Challenge components
│   └── analytics/            # Analytics components
├── lib/                      # Shared utilities
│   ├── convex/               # Convex client setup
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   └── constants.ts          # Application constants
├── models/                   # Type definitions
├── public/                   # Static assets
│   ├── manifest.json         # PWA manifest
│   ├── service-worker.js     # Service worker
│   └── icons/                # App icons
├── styles/                   # Global styles
├── convex/                   # Convex backend
│   ├── schema.ts             # Database schema
│   ├── auth.ts               # Authentication
│   ├── blocks.ts             # Block list functions
│   ├── sessions.ts           # Focus session functions
│   └── challenges.ts         # Challenge functions
└── tests/                    # Test files
    ├── unit/                 # Unit tests
    ├── integration/          # Integration tests
    └── e2e/                  # End-to-end tests
```

## Conclusion

This design document outlines the architecture, components, and implementation strategy for the FocusGuardian Progressive Web App. The application is designed to be a comprehensive accountability partner for users seeking to improve their focus and digital habits, with a strong emphasis on user experience, performance, and scalability.

The hybrid architecture combining Next.js, TailwindCSS, and Convex provides a solid foundation for building a responsive, offline-capable application with real-time data synchronization capabilities. The modular component structure ensures maintainability and extensibility as the application evolves beyond the MVP phase.