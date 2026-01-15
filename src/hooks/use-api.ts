import { useState, useEffect, useCallback, useRef } from "react";
import { getAuthenticatedClient } from "@/lib/client";
import type {
  campaigns,
  coupons,
  enrollments,
  shoppers,
  products,
  platforms,
  shared,
} from "@/lib/api-client";

// Generic async state hook
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Infinite scroll state
interface InfiniteState<T> {
  data: T[];
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

// Simple in-memory cache for API responses
const apiCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds cache

function getCacheKey(fnName: string, deps: unknown[]): string {
  return `${fnName}:${JSON.stringify(deps)}`;
}

function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: unknown[] = [],
  options?: { cacheKey?: string; cacheTTL?: number }
): AsyncState<T> {
  const cacheKey = options?.cacheKey || getCacheKey(asyncFn.toString().slice(0, 50), deps);
  const cacheTTL = options?.cacheTTL ?? CACHE_TTL;

  // Try to get cached data for initial state
  const cached = apiCache.get(cacheKey);
  const isCacheValid = cached && (Date.now() - cached.timestamp) < cacheTTL;

  const [data, setData] = useState<T | null>(isCacheValid ? (cached.data as T) : null);
  const [loading, setLoading] = useState(!isCacheValid);
  const [error, setError] = useState<Error | null>(null);
  const hasFetchedRef = useRef(isCacheValid);
  const depsRef = useRef(deps);

  const execute = useCallback(async (skipCache = false) => {
    // Check cache first (unless skipCache)
    if (!skipCache) {
      const cachedData = apiCache.get(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp) < cacheTTL) {
        setData(cachedData.data as T);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
      // Store in cache
      apiCache.set(cacheKey, { data: result, timestamp: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    // Check if deps actually changed
    const depsChanged = JSON.stringify(deps) !== JSON.stringify(depsRef.current);

    if (!hasFetchedRef.current || depsChanged) {
      hasFetchedRef.current = true;
      depsRef.current = deps;
      execute();
    }
  }, [execute, deps]);

  // Refetch bypasses cache
  const refetch = useCallback(() => execute(true), [execute]);

  return { data, loading, error, refetch };
}

// Shopper Profile
export function useShopperProfile() {
  const result = useAsync(async () => {
    const client = getAuthenticatedClient();
    const profile = await client.shoppers.getMyShopperProfile();

    // Sync shopper data to localStorage for identity
    if (profile?.shopper) {
      const shopperData = {
        id: profile.shopper.id,
        firstName: profile.shopper.firstName || "",
        lastName: profile.shopper.lastName || "",
        kycStatus: profile.shopper.kycStatus || "pending",
        avatarUrl: profile.shopper.avatarUrl,
      };
      localStorage.setItem("auth_shopper", JSON.stringify(shopperData));
    }

    return profile;
  }, []);

  return result;
}

// Shopper Stats
export function useShopperStats() {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.shoppers.getShopperStats();
  }, []);
}

// Shopper Earnings History
export function useEarningsHistory(period?: "daily" | "weekly" | "monthly") {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.shoppers.getEarningsHistory({ period: period || "monthly" });
  }, [period]);
}

// KYC Status
export function useKYCStatus() {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.shoppers.getKYCStatus();
  }, []);
}

// Campaigns List
export function useCampaigns(params?: {
  cursor?: string;
  limit?: number;
  platformId?: string;
  categoryId?: string;
  q?: string;
  featured?: boolean;
  sort?: "trending" | "recent";
}) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.campaigns.listCampaigns(params || {});
  }, [params?.cursor, params?.limit, params?.platformId, params?.categoryId, params?.q, params?.featured, params?.sort]);
}

// Infinite Campaigns List
export function useInfiniteCampaigns(params?: {
  limit?: number;
  platformId?: string;
  categoryId?: string;
  q?: string;
  featured?: boolean;
  sort?: "trending" | "recent";
}): InfiniteState<campaigns.ShopperCampaign> {
  const [data, setData] = useState<campaigns.ShopperCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);
  const paramsRef = useRef(params);

  // Reset when params change
  useEffect(() => {
    const paramsChanged = JSON.stringify(params) !== JSON.stringify(paramsRef.current);
    if (paramsChanged) {
      paramsRef.current = params;
      cursorRef.current = null;
      setData([]);
      setHasMore(true);
      setLoading(true);
    }
  }, [params]);

  const fetchData = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const client = getAuthenticatedClient();
      const result = await client.campaigns.listCampaigns({
        ...params,
        cursor: isLoadMore ? cursorRef.current || undefined : undefined,
      });

      if (isLoadMore) {
        setData(prev => [...prev, ...(result.data || [])]);
      } else {
        setData(result.data || []);
      }
      cursorRef.current = result.nextCursor;
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && cursorRef.current) {
      fetchData(true);
    }
  }, [loadingMore, hasMore, fetchData]);

  const refetch = useCallback(() => {
    cursorRef.current = null;
    setData([]);
    setHasMore(true);
    fetchData(false);
  }, [fetchData]);

  return { data, loading, loadingMore, error, hasMore, loadMore, refetch };
}

// Single Campaign
export function useCampaign(id: string) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.campaigns.getCampaign(id);
  }, [id]);
}

// Campaign Pricing
export function useCampaignPricing(id: string) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.campaigns.getCampaignPricing(id);
  }, [id]);
}

// Campaign Deliverables
export function useCampaignDeliverables(params?: {
  skip?: number;
  take?: number;
  platformId?: string;
  category?: string;
}) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.campaigns.listDeliverables(params || {});
  }, [params?.skip, params?.take, params?.platformId, params?.category]);
}

// Calculate Payout Estimate
export function usePayoutEstimate(campaignId: string, orderValue: number) {
  return useAsync(async () => {
    if (!orderValue || orderValue <= 0) return null;
    const client = getAuthenticatedClient();
    return client.campaigns.calculatePayoutEstimate(campaignId, { orderValue });
  }, [campaignId, orderValue]);
}

// Available Coupons for Campaign
export function useAvailableCoupons(campaignId: string) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.coupons.listAvailableCoupons(campaignId);
  }, [campaignId]);
}

// Enrollments List with campaign enrichment
// Campaign data is now embedded in the API response (no extra API calls needed)
export function useEnrollments(params?: {
  cursor?: string;
  limit?: number;
  status?: shared.EnrollmentStatus;
  campaignId?: string;
}): AsyncState<{ data: EnrichedEnrollment[]; nextCursor: string | null; hasMore: boolean }> {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    const result = await client.enrollments.listEnrollments(params || {});

    // Campaign data is now embedded in the enrollment response from backend
    // No need for N+1 API calls to fetch campaign details
    // Note: Cast to any since API client types may not be regenerated yet
    const enrichedData: EnrichedEnrollment[] = result.data.map(enrollment => {
      const e = enrollment as enrollments.Enrollment & {
        campaign?: {
          title: string;
          product?: { name: string; primaryImage?: string };
          platform?: { name: string; icon?: string };
        };
      };
      return {
        ...enrollment,
        // Campaign data comes directly from API response
        campaign: e.campaign ? {
          title: e.campaign.title,
          product: e.campaign.product ? {
            name: e.campaign.product.name,
            primaryImage: e.campaign.product.primaryImage,
          } : undefined,
          platform: e.campaign.platform ? {
            name: e.campaign.platform.name,
            icon: e.campaign.platform.icon,
          } : undefined,
        } : undefined,
      };
    });

    return {
      data: enrichedData,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }, [params?.cursor, params?.limit, params?.status, params?.campaignId]);
}

// Enriched enrollment type with campaign data
// Note: deliverables come from the base enrollments.Enrollment type
export interface EnrichedEnrollment extends enrollments.Enrollment {
  campaign?: {
    title: string;
    product?: {
      name: string;
      primaryImage?: string;
    };
    platform?: {
      name: string;
      icon?: string;
    };
  };
}

// Infinite Enrollments List - campaign data now embedded in API response
// No more N+1 API calls - single request returns all data
export function useInfiniteEnrollments(params?: {
  limit?: number;
  status?: shared.EnrollmentStatus;
  campaignId?: string;
}): InfiniteState<EnrichedEnrollment> {
  const [data, setData] = useState<EnrichedEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);
  const paramsRef = useRef(params);

  // Reset when params change
  useEffect(() => {
    const paramsChanged = JSON.stringify(params) !== JSON.stringify(paramsRef.current);
    if (paramsChanged) {
      paramsRef.current = params;
      cursorRef.current = null;
      setData([]);
      setHasMore(true);
      setLoading(true);
    }
  }, [params]);

  const fetchData = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const client = getAuthenticatedClient();
      const result = await client.enrollments.listEnrollments({
        ...params,
        cursor: isLoadMore ? cursorRef.current || undefined : undefined,
      });

      const enrollmentData = result.data || [];

      // Campaign data is now embedded in the API response - no extra fetches needed!
      const enrichedEnrollments: EnrichedEnrollment[] = enrollmentData.map(enrollment => {
        return {
          ...enrollment,
          // Campaign data comes directly from API response
          campaign: enrollment.campaign ? {
            title: enrollment.campaign.title,
            product: enrollment.campaign.product ? {
              name: enrollment.campaign.product.name,
              primaryImage: enrollment.campaign.product.primaryImage,
            } : undefined,
            platform: enrollment.campaign.platform ? {
              name: enrollment.campaign.platform.name,
              icon: enrollment.campaign.platform.icon,
            } : undefined,
          } : undefined,
          // Map deliverables to submissions format expected by EnrollmentCard
          submissions: enrollment.deliverables?.map(d => ({
            id: d.campaignDeliverableId,
            deliverableName: d.name,
            isRequired: d.isRequired,
            requireLink: d.requireLink,
            requireScreenshot: d.requireScreenshot,
            proofLink: d.proofLink,
            proofScreenshot: d.proofScreenshot,
          })),
        };
      });

      if (isLoadMore) {
        setData(prev => [...prev, ...enrichedEnrollments]);
      } else {
        setData(enrichedEnrollments);
      }
      cursorRef.current = result.nextCursor;
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && cursorRef.current) {
      fetchData(true);
    }
  }, [loadingMore, hasMore, fetchData]);

  const refetch = useCallback(() => {
    cursorRef.current = null;
    setData([]);
    setHasMore(true);
    fetchData(false);
  }, [fetchData]);

  return { data, loading, loadingMore, error, hasMore, loadMore, refetch };
}

// Single Enrollment
export function useEnrollment(id: string) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.enrollments.getEnrollment(id);
  }, [id]);
}

// Enrollment Detail
export function useEnrollmentDetail(id: string) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.enrollments.getEnrollmentDetail(id);
  }, [id]);
}

// Enrollment Pricing
export function useEnrollmentPricing(id: string) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.enrollments.getEnrollmentPricing(id);
  }, [id]);
}

// Products List
export function useProducts(params?: products.ListProductsParams) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.products.listProducts(params || {});
  }, [params?.skip, params?.take, params?.categoryId, params?.platformId, params?.search, params?.priceMin, params?.priceMax, params?.sortBy, params?.sortOrder]);
}

// Single Product
export function useProduct(slug: string) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.products.getProduct(slug);
  }, [slug]);
}

// Product Categories
export function useProductCategories() {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.products.listAllCategories();
  }, []);
}

// Platforms List
export function usePlatforms() {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.platforms.listActivePlatforms();
  }, []);
}

// Single Platform by ID
export function usePlatform(id: string | undefined) {
  return useAsync(async () => {
    if (!id) return null;
    const client = getAuthenticatedClient();
    return client.platforms.getPlatform(id);
  }, [id]);
}

// Product by ID (for campaign product lookup)
export function useProductById(id: string | undefined) {
  return useAsync(async () => {
    if (!id) return null;
    const client = getAuthenticatedClient();
    return client.products.getProduct(id);
  }, [id]);
}

// Product Category by ID
export function useProductCategory(id: string | undefined) {
  return useAsync(async () => {
    if (!id) return null;
    const client = getAuthenticatedClient();
    return client.products.getCategory(id);
  }, [id]);
}

// Active Campaigns (featured/trending for dashboard)
export function useActiveCampaigns(limit = 4) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    const result = await client.campaigns.listCampaigns({
      limit,
      featured: true
    });
    return result.data || [];
  }, [limit]);
}

// =============================================================================
// WALLET HOOKS
// =============================================================================

// Wallet Details
export function useWallet() {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.wallets.getMyWallet();
  }, []);
}

// Wallet Transactions
export function useWalletTransactions(params?: {
  skip?: number;
  take?: number;
  type?: "credit" | "debit";
}) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.wallets.getWalletTransactions(params || {});
  }, [params?.skip, params?.take, params?.type]);
}

// Withdrawals List
export function useWithdrawals(params?: {
  skip?: number;
  take?: number;
  status?: shared.WithdrawalStatus;
}) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.wallets.listMyWithdrawals(params || {});
  }, [params?.skip, params?.take, params?.status]);
}

// Single Withdrawal
export function useWithdrawal(id: string) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.wallets.getWithdrawal(id);
  }, [id]);
}

// Withdrawal Methods
export function useWithdrawalMethods() {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.wallets.listWithdrawalMethods();
  }, []);
}

// Single Withdrawal Method
export function useWithdrawalMethod(id: string) {
  return useAsync(async () => {
    if (!id) return null;
    const client = getAuthenticatedClient();
    return client.wallets.getWithdrawalMethod(id);
  }, [id]);
}

// Withdrawal Stats
export function useWithdrawalStats(params?: {
  organizationId?: string;
  shopperId?: string;
  holderType?: "organization" | "shopper";
  holderId?: string;
}) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.wallets.getWithdrawalStats(params || {});
  }, [params?.organizationId, params?.shopperId, params?.holderType, params?.holderId]);
}

// =============================================================================
// NOTIFICATION HOOKS
// =============================================================================

// Notification Preferences
export function useNotificationPreferences() {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.notifications.getNotificationPreferences();
  }, []);
}

// Unread Notification Count
export function useUnreadNotificationCount() {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.notifications.getUnreadCount();
  }, []);
}

// =============================================================================
// SEARCH HOOKS
// =============================================================================

// Unified Search - searches across campaigns, enrollments, and withdrawals
export function useUnifiedSearch(params: shoppers.UnifiedSearchParams | null) {
  return useAsync(async () => {
    if (!params || !params.q?.trim()) return null;
    const client = getAuthenticatedClient();
    return client.shoppers.unifiedSearch(params);
  }, [
    params?.q,
    params?.cursor,
    params?.limit,
  ]);
}

// Infinite Unified Search
export function useInfiniteUnifiedSearch(params?: Omit<shoppers.UnifiedSearchParams, 'cursor'>): InfiniteState<shoppers.SearchResult> & { facets: shoppers.SearchFacets | null } {
  const [data, setData] = useState<shoppers.SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [facets, setFacets] = useState<shoppers.SearchFacets | null>(null);
  const cursorRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Extract primitive values from params
  const q = params?.q;
  const limit = params?.limit;

  const fetchData = useCallback(async (isLoadMore = false) => {
    if (!q?.trim()) {
      setData([]);
      setLoading(false);
      setHasMore(false);
      setFacets(null);
      return;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setData([]); // Clear data immediately for non-load-more fetches
      cursorRef.current = null;
    }
    setError(null);

    try {
      const client = getAuthenticatedClient();
      const result = await client.shoppers.unifiedSearch({
        q: q,
        limit: limit,
        cursor: isLoadMore ? cursorRef.current || undefined : undefined,
      });

      // Check if this request was aborted
      if (abortControllerRef.current?.signal.aborted) return;

      if (isLoadMore) {
        setData(prev => [...prev, ...(result.data || [])]);
      } else {
        setData(result.data || []);
      }
      cursorRef.current = result.nextCursor;
      setHasMore(result.hasMore);
      setFacets(result.facets);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [q, limit]);

  // Fetch when params change
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && cursorRef.current && q?.trim()) {
      fetchData(true);
    }
  }, [loadingMore, hasMore, fetchData, q]);

  const refetch = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

  return { data, loading, loadingMore, error, hasMore, loadMore, refetch, facets };
}

// Export types for components
export type { campaigns, coupons, enrollments, shoppers, products, platforms, shared };
