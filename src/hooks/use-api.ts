import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
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

  // Search
  unifiedSearch: (params?: Record<string, unknown>) => ["search", params] as const,
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
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}

// =============================================================================
// SHOPPER HOOKS
// =============================================================================

// Shopper Profile
export function useShopperProfile() {
  const query = useQuery({
    queryKey: queryKeys.shopperProfile,
    queryFn: async () => {
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
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Shopper Stats
export function useShopperStats() {
  const query = useQuery({
    queryKey: queryKeys.shopperStats,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.shoppers.getShopperStats();
    },
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
  const query = useQuery({
    queryKey: queryKeys.earningsHistory(period || "monthly"),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.shoppers.getEarningsHistory({ period: period || "monthly" });
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// KYC Status
export function useKYCStatus() {
  const query = useQuery({
    queryKey: queryKeys.kycStatus,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.shoppers.getKYCStatus();
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

// Campaign Deliverables
export function useCampaignDeliverables(params?: {
  skip?: number;
  take?: number;
  platformId?: string;
  category?: string;
}) {
  const query = useQuery({
    queryKey: queryKeys.campaignDeliverables(params),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.campaigns.listDeliverables(params || {});
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
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

// Available Coupons for Campaign
export function useAvailableCoupons(campaignId: string) {
  const query = useQuery({
    queryKey: queryKeys.availableCoupons(campaignId),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.coupons.listAvailableCoupons(campaignId);
    },
    enabled: !!campaignId,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Active Campaigns (featured/trending for dashboard)
export function useActiveCampaigns(limit = 4) {
  const query = useQuery({
    queryKey: queryKeys.activeCampaigns(limit),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      const result = await client.campaigns.listCampaigns({
        limit,
        featured: true,
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
  submissions?: {
    id: string;
    deliverableName: string;
    isRequired: boolean;
    requireLink: boolean;
    requireScreenshot: boolean;
    proofLink?: string;
    proofScreenshot?: string;
  }[];
}

// Enrollments List with campaign enrichment
export function useEnrollments(params?: {
  cursor?: string;
  limit?: number;
  status?: shared.EnrollmentStatus;
  campaignId?: string;
}) {
  const query = useQuery({
    queryKey: queryKeys.enrollments(params),
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
          submissions: enrollment.deliverables?.map((d) => ({
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

// Enrollment Detail
export function useEnrollmentDetail(id: string) {
  const query = useQuery({
    queryKey: queryKeys.enrollmentDetail(id),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.enrollments.getEnrollmentDetail(id);
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

// Single Product
export function useProduct(slug: string) {
  const query = useQuery({
    queryKey: queryKeys.product(slug),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.products.getProduct(slug);
    },
    enabled: !!slug,
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
      return client.products.listAllCategories();
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Product by ID (for campaign product lookup)
export function useProductById(id: string | undefined) {
  const query = useQuery({
    queryKey: queryKeys.product(id || ""),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.products.getProduct(id!);
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
      return client.platforms.listActivePlatforms();
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
  const query = useQuery({
    queryKey: queryKeys.wallet,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.wallets.getMyWallet();
    },
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
  const query = useQuery({
    queryKey: queryKeys.walletTransactions(params),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.wallets.getWalletTransactions(params || {});
    },
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

// Withdrawals List
export function useWithdrawals(params?: {
  skip?: number;
  take?: number;
  status?: shared.WithdrawalStatus;
}) {
  const query = useQuery({
    queryKey: queryKeys.withdrawals(params),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.wallets.listMyWithdrawals(params || {});
    },
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
  const query = useQuery({
    queryKey: queryKeys.notificationPreferences,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.notifications.getNotificationPreferences();
    },
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
  const query = useQuery({
    queryKey: queryKeys.unreadNotificationCount,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.notifications.getUnreadCount();
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
// SEARCH HOOKS
// =============================================================================

// Unified Search - searches across campaigns, enrollments, and withdrawals
export function useUnifiedSearch(params: shoppers.UnifiedSearchParams | null) {
  const query = useQuery({
    queryKey: ["search", "unified", params?.q, params?.cursor, params?.limit],
    queryFn: async () => {
      const client = getAuthenticatedClient();
      if (!params) throw new Error("Params required");
      return client.shoppers.unifiedSearch(params);
    },
    enabled: !!params?.q?.trim(),
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Infinite Unified Search
export function useInfiniteUnifiedSearch(params?: Omit<shoppers.UnifiedSearchParams, "cursor">) {
  const query = useInfiniteQuery({
    queryKey: ["search", "unified", "infinite", params?.q, params?.limit],
    queryFn: async ({ pageParam }) => {
      const client = getAuthenticatedClient();
      return client.shoppers.unifiedSearch({
        ...params,
        q: params?.q || "",
        cursor: pageParam as string | undefined,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!params?.q?.trim(),
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

// Export types for components
export type { campaigns, coupons, enrollments, shoppers, products, platforms, shared };
