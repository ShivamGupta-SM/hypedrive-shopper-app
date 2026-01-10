import * as Headless from "@headlessui/react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  AdjustmentsHorizontalIcon,
  ClockIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import {
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Input, InputGroup } from "@/components/input";
import { Link } from "@/components/link";
import { Select } from "@/components/select";
import { Text } from "@/components/text";
import { useCampaigns, useInfiniteCampaigns, usePlatforms, useProductCategories } from "@/hooks/use-api";

function CampaignCard({
  campaign,
}: {
  campaign: {
    id: string;
    title: string;
    description?: string;
    rebatePercentage?: number;
    bonusAmount?: number;
    bonusAmountDecimal?: string;
    maxEnrollments?: number;
    currentEnrollments?: number;
    startDate?: string;
    endDate?: string;
    campaignType?: string;
    product?: {
      id: string;
      name: string;
      price: number;
      priceDecimal: string;
      productLink: string;
      primaryImage?: string;
    };
    organization?: {
      id: string;
      name: string;
      logo?: string;
    };
    platform?: {
      id: string;
      name: string;
      logo?: string;
      icon?: string;
    };
  };
}) {
  const cashback = campaign.rebatePercentage && campaign.rebatePercentage > 0
    ? `${campaign.rebatePercentage}%`
    : null;

  const bonus = campaign.bonusAmountDecimal
    ? `₹${campaign.bonusAmountDecimal}`
    : campaign.bonusAmount && campaign.bonusAmount > 0
      ? `₹${(campaign.bonusAmount / 100).toFixed(0)}`
      : null;

  const daysLeft = campaign.endDate
    ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const isEndingSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;

  const slotsLeft = campaign.maxEnrollments && campaign.currentEnrollments !== undefined
    ? Math.max(0, campaign.maxEnrollments - campaign.currentEnrollments)
    : null;

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
    >
      {/* Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {campaign.product?.primaryImage ? (
          <img
            src={campaign.product.primaryImage}
            alt={campaign.product.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <SparklesIcon className="size-10 text-zinc-300 dark:text-zinc-600" />
          </div>
        )}

        {/* Platform badge */}
        {campaign.platform?.icon && (
          <div className="absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-md bg-white/90 shadow-sm backdrop-blur-sm dark:bg-zinc-900/90">
            <img
              src={campaign.platform.icon}
              alt={campaign.platform.name}
              className="size-5 object-contain"
            />
          </div>
        )}

        {/* Urgency badge */}
        {isEndingSoon && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-zinc-900/80 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <ClockIcon className="size-3" />
            {daysLeft}d left
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Brand */}
        {campaign.organization && (
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {campaign.organization.name}
          </p>
        )}

        {/* Product Name */}
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-white">
          {campaign.product?.name || campaign.title}
        </h3>

        {/* Price + Rewards Row */}
        <div className="mt-2 flex items-baseline justify-between gap-2">
          {campaign.product?.priceDecimal && (
            <p className="text-base font-bold text-zinc-900 dark:text-white">
              ₹{campaign.product.priceDecimal}
            </p>
          )}

          <div className="flex items-center gap-1.5">
            {cashback && (
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                {cashback}
              </span>
            )}
            {bonus && (
              <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-400">
                +{bonus}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        {(slotsLeft !== null || campaign.platform?.name) && (
          <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            {slotsLeft !== null && (
              <span>{slotsLeft} slots left</span>
            )}
            {slotsLeft !== null && campaign.platform?.name && !campaign.platform.icon && (
              <span>·</span>
            )}
            {campaign.platform?.name && !campaign.platform.icon && (
              <span>{campaign.platform.name}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 py-1 pl-2.5 pr-1.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
      {label}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onRemove();
        }}
        className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
      >
        <XMarkIcon className="size-3" />
      </button>
    </span>
  );
}

function EmptyState({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-zinc-50 py-16 dark:bg-zinc-900/50">
      <div className="flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <SparklesIcon className="size-7 text-zinc-400 dark:text-zinc-500" />
      </div>
      <p className="mt-4 font-semibold text-zinc-900 dark:text-white">No campaigns found</p>
      <p className="mt-1 text-sm text-zinc-500">
        We couldn't find any campaigns matching your criteria.
      </p>
      {onClearFilters && (
        <Button onClick={onClearFilters} outline className="mt-5">
          Clear filters
        </Button>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="aspect-4/3 w-full animate-pulse bg-zinc-100 dark:bg-zinc-800" />
          <div className="space-y-2 p-3 sm:p-4">
            <div className="h-3 w-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-4 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-4 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FilterBottomSheet({
  isOpen,
  onClose,
  platformFilter,
  setPlatformFilter,
  categoryFilter,
  setCategoryFilter,
  platforms,
  categories,
  onClear,
}: {
  isOpen: boolean;
  onClose: () => void;
  platformFilter: string;
  setPlatformFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  platforms: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  onClear: () => void;
}) {
  const hasActiveFilters = platformFilter || categoryFilter;

  return (
    <Headless.Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <Headless.DialogBackdrop
        transition
        className="fixed inset-0 bg-black/50 transition duration-200 ease-out data-closed:opacity-0"
      />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center">
          <Headless.DialogPanel
            transition
            className="w-full max-w-lg rounded-t-2xl bg-white pb-safe transition duration-300 ease-out data-closed:translate-y-full dark:bg-zinc-900"
          >
            <div className="flex justify-center py-3">
              <div className="h-1 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            </div>

            <div className="px-5 pb-6">
              <div className="flex items-center justify-between pb-4">
                <Headless.DialogTitle className="text-base font-semibold text-zinc-900 dark:text-white">
                  Filters
                </Headless.DialogTitle>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <XMarkIcon className="size-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="platform-mobile" className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Platform
                  </label>
                  <Select
                    id="platform-mobile"
                    name="platform-mobile"
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                  >
                    <option value="">All Platforms</option>
                    {platforms.map((platform) => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label htmlFor="category-mobile" className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Category
                  </label>
                  <Select
                    id="category-mobile"
                    name="category-mobile"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                {hasActiveFilters && (
                  <Button outline onClick={onClear} className="flex-1">
                    Clear
                  </Button>
                )}
                <Button onClick={onClose} className="flex-1">
                  Apply
                </Button>
              </div>
            </div>
          </Headless.DialogPanel>
        </div>
      </div>
    </Headless.Dialog>
  );
}

// Trending campaign card for horizontal scroll
function TrendingCard({
  campaign,
}: {
  campaign: {
    id: string;
    title: string;
    rebatePercentage?: number;
    bonusAmount?: number;
    bonusAmountDecimal?: string;
    product?: {
      id: string;
      name: string;
      primaryImage?: string;
    };
    organization?: {
      name: string;
    };
  };
}) {
  const cashback = campaign.rebatePercentage && campaign.rebatePercentage > 0
    ? `${campaign.rebatePercentage}%`
    : null;

  const bonus = campaign.bonusAmountDecimal
    ? `₹${campaign.bonusAmountDecimal}`
    : campaign.bonusAmount && campaign.bonusAmount > 0
      ? `₹${(campaign.bonusAmount / 100).toFixed(0)}`
      : null;

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="group flex w-36 shrink-0 flex-col overflow-hidden rounded-xl bg-white ring-1 ring-zinc-950/5 dark:bg-zinc-800 dark:ring-white/10"
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-700">
        {campaign.product?.primaryImage ? (
          <img
            src={campaign.product.primaryImage}
            alt={campaign.product.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <SparklesIcon className="size-8 text-zinc-300 dark:text-zinc-500" />
          </div>
        )}

        {/* Reward badge */}
        {(cashback || bonus) && (
          <div className="absolute bottom-1.5 left-1.5 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {cashback || bonus}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col p-2">
        <p className="line-clamp-2 text-xs font-medium leading-tight text-zinc-900 dark:text-white">
          {campaign.product?.name || campaign.title}
        </p>
        {campaign.organization && (
          <p className="mt-0.5 truncate text-[10px] text-zinc-500 dark:text-zinc-400">
            {campaign.organization.name}
          </p>
        )}
      </div>
    </Link>
  );
}

// Tab button component
function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
        isActive
          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
          : "text-zinc-600 dark:text-zinc-400"
      }`}
    >
      {label}
    </button>
  );
}

// Icon button for filter
function FilterIconButton({
  onClick,
  hasActiveFilters,
}: {
  onClick: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Filters"
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-zinc-600 shadow-sm ring-1 ring-zinc-950/5 active:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-white/10 dark:active:bg-zinc-700"
    >
      <AdjustmentsHorizontalIcon className="size-4.5" />
      {hasActiveFilters && (
        <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white ring-2 ring-white dark:ring-zinc-900">
          !
        </span>
      )}
    </button>
  );
}

export function CampaignsList() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "ended">("active");
  const [platformFilter, setPlatformFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const { data: platformsData } = usePlatforms();
  const { data: categoriesData } = useProductCategories();

  const params = useMemo(() => ({
    q: search || undefined,
    status: activeTab,
    platformId: platformFilter || undefined,
    categoryId: categoryFilter || undefined,
    limit: 20,
  }), [search, activeTab, platformFilter, categoryFilter]);

  const {
    data: campaigns,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
  } = useInfiniteCampaigns(params);

  // Trending campaigns for horizontal scroll
  const { data: trendingCampaigns } = useCampaigns({ sort: "trending", limit: 10 });

  const platforms = platformsData?.platforms || [];
  const categories = categoriesData?.categories || [];

  // Infinite scroll observer
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; onRemove: () => void }[] = [];

    if (platformFilter) {
      const platform = platforms.find((p) => p.id === platformFilter);
      if (platform) {
        filters.push({
          key: "platform",
          label: platform.name,
          onRemove: () => setPlatformFilter(""),
        });
      }
    }

    if (categoryFilter) {
      const category = categories.find((c) => c.id === categoryFilter);
      if (category) {
        filters.push({
          key: "category",
          label: category.name,
          onRemove: () => setCategoryFilter(""),
        });
      }
    }

    return filters;
  }, [platformFilter, categoryFilter, platforms, categories]);

  const clearAllFilters = () => {
    setSearch("");
    setPlatformFilter("");
    setCategoryFilter("");
  };

  const hasActiveFilters = search || platformFilter || categoryFilter;
  const campaignCount = campaigns.length;

  const trendingList = trendingCampaigns?.data || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Heading>Campaigns</Heading>
        <Text className="mt-1 text-sm">Browse campaigns and earn cashback on purchases</Text>
      </div>

      {/* Trending Campaigns - Horizontal Scroll */}
      {trendingList.length > 0 && (
        <div className="-mx-4 sm:-mx-6 lg:-mx-10">
          <div className="mb-2 px-4 sm:px-6 lg:px-10">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Trending Now</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-10">
            {trendingList.map((campaign) => (
              <TrendingCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      )}

      {/* Search + Filter Row */}
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <InputGroup>
            <MagnifyingGlassIcon className="size-4.5" />
            <Input
              name="search"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </div>

        {/* Filter icon button - mobile */}
        <div className="lg:hidden">
          <FilterIconButton
            onClick={() => setShowFilterSheet(true)}
            hasActiveFilters={activeFilters.length > 0}
          />
        </div>

        {/* Desktop filters */}
        <div className="hidden items-center gap-2 lg:flex">
          <Select
            name="platform"
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option value="">All Platforms</option>
            {platforms.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </Select>

          <Select
            name="category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Tabs - Active / Ended */}
      <div className="flex items-center gap-1">
        <TabButton
          label="Active"
          isActive={activeTab === "active"}
          onClick={() => setActiveTab("active")}
        />
        <TabButton
          label="Ended"
          isActive={activeTab === "ended"}
          onClick={() => setActiveTab("ended")}
        />
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              onRemove={filter.onRemove}
            />
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">
          {loading ? "Loading..." : `${campaignCount} campaign${campaignCount !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Results Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-zinc-50 py-16 dark:bg-zinc-900/50">
          <div className="flex size-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/50">
            <XMarkIcon className="size-6 text-rose-500" />
          </div>
          <p className="mt-4 font-semibold text-zinc-900 dark:text-white">Something went wrong</p>
          <p className="mt-1 text-sm text-zinc-500">Unable to load campaigns</p>
          <Button onClick={refetch} outline className="mt-5">
            Try again
          </Button>
        </div>
      ) : campaigns.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>

          {/* Infinite scroll trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-6">
              {loadingMore && (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <div className="size-4 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-400" />
                  Loading more...
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState onClearFilters={hasActiveFilters ? clearAllFilters : undefined} />
      )}

      {/* Mobile Filter Sheet */}
      <FilterBottomSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        platformFilter={platformFilter}
        setPlatformFilter={setPlatformFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        platforms={platforms}
        categories={categories}
        onClear={clearAllFilters}
      />
    </div>
  );
}
