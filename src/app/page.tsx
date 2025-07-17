import Link from 'next/link';
import { usePWA } from '@/components/providers/PWAProvider';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            FocusGuardian
          </h1>
          <p className="text-lg text-muted-foreground">
            Your digital accountability partner for building better focus habits
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors inline-block"
          >
            Get Started
          </Link>
          
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/block-list"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg text-sm transition-colors inline-block"
            >
              Manage Blocks
            </Link>
            <Link
              href="/analytics"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg text-sm transition-colors inline-block"
            >
              View Analytics
            </Link>
          </div>
        </div>

        <div className="pt-8 text-sm text-muted-foreground">
          <p>
            Transform your relationship with distracting websites through
            cognitive challenges and positive reinforcement.
          </p>
        </div>
      </div>
    </div>
  );
}