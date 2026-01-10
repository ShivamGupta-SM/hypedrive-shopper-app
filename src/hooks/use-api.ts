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
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.shoppers.getMyShopperProfile();
  }, []);
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
}): InfiniteState<campaigns.CampaignListItem> {
  const [data, setData] = useState<campaigns.CampaignListItem[]>([]);
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

// Infinite Enrollments List
export function useInfiniteEnrollments(params?: {
  limit?: number;
  status?: shared.EnrollmentStatus;
  campaignId?: string;
}): InfiniteState<enrollments.EnrollmentListItem> {
  const [data, setData] = useState<enrollments.EnrollmentListItem[]>([]);
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
    return client.wallet.getMyWallet();
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
    return client.wallet.getWalletTransactions(params || {});
  }, [params?.skip, params?.take, params?.type]);
}

// Withdrawals List
export function useWithdrawals(params?: {
  skip?: number;
  take?: number;
  status?: string;
}) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.wallet.listMyWithdrawals(params || {});
  }, [params?.skip, params?.take, params?.status]);
}

// Single Withdrawal
export function useWithdrawal(id: string) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.wallet.getWithdrawal(id);
  }, [id]);
}

// Withdrawal Methods
export function useWithdrawalMethods() {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.wallet.listWithdrawalMethods();
  }, []);
}

// Single Withdrawal Method
export function useWithdrawalMethod(id: string) {
  return useAsync(async () => {
    if (!id) return null;
    const client = getAuthenticatedClient();
    return client.wallet.getWithdrawalMethod(id);
  }, [id]);
}

// Withdrawal Stats
export function useWithdrawalStats(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useAsync(async () => {
    const client = getAuthenticatedClient();
    return client.wallet.getWithdrawalStats(params || {});
  }, [params?.startDate, params?.endDate]);
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
