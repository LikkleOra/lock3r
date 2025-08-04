// Convex client configuration for FocusGuardian
import { ConvexReactClient } from "convex/react";

// Initialize Convex client
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  console.warn("NEXT_PUBLIC_CONVEX_URL environment variable is not set. Using mock URL for development.");
  // Use a mock URL for development when Convex is not configured
  const mockUrl = "https://mock-convex-url.convex.cloud";
  export const convex = new ConvexReactClient(mockUrl);
} else {
  export const convex = new ConvexReactClient(convexUrl);
}

// Export for use in components
export default convex;

// Utility function to check if Convex is properly configured
export function isConvexConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_CONVEX_URL;
}

// Error handler for Convex operations
export function handleConvexError(error: any): string {
  if (error?.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}