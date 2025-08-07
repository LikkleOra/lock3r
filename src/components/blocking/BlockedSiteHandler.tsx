'use client';

import React from 'react';
import { useChallengeSystem } from '@/hooks/useChallengeSystem';
import { ChallengeModal, ChallengeResult } from '@/components/challenges';

interface BlockedSiteHandlerProps {
  children: React.ReactNode;
}

export function BlockedSiteHandler({ children }: BlockedSiteHandlerProps) {
  const {
    currentChallenge,
    isLoading,
    error,
    showChallengeModal,
    showResultModal,
    challengeResult,
    blockedUrl,
    temporaryUnlockDuration,
    submitAnswer,
    skipChallenge,
    tryAgain,
    closeChallengeModal,
    closeResultModal,
  } = useChallengeSystem();

  return (
    <>
      {children}
      
      {/* Challenge Modal */}
      {currentChallenge && (
        <ChallengeModal
          challenge={currentChallenge}
          isOpen={showChallengeModal}
          onSubmit={submitAnswer}
          onSkip={skipChallenge}
          onClose={closeChallengeModal}
          blockedUrl={blockedUrl || undefined}
        />
      )}

      {/* Challenge Result Modal */}
      {challengeResult && currentChallenge && (
        <ChallengeResult
          challenge={currentChallenge}
          userAnswer={challengeResult.userAnswer}
          isCorrect={challengeResult.isCorrect}
          isOpen={showResultModal}
          onClose={closeResultModal}
          onTryAgain={tryAgain}
          temporaryUnlockDuration={temporaryUnlockDuration}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Generating challenge...</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}