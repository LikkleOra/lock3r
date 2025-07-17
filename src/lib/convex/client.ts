// Convex client configuration for FocusGuardian
import { ConvexReactClient } from "convex/react";

// Initialize Convex client
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not set");
}

export const convex = new ConvexReactClient(convexUrl);

// Export for use in components
export default convex;