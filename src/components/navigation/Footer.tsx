'use client';

import React from 'react';
import { usePWA } from '@/components/providers/PWAProvider';

export function Footer() {
  const { isInstalled, canInstall, installPrompt, isOnline } = usePWA();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* App Info */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              © 2024 FocusGuardian - Your Digital Accountability Partner
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-4">
            {/* Online Status */}
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-muted-foreground">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* PWA Status */}
            {isInstalled ? (
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-muted-foreground">Installed</span>
              </div>
            ) : canInstall ? (
              <button
                onClick={installPrompt}
                className="text-sm text-primary hover:underline"
              >
                Install App
              </button>
            ) : null}

            {/* Version */}
            <div className="text-xs text-muted-foreground">
              v1.0.0
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <button className="hover:text-foreground transition-colors">
              Privacy Policy
            </button>
            <button className="hover:text-foreground transition-colors">
              Terms of Service
            </button>
            <button className="hover:text-foreground transition-colors">
              Help & Support
            </button>
            <button className="hover:text-foreground transition-colors">
              Feedback
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}