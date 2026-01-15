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
} from "@heroicons/react/20/solid";
import { useInfiniteUnifiedSearch, type shoppers } from "@/hooks/use-api";
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

type FilterType = "all" | "campaigns" | "enrollments" | "withdrawals";

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
    case "withdrawal":
      return <BanknotesIcon className="size-4 text-emerald-500" />;
    default:
      return null;
  }
}

function getResultRoute(result: shoppers.SearchResult): string {
  switch (result.resultType) {
    case "campaign":
      return `/campaigns/${result.id}`;
    case "enrollment":
      return `/enrollments/${result.id}`;
    case "withdrawal":
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

function groupResultsByType(results: shoppers.SearchResult[]) {
  return {
    campaigns: results.filter((r) => r.resultType === "campaign"),
    enrollments: results.filter((r) => r.resultType === "enrollment"),
    withdrawals: results.filter((r) => r.resultType === "withdrawal"),
  };
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
      withdrawals: "withdrawal",
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
    (result: shoppers.SearchResult) => {
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
      count: facets ? facets.campaigns + facets.enrollments + facets.withdrawals : 0
    },
    { key: "campaigns", label: "Campaigns", count: facets?.campaigns ?? 0 },
    { key: "enrollments", label: "Enrollments", count: facets?.enrollments ?? 0 },
    { key: "withdrawals", label: "Withdrawals", count: facets?.withdrawals ?? 0 },
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
          <div className="flex items-center gap-3 border-b border-zinc-100 px-4 dark:border-zinc-800">
            <MagnifyingGlassIcon className="size-5 shrink-0 text-zinc-400" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search campaigns, enrollments, withdrawals..."
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
            <div className="flex gap-1.5 border-b border-zinc-100 px-4 py-2 dark:border-zinc-800">
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
                          {groupedResults.campaigns.map((result) => (
                            <Command.Item
                              key={result.id}
                              value={`campaign-${result.id}-${result.title}`}
                              onSelect={() => handleSelectResult(result)}
                              className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                            >
                              <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                {getResultIcon(result.resultType)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                                    <HighlightText text={result.title} query={debouncedQuery} />
                                  </span>
                                  <span
                                    className={clsx(
                                      "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                                      getStatusColors(result.status as any).bg,
                                      getStatusColors(result.status as any).text
                                    )}
                                  >
                                    {result.status.replace(/_/g, " ")}
                                  </span>
                                </div>
                                {result.description && (
                                  <p className="truncate text-xs text-zinc-500">
                                    <HighlightText text={result.description} query={debouncedQuery} />
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-zinc-400">
                                {formatRelativeTime(result.createdAt)}
                              </span>
                            </Command.Item>
                          ))}
                        </Command.Group>
                      )}

                    {/* Enrollments Group */}
                    {(filter === "all" || filter === "enrollments") &&
                      groupedResults.enrollments.length > 0 && (
                        <Command.Group heading="Enrollments">
                          {groupedResults.enrollments.map((result) => (
                            <Command.Item
                              key={result.id}
                              value={`enrollment-${result.id}-${result.title}`}
                              onSelect={() => handleSelectResult(result)}
                              className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                            >
                              <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                {getResultIcon(result.resultType)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                                    <HighlightText text={result.title} query={debouncedQuery} />
                                  </span>
                                  <span
                                    className={clsx(
                                      "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                                      getStatusColors(result.status as any).bg,
                                      getStatusColors(result.status as any).text
                                    )}
                                  >
                                    {result.status.replace(/_/g, " ")}
                                  </span>
                                </div>
                                {result.description && (
                                  <p className="truncate text-xs text-zinc-500">
                                    <HighlightText text={result.description} query={debouncedQuery} />
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-zinc-400">
                                {formatRelativeTime(result.createdAt)}
                              </span>
                            </Command.Item>
                          ))}
                        </Command.Group>
                      )}

                    {/* Withdrawals Group */}
                    {(filter === "all" || filter === "withdrawals") &&
                      groupedResults.withdrawals.length > 0 && (
                        <Command.Group heading="Withdrawals">
                          {groupedResults.withdrawals.map((result) => (
                            <Command.Item
                              key={result.id}
                              value={`withdrawal-${result.id}-${result.title}`}
                              onSelect={() => handleSelectResult(result)}
                              className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                            >
                              <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                {getResultIcon(result.resultType)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                                    <HighlightText text={result.title} query={debouncedQuery} />
                                  </span>
                                  <span
                                    className={clsx(
                                      "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                                      getStatusColors(result.status as any).bg,
                                      getStatusColors(result.status as any).text
                                    )}
                                  >
                                    {result.status.replace(/_/g, " ")}
                                  </span>
                                </div>
                                {result.description && (
                                  <p className="truncate text-xs text-zinc-500">
                                    <HighlightText text={result.description} query={debouncedQuery} />
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-zinc-400">
                                {formatRelativeTime(result.createdAt)}
                              </span>
                            </Command.Item>
                          ))}
                        </Command.Group>
                      )}
                  </>
                )}
              </>
            )}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-zinc-100 px-3 py-2 text-[10px] text-zinc-400 dark:border-zinc-800">
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
