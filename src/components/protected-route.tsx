import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/store/auth-store";
import { useShopperProfile } from "@/hooks/use-api";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
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
  const { data: shopperData, loading: shopperLoading } = useShopperProfile();
  const shopper = shopperData?.shopper;
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Wait for shopper data to load before making routing decisions
  if (shopperLoading) {
    return null; // Brief loading state - AppInitializer handles initial load spinner
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
  const { data: shopperData, loading: shopperLoading } = useShopperProfile();
  const shopper = shopperData?.shopper;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait for shopper data to load before making routing decisions
  if (shopperLoading) {
    return null;
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
  const { data: shopperData, loading: shopperLoading } = useShopperProfile();
  const shopper = shopperData?.shopper;

  if (isAuthenticated) {
    // Wait for shopper check before redirecting
    if (shopperLoading) {
      return null;
    }
    const destination = shopper ? redirectTo : "/onboarding";
    return <Navigate to={destination} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
