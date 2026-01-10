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

// Enrollments List
export function useEnrollments(params?: {
  cursor?: string;
  limit?: number;
  status?: shared.EnrollmentStatus;
  campaignId?: string;
}) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.enrollments.listEnrollments(params || {});
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

// Cache types for campaign and product data
interface CampaignCache {
  campaign: campaigns.ShopperCampaign;
  product?: products.ProductWithStats;
  platform?: platforms.Platform;
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

      // Fetch campaign, product, and platform data for uncached campaigns
      if (uniqueCampaignIds.length > 0) {
        const campaignPromises = uniqueCampaignIds.map(async (id) => {
          try {
            const campaign = await client.campaigns.getCampaign(id);

            // Fetch product data if campaign has productId
            let product: products.ProductWithStats | undefined;
            let platform: platforms.Platform | undefined;

            if (campaign.productId) {
              try {
                product = await client.products.getProduct(campaign.productId);
                // Fetch platform if product has platformId
                if (product?.platformId) {
                  try {
                    platform = await client.platforms.getPlatform(product.platformId);
                  } catch {
                    // Platform fetch failed, continue without it
                  }
                }
              } catch {
                // Product fetch failed, continue without it
              }
            }

            return { id, campaign, product, platform };
          } catch {
            return { id, campaign: null, product: undefined, platform: undefined };
          }
        });

        const campaignResults = await Promise.all(campaignPromises);
        campaignResults.forEach(({ id, campaign, product, platform }) => {
          if (campaign) {
            campaignCacheRef.current.set(id, { campaign, product, platform });
          }
        });
      }

      // Enrich enrollments with campaign data
      const enrichedEnrollments: EnrichedEnrollment[] = enrollmentData.map(enrollment => {
        const cached = campaignCacheRef.current.get(enrollment.campaignId);
        const campaign = cached?.campaign;
        const product = cached?.product;
        const platform = cached?.platform;

        // Get primary image from product
        const primaryImage = product?.productImages?.find(img => img.isPrimary)?.imageUrl
          || product?.productImages?.[0]?.imageUrl;

        return {
          ...enrollment,
          campaign: campaign ? {
            title: campaign.title,
            product: product ? {
              name: product.name,
              primaryImage,
            } : undefined,
            platform: platform ? {
              name: platform.name,
              icon: platform.icon || platform.logo,
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

// Export types for components
export type { campaigns, coupons, enrollments, shoppers, products, platforms, shared };
