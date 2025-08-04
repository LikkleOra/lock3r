'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/focus': 'Focus Session',
  '/block-list': 'Block List',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  
  // Don't show breadcrumbs on home page
  if (pathname === '/') return null;

  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { name: 'Dashboard', href: '/' },
    ...pathSegments.map((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      const name = routeNames[href] || segment.charAt(0).toUpperCase() + segment.slice(1);
      return { name, href };
    }),
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href}>
          {index > 0 && <span>/</span>}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.name}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}