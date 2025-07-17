# Requirements Document

## Introduction

FocusGuardian is a Progressive Web App (PWA) designed to function as an accountability partner that helps users maintain focus and build better digital habits. Rather than just blocking distractions, the application combines site management with positive reinforcement, focus analytics, and cognitive challenges to encourage mindful internet usage during designated focus periods.

The MVP targets users who struggle with digital distractions during work or study sessions, providing them with customizable focus tools, productivity insights, and intelligent accountability mechanisms that transform the relationship with potentially distracting websites and applications.

### Tech Stack
- **Frontend**: Next.js (App Router) with TailwindCSS for styling
- **Backend**: Convex for backend infrastructure and real-time data synchronization
- **Storage**: Combination of localStorage for offline functionality and Convex database for cloud persistence
- **PWA**: Service Worker + Web Manifest for installable experience
- **API Integration**: Codex API for generating cognitive challenges

## Requirements

### Requirement 1: Site and Application Blocking Management

**User Story:** As a user, I want to add and remove websites or applications from my block list, so that I can customize which distractions are prevented during focus sessions.

#### Acceptance Criteria

1. WHEN a user enters a valid URL or application name THEN the system SHALL add it to the block list and persist the data locally
2. WHEN a user views their block list THEN the system SHALL display all currently blocked sites and applications with options to remove them
3. WHEN a user removes an item from the block list THEN the system SHALL immediately update the list and remove blocking for that item
4. IF a user enters an invalid URL format THEN the system SHALL display a validation error and prevent addition
5. WHEN the application starts THEN the system SHALL load the previously saved block list from local storage

### Requirement 2: Focus Timer Sessions

**User Story:** As a user, I want to start timed focus sessions with customizable durations, so that I can structure my work periods and have blocks automatically enforced during these times.

#### Acceptance Criteria

1. WHEN a user starts a focus session THEN the system SHALL activate blocking for all items in the block list
2. WHEN a user sets a custom timer duration THEN the system SHALL accept values between 1 minute and 8 hours
3. WHEN a focus session is active THEN the system SHALL display the remaining time and session status
4. WHEN a focus session expires THEN the system SHALL automatically deactivate blocking and notify the user
5. WHEN a user manually ends a focus session THEN the system SHALL deactivate blocking immediately
6. IF the browser is closed during a session THEN the system SHALL resume the session when reopened (PWA persistence)

### Requirement 3: Permanent Site Blocking

**User Story:** As a user, I want to set certain sites as permanently blocked, so that I can maintain consistent restrictions on my most problematic distractions regardless of focus session status.

#### Acceptance Criteria

1. WHEN a user marks a site as permanently blocked THEN the system SHALL enforce blocking at all times until manually unlocked
2. WHEN a user attempts to access a permanently blocked site THEN the system SHALL present the cognitive unlock challenge
3. WHEN a user successfully completes an unlock challenge THEN the system SHALL temporarily disable blocking for that site for a configurable duration (default 10 minutes)
4. WHEN the temporary unlock expires THEN the system SHALL automatically re-enable permanent blocking for that site
5. WHEN a user views their block list THEN the system SHALL clearly distinguish between session-based and permanent blocks

### Requirement 4: Cognitive Unlock Challenges

**User Story:** As a user, I want to face challenging puzzles when trying to override blocks, so that I'm discouraged from mindlessly accessing distracting sites and must make a conscious effort to break focus.

#### Acceptance Criteria

1. WHEN a user attempts to access a blocked site THEN the system SHALL present a randomly selected cognitive challenge
2. WHEN a challenge is presented THEN the system SHALL include puzzles, riddles, math problems, science questions, or mini-games of sufficient difficulty
3. WHEN a user completes a challenge correctly THEN the system SHALL grant temporary access to the requested site
4. WHEN a user fails a challenge THEN the system SHALL deny access and optionally present a different challenge after a cooldown period
5. WHEN challenges are generated THEN the system SHALL integrate with Codex API for dynamic content creation and validation
6. IF the Codex API is unavailable THEN the system SHALL fall back to a local bank of pre-defined challenges

### Requirement 5: Progressive Web App Functionality

**User Story:** As a user, I want to install FocusGuardian as a PWA on my device, so that I can access it quickly and maintain focus state even when offline or after closing the browser.

#### Acceptance Criteria

1. WHEN a user visits the application THEN the system SHALL provide PWA installation prompts on supported browsers
2. WHEN the PWA is installed THEN the system SHALL function offline with cached resources and data
3. WHEN the application is reopened THEN the system SHALL restore the previous focus session state if one was active
4. WHEN network connectivity is lost THEN the system SHALL continue blocking functionality using cached data
5. WHEN the service worker updates THEN the system SHALL handle updates gracefully without losing user data

### Requirement 6: Cross-Platform Compatibility

**User Story:** As a user, I want to use FocusGuardian on both desktop and mobile browsers, so that I can maintain consistent focus management across all my devices.

#### Acceptance Criteria

1. WHEN accessed on mobile devices THEN the system SHALL provide a responsive interface optimized for touch interaction
2. WHEN accessed on desktop browsers THEN the system SHALL provide an interface optimized for keyboard and mouse interaction
3. WHEN the screen orientation changes THEN the system SHALL adapt the layout appropriately
4. WHEN accessed on different browsers THEN the system SHALL maintain consistent functionality across Chrome, Firefox, Safari, and Edge
5. WHEN data is modified on one device THEN the system SHALL maintain local consistency (note: cross-device sync is not required for MVP)

### Requirement 7: Data Persistence and Privacy

**User Story:** As a user, I want my block lists and settings to be saved locally on my device, so that my privacy is maintained and my configuration persists between sessions.

#### Acceptance Criteria

1. WHEN user data is stored THEN the system SHALL use only local storage mechanisms (localStorage, IndexedDB)
2. WHEN the application is uninstalled THEN the system SHALL allow users to export their configuration data
3. WHEN users want to transfer settings THEN the system SHALL provide import/export functionality for configuration data
4. WHEN storing sensitive data THEN the system SHALL not transmit personal browsing data to external servers
5. WHEN the browser storage is cleared THEN the system SHALL gracefully handle missing data and provide setup guidance

### Requirement 8: Performance and Scalability

**User Story:** As a user, I want the application to respond quickly and handle large block lists efficiently, so that my productivity workflow is not interrupted by slow performance.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL display the main interface within 2 seconds on standard broadband connections
2. WHEN checking if a site is blocked THEN the system SHALL complete the check within 100 milliseconds
3. WHEN the block list contains up to 1000 entries THEN the system SHALL maintain responsive performance
4. WHEN multiple focus sessions are used daily THEN the system SHALL not degrade in performance over time
5. WHEN the service worker processes requests THEN the system SHALL minimize battery and CPU usage on mobile devices