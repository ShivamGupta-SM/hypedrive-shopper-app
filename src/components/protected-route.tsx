import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/store/auth-store";
import { useShopperProfile } from "@/hooks/use-api";
import { WifiIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

// Sleek connection error component - matches app's design language
function ConnectionError() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Icon with subtle animation */}
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <WifiIcon className="size-8 text-zinc-400" strokeWidth={1.5} />
        </div>

        {/* Text */}
        <div className="mt-5 text-center">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            Connection Lost
          </h2>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            Unable to reach our servers. Check your internet and try again.
          </p>
        </div>

        {/* Retry button */}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white active:scale-[0.98] dark:bg-white dark:text-zinc-900"
        >
          <ArrowPathIcon className="size-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}

/**
 * ProtectedRoute - Requires authentication AND shopper profile
 *
 * Note: Uses TanStack Query for shopper data (single source of truth).
 * Shows loading state while checking shopper profile.
 *
 * Flow:
 * 1. Not authenticated → redirect to /login
 * 2. Loading shopper data → show nothing (brief flash)
 * 3. No shopper profile → redirect to /onboarding
 * 4. Has shopper → render children
 */
export function ProtectedRoute({ children, redirectTo = "/login" }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: shopperData, loading: shopperLoading, error: shopperError } = useShopperProfile();
  const shopper = shopperData?.shopper;
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Wait for shopper data to load before making routing decisions
  if (shopperLoading) {
    return null; // Brief loading state - AppInitializer handles initial load spinner
  }

  // If there's an error fetching shopper (network error, server down, etc.)
  // DON'T redirect to onboarding - show error state instead
  if (shopperError) {
    return <ConnectionError />;
  }

  if (!shopper && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

/**
 * OnboardingRoute - Requires authentication but NO shopper profile
 *
 * Flow:
 * 1. Not authenticated → redirect to /login
 * 2. Loading shopper data → show nothing
 * 3. Already has shopper profile → redirect to dashboard
 * 4. No shopper → show onboarding form
 */
export function OnboardingRoute({ children }: { children?: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: shopperData, loading: shopperLoading, error: shopperError } = useShopperProfile();
  const shopper = shopperData?.shopper;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait for shopper data to load before making routing decisions
  if (shopperLoading) {
    return null;
  }

  // If there's an error fetching shopper, show error instead of assuming no profile
  if (shopperError) {
    return <ConnectionError />;
  }

  if (shopper) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

/**
 * PublicRoute - Redirects authenticated users away (for login/register pages)
 *
 * Flow:
 * 1. Authenticated with shopper → redirect to dashboard
 * 2. Authenticated without shopper → redirect to onboarding
 * 3. Not authenticated → show public page
 */
export function PublicRoute({ children, redirectTo = "/" }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: shopperData, loading: shopperLoading, error: shopperError } = useShopperProfile();
  const shopper = shopperData?.shopper;

  if (isAuthenticated) {
    // Wait for shopper check before redirecting
    if (shopperLoading) {
      return null;
    }
    // If error fetching shopper, don't redirect - let them stay on public page
    // They can try logging in again or the issue might resolve
    if (shopperError) {
      return children ? <>{children}</> : <Outlet />;
    }
    const destination = shopper ? redirectTo : "/onboarding";
    return <Navigate to={destination} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
