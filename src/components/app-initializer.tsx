import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { DashboardSkeleton } from "@/lib/skeleton";

/**
 * AppInitializer - Handles app startup initialization
 *
 * Shows a loading skeleton while:
 * 1. Zustand rehydrates auth state from localStorage
 * 2. If authenticated, fetches shopper profile
 *
 * Once initialized, renders children (the app routes)
 */
export function AppInitializer({ children }: { children: React.ReactNode }) {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white px-4 py-6 dark:bg-zinc-900 lg:px-10 lg:py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  return <>{children}</>;
}
