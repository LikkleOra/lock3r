'use client';

import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ message = 'Loading...', size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]} mb-4`} />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export function PageLoading({ message }: { message?: string }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loading message={message} size="lg" />
    </div>
  );
}