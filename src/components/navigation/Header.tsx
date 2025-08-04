'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFocusSession } from '@/hooks/useFocusSession';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '🏠' },
  { name: 'Focus', href: '/focus', icon: '🎯' },
  { name: 'Blocks', href: '/block-list', icon: '🚫' },
  { name: 'Analytics', href: '/analytics', icon: '📊' },
];

export function Header() {
  const pathname = usePathname();
  const { isSessionActive } = useFocusSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl">🛡️</div>
            <span className="font-bold text-xl">FocusGuardian</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Session Status */}
          <div className="flex items-center space-x-4">
            {isSessionActive && (
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Focus Active</span>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md hover:bg-muted">
              <span className="sr-only">Open menu</span>
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-foreground" />
                <div className="w-full h-0.5 bg-foreground" />
                <div className="w-full h-0.5 bg-foreground" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t py-4">
          <nav className="flex flex-col space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}