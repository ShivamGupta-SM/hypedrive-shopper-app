import { Command } from "cmdk";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  MagnifyingGlassIcon,
  FireIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  XMarkIcon,
  ClockIcon,
  HomeIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  ArrowRightIcon,
  UsersIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  GiftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { useInfiniteUnifiedSearch, type SearchResult } from "@/hooks/use-api";
import { getStatusColors } from "@/lib/theme";
import clsx from "clsx";

// Highlight matching text in search results
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim() || query.length < 2) return <>{text}</>;

  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-amber-200 text-amber-900 dark:bg-amber-500/30 dark:text-amber-200 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// =============================================================================
// TYPES
// =============================================================================

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RecentSearch {
  query: string;
  timestamp: number;
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  keywords?: string[];
}

type FilterType = "all" | "campaigns" | "enrollments" | "transactions";

// =============================================================================
// CONSTANTS
// =============================================================================

const RECENT_SEARCHES_KEY = "hypedrive_recent_searches";
const MAX_RECENT_SEARCHES = 5;

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "home",
    label: "Go to Dashboard",
    description: "View your dashboard overview",
    icon: <HomeIcon className="size-4" />,
    route: "/",
    keywords: ["home", "dashboard", "overview"],
  },
  {
    id: "campaigns",
    label: "Browse Campaigns",
    description: "Explore available cashback campaigns",
    icon: <FireIcon className="size-4" />,
    route: "/campaigns",
    keywords: ["campaigns", "offers", "cashback"],
  },
  {
    id: "enrollments",
    label: "My Enrollments",
    description: "View your campaign enrollments",
    icon: <ClipboardDocumentListIcon className="size-4" />,
    route: "/enrollments",
    keywords: ["enrollments", "orders", "submissions"],
  },
  {
    id: "wallet",
    label: "My Wallet",
    description: "Check balance and transactions",
    icon: <BanknotesIcon className="size-4" />,
    route: "/wallet",
    keywords: ["wallet", "balance", "money", "withdraw"],
  },
  {
    id: "withdraw",
    label: "Request Withdrawal",
    description: "Withdraw your earnings",
    icon: <PlusCircleIcon className="size-4" />,
    route: "/wallet?action=withdraw",
    keywords: ["withdraw", "payout", "transfer"],
  },
  {
    id: "settings",
    label: "Settings",
    description: "Manage your account settings",
    icon: <Cog6ToothIcon className="size-4" />,
    route: "/settings",
    keywords: ["settings", "profile", "account", "preferences"],
  },
];

// =============================================================================
// HOOKS
// =============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (s) => s.query.toLowerCase() !== query.toLowerCase()
      );
      const updated = [
        { query: query.trim(), timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT_SEARCHES);

      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }

      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const removeRecentSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter(
        (s) => s.query.toLowerCase() !== query.toLowerCase()
      );
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
  };
}

// =============================================================================
// HELPERS
// =============================================================================

function getResultIcon(resultType: string) {
  switch (resultType) {
    case "campaign":
      return <FireIcon className="size-4 text-amber-500" />;
    case "enrollment":
      return <ClipboardDocumentListIcon className="size-4 text-sky-500" />;
    case "transaction":
      return <BanknotesIcon className="size-4 text-emerald-500" />;
    default:
      return null;
  }
}

function getResultRoute(result: SearchResult): string {
  switch (result.resultType) {
    case "campaign":
      return `/campaigns/${result.id}`;
    case "enrollment":
      return `/enrollments/${result.id}`;
    case "transaction":
      return `/wallet`;
    default:
      return "/";
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function groupResultsByType(results: SearchResult[]) {
  return {
    campaigns: results.filter((r) => r.resultType === "campaign"),
    enrollments: results.filter((r) => r.resultType === "enrollment"),
    transactions: results.filter((r) => r.resultType === "transaction"),
  };
}

/** Get subtitle text based on result type */
function getResultSubtitle(result: SearchResult): string | null {
  switch (result.resultType) {
    case "campaign":
      // Show organization name and bonus amount
      const parts: string[] = [];
      if (result.organization?.name) parts.push(result.organization.name);
      if (result.amountDecimal) parts.push(`₹${result.amountDecimal} bonus`);
      return parts.length > 0 ? parts.join(" · ") : null;
    case "enrollment":
      // Show campaign title and order value
      const enrollParts: string[] = [];
      if (result.campaign?.title) enrollParts.push(result.campaign.title);
      if (result.amountDecimal) enrollParts.push(`₹${result.amountDecimal}`);
      return enrollParts.length > 0 ? enrollParts.join(" · ") : null;
    case "transaction":
      // Show amount with credit/debit indicator
      if (result.amountDecimal) {
        const prefix = result.transactionType === "credit" ? "+" : "-";
        return `${prefix}₹${result.amountDecimal}`;
      }
      return null;
    default:
      return null;
  }
}

/** Get secondary info line (product price, enrollment slots, expiry, etc.) */
function getResultSecondaryInfo(result: SearchResult): string | null {
  switch (result.resultType) {
    case "campaign":
      const infoParts: string[] = [];
      // Product price
      if (result.secondaryAmountDecimal) {
        infoParts.push(`₹${result.secondaryAmountDecimal} product`);
      }
      // Enrollment slots
      if (result.maxCount !== undefined && result.maxCount > 0) {
        const current = result.currentCount ?? 0;
        const remaining = result.maxCount - current;
        if (remaining <= 5 && remaining > 0) {
          infoParts.push(`${remaining} slots left`);
        } else if (remaining === 0) {
          infoParts.push("Fully booked");
        } else {
          infoParts.push(`${current}/${result.maxCount} enrolled`);
        }
      }
      // Platform
      if (result.platform?.name) {
        infoParts.push(result.platform.name);
      }
      return infoParts.length > 0 ? infoParts.join(" · ") : null;
    case "enrollment":
      const enrollInfo: string[] = [];
      // Bonus amount (secondary)
      if (result.secondaryAmountDecimal) {
        enrollInfo.push(`₹${result.secondaryAmountDecimal} bonus`);
      }
      // Expiry warning
      if (result.expiresAt) {
        const expiryDate = new Date(result.expiresAt);
        const now = new Date();
        const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 3 && daysLeft > 0) {
          enrollInfo.push(`Expires in ${daysLeft}d`);
        } else if (daysLeft <= 0) {
          enrollInfo.push("Expired");
        }
      }
      return enrollInfo.length > 0 ? enrollInfo.join(" · ") : null;
    case "transaction":
      // Transaction category label
      if (result.transactionCategory) {
        const categoryLabels: Record<string, string> = {
          enrollment_hold: "Hold",
          deposit: "Deposit",
          payout: "Payout",
          refund: "Refund",
          admin_credit: "Credit",
          other: "Other",
        };
        return categoryLabels[result.transactionCategory] || null;
      }
      return null;
    default:
      return null;
  }
}

/** Get matched fields indicator */
function getMatchedFieldsDisplay(result: SearchResult): string | null {
  if (!result.matchedFields || result.matchedFields.length === 0) return null;

  const fieldLabels: Record<string, string> = {
    title: "title",
    description: "description",
    productName: "product",
    organizationName: "brand",
    orderId: "order ID",
    campaignTitle: "campaign",
    reference: "reference",
  };

  const labels = result.matchedFields
    .map(f => fieldLabels[f])
    .filter(Boolean)
    .slice(0, 2); // Show max 2

  return labels.length > 0 ? `Matched: ${labels.join(", ")}` : null;
}

/** Get transaction category icon */
function getTransactionCategoryIcon(category?: string) {
  switch (category) {
    case "deposit":
      return <ArrowDownTrayIcon className="size-3" />;
    case "payout":
      return <ArrowUpTrayIcon className="size-3" />;
    case "refund":
      return <ArrowPathIcon className="size-3" />;
    case "admin_credit":
      return <GiftIcon className="size-3" />;
    case "enrollment_hold":
      return <ClockIcon className="size-3" />;
    default:
      return null;
  }
}

/** Get icon/image for result */
function getResultImage(result: SearchResult): string | null {
  // For campaigns and enrollments, use product image
  if (result.product?.primaryImage) {
    return result.product.primaryImage;
  }
  // For campaigns, fallback to organization logo
  if (result.resultType === "campaign" && result.organization?.logo) {
    return result.organization.logo;
  }
  return null;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const debouncedQuery = useDebounce(query, 300);
  const {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
  } = useRecentSearches();

  // Always fetch ALL results - no resourceType filter to API
  // This way we get accurate facet counts and can filter on frontend
  const { data, loading, facets } = useInfiniteUnifiedSearch(
    debouncedQuery.trim().length >= 2
      ? { q: debouncedQuery, limit: 50 } // Fetch more to have enough for each type
      : undefined
  );

  // Group results by type
  const groupedResults = useMemo(() => groupResultsByType(data), [data]);

  // Filter results based on selected tab - this is the native cmdk way
  const filteredResults = useMemo(() => {
    if (filter === "all") return data;

    const typeMap: Record<FilterType, string> = {
      all: "",
      campaigns: "campaign",
      enrollments: "enrollment",
      transactions: "transaction",
    };

    return data.filter((r) => r.resultType === typeMap[filter]);
  }, [data, filter]);

  const hasResults = filteredResults.length > 0;
  const hasQuery = debouncedQuery.trim().length >= 2;

  // Reset state when menu closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setFilter("all");
    }
  }, [open]);

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      addRecentSearch(query);
      onOpenChange(false);
      navigate(getResultRoute(result));
    },
    [navigate, onOpenChange, addRecentSearch, query]
  );

  const handleSelectAction = useCallback(
    (action: QuickAction) => {
      onOpenChange(false);
      navigate(action.route);
    },
    [navigate, onOpenChange]
  );

  const handleSelectRecentSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  if (!open) return null;

  // Tab configuration with counts from facets
  const tabs: { key: FilterType; label: string; count: number }[] = [
    {
      key: "all",
      label: "All",
      count: facets ? facets.campaigns + facets.enrollments + facets.transactions : 0
    },
    { key: "campaigns", label: "Campaigns", count: facets?.campaigns ?? 0 },
    { key: "enrollments", label: "Enrollments", count: facets?.enrollments ?? 0 },
    { key: "transactions", label: "Transactions", count: facets?.transactions ?? 0 },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal - Responsive: full width on mobile, larger on desktop */}
      <div className="fixed inset-x-4 top-[10%] z-50 mx-auto sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-xl sm:-translate-x-1/2 md:max-w-2xl lg:max-w-3xl">
        <Command
          loop
          shouldFilter={!hasQuery} // Only filter quick actions, not API results
          className="overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-zinc-900"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-700">
            <MagnifyingGlassIcon className="size-5 shrink-0 text-zinc-400" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search campaigns, enrollments, transactions..."
              className="h-12 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="shrink-0 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <XMarkIcon className="size-4" />
              </button>
            )}
          </div>

          {/* Filter Tabs - Only show when we have search results */}
          {hasQuery && facets && (
            <div className="flex gap-1.5 border-b border-zinc-200 px-4 py-2 dark:border-zinc-700">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={clsx(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    filter === tab.key
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  )}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-1 opacity-60">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          <Command.List className="max-h-80 overflow-y-auto p-2">
            {/* Loading */}
            {loading && hasQuery && (
              <div className="flex items-center justify-center py-6">
                <div className="size-4 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600" />
                <span className="ml-2 text-xs text-zinc-500">Searching...</span>
              </div>
            )}

            {/* Empty Query - Quick Actions */}
            {!hasQuery && (
              <>
                {recentSearches.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <span className="text-xs font-medium text-zinc-400">
                        Recent
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((search) => (
                      <Command.Item
                        key={search.query}
                        value={`recent-${search.query}`}
                        onSelect={() => handleSelectRecentSearch(search.query)}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-zinc-700 aria-selected:bg-zinc-100 dark:text-zinc-300 dark:aria-selected:bg-zinc-800"
                      >
                        <ClockIcon className="size-4 text-zinc-400" />
                        <span className="flex-1">{search.query}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(search.query);
                          }}
                          className="text-zinc-400 hover:text-zinc-600"
                        >
                          <XMarkIcon className="size-3.5" />
                        </button>
                      </Command.Item>
                    ))}
                    <div className="my-2 h-px bg-zinc-100 dark:bg-zinc-800" />
                  </>
                )}

                <div className="px-2 py-1.5">
                  <span className="text-xs font-medium text-zinc-400">
                    Quick Actions
                  </span>
                </div>
                {QUICK_ACTIONS.map((action) => (
                  <Command.Item
                    key={action.id}
                    value={action.id}
                    keywords={action.keywords}
                    onSelect={() => handleSelectAction(action)}
                    className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 group-aria-selected:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:group-aria-selected:bg-zinc-700">
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {action.label}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRightIcon className="size-4 text-zinc-300 opacity-0 group-aria-selected:opacity-100 dark:text-zinc-600" />
                  </Command.Item>
                ))}
              </>
            )}

            {/* Search Results */}
            {hasQuery && !loading && (
              <>
                {!hasResults && (
                  <Command.Empty className="py-6 text-center">
                    <MagnifyingGlassIcon className="mx-auto size-6 text-zinc-300 dark:text-zinc-600" />
                    <p className="mt-2 text-sm text-zinc-500">
                      No results for "{debouncedQuery}"
                      {filter !== "all" && ` in ${filter}`}
                    </p>
                  </Command.Empty>
                )}

                {hasResults && (
                  <>
                    {/* Campaigns Group */}
                    {(filter === "all" || filter === "campaigns") &&
                      groupedResults.campaigns.length > 0 && (
                        <Command.Group heading="Campaigns">
                          {groupedResults.campaigns.map((result) => {
                            const image = getResultImage(result);
                            const subtitle = getResultSubtitle(result);
                            const secondaryInfo = getResultSecondaryInfo(result);
                            const matchedFields = getMatchedFieldsDisplay(result);
                            const slotsWarning = result.maxCount && result.currentCount !== undefined
                              ? result.maxCount - result.currentCount <= 5 && result.maxCount - result.currentCount > 0
                              : false;
                            return (
                              <Command.Item
                                key={result.id}
                                value={`campaign-${result.id}-${result.title}`}
                                onSelect={() => handleSelectResult(result)}
                                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                              >
                                {image ? (
                                  <img
                                    src={image}
                                    alt=""
                                    className="size-12 shrink-0 rounded-lg bg-zinc-100 object-contain dark:bg-zinc-800"
                                  />
                                ) : (
                                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                    {getResultIcon(result.resultType)}
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                                      <HighlightText text={result.title} query={debouncedQuery} />
                                    </span>
                                    <span
                                      className={clsx(
                                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                                        getStatusColors(result.status).bg,
                                        getStatusColors(result.status).text
                                      )}
                                    >
                                      {result.status.replace(/_/g, " ")}
                                    </span>
                                    {slotsWarning && (
                                      <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                        <UsersIcon className="size-3" />
                                        {result.maxCount! - result.currentCount!} left
                                      </span>
                                    )}
                                  </div>
                                  {subtitle && (
                                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                                      {subtitle}
                                    </p>
                                  )}
                                  {secondaryInfo && (
                                    <p className="truncate text-[10px] text-zinc-400 dark:text-zinc-500">
                                      {secondaryInfo}
                                    </p>
                                  )}
                                </div>
                                <div className="shrink-0 text-right">
                                  <span className="text-xs text-zinc-400">
                                    {formatRelativeTime(result.createdAt)}
                                  </span>
                                  {matchedFields && (
                                    <p className="text-[9px] text-zinc-400/70 dark:text-zinc-500/70">
                                      {matchedFields}
                                    </p>
                                  )}
                                </div>
                              </Command.Item>
                            );
                          })}
                        </Command.Group>
                      )}

                    {/* Enrollments Group */}
                    {(filter === "all" || filter === "enrollments") &&
                      groupedResults.enrollments.length > 0 && (
                        <Command.Group heading="Enrollments">
                          {groupedResults.enrollments.map((result) => {
                            const image = getResultImage(result);
                            const subtitle = getResultSubtitle(result);
                            const secondaryInfo = getResultSecondaryInfo(result);
                            const matchedFields = getMatchedFieldsDisplay(result);
                            // Check if expiring soon
                            const isExpiringSoon = result.expiresAt && (() => {
                              const daysLeft = Math.ceil((new Date(result.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                              return daysLeft <= 3 && daysLeft > 0;
                            })();
                            return (
                              <Command.Item
                                key={result.id}
                                value={`enrollment-${result.id}-${result.title}`}
                                onSelect={() => handleSelectResult(result)}
                                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                              >
                                {image ? (
                                  <img
                                    src={image}
                                    alt=""
                                    className="size-12 shrink-0 rounded-lg bg-zinc-100 object-contain dark:bg-zinc-800"
                                  />
                                ) : (
                                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                    {getResultIcon(result.resultType)}
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                                      <HighlightText text={result.title} query={debouncedQuery} />
                                    </span>
                                    <span
                                      className={clsx(
                                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                                        getStatusColors(result.status).bg,
                                        getStatusColors(result.status).text
                                      )}
                                    >
                                      {result.status.replace(/_/g, " ")}
                                    </span>
                                    {isExpiringSoon && (
                                      <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                        <ExclamationTriangleIcon className="size-3" />
                                        Expiring
                                      </span>
                                    )}
                                  </div>
                                  {subtitle && (
                                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                                      {subtitle}
                                    </p>
                                  )}
                                  {secondaryInfo && (
                                    <p className="truncate text-[10px] text-zinc-400 dark:text-zinc-500">
                                      {secondaryInfo}
                                    </p>
                                  )}
                                </div>
                                <div className="shrink-0 text-right">
                                  <span className="text-xs text-zinc-400">
                                    {formatRelativeTime(result.createdAt)}
                                  </span>
                                  {matchedFields && (
                                    <p className="text-[9px] text-zinc-400/70 dark:text-zinc-500/70">
                                      {matchedFields}
                                    </p>
                                  )}
                                </div>
                              </Command.Item>
                            );
                          })}
                        </Command.Group>
                      )}

                    {/* Transactions Group */}
                    {(filter === "all" || filter === "transactions") &&
                      groupedResults.transactions.length > 0 && (
                        <Command.Group heading="Transactions">
                          {groupedResults.transactions.map((result) => {
                            const subtitle = getResultSubtitle(result);
                            const secondaryInfo = getResultSecondaryInfo(result);
                            const matchedFields = getMatchedFieldsDisplay(result);
                            const categoryIcon = getTransactionCategoryIcon(result.transactionCategory);
                            const isCredit = result.transactionType === "credit";
                            return (
                              <Command.Item
                                key={result.id}
                                value={`transaction-${result.id}-${result.title}`}
                                onSelect={() => handleSelectResult(result)}
                                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                              >
                                <div className={clsx(
                                  "flex size-12 shrink-0 items-center justify-center rounded-lg",
                                  isCredit
                                    ? "bg-emerald-50 dark:bg-emerald-950/30"
                                    : "bg-red-50 dark:bg-red-950/30"
                                )}>
                                  <BanknotesIcon className={clsx(
                                    "size-5",
                                    isCredit
                                      ? "text-emerald-500"
                                      : "text-red-500"
                                  )} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                                      <HighlightText text={result.title} query={debouncedQuery} />
                                    </span>
                                    <span
                                      className={clsx(
                                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                                        getStatusColors(result.status).bg,
                                        getStatusColors(result.status).text
                                      )}
                                    >
                                      {result.status.replace(/_/g, " ")}
                                    </span>
                                    {secondaryInfo && (
                                      <span className="flex shrink-0 items-center gap-0.5 rounded bg-zinc-100 px-1 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                        {categoryIcon}
                                        {secondaryInfo}
                                      </span>
                                    )}
                                  </div>
                                  {result.campaign?.title && (
                                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                                      {result.campaign.title}
                                    </p>
                                  )}
                                  {result.description && result.description !== result.title && (
                                    <p className="truncate text-[10px] text-zinc-400 dark:text-zinc-500">
                                      {result.description}
                                    </p>
                                  )}
                                </div>
                                <div className="shrink-0 text-right">
                                  {subtitle && (
                                    <p className={clsx(
                                      "text-sm font-semibold",
                                      isCredit
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-red-600 dark:text-red-400"
                                    )}>
                                      {subtitle}
                                    </p>
                                  )}
                                  <p className="text-[10px] text-zinc-400">
                                    {formatRelativeTime(result.createdAt)}
                                  </p>
                                  {matchedFields && (
                                    <p className="text-[9px] text-zinc-400/70 dark:text-zinc-500/70">
                                      {matchedFields}
                                    </p>
                                  )}
                                </div>
                              </Command.Item>
                            );
                          })}
                        </Command.Group>
                      )}
                  </>
                )}
              </>
            )}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-zinc-100 px-3 py-2 text-[10px] text-zinc-400 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">
                  ↑↓
                </kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">
                  ↵
                </kbd>
                select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">
                esc
              </kbd>
              close
            </span>
          </div>
        </Command>
      </div>
    </>
  );
}
