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

function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: unknown[] = []
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
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
export function useEnrollments(params?: {
  cursor?: string;
  limit?: number;
  status?: shared.EnrollmentStatus;
  campaignId?: string;
}): AsyncState<{ data: EnrichedEnrollment[]; nextCursor: string | null; hasMore: boolean }> {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    const result = await client.enrollments.listEnrollments(params || {});

    // Fetch campaign data for all enrollments
    const uniqueCampaignIds = [...new Set(result.data.map(e => e.campaignId))];
    const campaignMap = new Map<string, campaigns.ShopperCampaign>();

    await Promise.all(
      uniqueCampaignIds.map(async (id) => {
        try {
          const campaign = await client.campaigns.getCampaign(id);
          campaignMap.set(id, campaign);
        } catch {
          // Campaign fetch failed, continue without it
        }
      })
    );

    // Enrich enrollments with campaign data
    const enrichedData: EnrichedEnrollment[] = result.data.map(enrollment => {
      const campaign = campaignMap.get(enrollment.campaignId);

      // Get primary image directly from ShopperCampaign.product
      const primaryImage = campaign?.product?.primaryImage
        || campaign?.product?.productImages?.find(img => img.isPrimary)?.imageUrl
        || campaign?.product?.productImages?.[0]?.imageUrl;

      return {
        ...enrollment,
        campaign: campaign ? {
          title: campaign.title,
          product: campaign.product ? {
            name: campaign.product.name,
            primaryImage,
          } : undefined,
          platform: campaign.platform ? {
            name: campaign.platform.name,
            icon: campaign.platform.icon || campaign.platform.logo,
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
  submissions?: Array<{
    id: string;
    deliverableName: string;
    isRequired: boolean;
    requireLink: boolean;
    requireScreenshot: boolean;
    proofLink?: string;
    proofScreenshot?: string;
  }>;
}

// Cache types for campaign data (ShopperCampaign includes product and platform)
interface CampaignCache {
  campaign: campaigns.ShopperCampaign;
}

// Infinite Enrollments List with campaign enrichment
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
  const campaignCacheRef = useRef<Map<string, CampaignCache>>(new Map());

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

      // Get unique campaign IDs that aren't cached
      const uniqueCampaignIds = [...new Set(enrollmentData.map(e => e.campaignId))]
        .filter(id => !campaignCacheRef.current.has(id));

      // Fetch campaign data for uncached campaigns
      // ShopperCampaign already includes product and platform info, no extra fetches needed
      if (uniqueCampaignIds.length > 0) {
        const campaignPromises = uniqueCampaignIds.map(async (id) => {
          try {
            const campaign = await client.campaigns.getCampaign(id);
            return { id, campaign };
          } catch {
            return { id, campaign: null };
          }
        });

        const campaignResults = await Promise.all(campaignPromises);
        campaignResults.forEach(({ id, campaign }) => {
          if (campaign) {
            campaignCacheRef.current.set(id, { campaign });
          }
        });
      }

      // Enrich enrollments with campaign data
      const enrichedEnrollments: EnrichedEnrollment[] = enrollmentData.map(enrollment => {
        const cached = campaignCacheRef.current.get(enrollment.campaignId);
        const campaign = cached?.campaign;

        // Get primary image directly from ShopperCampaign.product
        const primaryImage = campaign?.product?.primaryImage
          || campaign?.product?.productImages?.find(img => img.isPrimary)?.imageUrl
          || campaign?.product?.productImages?.[0]?.imageUrl;

        return {
          ...enrollment,
          campaign: campaign ? {
            title: campaign.title,
            product: campaign.product ? {
              name: campaign.product.name,
              primaryImage,
            } : undefined,
            platform: campaign.platform ? {
              name: campaign.platform.name,
              icon: campaign.platform.icon || campaign.platform.logo,
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
    params?.resourceType,
    params?.cursor,
    params?.limit,
    params?.platformId,
    params?.organizationId,
    params?.bonusMin,
    params?.bonusMax,
    params?.enrollmentStatus,
    params?.withdrawalStatus,
    params?.amountMin,
    params?.amountMax,
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
  const resourceType = params?.resourceType;
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
        resourceType: resourceType,
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
  }, [q, resourceType, limit]);

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

// Search Campaigns Only
export function useSearchCampaigns(params: {
  q: string;
  cursor?: string;
  limit?: number;
  platformId?: string;
  organizationId?: string;
  bonusMin?: number;
  bonusMax?: number;
} | null) {
  return useAsync(async () => {
    if (!params || !params.q?.trim()) return null;
    const client = getAuthenticatedClient();
    return client.shoppers.searchCampaignsEndpoint(params);
  }, [
    params?.q,
    params?.cursor,
    params?.limit,
    params?.platformId,
    params?.organizationId,
    params?.bonusMin,
    params?.bonusMax,
  ]);
}

// Search Enrollments Only
export function useSearchEnrollments(params: {
  q: string;
  cursor?: string;
  limit?: number;
  status?: shared.EnrollmentStatus;
} | null) {
  return useAsync(async () => {
    if (!params || !params.q?.trim()) return null;
    const client = getAuthenticatedClient();
    return client.shoppers.searchEnrollmentsEndpoint(params);
  }, [params?.q, params?.cursor, params?.limit, params?.status]);
}

// Search Withdrawals Only
export function useSearchWithdrawals(params: {
  q: string;
  cursor?: string;
  limit?: number;
  status?: shared.WithdrawalStatus;
  amountMin?: number;
  amountMax?: number;
} | null) {
  return useAsync(async () => {
    if (!params || !params.q?.trim()) return null;
    const client = getAuthenticatedClient();
    return client.shoppers.searchWithdrawalsEndpoint(params);
  }, [
    params?.q,
    params?.cursor,
    params?.limit,
    params?.status,
    params?.amountMin,
    params?.amountMax,
  ]);
}

// Export types for components
export type { campaigns, coupons, enrollments, shoppers, products, platforms, shared };
