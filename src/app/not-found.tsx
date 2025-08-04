import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </Link>
          
          <Link
            href="/focus"
            className="block w-full px-6 py-3 border rounded-lg hover:bg-muted transition-colors"
          >
            Start Focus Session
          </Link>
        </div>
      </div>
    </div>
  );
}