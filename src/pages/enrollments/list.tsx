import {
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  QueueListIcon,
  ShoppingBagIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { Heading } from "@/components/heading";
import { Input, InputGroup } from "@/components/input";
import { Link } from "@/components/link";
import { Text } from "@/components/text";
import type { shared } from "@/hooks/use-api";
import { useInfiniteEnrollments } from "@/hooks/use-api";
import { HighlightText } from "@/lib/highlight-text";
import { formatCurrency } from "@/lib/money-utils";
import { EnrollmentCardSkeleton, SkeletonWrapper } from "@/lib/skeleton";

type EnrollmentStatus = shared.EnrollmentStatus;

function getStatusConfig(status: EnrollmentStatus): {
  label: string;
  icon: typeof CheckCircleIcon;
  color: "emerald" | "amber" | "red" | "zinc" | "sky";
} {
  const statusInfo: Record<EnrollmentStatus, { label: string; icon: typeof CheckCircleIcon; color: "emerald" | "amber" | "red" | "zinc" | "sky" }> = {
    awaiting_submission: { label: "Pending", icon: DocumentTextIcon, color: "amber" },
    awaiting_review: { label: "In Review", icon: ClockIcon, color: "sky" },
    changes_requested: { label: "Changes Needed", icon: ExclamationTriangleIcon, color: "amber" },
    approved: { label: "Approved", icon: CheckCircleIcon, color: "emerald" },
    permanently_rejected: { label: "Rejected", icon: XCircleIcon, color: "red" },
    withdrawn: { label: "Withdrawn", icon: XMarkIcon, color: "zinc" },
    expired: { label: "Expired", icon: ClockIcon, color: "zinc" },
  };

  const info = statusInfo[status] || { label: status, icon: ClockIcon, color: "zinc" as const };

  return {
    label: info.label,
    icon: info.icon,
    color: info.color,
  };
}

function LoadingSkeleton() {
  return (
    <SkeletonWrapper>
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4].map((n) => (
          <EnrollmentCardSkeleton key={`skeleton-${n}`} />
        ))}
      </div>
    </SkeletonWrapper>
  );
}

// Semicircle gauge for deadline visualization - clean and simple
function DeadlineGauge({
  daysRemaining,
  totalDays = 30
}: {
  daysRemaining: number;
  totalDays?: number;
}) {
  const percent = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));

  const isExpired = daysRemaining <= 0;
  const isUrgent = daysRemaining <= 3;

  const strokeColor = isExpired
    ? "#ef4444"
    : isUrgent
      ? "#f59e0b"
      : "#10b981";

  const textColor = isExpired
    ? "text-red-600 dark:text-red-400"
    : isUrgent
      ? "text-amber-600 dark:text-amber-400"
      : "text-emerald-600 dark:text-emerald-400";

  const size = 56;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 8 }}>
        <svg
          width={size}
          height={size / 2 + strokeWidth}
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
          className="overflow-visible"
        >
          <title>{daysRemaining} days remaining</title>
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="#e4e4e7"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="dark:stroke-zinc-700"
          />
          {/* Progress arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        {/* Center value */}
        <div className={`absolute inset-x-0 bottom-0 flex flex-col items-center ${textColor}`}>
          <span className="text-base font-bold tabular-nums leading-none">{daysRemaining}</span>
          <span className="text-[7px] font-medium uppercase tracking-wide opacity-70">days</span>
        </div>
      </div>
    </div>
  );
}

function EnrollmentCard({
  enrollment,
  searchQuery = "",
}: {
  enrollment: {
    id: string;
    orderId: string;
    orderValueDecimal: string;
    currency: string;
    status: EnrollmentStatus;
    lockedRebatePercentage: number;
    lockedBonusAmountDecimal?: string;
    purchaseDate?: string;
    expiresAt?: string;
    createdAt: string;
    campaignId: string;
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
    tasks?: Array<{
      enrollmentTaskId: string;
      name: string;
      isRequired: boolean;
      requireLink: boolean;
      requireScreenshot: boolean;
      instructions?: string;
      proofLink?: string;
      proofScreenshot?: string;
    }>;
  };
  searchQuery?: string;
}) {
  const statusConfig = getStatusConfig(enrollment.status);
  const StatusIcon = statusConfig.icon;

  const estimatedPayout = useMemo(() => {
    const orderValue = parseFloat(enrollment.orderValueDecimal);
    const rebate = (orderValue * enrollment.lockedRebatePercentage) / 100;
    const bonus = enrollment.lockedBonusAmountDecimal
      ? parseFloat(enrollment.lockedBonusAmountDecimal)
      : 0;
    return rebate + bonus;
  }, [
    enrollment.orderValueDecimal,
    enrollment.lockedRebatePercentage,
    enrollment.lockedBonusAmountDecimal,
  ]);

  const deadlineInfo = useMemo(() => {
    if (!enrollment.expiresAt) return null;
    const expiresAt = new Date(enrollment.expiresAt);
    const now = new Date();
    const daysRemaining = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const formattedDate = expiresAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    return { daysRemaining, formattedDate };
  }, [enrollment.expiresAt]);

  const hasDeadline = deadlineInfo !== null && deadlineInfo.daysRemaining > 0;
  // Show gauge for all active (in-progress) statuses
  const showGauge = hasDeadline && (
    enrollment.status === "awaiting_submission" ||
    enrollment.status === "changes_requested" ||
    enrollment.status === "awaiting_review"
  );

  const productName = enrollment.campaign?.product?.name || enrollment.campaign?.title;
  const productImage = enrollment.campaign?.product?.primaryImage;
  const platformIcon = enrollment.campaign?.platform?.icon;
  const platformName = enrollment.campaign?.platform?.name;

  // Get tasks from API
  const tasks = enrollment.tasks || [];

  // Format date
  const enrollmentDate = new Date(enrollment.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={`/enrollments/${enrollment.id}`}
      className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
    >
      {/* Main Content */}
      <div className="p-3 sm:p-4">
        {/* Product Section */}
        <div className="flex items-start gap-3">
          {/* Product Image */}
          <div className="relative shrink-0">
            <div className="size-20 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              {productImage ? (
                <img
                  src={productImage}
                  alt={productName || "Product"}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="flex size-full items-center justify-center"><svg class="size-6 text-zinc-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 00-1.743 1.598l-.826 9.5A1.75 1.75 0 003.84 19H16.16a1.75 1.75 0 001.743-1.902l-.826-9.5A1.75 1.75 0 0015.333 6H14V5a4 4 0 00-8 0zm4-2.5A2.5 2.5 0 007.5 5v1h5V5A2.5 2.5 0 0010 2.5z" clip-rule="evenodd" /></svg></div>';
                    }
                  }}
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <ShoppingBagIcon className="size-8 text-zinc-400" />
                </div>
              )}
            </div>
            {platformIcon && (
              <img
                src={platformIcon}
                alt={platformName}
                loading="lazy"
                decoding="async"
                className="absolute -bottom-1 -right-1 size-5 rounded-md border-2 border-white bg-white object-contain dark:border-zinc-900 dark:bg-zinc-900"
              />
            )}
          </div>

          {/* Product Info */}
          <div className="min-w-0 flex-1">
            {/* Title + Status Row */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-base font-semibold text-zinc-900 dark:text-white">
                <HighlightText text={productName || "Campaign Enrollment"} query={searchQuery} />
              </h3>
              <Badge color={statusConfig.color} className="inline-flex shrink-0 items-center gap-1 text-xs!">
                <StatusIcon className="size-3" />
                {statusConfig.label}
              </Badge>
            </div>

            {/* Order & Date Info */}
            <div className="mt-1.5 space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <svg className="size-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0114.25 14H1.75A1.75 1.75 0 010 12.25v-8.5C0 2.784.784 2 1.75 2zm0 1.5a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25v-8.5a.25.25 0 00-.25-.25H1.75z"/>
                  <path d="M3.5 5.5h3v3h-3v-3zm0 4.5h3v2h-3v-2zm4.5-4.5h4v1h-4v-1zm0 2h4v1h-4v-1zm0 2h4v1h-4v-1zm0 2h2v1h-2v-1z"/>
                </svg>
                <span className="font-medium">
                  <HighlightText text={enrollment.orderId} query={searchQuery} />
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <svg className="size-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M4 1.75a.75.75 0 01.75.75V3h6.5V2.5a.75.75 0 011.5 0V3h.25A2.75 2.75 0 0115.75 5.75v7.5A2.75 2.75 0 0113 16H3A2.75 2.75 0 01.25 13.25v-7.5A2.75 2.75 0 013 3h.25V2.5a.75.75 0 01.75-.75zm10.25 4.5a1.25 1.25 0 00-1.25-1.25H3A1.25 1.25 0 001.75 6.25v.5h12.5v-.5z" clipRule="evenodd"/>
                </svg>
                <span className="font-medium">{enrollmentDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section - Horizontal scrollable chips */}
        {tasks.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-xs font-medium text-zinc-900 dark:text-white">Required Tasks</p>
            <div className="-mx-3 overflow-x-auto px-3 sm:-mx-4 sm:px-4">
              <div className="flex gap-1.5 pb-1" style={{ minWidth: 'max-content' }}>
                {tasks.map((task) => {
                  const isComplete = task.proofLink || task.proofScreenshot;
                  return (
                    <span
                      key={task.enrollmentTaskId}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        isComplete
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      <QueueListIcon className={`size-3 ${isComplete ? 'text-emerald-500' : 'text-zinc-400'}`} />
                      {task.name}
                      {isComplete && <CheckCircleIcon className="size-3 text-emerald-500" />}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pricing Section - 3 columns with dividers */}
      <div className="relative border-t border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="grid grid-cols-3 items-end px-3 py-3 sm:px-4">
          {/* Order Value */}
          <div className="text-center">
            <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Order Value</p>
            <p className="mt-0.5 text-base font-semibold text-zinc-900 sm:text-lg dark:text-white">
              {formatCurrency(enrollment.orderValueDecimal)}
            </p>
          </div>

          {/* Cashback */}
          <div className="text-center">
            <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              {enrollment.status === "approved" ? "Earned" : "Cashback"}
            </p>
            <p className="mt-0.5 text-base font-semibold text-emerald-600 sm:text-lg dark:text-emerald-400">
              {formatCurrency(estimatedPayout)}
            </p>
          </div>

          {/* Days Left / Status */}
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              {showGauge ? "Days Left" : "Status"}
            </p>
            {showGauge && deadlineInfo ? (
              <div className="-mb-1">
                <DeadlineGauge daysRemaining={deadlineInfo.daysRemaining} />
              </div>
            ) : (
              <p className="mt-0.5 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                {enrollment.status === "approved" ? "Complete" : enrollment.status === "permanently_rejected" ? "Rejected" : "—"}
              </p>
            )}
          </div>
        </div>

        {/* Vertical Dividers */}
        <div className="pointer-events-none absolute inset-y-2 left-1/3 w-px bg-zinc-300 dark:bg-zinc-600" />
        <div className="pointer-events-none absolute inset-y-2 left-2/3 w-px bg-zinc-300 dark:bg-zinc-600" />
      </div>
    </Link>
  );
}


// Tab types for filtering
type TabType = "all" | "pending" | "changes_requested" | "in_progress" | "completed" | "expired";

// Tab button component
function TabButton({
  label,
  icon: Icon,
  iconColor,
  isActive,
  onClick,
  count,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
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
      {count !== undefined && count > 0 && (
        <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none ${
          isActive
            ? "bg-white/20 text-white dark:bg-zinc-900/30 dark:text-zinc-900"
            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// Map tab to status filters - defined outside component to avoid recreating
const tabStatusMap: Record<TabType, EnrollmentStatus[] | undefined> = {
  all: undefined,
  pending: ["awaiting_submission"],
  changes_requested: ["changes_requested"],
  in_progress: ["awaiting_review"],
  completed: ["approved", "permanently_rejected", "withdrawn"],
  expired: ["expired"],
};

// Tab label mapping
const tabLabels: Record<TabType, string> = {
  all: "All",
  pending: "Pending",
  changes_requested: "Action Required",
  in_progress: "Under Review",
  completed: "Completed",
  expired: "Expired",
};

export function EnrollmentsList() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasInitialData, setHasInitialData] = useState(false);

  // Debounced search for API calls
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const params = useMemo(
    () => ({
      limit: 20,
      q: debouncedSearch || undefined,
    }),
    [debouncedSearch]
  );

  const {
    data: enrollments,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
  } = useInfiniteEnrollments(params);

  // Filter enrollments based on active tab (search is handled by backend)
  const filteredEnrollments = useMemo(() => {
    let filtered = enrollments;

    // Filter by tab status (client-side since we fetch all and filter by tab)
    const tabStatuses = tabStatusMap[activeTab];
    if (tabStatuses) {
      filtered = filtered.filter((e) => tabStatuses.includes(e.status as EnrollmentStatus));
    }

    return filtered;
  }, [enrollments, activeTab]);

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

  const stats = useMemo(() => {
    if (!enrollments.length) return null;
    return {
      total: enrollments.length,
      pending: enrollments.filter(
        (e) => e.status === "awaiting_submission"
      ).length,
      changesRequested: enrollments.filter(
        (e) => e.status === "changes_requested"
      ).length,
      inProgress: enrollments.filter(
        (e) => e.status === "awaiting_review"
      ).length,
      completed: enrollments.filter(
        (e) =>
          e.status === "approved" ||
          e.status === "permanently_rejected" ||
          e.status === "withdrawn"
      ).length,
      expired: enrollments.filter(
        (e) => e.status === "expired"
      ).length,
    };
  }, [enrollments]);

  // Track if user ever had enrollments (to keep UI stable during search)
  useEffect(() => {
    if (!loading && enrollments.length > 0 && !hasInitialData) {
      setHasInitialData(true);
    }
  }, [loading, enrollments.length, hasInitialData]);

  // Show search/tabs if we ever had data OR currently have data
  const showControls = hasInitialData || enrollments.length > 0;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div>
        <Heading>Enrollments</Heading>
        <Text className="mt-0.5 text-sm">Track your campaign enrollments and earnings</Text>
      </div>

      {/* Search Bar - only show when there are enrollments */}
      {showControls && (
        <InputGroup>
          <MagnifyingGlassIcon />
          <Input
            name="search"
            placeholder="Search by product, campaign, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      )}

      {/* Tabs - only show when there are enrollments */}
      {showControls && (
        <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 py-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabButton
            label={tabLabels.all}
            icon={QueueListIcon}
            iconColor="text-sky-500"
            isActive={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          />
          <TabButton
            label={tabLabels.pending}
            icon={DocumentTextIcon}
            iconColor="text-amber-500"
            isActive={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
            count={stats?.pending}
          />
          <TabButton
            label={tabLabels.changes_requested}
            icon={ExclamationTriangleIcon}
            iconColor="text-orange-500"
            isActive={activeTab === "changes_requested"}
            onClick={() => setActiveTab("changes_requested")}
            count={stats?.changesRequested}
          />
          <TabButton
            label={tabLabels.in_progress}
            icon={ClockIcon}
            iconColor="text-sky-500"
            isActive={activeTab === "in_progress"}
            onClick={() => setActiveTab("in_progress")}
            count={stats?.inProgress}
          />
          <TabButton
            label={tabLabels.completed}
            icon={CheckCircleIcon}
            iconColor="text-emerald-500"
            isActive={activeTab === "completed"}
            onClick={() => setActiveTab("completed")}
          />
          <TabButton
            label={tabLabels.expired}
            icon={XCircleIcon}
            iconColor="text-red-500"
            isActive={activeTab === "expired"}
            onClick={() => setActiveTab("expired")}
            count={stats?.expired}
          />
        </div>
      )}

      {/* Results count - only show when there are filtered results */}
      {!loading && filteredEnrollments.length > 0 && (
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 sm:pb-3 dark:border-zinc-700">
          <p className="text-[13px] text-zinc-500 sm:text-sm">
            {`${filteredEnrollments.length} enrollment${filteredEnrollments.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-zinc-50 py-12 sm:py-16 dark:bg-zinc-900/50">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
            <XMarkIcon className="size-6 text-red-500" />
          </div>
          <p className="mt-4 font-semibold text-zinc-900 dark:text-white">Something went wrong</p>
          <p className="mt-1 text-sm text-zinc-500">Unable to load enrollments</p>
          <Button onClick={() => refetch()} outline className="mt-5">
            Try again
          </Button>
        </div>
      ) : filteredEnrollments.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 lg:gap-4">
            {filteredEnrollments.map((enrollment) => (
              <EnrollmentCard
                key={enrollment.id}
                enrollment={
                  enrollment as Parameters<typeof EnrollmentCard>[0]["enrollment"]
                }
                searchQuery={debouncedSearch}
              />
            ))}
          </div>

          {/* Infinite scroll trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-4 sm:py-6">
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
          preset="enrollments"
          title={activeTab !== "all" || debouncedSearch ? "No matching enrollments" : "No enrollments yet"}
          description={activeTab !== "all" || debouncedSearch ? "Try adjusting your filters or search to find your enrollments." : "Start earning cashback by enrolling in campaigns."}
          action={activeTab === "all" && !debouncedSearch ? { label: "Browse Campaigns", href: "/campaigns" } : undefined}
        />
      )}
    </div>
  );
}
