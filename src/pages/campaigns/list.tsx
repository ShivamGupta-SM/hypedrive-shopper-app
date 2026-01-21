import * as Headless from "@headlessui/react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  ArchiveBoxIcon,
  FunnelIcon,
  PlayCircleIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { CampaignCard } from "@/components/campaign-card";
import { EmptyState } from "@/components/empty-state";
import { Heading } from "@/components/heading";
import { Input, InputGroup } from "@/components/input";
import { Link } from "@/components/link";
import { Select } from "@/components/select";
import { Text } from "@/components/text";
import { useCampaigns, useInfiniteCampaigns, usePlatforms, useProductCategories, getAssetUrl } from "@/hooks/use-api";
import { getCampaignTypeConfig, getDaysLeft, getDisplayCashback } from "@/lib/campaign-utils";
import { CampaignCardSkeleton, SkeletonWrapper } from "@/lib/skeleton";

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


function LoadingSkeleton() {
  return (
    <SkeletonWrapper>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <CampaignCardSkeleton key={`skeleton-${n}`} />
        ))}
      </div>
    </SkeletonWrapper>
  );
}

interface FilterState {
  platform: string;
  category: string;
}

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onClear: () => void;
  options: {
    platforms: { id: string; name: string }[];
    categories: { id: string; name: string }[];
  };
}

function FilterBottomSheet({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClear,
  options,
}: FilterBottomSheetProps) {
  const hasActiveFilters = filters.platform || filters.category;

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
                    value={filters.platform}
                    onChange={(e) => onFilterChange("platform", e.target.value)}
                  >
                    <option value="">All Platforms</option>
                    {options.platforms.map((platform) => (
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
                    value={filters.category}
                    onChange={(e) => onFilterChange("category", e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {options.categories.map((category) => (
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

// Trending campaign card - horizontal layout with image on left, details on right
function TrendingCard({
  campaign,
}: {
  campaign: {
    id: string;
    title: string;
    rebatePercentage?: number;
    bonusAmount?: number;
    bonusAmountDecimal?: string;
    endDate?: string;
    campaignType?: string;
    product?: {
      id: string;
      name: string;
      price?: number;
      priceDecimal?: string;
      primaryImage?: string;
    };
    organization?: {
      name: string;
      logo?: string;
    };
    platform?: {
      name: string;
      icon?: string;
    };
  };
}) {
  const daysLeft = getDaysLeft(campaign);
  const cashbackDisplay = getDisplayCashback(campaign);
  const badgeConfig = getCampaignTypeConfig(campaign.campaignType);

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="flex w-[calc(100vw-3rem)] shrink-0 snap-center flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 sm:w-85 lg:w-auto dark:bg-zinc-900 dark:ring-zinc-800"
    >
      <div className="flex flex-1">
        {/* Image - Left side (square) */}
        <div className="relative size-28 shrink-0 overflow-hidden bg-zinc-100 sm:size-32 lg:size-28 xl:size-32 dark:bg-zinc-800">
          {campaign.product?.primaryImage ? (
            <img
              src={getAssetUrl(campaign.product.primaryImage)}
              alt={campaign.product.name}
              loading="lazy"
              decoding="async"
              className="size-full object-contain"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <SparklesIcon className="size-8 text-zinc-300 dark:text-zinc-600" />
            </div>
          )}

          {/* Platform icon */}
          {campaign.platform?.icon && (
            <div className="absolute bottom-2 right-2 flex size-6 items-center justify-center rounded-md bg-white/90 shadow-sm dark:bg-zinc-900/90">
              <img
                src={getAssetUrl(campaign.platform.icon)}
                alt={campaign.platform.name}
                loading="lazy"
                decoding="async"
                className="size-4 object-contain"
              />
            </div>
          )}
        </div>

        {/* Content - Right side */}
        <div className="flex min-w-0 flex-1 flex-col justify-between p-2.5 sm:p-3">
          <div>
            {/* Brand */}
            {campaign.organization && (
              <p className="truncate text-[10px] font-medium uppercase tracking-wide text-zinc-400 sm:text-[11px] dark:text-zinc-500">
                {campaign.organization.name}
              </p>
            )}

            {/* Product Name */}
            <h3 className="mt-0.5 line-clamp-2 text-[13px] font-medium leading-snug text-zinc-900 sm:text-sm dark:text-white">
              {campaign.product?.name || campaign.title}
            </h3>
          </div>

          {/* Badge */}
          <div className="mt-2">
            <Badge color={badgeConfig.color} className="text-[10px]">
              {badgeConfig.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Edge-to-edge divider */}
      <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

      {/* Footer Stats - 3-column layout with dividers */}
      <div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-700">
        {/* Price */}
        <div className="flex flex-col items-center justify-center py-2">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Price</span>
          <span className="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-white">
            {campaign.product?.priceDecimal ? `₹${campaign.product.priceDecimal}` : "—"}
          </span>
        </div>

        {/* Cashback */}
        <div className="flex flex-col items-center justify-center py-2">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Cashback</span>
          <span className="text-xs font-semibold text-emerald-600 sm:text-sm dark:text-emerald-400">
            {cashbackDisplay}
          </span>
        </div>

        {/* Days Left */}
        <div className="flex flex-col items-center justify-center py-2">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Days Left</span>
          <span className={`text-xs font-semibold sm:text-sm ${
            daysLeft !== null && daysLeft <= 7
              ? "text-amber-600 dark:text-amber-400"
              : "text-zinc-900 dark:text-white"
          }`}>
            {daysLeft !== null ? daysLeft : "—"}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Tab button component
function TabButton({
  label,
  icon: Icon,
  iconColor,
  isActive,
  onClick,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ring-1 ${
        isActive
          ? "bg-zinc-900 text-white ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:ring-white"
          : "bg-white text-zinc-600 ring-zinc-200 active:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700 dark:active:bg-zinc-700"
      }`}
    >
      {Icon && <Icon className={`size-4 ${isActive ? "" : iconColor || ""}`} />}
      {label}
    </button>
  );
}

// Icon button for filter - matches Input component styling exactly
function FilterIconButton({
  onClick,
  hasActiveFilters,
}: {
  onClick: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <span className="relative block before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-sm dark:before:hidden">
      <button
        type="button"
        onClick={onClick}
        aria-label="Filters"
        className="relative flex size-10.5 shrink-0 items-center justify-center rounded-lg border border-zinc-950/10 bg-transparent text-zinc-500 active:bg-zinc-50 sm:size-8.5 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:active:bg-white/10"
      >
        <FunnelIcon className="size-4.5 sm:size-4" />
        {hasActiveFilters && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-zinc-900">
            !
          </span>
        )}
      </button>
    </span>
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

      {/* Trending Campaigns - Horizontal Snap Scroll on mobile, Grid on desktop */}
      {trendingList.length > 0 && (
        <div className="-mx-4 sm:-mx-6 lg:mx-0">
          <div className="mb-3 flex items-center justify-between px-4 sm:px-6 lg:px-0">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Trending Now</h3>
            <span className="text-xs text-zinc-400 lg:hidden dark:text-zinc-500">Swipe →</span>
          </div>
          {/* Mobile: horizontal scroll */}
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-1 sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {trendingList.map((campaign) => (
              <TrendingCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
          {/* Desktop: 3-column grid showing first 3 items */}
          <div className="hidden gap-4 lg:grid lg:grid-cols-3">
            {trendingList.slice(0, 3).map((campaign) => (
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
      <div className="-mx-0.5 flex items-center gap-1.5 overflow-x-auto px-0.5 py-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <TabButton
          label="Active"
          icon={PlayCircleIcon}
          iconColor="text-emerald-500"
          isActive={activeTab === "active"}
          onClick={() => setActiveTab("active")}
        />
        <TabButton
          label="Ended"
          icon={ArchiveBoxIcon}
          iconColor="text-zinc-400"
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
          <div className="flex size-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
            <XMarkIcon className="size-6 text-red-500" />
          </div>
          <p className="mt-4 font-semibold text-zinc-900 dark:text-white">Something went wrong</p>
          <p className="mt-1 text-sm text-zinc-500">Unable to load campaigns</p>
          <Button onClick={() => refetch()} outline className="mt-5">
            Try again
          </Button>
        </div>
      ) : campaigns.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
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
        <EmptyState
          preset="campaigns"
          title="No campaigns found"
          description="We couldn't find any campaigns matching your criteria."
          action={hasActiveFilters ? { label: "Clear filters", onClick: clearAllFilters } : { label: "Browse All", href: "/campaigns" }}
        />
      )}

      {/* Mobile Filter Sheet */}
      <FilterBottomSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        filters={{ platform: platformFilter, category: categoryFilter }}
        onFilterChange={(key, value) => {
          if (key === "platform") setPlatformFilter(value);
          else if (key === "category") setCategoryFilter(value);
        }}
        onClear={clearAllFilters}
        options={{ platforms, categories }}
      />
    </div>
  );
}
