import { useState, useRef, useCallback } from "react";
import { useQuery, useInfiniteQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Client, { Local, isAPIError, APIError, ErrCode } from "@/lib/client";
import { useAuthStore, getAuthToken } from "@/store/auth-store";
import type {
  auth,
  campaigns,
  coupons,
  enrollments,
  platforms,
  products,
  shoppers,
  shared,
  wallets,
} from "@/lib/client";

// =============================================================================
// CLIENT SETUP
// =============================================================================

// Determine API URL from environment
const API_URL = import.meta.env.VITE_API_URL || Local;

// Public API client instance (no auth)
export const apiClient = new Client(API_URL);

/**
 * Get authenticated client with current auth token
 * Use this for all authenticated API calls
 */
export function getAuthenticatedClient(): Client {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No auth token found");
  }
  return apiClient.with({
    requestInit: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

/**
 * Resolve a relative asset path to a full URL
 * Handles paths like "uploads/..." returned from the backend
 */
export function getAssetUrl(path: string | undefined | null): string {
  if (!path) return "";
  // If already a full URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${API_URL}/${cleanPath}`;
}

// =============================================================================
// QUERY KEYS - Centralized for easy cache invalidation
// =============================================================================

export const queryKeys = {
  // Shopper
  shopperProfile: ["shopper", "profile"] as const,
  shopperStats: ["shopper", "stats"] as const,
  earningsHistory: (period: string) => ["shopper", "earnings", period] as const,
  kycStatus: ["shopper", "kyc"] as const,

  // Campaigns
  campaigns: (params?: Record<string, unknown>) => ["campaigns", params] as const,
  campaign: (id: string) => ["campaigns", id] as const,
  campaignPricing: (id: string) => ["campaigns", id, "pricing"] as const,
  campaignDeliverables: (params?: Record<string, unknown>) => ["campaigns", "deliverables", params] as const,
  activeCampaigns: (limit: number) => ["campaigns", "active", limit] as const,

  // Enrollments
  enrollments: (params?: Record<string, unknown>) => ["enrollments", params] as const,
  enrollment: (id: string) => ["enrollments", id] as const,
  enrollmentDetail: (id: string) => ["enrollments", id, "detail"] as const,
  enrollmentPricing: (id: string) => ["enrollments", id, "pricing"] as const,

  // Products
  products: (params?: Record<string, unknown>) => ["products", params] as const,
  product: (slug: string) => ["products", slug] as const,
  productCategories: ["products", "categories"] as const,

  // Platforms
  platforms: ["platforms"] as const,
  platform: (id: string) => ["platforms", id] as const,

  // Wallet
  wallet: ["wallet"] as const,
  walletTransactions: (params?: Record<string, unknown>) => ["wallet", "transactions", params] as const,
  walletTransaction: (id: string) => ["wallet", "transactions", "detail", id] as const,
  withdrawals: (params?: Record<string, unknown>) => ["wallet", "withdrawals", params] as const,
  withdrawal: (id: string) => ["wallet", "withdrawals", id] as const,
  withdrawalMethods: ["wallet", "withdrawal-methods"] as const,
  withdrawalMethod: (id: string) => ["wallet", "withdrawal-methods", id] as const,
  withdrawalStats: (params?: Record<string, unknown>) => ["wallet", "withdrawal-stats", params] as const,

  // Notifications
  notificationPreferences: ["notifications", "preferences"] as const,
  unreadNotificationCount: ["notifications", "unread-count"] as const,

  // Coupons
  availableCoupons: (campaignId: string) => ["coupons", campaignId] as const,
  couponByCode: (code: string) => ["coupons", "code", code] as const,
  myRedemptions: (params?: Record<string, unknown>) => ["coupons", "redemptions", params] as const,

  // Auth/Sessions
  sessions: ["auth", "sessions"] as const,

  // Search
  unifiedSearch: (params?: Record<string, unknown>) => ["search", params] as const,

  // Category Products
  categoryProducts: (id: string, params?: Record<string, unknown>) => ["products", "category", id, params] as const,

  // Task Templates (replacing deliverables)
  taskTemplates: (params?: Record<string, unknown>) => ["tasks", "templates", params] as const,
  taskTemplate: (id: string) => ["tasks", "templates", id] as const,
};

// =============================================================================
// HELPER TO INVALIDATE QUERIES
// =============================================================================

export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateShopperProfile: () => queryClient.invalidateQueries({ queryKey: queryKeys.shopperProfile }),
    invalidateShopperStats: () => queryClient.invalidateQueries({ queryKey: queryKeys.shopperStats }),
    invalidateWallet: () => queryClient.invalidateQueries({ queryKey: queryKeys.wallet }),
    invalidateEnrollments: () => queryClient.invalidateQueries({ queryKey: ["enrollments"] }),
    invalidateCampaigns: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
    invalidateSessions: () => queryClient.invalidateQueries({ queryKey: queryKeys.sessions }),
    invalidateWithdrawals: () => queryClient.invalidateQueries({ queryKey: ["wallet", "withdrawals"] }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}

// =============================================================================
// SHOPPER HOOKS
// =============================================================================

// Shopper Profile - Single source of truth for shopper data
export function useShopperProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.shopperProfile,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.shoppers.getMyShopperProfile();
    },
    enabled: isAuthenticated,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// =============================================================================
// IDENTITY HOOK - Derives user identity from Zustand (user) + TanStack Query (shopper)
// =============================================================================

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  shopperStatus?: string;
}

/**
 * Get current user identity - combines auth user from Zustand with shopper profile from TanStack Query
 * This is the single source of truth for user identity in the app
 */
export function useGetIdentity<T = AuthUser>() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Get shopper data from TanStack Query cache
  const { data: shopperData, loading: shopperLoading } = useShopperProfile();
  const shopper = shopperData?.shopper;

  // Derive identity from user + shopper
  const data: AuthUser | null = user
    ? {
        id: user.id,
        name: shopper ? `${shopper.firstName} ${shopper.lastName}`.trim() || user.name : user.name,
        email: user.email,
        avatar: shopper?.avatarUrl || user.image || undefined,
        shopperStatus: shopper?.kycStatus,
      }
    : null;

  return {
    data: data as T | null,
    isLoading: isAuthenticated && shopperLoading,
  };
}

// Shopper Stats
export function useShopperStats() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.shopperStats,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.shoppers.getShopperStats();
    },
    enabled: isAuthenticated,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Shopper Earnings History
export function useEarningsHistory(period?: "daily" | "weekly" | "monthly") {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.earningsHistory(period || "monthly"),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.shoppers.getEarningsHistory({ period: period || "monthly" });
    },
    enabled: isAuthenticated,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * @deprecated KYC status endpoint removed in API v2.1. KYC data is now in shopper profile.
 * Use useShopperProfile() and access shopper.kycStatus, shopper.panVerified, shopper.kycRejectionReason
 */
export function useKYCStatus() {
  console.warn("useKYCStatus is deprecated. Use useShopperProfile() instead - KYC data is now in shopper profile.");
  return {
    data: null,
    loading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}

// =============================================================================
// CAMPAIGN HOOKS
// =============================================================================

// Campaigns List
export function useCampaigns(params?: {
  cursor?: string;
  limit?: number;
  platformId?: string;
  categoryId?: string;
  q?: string;
  featured?: boolean;
  sort?: "trending" | "recent";
  status?: "active" | "ended";
}) {
  const query = useQuery({
    queryKey: queryKeys.campaigns(params),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.campaigns.listCampaigns(params || {});
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Infinite Campaigns List
export function useInfiniteCampaigns(params?: {
  limit?: number;
  platformId?: string;
  categoryId?: string;
  q?: string;
  featured?: boolean;
  sort?: "trending" | "recent";
  status?: "active" | "ended";
}) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.campaigns(params),
    queryFn: async ({ pageParam }) => {
      const client = getAuthenticatedClient();
      return client.campaigns.listCampaigns({
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

  // Flatten pages into single array
  const data = query.data?.pages.flatMap(page => page.data || []) ?? [];

  return {
    data,
    loading: query.isLoading,
    loadingMore: query.isFetchingNextPage,
    error: query.error,
    hasMore: query.hasNextPage ?? false,
    loadMore: () => query.fetchNextPage(),
    refetch: query.refetch,
  };
}

// Single Campaign
export function useCampaign(id: string) {
  const query = useQuery({
    queryKey: queryKeys.campaign(id),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.campaigns.getCampaign(id);
    },
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Campaign Pricing
export function useCampaignPricing(id: string) {
  const query = useQuery({
    queryKey: queryKeys.campaignPricing(id),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.campaigns.getCampaignPricing(id);
    },
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * @deprecated Campaign deliverables/tasks are now included in campaign detail response.
 * Use useCampaign(id) and access campaign.tasks instead.
 */
export function useCampaignDeliverables(_params?: {
  skip?: number;
  take?: number;
  platformId?: string;
  category?: string;
}) {
  console.warn("useCampaignDeliverables is deprecated. Tasks are now included in campaign detail response.");
  return {
    data: null,
    loading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}

// Calculate Payout Estimate
export function usePayoutEstimate(campaignId: string, orderValue: number) {
  const query = useQuery({
    queryKey: ["payout-estimate", campaignId, orderValue],
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.campaigns.calculatePayoutEstimate(campaignId, { orderValue });
    },
    enabled: !!campaignId && orderValue > 0,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * @deprecated Coupon endpoint removed in API v2.1. Use validateCoupon during enrollment flow instead.
 */
export function useAvailableCoupons(_campaignId: string) {
  console.warn("useAvailableCoupons is deprecated. Use validateCoupon during enrollment flow instead.");
  return {
    data: null,
    loading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}

/**
 * @deprecated Use useCampaigns({ featured: true, limit }) instead
 * Active Campaigns (featured/trending for dashboard)
 */
export function useActiveCampaigns(limit = 4) {
  const query = useQuery({
    queryKey: queryKeys.activeCampaigns(limit),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      const result = await client.campaigns.listCampaigns({
        limit,
        featured: true,
        status: "active",
      });
      return result.data || [];
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// =============================================================================
// ENROLLMENT HOOKS
// =============================================================================

// Enriched enrollment type with campaign data and tasks
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
  tasks?: {
    enrollmentTaskId: string;
    name: string;
    requireLink: boolean;
    requireScreenshot: boolean;
    isRequired: boolean;
    instructions?: string;
    proofLink?: string;
    proofScreenshot?: string;
    platformName?: string;
  }[];
}

// Enrollments List with campaign enrichment
export function useEnrollments(params?: {
  cursor?: string;
  limit?: number;
  status?: shared.EnrollmentStatus;
  campaignId?: string;
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.enrollments(params),
    enabled: isAuthenticated,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      const result = await client.enrollments.listEnrollments(params || {});

      // Campaign data is now embedded in the enrollment response from backend
      const enrichedData: EnrichedEnrollment[] = result.data.map((enrollment) => {
        const e = enrollment as enrollments.Enrollment & {
          campaign?: {
            title: string;
            product?: { name: string; primaryImage?: string };
            platform?: { name: string; icon?: string };
          };
        };
        return {
          ...enrollment,
          campaign: e.campaign
            ? {
                title: e.campaign.title,
                product: e.campaign.product
                  ? {
                      name: e.campaign.product.name,
                      primaryImage: e.campaign.product.primaryImage,
                    }
                  : undefined,
                platform: e.campaign.platform
                  ? {
                      name: e.campaign.platform.name,
                      icon: e.campaign.platform.icon,
                    }
                  : undefined,
              }
            : undefined,
        };
      });

      return {
        data: enrichedData,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      };
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Infinite Enrollments List
export function useInfiniteEnrollments(params?: {
  limit?: number;
  status?: shared.EnrollmentStatus;
  campaignId?: string;
  q?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "orderValue" | "payout";
  sortOrder?: "asc" | "desc";
}) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.enrollments(params),
    queryFn: async ({ pageParam }) => {
      const client = getAuthenticatedClient();
      const result = await client.enrollments.listEnrollments({
        ...params,
        cursor: pageParam as string | undefined,
      });

      // Campaign data is now embedded in the API response
      const enrichedEnrollments: EnrichedEnrollment[] = result.data.map((enrollment) => {
        return {
          ...enrollment,
          campaign: enrollment.campaign
            ? {
                title: enrollment.campaign.title,
                product: enrollment.campaign.product
                  ? {
                      name: enrollment.campaign.product.name,
                      primaryImage: enrollment.campaign.product.primaryImage,
                    }
                  : undefined,
                platform: enrollment.campaign.platform
                  ? {
                      name: enrollment.campaign.platform.name,
                      icon: enrollment.campaign.platform.icon,
                    }
                  : undefined,
              }
            : undefined,
        };
      });

      return {
        data: enrichedEnrollments,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });

  // Flatten pages into single array
  const data = query.data?.pages.flatMap((page) => page.data || []) ?? [];

  return {
    data,
    loading: query.isLoading,
    loadingMore: query.isFetchingNextPage,
    error: query.error,
    hasMore: query.hasNextPage ?? false,
    loadMore: () => query.fetchNextPage(),
    refetch: query.refetch,
  };
}

// Single Enrollment
export function useEnrollment(id: string) {
  const query = useQuery({
    queryKey: queryKeys.enrollment(id),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.enrollments.getEnrollment(id);
    },
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Enrollment Detail (consolidated - uses getEnrollment which returns full detail)
export function useEnrollmentDetail(id: string) {
  const query = useQuery({
    queryKey: queryKeys.enrollmentDetail(id),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.enrollments.getEnrollment(id);
    },
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Enrollment Pricing
export function useEnrollmentPricing(id: string) {
  const query = useQuery({
    queryKey: queryKeys.enrollmentPricing(id),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.enrollments.getEnrollmentPricing(id);
    },
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// =============================================================================
// PRODUCT HOOKS
// =============================================================================

// Products List
export function useProducts(params?: products.ListProductsParams) {
  const query = useQuery({
    queryKey: queryKeys.products(params as Record<string, unknown>),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.products.listProducts(params || {});
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Single Product by ID or Slug
export function useProduct(idOrSlug: string | undefined) {
  const query = useQuery({
    queryKey: queryKeys.product(idOrSlug || ""),
    queryFn: async () => {
      if (!idOrSlug) throw new Error("Product ID or slug is required");
      const client = getAuthenticatedClient();
      return client.products.getProduct(idOrSlug);
    },
    enabled: !!idOrSlug,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Product Categories
export function useProductCategories() {
  const query = useQuery({
    queryKey: queryKeys.productCategories,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      const result = await client.products.listCategories({});
      return { categories: result.data };
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * @deprecated Use useProduct(id) instead - this is a duplicate hook
 * Product by ID (for campaign product lookup)
 */
export function useProductById(id: string | undefined) {
  return useProduct(id || "");
}

// Product Category by ID
export function useProductCategory(id: string | undefined) {
  const query = useQuery({
    queryKey: ["product-category", id],
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.products.getCategory(id!);
    },
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// =============================================================================
// PLATFORM HOOKS
// =============================================================================

// Platforms List
export function usePlatforms() {
  const query = useQuery({
    queryKey: queryKeys.platforms,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      const result = await client.platforms.listPlatforms({ status: "active" });
      return { platforms: result.data };
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Single Platform by ID
export function usePlatform(id: string | undefined) {
  const query = useQuery({
    queryKey: queryKeys.platform(id || ""),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.platforms.getPlatform(id!);
    },
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// =============================================================================
// WALLET HOOKS
// =============================================================================

// Wallet Details
export function useWallet() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.wallet,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.wallets.getMyWallet();
    },
    enabled: isAuthenticated,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Wallet Transactions
export function useWalletTransactions(params?: {
  skip?: number;
  take?: number;
  type?: "credit" | "debit";
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.walletTransactions(params),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.wallets.getWalletTransactions(params || {});
    },
    enabled: isAuthenticated,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

// Single Wallet Transaction
export function useWalletTransaction(transactionId: string | undefined) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.walletTransaction(transactionId || ""),
    queryFn: async () => {
      if (!transactionId) throw new Error("Transaction ID required");
      const client = getAuthenticatedClient();
      return client.wallets.getWalletTransaction(transactionId);
    },
    enabled: isAuthenticated && !!transactionId,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? getAPIErrorMessage(query.error, "Failed to load transaction") : null,
    refetch: query.refetch,
  };
}

// Withdrawals List
export function useWithdrawals(params?: {
  skip?: number;
  take?: number;
  status?: shared.WithdrawalStatus;
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.withdrawals(params),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.wallets.listMyWithdrawals(params || {});
    },
    enabled: isAuthenticated,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Single Withdrawal
export function useWithdrawal(id: string) {
  const query = useQuery({
    queryKey: queryKeys.withdrawal(id),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.wallets.getWithdrawal(id);
    },
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Withdrawal Methods
export function useWithdrawalMethods() {
  const query = useQuery({
    queryKey: queryKeys.withdrawalMethods,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.wallets.listWithdrawalMethods();
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

// Single Withdrawal Method
export function useWithdrawalMethod(id: string) {
  const query = useQuery({
    queryKey: queryKeys.withdrawalMethod(id),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.wallets.getWithdrawalMethod(id);
    },
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Withdrawal Stats
export function useWithdrawalStats(params?: {
  organizationId?: string;
  shopperId?: string;
  holderType?: "organization" | "shopper";
  holderId?: string;
}) {
  const query = useQuery({
    queryKey: queryKeys.withdrawalStats(params),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.wallets.getWithdrawalStats(params || {});
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// =============================================================================
// NOTIFICATION HOOKS
// =============================================================================

// Notification Preferences
export function useNotificationPreferences() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.notificationPreferences,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.notifications.getNotificationPreferences();
    },
    enabled: isAuthenticated,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Unread Notification Count
export function useUnreadNotificationCount() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.unreadNotificationCount,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.notifications.getUnreadCount();
    },
    enabled: isAuthenticated,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// =============================================================================
// SEARCH TYPES (Custom - not in generated client)
// =============================================================================

/** Product info for search results */
export interface SearchProductInfo {
  id: string;
  name: string;
  priceDecimal?: string;
  primaryImage?: string;
}

/** Organization info for search results */
export interface SearchOrganizationInfo {
  id: string;
  name: string;
  logo?: string;
}

/** Platform info for search results */
export interface SearchPlatformInfo {
  id: string;
  name: string;
  icon?: string;
}

/** Campaign info for search results */
export interface SearchCampaignInfo {
  id: string;
  title: string;
}

/** Unified search result - single structure for all types */
export interface SearchResult {
  /** Result type: campaign, enrollment, or transaction */
  resultType: "campaign" | "enrollment" | "transaction";
  /** Resource ID */
  id: string;
  /** Display title (campaign title, order ID, or transaction description) */
  title: string;
  /** Optional description */
  description?: string;
  /** Status string */
  status: string;
  /** Created/requested timestamp */
  createdAt: string;
  /** Amount in decimal format (bonus, order value, or transaction amount) */
  amountDecimal?: string;
  /** Secondary amount (e.g., product price for campaigns, bonus for enrollments) */
  secondaryAmountDecimal?: string;
  /** For campaigns: current enrollments */
  currentCount?: number;
  /** For campaigns: max enrollments */
  maxCount?: number;
  /** Processed/approved timestamp */
  processedAt?: string;
  /** Expiry timestamp */
  expiresAt?: string;
  /** Product info (for campaigns and enrollments) */
  product?: SearchProductInfo;
  /** Organization info (for campaigns) */
  organization?: SearchOrganizationInfo;
  /** Platform info (for campaigns) */
  platform?: SearchPlatformInfo;
  /** Campaign info (for enrollments and transactions) */
  campaign?: SearchCampaignInfo;
  /** Fields that matched the search query */
  matchedFields: string[];
  /** Transaction type: credit or debit (for transactions) */
  transactionType?: "credit" | "debit";
  /** Transaction category (for transactions) */
  transactionCategory?: "enrollment_hold" | "deposit" | "payout" | "refund" | "admin_credit" | "other";
}

/** Search facets - counts per type */
export interface SearchFacets {
  campaigns: number;
  enrollments: number;
  transactions: number;
}

/** Unified search response */
export interface UnifiedSearchResponse {
  data: SearchResult[];
  nextCursor: string | null;
  hasMore: boolean;
  facets: SearchFacets;
  query: string;
}

/** Search params */
export interface UnifiedSearchParams {
  /** Search query - searches across all resource types (2-200 chars) */
  q: string;
  /** Pagination cursor (base64 encoded) */
  cursor?: string;
  /** Page size (1-50) */
  limit?: number;
}

// =============================================================================
// SEARCH API CALL (Custom - not in generated client)
// =============================================================================

/**
 * Direct API call to search endpoint since it's not in the generated client
 */
async function fetchUnifiedSearch(params: UnifiedSearchParams): Promise<UnifiedSearchResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No auth token found");
  }

  const queryParams = new URLSearchParams();
  queryParams.set("q", params.q);
  if (params.cursor) queryParams.set("cursor", params.cursor);
  if (params.limit) queryParams.set("limit", String(params.limit));

  const response = await fetch(`${API_URL}/search?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Search failed with status ${response.status}`);
  }

  return response.json();
}

// =============================================================================
// SEARCH HOOKS
// =============================================================================

// Unified Search - searches across campaigns, enrollments, and transactions
export function useUnifiedSearch(params: UnifiedSearchParams | null) {
  const query = useQuery({
    queryKey: ["search", "unified", params?.q, params?.cursor, params?.limit],
    queryFn: async () => {
      if (!params) throw new Error("Params required");
      return fetchUnifiedSearch(params);
    },
    enabled: !!params?.q?.trim() && params.q.trim().length >= 2,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Infinite Unified Search
export function useInfiniteUnifiedSearch(params?: Omit<UnifiedSearchParams, "cursor">) {
  const query = useInfiniteQuery({
    queryKey: ["search", "unified", "infinite", params?.q, params?.limit],
    queryFn: async ({ pageParam }) => {
      return fetchUnifiedSearch({
        ...params,
        q: params?.q || "",
        cursor: pageParam as string | undefined,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!params?.q?.trim() && params.q.trim().length >= 2,
  });

  // Flatten pages into single array
  const data = query.data?.pages.flatMap((page) => page.data || []) ?? [];
  const facets = query.data?.pages[0]?.facets ?? null;

  return {
    data,
    loading: query.isLoading,
    loadingMore: query.isFetchingNextPage,
    error: query.error,
    hasMore: query.hasNextPage ?? false,
    loadMore: () => query.fetchNextPage(),
    refetch: query.refetch,
    facets,
  };
}

// =============================================================================
// AUTH/SESSION HOOKS
// =============================================================================

// List all active sessions (basic)
export function useSessions() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.sessions,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.auth.listSessions();
    },
    enabled: isAuthenticated,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// List all device sessions (with device info)
export function useDeviceSessions() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = useQuery({
    queryKey: [...queryKeys.sessions, "devices"],
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.auth.listDeviceSessions();
    },
    enabled: isAuthenticated,
  });

  return {
    data: query.data?.sessions ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Revoke a specific device session
export function useRevokeDeviceSession() {
  const queryClient = useQueryClient();
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revoke = async (sessionToken: string) => {
    setRevoking(true);
    setError(null);

    try {
      const client = getAuthenticatedClient();
      await client.auth.revokeDeviceSession({ sessionToken });
      // Invalidate sessions query to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to revoke session";
      setError(message);
      return false;
    } finally {
      setRevoking(false);
    }
  };

  return { revoke, revoking, error };
}

// Revoke all other sessions (keep current)
export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revokeAll = async () => {
    setRevoking(true);
    setError(null);

    try {
      const client = getAuthenticatedClient();
      await client.auth.revokeOtherSessions();
      // Invalidate sessions query to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to revoke sessions";
      setError(message);
      return false;
    } finally {
      setRevoking(false);
    }
  };

  return { revokeAll, revoking, error };
}

// =============================================================================
// COUPON HOOKS (Extended)
// =============================================================================

/**
 * @deprecated getCouponByCode removed in API v2.1. Use useValidateCoupon() instead.
 */
export function useCouponByCode(_code: string | null) {
  console.warn("useCouponByCode is deprecated. Use useValidateCoupon() instead.");
  return {
    data: null,
    loading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}

/**
 * @deprecated getMyRedemptions removed in API v2.1.
 */
export function useMyRedemptions(_params?: { cursor?: string; limit?: number }) {
  console.warn("useMyRedemptions is deprecated. Coupon redemptions endpoint removed in API v2.1.");
  return {
    data: null,
    loading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}

// Validate coupon for enrollment (used during enrollment creation)
// This is the ONLY coupon endpoint remaining in API v2.1
export function useValidateCoupon() {
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<coupons.ValidateCouponResponse | null>(null);

  const validate = async (params: { code: string }) => {
    setValidating(true);
    setError(null);
    setResult(null);

    try {
      const client = getAuthenticatedClient();
      const response = await client.coupons.validateCoupon(params);
      setResult(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to validate coupon";
      setError(message);
      return null;
    } finally {
      setValidating(false);
    }
  };

  const reset = () => {
    setError(null);
    setResult(null);
  };

  return { validate, validating, error, result, reset };
}

/**
 * @deprecated applyCoupon removed in API v2.1. Pass couponCode to createEnrollment instead.
 */
export function useApplyCoupon() {
  console.warn("useApplyCoupon is deprecated. Pass couponCode to createEnrollment instead.");
  return {
    apply: async (_couponId: string, _enrollmentId: string) => {
      throw new Error("applyCoupon endpoint removed. Pass couponCode to createEnrollment instead.");
    },
    applying: false,
    error: null,
    reset: () => {},
  };
}

/**
 * @deprecated removeCouponFromEnrollment removed in API v2.1. Contact admin for edge cases.
 */
export function useRemoveCoupon() {
  console.warn("useRemoveCoupon is deprecated. Contact admin for coupon removal.");
  return {
    remove: async (_enrollmentId: string) => {
      throw new Error("removeCouponFromEnrollment endpoint removed. Contact admin.");
    },
    removing: false,
    error: null,
    reset: () => {},
  };
}

// =============================================================================
// PRODUCT HOOKS (Extended)
// =============================================================================

// Get products by category
export function useCategoryProducts(categoryId: string | null, params?: { skip?: number; take?: number }) {
  const query = useQuery({
    queryKey: queryKeys.categoryProducts(categoryId || "", params),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.products.getCategoryProducts(categoryId!, params || {});
    },
    enabled: !!categoryId,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// =============================================================================
// CAMPAIGN HOOKS (Extended)
// =============================================================================

// Get single task template
export function useTaskTemplate(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.taskTemplate(id || ""),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.campaigns.getTaskTemplate(id!);
    },
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * List task templates (global task types available for campaigns)
 */
export function useTaskTemplates(params?: {
  skip?: number;
  take?: number;
  platformId?: string;
  category?: shared.TaskCategory;
}) {
  const query = useQuery({
    queryKey: ["task-templates", params],
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.campaigns.listTaskTemplates({
        skip: params?.skip,
        take: params?.take ?? 10,
        platformId: params?.platformId,
        category: params?.category,
      });
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * @deprecated Use useTaskTemplate instead
 */
export function useDeliverable(id: string | null) {
  console.warn("useDeliverable is deprecated. Use useTaskTemplate instead.");
  return useTaskTemplate(id);
}

// =============================================================================
// ERROR HANDLING UTILITIES
// =============================================================================

// Error code to user-friendly message mapping
const ERROR_MESSAGES: Record<string, string> = {
  // Withdrawal errors
  insufficient_balance: "Insufficient balance for this withdrawal",
  minimum_withdrawal_not_met: "Minimum withdrawal is ₹100",
  maximum_withdrawal_exceeded: "Amount exceeds maximum withdrawal limit",
  withdrawal_method_not_verified: "This payment method is not verified",
  withdrawal_method_not_found: "Payment method not found",
  daily_withdrawal_limit_exceeded: "Daily withdrawal limit exceeded",
  withdrawal_already_processing: "You already have a withdrawal in progress",

  // Enrollment errors
  already_enrolled: "You are already enrolled in this campaign",
  already_exists: "You have already enrolled with this order ID",
  campaign_not_active: "This campaign is no longer active",
  campaign_full: "This campaign has reached its enrollment limit",
  invalid_order: "Order details could not be verified",
  order_already_used: "This order has already been used for enrollment",
  scan_expired: "Scan has expired, please upload again",

  // Auth errors
  invalid_credentials: "Invalid email or password",
  email_already_exists: "An account with this email already exists",
  weak_password: "Password is too weak",
  invalid_token: "Invalid or expired token",
  session_expired: "Your session has expired, please login again",

  // Service errors (API v2)
  resource_exhausted: "Too many requests. Please try again in a moment.",
  unavailable: "Service temporarily unavailable. Please try again.",

  // General errors
  not_found: "Resource not found",
  permission_denied: "You don't have permission to perform this action",
  rate_limited: "Too many requests, please try again later",
  validation_error: "Invalid input data",
  invalid_argument: "Invalid input data",
};

/**
 * Extract user-friendly error message from API error
 */
export function getAPIErrorMessage(error: unknown, fallback: string): string {
  if (isAPIError(error)) {
    // Check for specific error code mapping
    const codeMessage = ERROR_MESSAGES[error.code];
    if (codeMessage) return codeMessage;

    // Fall back to API message
    if (error.message) return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

/**
 * Get error code from API error
 */
export function getAPIErrorCode(error: unknown): ErrCode | null {
  if (isAPIError(error)) {
    return error.code;
  }
  return null;
}

/**
 * Check if error is a specific type
 */
export function isErrorCode(error: unknown, code: ErrCode | string): boolean {
  if (isAPIError(error)) {
    return error.code === code;
  }
  return false;
}

// =============================================================================
// MUTATION HOOKS - For state-changing operations
// =============================================================================

// -----------------------------------------------------------------------------
// WITHDRAWAL MUTATIONS
// -----------------------------------------------------------------------------

export interface CreateWithdrawalParams {
  amount: number; // Amount in rupees (will be converted to paise)
  withdrawalMethodId: string;
}

export interface CreateWithdrawalResult {
  success: boolean;
  withdrawal?: wallets.Withdrawal;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Create a new withdrawal request
 * - Validates amount (min 1 rupee, converts to paise)
 * - Handles specific API error codes
 * - Invalidates wallet and withdrawal queries on success
 */
export function useCreateWithdrawal() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: CreateWithdrawalParams): Promise<wallets.Withdrawal> => {
      const client = getAuthenticatedClient();

      // Validate amount (minimum 100 rupees as per API v2)
      if (params.amount < 100) {
        throw new Error("Minimum withdrawal amount is ₹100");
      }

      // Convert to paise with proper rounding
      const amountInPaise = Math.round(params.amount * 100);

      return client.wallets.createWithdrawal({
        amount: amountInPaise,
        withdrawalMethodId: params.withdrawalMethodId,
      });
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
      queryClient.invalidateQueries({ queryKey: ["wallet", "withdrawals"] });
    },
  });

  const createWithdrawal = async (params: CreateWithdrawalParams): Promise<CreateWithdrawalResult> => {
    try {
      const withdrawal = await mutation.mutateAsync(params);
      return { success: true, withdrawal };
    } catch (error) {
      return {
        success: false,
        error: {
          code: getAPIErrorCode(error) || "unknown",
          message: getAPIErrorMessage(error, "Failed to create withdrawal"),
        },
      };
    }
  };

  return {
    createWithdrawal,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to create withdrawal") : null,
    reset: mutation.reset,
  };
}

// -----------------------------------------------------------------------------
// ENROLLMENT MUTATIONS
// -----------------------------------------------------------------------------

export interface CreateEnrollmentParams {
  scanId: string;
  couponCode?: string;
}

export interface CreateEnrollmentResult {
  success: boolean;
  enrollmentId?: string;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Create a new campaign enrollment
 * - Requires a valid scan ID from scanOrder
 * - Optional coupon code
 * - Invalidates enrollment and campaign queries on success
 */
export function useCreateEnrollment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: CreateEnrollmentParams) => {
      const client = getAuthenticatedClient();
      return client.enrollments.createEnrollment({
        scanId: params.scanId,
        couponCode: params.couponCode,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.shopperStats });
    },
  });

  const createEnrollment = async (params: CreateEnrollmentParams): Promise<CreateEnrollmentResult> => {
    try {
      const result = await mutation.mutateAsync(params);
      return { success: true, enrollmentId: result.id };
    } catch (error) {
      return {
        success: false,
        error: {
          code: getAPIErrorCode(error) || "unknown",
          message: getAPIErrorMessage(error, "Failed to create enrollment"),
        },
      };
    }
  };

  return {
    createEnrollment,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to create enrollment") : null,
    reset: mutation.reset,
  };
}

export interface SubmitTasksParams {
  enrollmentId: string;
  submissions: Array<{
    enrollmentTaskId: string;
    proofLink?: string;
    proofScreenshot?: string;
  }>;
}

/**
 * Submit tasks for an enrollment
 * - Validates that at least one submission is provided
 * - Invalidates enrollment queries on success
 */
export function useSubmitTasks() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: SubmitTasksParams) => {
      const client = getAuthenticatedClient();

      if (!params.submissions.length) {
        throw new Error("At least one task submission is required");
      }

      return client.enrollments.submitTasks(params.enrollmentId, {
        submissions: params.submissions,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollment(variables.enrollmentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollmentDetail(variables.enrollmentId) });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });

  return {
    submitTasks: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to submit tasks") : null,
    reset: mutation.reset,
  };
}

/**
 * @deprecated Use useSubmitTasks instead - deliverables renamed to tasks
 */
export function useSubmitDeliverables() {
  console.warn("useSubmitDeliverables is deprecated. Use useSubmitTasks instead.");
  const { submitTasks, ...rest } = useSubmitTasks();
  return {
    submitDeliverables: async (params: { enrollmentId: string; submissions: Array<{ campaignDeliverableId: string; proofLink?: string; proofScreenshot?: string }> }) => {
      return submitTasks({
        enrollmentId: params.enrollmentId,
        submissions: params.submissions.map(s => ({
          enrollmentTaskId: s.campaignDeliverableId,
          proofLink: s.proofLink,
          proofScreenshot: s.proofScreenshot,
        })),
      });
    },
    ...rest,
  };
}

/**
 * Update a single task submission
 */
export function useUpdateTaskSubmission() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: {
      enrollmentId: string;
      taskId: string;
      data: { proofLink?: string; proofScreenshot?: string };
    }) => {
      const client = getAuthenticatedClient();
      return client.enrollments.updateTaskSubmission(
        params.enrollmentId,
        params.taskId,
        params.data
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollment(variables.enrollmentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollmentDetail(variables.enrollmentId) });
    },
  });

  return {
    updateTask: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to update task") : null,
    reset: mutation.reset,
  };
}

/**
 * @deprecated Use useUpdateTaskSubmission instead
 */
export function useUpdateDeliverable() {
  console.warn("useUpdateDeliverable is deprecated. Use useUpdateTaskSubmission instead.");
  const { updateTask, ...rest } = useUpdateTaskSubmission();
  return {
    updateDeliverable: async (params: { enrollmentId: string; deliverableId: string; data: { proofLink?: string; proofScreenshot?: string } }) => {
      return updateTask({
        enrollmentId: params.enrollmentId,
        taskId: params.deliverableId,
        data: params.data,
      });
    },
    ...rest,
  };
}

/**
 * Clear a task submission
 */
export function useClearTaskSubmission() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: { enrollmentId: string; taskId: string }) => {
      const client = getAuthenticatedClient();
      return client.enrollments.clearTaskSubmission(params.enrollmentId, params.taskId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollment(variables.enrollmentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollmentDetail(variables.enrollmentId) });
    },
  });

  return {
    clearTask: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to clear task") : null,
    reset: mutation.reset,
  };
}

/**
 * @deprecated Use useClearTaskSubmission instead
 */
export function useDeleteDeliverable() {
  console.warn("useDeleteDeliverable is deprecated. Use useClearTaskSubmission instead.");
  const { clearTask, ...rest } = useClearTaskSubmission();
  return {
    deleteDeliverable: async (params: { enrollmentId: string; deliverableId: string }) => {
      return clearTask({
        enrollmentId: params.enrollmentId,
        taskId: params.deliverableId,
      });
    },
    ...rest,
  };
}

/**
 * Withdraw from an enrollment
 */
export function useWithdrawEnrollment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      const client = getAuthenticatedClient();
      return client.enrollments.withdrawEnrollment(enrollmentId);
    },
    onSuccess: (_, enrollmentId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollment(enrollmentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollmentDetail(enrollmentId) });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });

  return {
    withdrawEnrollment: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to withdraw enrollment") : null,
    reset: mutation.reset,
  };
}

/**
 * Resubmit an enrollment for review
 */
export function useResubmitEnrollment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      const client = getAuthenticatedClient();
      return client.enrollments.resubmitEnrollment(enrollmentId);
    },
    onSuccess: (_, enrollmentId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollment(enrollmentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollmentDetail(enrollmentId) });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });

  return {
    resubmitEnrollment: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to resubmit enrollment") : null,
    reset: mutation.reset,
  };
}

// -----------------------------------------------------------------------------
// SCAN ORDER WITH POLLING
// -----------------------------------------------------------------------------

export interface ScanOrderParams {
  campaignId: string;
  screenshotUrl: string;
  onStageChange?: (stage: "uploading" | "processing" | "extracting" | "validating") => void;
  signal?: AbortSignal;
}

export interface ScanOrderResult {
  success: boolean;
  scanResult?: enrollments.ScanOrderResult;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Scan an order screenshot with polling support
 * - Supports AbortController for cancellation
 * - Exponential backoff for polling
 * - Reports scan stages via callback
 */
export function useScanOrder() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scanOrder = useCallback(async (params: ScanOrderParams): Promise<ScanOrderResult> => {
    const { campaignId, screenshotUrl, onStageChange, signal } = params;

    // Create internal abort controller if not provided
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Link to external signal if provided
    if (signal) {
      signal.addEventListener("abort", () => abortController.abort());
    }

    setIsPending(true);
    setError(null);

    try {
      const client = getAuthenticatedClient();

      onStageChange?.("processing");

      const result = await client.enrollments.scanOrder({ campaignId, screenshotUrl });

      // Check for abort
      if (abortController.signal.aborted) {
        return { success: false, error: { code: "aborted", message: "Scan was cancelled" } };
      }

      // Completed immediately
      if (result.status === "completed") {
        onStageChange?.("validating");
        return { success: true, scanResult: result };
      }

      // Failed immediately
      if (result.status === "failed") {
        return {
          success: false,
          scanResult: result,
          error: {
            code: "scan_failed",
            message: result.errorMessage || "Failed to scan receipt",
          },
        };
      }

      // Need to poll for status
      if (result.scanId && (result.status === "pending" || result.status === "processing")) {
        onStageChange?.("extracting");

        const pollResult = await pollScanStatusWithBackoff(
          client,
          result.scanId,
          onStageChange,
          abortController.signal
        );

        if (!pollResult) {
          return {
            success: false,
            error: { code: "timeout", message: "Scan timed out. Please try again." },
          };
        }

        if (pollResult.status === "completed") {
          return { success: true, scanResult: pollResult };
        }

        return {
          success: false,
          scanResult: pollResult,
          error: {
            code: "scan_failed",
            message: pollResult.errorMessage || "Failed to scan receipt",
          },
        };
      }

      return {
        success: false,
        error: { code: "unexpected_status", message: "Unexpected scan status" },
      };
    } catch (err) {
      if (abortController.signal.aborted) {
        return { success: false, error: { code: "aborted", message: "Scan was cancelled" } };
      }

      const message = getAPIErrorMessage(err, "Failed to scan receipt");
      setError(message);
      return {
        success: false,
        error: {
          code: getAPIErrorCode(err) || "unknown",
          message,
        },
      };
    } finally {
      setIsPending(false);
      abortControllerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setError(null);
    abortControllerRef.current?.abort();
  }, []);

  return {
    scanOrder,
    cancel,
    reset,
    isPending,
    error,
  };
}

/**
 * Poll scan status with exponential backoff
 */
async function pollScanStatusWithBackoff(
  client: ReturnType<typeof getAuthenticatedClient>,
  scanId: string,
  onStageChange?: (stage: "uploading" | "processing" | "extracting" | "validating") => void,
  signal?: AbortSignal,
  maxAttempts = 20,
  initialDelayMs = 1000,
  maxDelayMs = 8000
): Promise<enrollments.ScanOrderResult | null> {
  let attempts = 0;
  let delay = initialDelayMs;

  while (attempts < maxAttempts) {
    // Check for abort
    if (signal?.aborted) {
      return null;
    }

    try {
      // Update stage based on progress
      if (attempts >= 2 && attempts < 6) {
        onStageChange?.("extracting");
      } else if (attempts >= 6) {
        onStageChange?.("validating");
      }

      const status = await client.enrollments.getScanStatus(scanId);

      if (status.status === "completed" || status.status === "failed") {
        if (status.status === "completed") {
          onStageChange?.("validating");
        }
        return {
          scanId,
          status: status.status,
          extractedData: status.extractedData,
          confidence: status.confidence,
          errorMessage: status.errorMessage,
        } as enrollments.ScanOrderResult;
      }

      // Wait with exponential backoff
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(resolve, delay);
        signal?.addEventListener("abort", () => {
          clearTimeout(timeoutId);
          reject(new Error("Aborted"));
        });
      });

      // Exponential backoff with cap
      delay = Math.min(delay * 1.5, maxDelayMs);
      attempts++;
    } catch {
      // If aborted, return null
      if (signal?.aborted) {
        return null;
      }
      // For other errors, continue polling
      attempts++;
    }
  }

  return null;
}

// -----------------------------------------------------------------------------
// FILE UPLOAD WITH SIGNED URL + CLIENT-SIDE COMPRESSION
// -----------------------------------------------------------------------------

import imageCompression from "browser-image-compression";

/**
 * Compress image on client-side before upload
 */
async function compressImage(file: File, options?: {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}): Promise<{ compressedFile: File; originalSize: number; compressedSize: number }> {
  const originalSize = file.size;

  // Skip compression for non-images or small files
  if (!file.type.startsWith("image/") || file.size < 100 * 1024) {
    return { compressedFile: file, originalSize, compressedSize: file.size };
  }

  const compressedFile = await imageCompression(file, {
    maxSizeMB: options?.maxSizeMB ?? 1,
    maxWidthOrHeight: options?.maxWidthOrHeight ?? 1920,
    useWebWorker: true,
    fileType: file.type as "image/jpeg" | "image/png" | "image/webp",
  });

  return {
    compressedFile,
    originalSize,
    compressedSize: compressedFile.size,
  };
}

/**
 * Upload file to S3 using pre-signed URL with XMLHttpRequest for progress tracking
 */
async function uploadToS3WithProgress(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });
}

// -----------------------------------------------------------------------------

export interface UploadFileParams {
  file: File;
  folder?: "uploads" | "profile-pictures" | "kyc-documents";
  maxRetries?: number;
  onProgress?: (progress: number) => void;
  /** Max compressed size in MB (default: 1) */
  maxSizeMB?: number;
  /** Max width or height in pixels (default: 1920) */
  maxWidthOrHeight?: number;
}

export interface UploadFileResult {
  success: boolean;
  fileUrl?: string;
  key?: string;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: string;
  error?: string;
}

/**
 * Upload a file using signed URL with client-side compression
 * - Compresses image on client-side using browser-image-compression
 * - Gets pre-signed URL from backend
 * - Uploads directly to S3 with progress tracking
 * - Retries failed uploads with exponential backoff
 */
export function useFileUpload() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(async (params: UploadFileParams): Promise<UploadFileResult> => {
    const {
      file,
      folder = "uploads",
      maxRetries = 3,
      onProgress,
      maxSizeMB = 1,
      maxWidthOrHeight = 1920,
    } = params;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Please upload an image file" };
    }

    // Validate file size (10MB max before compression)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 10MB" };
    }

    setIsPending(true);
    setError(null);
    setProgress(0);

    let lastError: string = "Upload failed";
    let attempt = 0;
    let delay = 1000;

    while (attempt < maxRetries) {
      try {
        const client = getAuthenticatedClient();

        // Step 1: Compress image on client-side
        setProgress(10);
        onProgress?.(10);

        const { compressedFile, originalSize, compressedSize } = await compressImage(file, {
          maxSizeMB,
          maxWidthOrHeight,
        });

        // Step 2: Get pre-signed URL from backend
        setProgress(20);
        onProgress?.(20);

        let signedUrlResult;
        switch (folder) {
          case "profile-pictures":
            signedUrlResult = await client.storage.requestProfilePictureUploadUrl({
              filename: file.name,
            });
            break;
          case "kyc-documents":
            signedUrlResult = await client.storage.requestKycDocumentUploadUrl({
              filename: file.name,
            });
            break;
          default:
            signedUrlResult = await client.storage.requestUploadUrl({
              filename: file.name,
              contentType: compressedFile.type,
              folder,
            });
        }

        // Step 3: Upload to S3 with progress tracking
        await uploadToS3WithProgress(
          signedUrlResult.uploadUrl,
          compressedFile,
          compressedFile.type,
          (uploadProgress) => {
            // Map 0-100 to 20-100 (first 20% is compression + getting URL)
            const mappedProgress = 20 + Math.round(uploadProgress * 0.8);
            setProgress(mappedProgress);
            onProgress?.(mappedProgress);
          }
        );

        setProgress(100);
        onProgress?.(100);
        setIsPending(false);

        const compressionRatio = originalSize > 0
          ? `${((1 - compressedSize / originalSize) * 100).toFixed(1)}%`
          : "0%";

        return {
          success: true,
          fileUrl: signedUrlResult.fileUrl,
          key: signedUrlResult.key,
          originalSize,
          compressedSize,
          compressionRatio,
        };
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Upload failed";
        attempt++;

        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }

    setError(lastError);
    setIsPending(false);
    return { success: false, error: lastError };
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setProgress(0);
  }, []);

  return {
    uploadFile,
    reset,
    isPending,
    error,
    progress,
  };
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Safely validate and extract campaign data from enrollment
 */
export function validateEnrollmentCampaign(enrollment: enrollments.Enrollment & {
  campaign?: {
    title?: string;
    product?: { name?: string; primaryImage?: string };
    platform?: { name?: string; icon?: string };
  };
}): EnrichedEnrollment["campaign"] | undefined {
  if (!enrollment.campaign) return undefined;

  const campaign = enrollment.campaign;

  // Validate required fields
  if (!campaign.title) return undefined;

  return {
    title: campaign.title,
    product: campaign.product?.name
      ? {
          name: campaign.product.name,
          primaryImage: campaign.product.primaryImage,
        }
      : undefined,
    platform: campaign.platform?.name
      ? {
          name: campaign.platform.name,
          icon: campaign.platform.icon,
        }
      : undefined,
  };
}

// =============================================================================
// AUTH MUTATIONS
// =============================================================================

export interface ChangeEmailParams {
  newEmail: string;
  callbackURL?: string;
}

/**
 * Change user email - sends verification to new email
 */
export function useChangeEmail() {
  const mutation = useMutation({
    mutationFn: async (params: ChangeEmailParams) => {
      const client = getAuthenticatedClient();
      return client.auth.changeEmail({
        newEmail: params.newEmail,
        callbackURL: params.callbackURL || `${window.location.origin}/settings`,
      });
    },
  });

  return {
    changeEmail: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to change email") : null,
    reset: mutation.reset,
  };
}

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}

/**
 * Change user password
 */
export function useChangePassword() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: ChangePasswordParams) => {
      const client = getAuthenticatedClient();
      return client.auth.changePassword({
        currentPassword: params.currentPassword,
        newPassword: params.newPassword,
        revokeOtherSessions: params.revokeOtherSessions ?? false,
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate sessions if other sessions were revoked
      if (variables.revokeOtherSessions) {
        queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
      }
    },
  });

  return {
    changePassword: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to change password") : null,
    reset: mutation.reset,
  };
}

// =============================================================================
// SHOPPER MUTATIONS
// =============================================================================

export interface UpdateShopperProfileParams {
  displayName?: string;
  phoneNumber?: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  avatarUrl?: string;
}

/**
 * Update shopper profile
 */
export function useUpdateShopperProfile() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: UpdateShopperProfileParams) => {
      const client = getAuthenticatedClient();
      return client.shoppers.updateShopperProfile(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shopperProfile });
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to update profile") : null,
    reset: mutation.reset,
  };
}

export interface SubmitPANParams {
  panNumber: string;
}

export interface SubmitPANResult {
  verified: boolean;
  name?: string;
  error?: string;
}

/**
 * Submit PAN for KYC verification
 */
export function useSubmitPAN() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: SubmitPANParams): Promise<SubmitPANResult> => {
      const client = getAuthenticatedClient();
      return client.shoppers.submitPAN({ panNumber: params.panNumber.toUpperCase() });
    },
    onSuccess: (result) => {
      if (result.verified) {
        queryClient.invalidateQueries({ queryKey: queryKeys.kycStatus });
        queryClient.invalidateQueries({ queryKey: queryKeys.shopperProfile });
      }
    },
  });

  return {
    submitPAN: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to verify PAN") : null,
    reset: mutation.reset,
  };
}

// =============================================================================
// WITHDRAWAL METHOD MUTATIONS
// =============================================================================

export interface AddWithdrawalMethodParams {
  accountType: "bank_account" | "upi";
  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  upiId?: string;
}

/**
 * Add a new withdrawal method (bank account or UPI)
 */
export function useAddWithdrawalMethod() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: AddWithdrawalMethodParams) => {
      const client = getAuthenticatedClient();
      return client.wallets.addWithdrawalMethod(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawalMethods });
    },
  });

  return {
    addMethod: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to add payment method") : null,
    reset: mutation.reset,
  };
}

/**
 * Verify a withdrawal method
 */
export function useVerifyWithdrawalMethod() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const client = getAuthenticatedClient();
      return client.wallets.verifyWithdrawalMethod(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawalMethods });
    },
  });

  return {
    verifyMethod: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to verify payment method") : null,
    reset: mutation.reset,
  };
}

/**
 * Set a withdrawal method as default
 */
export function useSetDefaultWithdrawalMethod() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const client = getAuthenticatedClient();
      return client.wallets.setDefaultWithdrawalMethod(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawalMethods });
    },
  });

  return {
    setDefault: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to set default payment method") : null,
    reset: mutation.reset,
  };
}

/**
 * Delete a withdrawal method
 */
export function useDeleteWithdrawalMethod() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const client = getAuthenticatedClient();
      return client.wallets.deleteWithdrawalMethod(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawalMethods });
    },
  });

  return {
    deleteMethod: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to delete payment method") : null,
    reset: mutation.reset,
  };
}

/**
 * Cancel a pending withdrawal
 */
export function useCancelWithdrawal() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const client = getAuthenticatedClient();
      return client.wallets.cancelWithdrawal(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
      queryClient.invalidateQueries({ queryKey: ["wallet", "withdrawals"] });
    },
  });

  return {
    cancelWithdrawal: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to cancel withdrawal") : null,
    reset: mutation.reset,
  };
}

// =============================================================================
// CAMPAIGN MUTATIONS
// =============================================================================

/**
 * Calculate estimated payout for a campaign based on order value
 */
export function useCalculatePayoutEstimate() {
  const mutation = useMutation({
    mutationFn: async ({ campaignId, orderValue }: { campaignId: string; orderValue: number }) => {
      const client = getAuthenticatedClient();
      return client.campaigns.calculatePayoutEstimate(campaignId, { orderValue });
    },
  });

  return {
    calculatePayout: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to calculate payout") : null,
    reset: mutation.reset,
  };
}

// =============================================================================
// NOTIFICATION MUTATIONS
// =============================================================================

export interface UpdateNotificationPreferencesParams {
  channels: {
    email?: boolean;
    inApp?: boolean;
    push?: boolean;
  };
}

/**
 * Update notification preferences
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: UpdateNotificationPreferencesParams) => {
      const client = getAuthenticatedClient();
      return client.notifications.updateNotificationPreferences(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationPreferences });
    },
  });

  return {
    updatePreferences: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to update preferences") : null,
    reset: mutation.reset,
  };
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const client = getAuthenticatedClient();
      return client.notifications.markAllAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationCount });
    },
  });

  return {
    markAllRead: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getAPIErrorMessage(mutation.error, "Failed to mark notifications as read") : null,
    reset: mutation.reset,
  };
}

// =============================================================================
// PROFILE PICTURE UPLOAD (Signed URL with Client-Side Compression)
// =============================================================================

export interface UploadProfilePictureParams {
  file: File;
}

export interface UploadProfilePictureResult {
  success: boolean;
  fileUrl?: string;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: string;
}

/**
 * Upload profile picture using signed URL with client-side compression
 * - Compresses image on client-side using browser-image-compression
 * - Gets pre-signed URL from backend
 * - Uploads directly to S3
 * - Updates shopper profile with new avatar URL
 */
export function useUploadProfilePicture() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadProfilePicture = useCallback(async (params: UploadProfilePictureParams): Promise<UploadProfilePictureResult> => {
    const { file } = params;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return { success: false };
    }

    // Validate file size (5MB max for profile pictures)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return { success: false };
    }

    setIsPending(true);
    setError(null);

    try {
      const client = getAuthenticatedClient();

      // Step 1: Compress image on client-side (512x512 max for profile pics)
      const { compressedFile, originalSize, compressedSize } = await compressImage(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 512,
      });

      // Step 2: Get pre-signed URL from backend
      const signedUrlResult = await client.storage.requestProfilePictureUploadUrl({
        filename: file.name,
      });

      // Step 3: Upload to S3
      await uploadToS3WithProgress(
        signedUrlResult.uploadUrl,
        compressedFile,
        compressedFile.type
      );

      // Step 4: Update shopper profile with new avatar URL
      await client.shoppers.updateShopperProfile({ avatarUrl: signedUrlResult.fileUrl });

      // Invalidate profile query
      queryClient.invalidateQueries({ queryKey: queryKeys.shopperProfile });

      const compressionRatio = originalSize > 0
        ? `${((1 - compressedSize / originalSize) * 100).toFixed(1)}%`
        : "0%";

      return {
        success: true,
        fileUrl: signedUrlResult.fileUrl,
        originalSize,
        compressedSize,
        compressionRatio,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload profile picture";
      setError(message);
      return { success: false };
    } finally {
      setIsPending(false);
    }
  }, [queryClient]);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadProfilePicture,
    isPending,
    error,
    reset,
  };
}

// Export types for components
export type { auth, campaigns, coupons, enrollments, platforms, products, shoppers, shared, wallets };

// Re-export error utilities
export { isAPIError, APIError, ErrCode };
