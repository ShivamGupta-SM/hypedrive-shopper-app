import {
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Link } from "@/components/link";
import { Text } from "@/components/text";
import type { shared } from "@/hooks/use-api";
import { useInfiniteEnrollments } from "@/hooks/use-api";
import { getStatusColors } from "@/lib/theme";

type EnrollmentStatus = shared.EnrollmentStatus;

function formatRelativeTime(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function getActionHint(status: EnrollmentStatus): string | null {
  const hints: Partial<Record<EnrollmentStatus, string>> = {
    awaiting_submission: "Upload receipt",
    changes_requested: "Resubmit proof",
    awaiting_review: "Under review",
    approved: "Cashback credited",
    permanently_rejected: "Not eligible",
    expired: "Deadline passed",
    withdrawn: "Cancelled",
  };
  return hints[status] || null;
}

function formatCurrency(amount: string | number) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function getStatusConfig(status: EnrollmentStatus): {
  label: string;
  icon: typeof CheckCircleIcon;
  bgClass: string;
  iconClass: string;
} {
  // Get colors from centralized theme
  const colors = getStatusColors(status);

  // Status-specific labels and icons
  const statusInfo: Record<EnrollmentStatus, { label: string; icon: typeof CheckCircleIcon }> = {
    awaiting_submission: { label: "Pending", icon: DocumentTextIcon },
    awaiting_review: { label: "In Review", icon: ClockIcon },
    changes_requested: { label: "Changes Needed", icon: ExclamationTriangleIcon },
    approved: { label: "Approved", icon: CheckCircleIcon },
    permanently_rejected: { label: "Rejected", icon: XCircleIcon },
    withdrawn: { label: "Withdrawn", icon: XMarkIcon },
    expired: { label: "Expired", icon: ClockIcon },
  };

  const info = statusInfo[status] || { label: status, icon: ClockIcon };

  return {
    label: info.label,
    icon: info.icon,
    bgClass: colors.bg,
    iconClass: colors.icon,
  };
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="size-12 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-3 w-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <div className="h-5 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-5 w-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  variant = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  variant?: "default" | "warning" | "info" | "success";
}) {
  const styles = {
    default: { icon: "text-zinc-500 dark:text-zinc-400" },
    warning: { icon: "text-amber-500 dark:text-amber-400" },
    info: { icon: "text-sky-500 dark:text-sky-400" },
    success: { icon: "text-emerald-500 dark:text-emerald-400" },
  }[variant];

  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <Icon className={`size-4 shrink-0 ${styles.icon}`} />
      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-base font-semibold text-zinc-900 dark:text-white">{value}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      </div>
    </div>
  );
}

// Circular gauge for deadline visualization - number centered inside ring
function DeadlineGauge({
  daysRemaining,
  totalDays = 30
}: {
  daysRemaining: number;
  totalDays?: number;
}) {
  // Calculate percentage (clamped between 0 and 100)
  const percentage = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));

  // Color based on urgency - more nuanced thresholds
  const getColor = () => {
    if (daysRemaining <= 2) return { stroke: "#ef4444", text: "text-red-600 dark:text-red-400" };
    if (daysRemaining <= 5) return { stroke: "#f59e0b", text: "text-amber-600 dark:text-amber-400" };
    if (daysRemaining <= 14) return { stroke: "#3b82f6", text: "text-blue-600 dark:text-blue-400" };
    return { stroke: "#10b981", text: "text-emerald-600 dark:text-emerald-400" };
  };

  const colors = getColor();

  // Circle parameters
  const size = 52;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <title>{daysRemaining} days remaining</title>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-200 dark:text-zinc-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {/* Centered text */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${colors.text}`}>
        <span className="text-sm font-bold leading-none">{daysRemaining}</span>
        <span className="text-[8px] font-medium uppercase tracking-wide">days</span>
      </div>
    </div>
  );
}

function EnrollmentCard({
  enrollment,
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
    submissions?: Array<{
      id: string;
      deliverableName: string;
      isRequired: boolean;
      requireLink: boolean;
      requireScreenshot: boolean;
      proofLink?: string;
      proofScreenshot?: string;
    }>;
  };
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

  const isExpiringSoon =
    deadlineInfo !== null && deadlineInfo.daysRemaining > 0 && deadlineInfo.daysRemaining <= 3;
  const isActionRequired =
    enrollment.status === "awaiting_submission" ||
    enrollment.status === "changes_requested";
  const hasDeadline = deadlineInfo !== null && deadlineInfo.daysRemaining > 0;

  const productName = enrollment.campaign?.product?.name || enrollment.campaign?.title;
  const productImage = enrollment.campaign?.product?.primaryImage;
  const platformIcon = enrollment.campaign?.platform?.icon;
  const platformName = enrollment.campaign?.platform?.name;
  const actionHint = getActionHint(enrollment.status);
  const relativeTime = formatRelativeTime(enrollment.createdAt);

  // Get deliverables info
  const deliverables = enrollment.submissions || [];
  const completedDeliverables = deliverables.filter(d => d.proofLink || d.proofScreenshot);

  return (
    <Link
      href={`/enrollments/${enrollment.id}`}
      className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
    >
      {/* Header: Product + Status */}
      <div className="flex items-start gap-2.5 p-3 sm:gap-3 sm:p-4">
        {/* Product Thumbnail */}
        <div className="relative shrink-0">
          <div className="size-11 overflow-hidden rounded-lg bg-zinc-100 sm:size-12 dark:bg-zinc-800">
            {productImage ? (
              <img
                src={productImage}
                alt={productName || "Product"}
                className="size-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="flex size-full items-center justify-center"><svg class="size-5 text-zinc-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M3.5 2A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 12.5 2h-9ZM5 5.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 5.75Zm.75 2.25a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5ZM5 10.75a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" /></svg></div>';
                  }
                }}
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <ShoppingBagIcon className="size-5 text-zinc-400" />
              </div>
            )}
          </div>
          {platformIcon && (
            <img
              src={platformIcon}
              alt={platformName}
              className="absolute -bottom-0.5 -right-0.5 size-4 rounded border border-white bg-white object-contain dark:border-zinc-900 dark:bg-zinc-900"
            />
          )}
        </div>

        {/* Product Info + Status */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 text-[13px] font-medium text-zinc-900 sm:text-sm dark:text-white">
              {productName || "Campaign Enrollment"}
            </p>
            {/* Status Badge */}
            <div className={`flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 ${statusConfig.bgClass}`}>
              <StatusIcon className={`size-3 ${statusConfig.iconClass}`} />
              <span className="text-[10px] font-medium text-zinc-700 sm:text-[11px] dark:text-zinc-300">
                {statusConfig.label}
              </span>
            </div>
          </div>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            Order #{enrollment.orderId} · {relativeTime}
          </p>
        </div>
      </div>

      {/* Edge-to-edge divider */}
      <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

      {/* Amount Row */}
      <div className="flex items-stretch gap-3 p-3 sm:gap-4 sm:p-4">
        {/* Order Value */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500 sm:text-[10px] dark:text-zinc-400">
            Order Value
          </p>
          <p className="mt-0.5 text-base font-semibold text-zinc-900 sm:text-lg dark:text-white">
            {formatCurrency(enrollment.orderValueDecimal)}
          </p>
        </div>

        {/* Vertical Divider */}
        <div className="my-1 w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />

        {/* Cashback Amount */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500 sm:text-[10px] dark:text-zinc-400">
            {enrollment.status === "approved" ? "Earned" : "Cashback"}
          </p>
          <p className="mt-0.5 text-base font-bold text-emerald-600 sm:text-lg dark:text-emerald-400">
            +{formatCurrency(estimatedPayout)}
          </p>
        </div>

        {/* Deadline Gauge - Only show for action required statuses */}
        {isActionRequired && hasDeadline && (
          <>
            <div className="my-1 w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
            <DeadlineGauge daysRemaining={deadlineInfo.daysRemaining} />
          </>
        )}
      </div>

      {/* Deliverables Chips - if present */}
      {deliverables.length > 0 && (
        <>
          {/* Edge-to-edge divider */}
          <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex flex-wrap gap-1.5 p-3 sm:p-4">
            {deliverables.slice(0, 3).map((d) => {
              const isComplete = d.proofLink || d.proofScreenshot;
              return (
                <span
                  key={d.id}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-[11px] ${
                    isComplete
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : d.isRequired
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {isComplete ? (
                    <CheckCircleIcon className="size-2.5 text-emerald-500" />
                  ) : d.isRequired ? (
                    <span className="size-1 rounded-full bg-amber-500" />
                  ) : null}
                  {d.deliverableName.length > 12
                    ? `${d.deliverableName.slice(0, 12)}...`
                    : d.deliverableName}
                </span>
              );
            })}
            {deliverables.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 sm:text-[11px] dark:bg-zinc-800 dark:text-zinc-400">
                +{deliverables.length - 3}
              </span>
            )}
          </div>
        </>
      )}

      {/* Action Alert - Only if no deliverables shown and action required */}
      {isActionRequired && deliverables.length === 0 && (
        <>
          {/* Edge-to-edge divider */}
          <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs sm:px-4">
            <div className={`flex items-center gap-1.5 font-medium ${
              isExpiringSoon
                ? "text-red-600 dark:text-red-400"
                : "text-amber-600 dark:text-amber-400"
            }`}>
              {isExpiringSoon ? (
                <ClockIcon className="size-3.5" />
              ) : (
                <ExclamationTriangleIcon className="size-3.5" />
              )}
              <span>{actionHint}</span>
            </div>
            {hasDeadline && (
              <span className="shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500">
                Due {deadlineInfo.formattedDate}
              </span>
            )}
          </div>
        </>
      )}

      {/* Footer Stats Bar */}
      <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
      <div className="flex items-center justify-between px-3 py-2 sm:px-4">
        <div className="flex items-center gap-3 text-[10px] sm:gap-4 sm:text-[11px]">
          <span className="text-zinc-500 dark:text-zinc-400">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{enrollment.lockedRebatePercentage}%</span> cashback
          </span>
          {enrollment.lockedBonusAmountDecimal && parseFloat(enrollment.lockedBonusAmountDecimal) > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400">
              +₹{Math.round(parseFloat(enrollment.lockedBonusAmountDecimal))} bonus
            </span>
          )}
        </div>
        {deliverables.length > 0 && (
          <span className="text-[10px] text-zinc-500 sm:text-[11px] dark:text-zinc-400">
            {completedDeliverables.length}/{deliverables.length} tasks
          </span>
        )}
      </div>
    </Link>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-zinc-50 py-16 dark:bg-zinc-900/50">
      <div className="flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <ShoppingBagIcon className="size-7 text-zinc-400 dark:text-zinc-500" />
      </div>
      <p className="mt-4 font-semibold text-zinc-900 dark:text-white">
        {hasFilters ? "No matching enrollments" : "No enrollments yet"}
      </p>
      <p className="mt-1 max-w-xs text-center text-sm text-zinc-500">
        {hasFilters
          ? "Try adjusting your filters to find your enrollments."
          : "Start earning cashback by enrolling in campaigns."}
      </p>
      {!hasFilters && (
        <Button href="/campaigns" className="mt-5">
          Browse Campaigns
        </Button>
      )}
    </div>
  );
}

// Tab types for filtering
type TabType = "all" | "action" | "in_progress" | "completed" | "expired";

// Tab button component
function TabButton({
  label,
  isActive,
  onClick,
  count,
}: {
  label: string;
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
  action: ["awaiting_submission", "changes_requested"],
  in_progress: ["awaiting_review"],
  completed: ["approved", "rejected", "permanently_rejected", "cancelled", "withdrawn"],
  expired: ["expired"],
};

// Tab label mapping
const tabLabels: Record<TabType, string> = {
  all: "All",
  action: "Action Needed",
  in_progress: "In Review",
  completed: "Completed",
  expired: "Expired",
};

export function EnrollmentsList() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const params = useMemo(
    () => ({
      limit: 20,
    }),
    []
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

  // Filter enrollments based on active tab
  const filteredEnrollments = useMemo(() => {
    const tabStatuses = tabStatusMap[activeTab];
    if (!tabStatuses) return enrollments;
    return enrollments.filter((e) => tabStatuses.includes(e.status as EnrollmentStatus));
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
      needsAction: enrollments.filter(
        (e) =>
          e.status === "awaiting_submission" || e.status === "changes_requested"
      ).length,
      inProgress: enrollments.filter(
        (e) => e.status === "awaiting_review"
      ).length,
      completed: enrollments.filter(
        (e) =>
          e.status === "approved" ||
          e.status === "rejected" ||
          e.status === "permanently_rejected" ||
          e.status === "cancelled" ||
          e.status === "withdrawn"
      ).length,
      expired: enrollments.filter(
        (e) => e.status === "expired"
      ).length,
    };
  }, [enrollments]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div>
        <Heading>Enrollments</Heading>
        <Text className="mt-0.5 text-sm">Track your campaign enrollments and earnings</Text>
      </div>

      {/* Quick Stats - Horizontal scroll on mobile */}
      {stats && stats.total > 0 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 sm:gap-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <StatCard icon={ExclamationTriangleIcon} label="Pending" value={stats.needsAction} variant="warning" />
          <StatCard icon={ClockIcon} label="Review" value={stats.inProgress} variant="info" />
          <StatCard icon={CheckCircleIcon} label="Done" value={stats.completed} variant="success" />
        </div>
      )}

      {/* Tabs - Scrollable */}
      <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 py-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <TabButton
          label={tabLabels.all}
          isActive={activeTab === "all"}
          onClick={() => setActiveTab("all")}
        />
        <TabButton
          label={tabLabels.action}
          isActive={activeTab === "action"}
          onClick={() => setActiveTab("action")}
          count={stats?.needsAction}
        />
        <TabButton
          label={tabLabels.in_progress}
          isActive={activeTab === "in_progress"}
          onClick={() => setActiveTab("in_progress")}
          count={stats?.inProgress}
        />
        <TabButton
          label={tabLabels.completed}
          isActive={activeTab === "completed"}
          onClick={() => setActiveTab("completed")}
        />
        <TabButton
          label={tabLabels.expired}
          isActive={activeTab === "expired"}
          onClick={() => setActiveTab("expired")}
          count={stats?.expired}
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 sm:pb-3 dark:border-zinc-800">
        <p className="text-[13px] text-zinc-500 sm:text-sm">
          {loading
            ? "Loading..."
            : `${filteredEnrollments.length} enrollment${filteredEnrollments.length !== 1 ? "s" : ""}`}
        </p>
      </div>

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
        <EmptyState hasFilters={activeTab !== "all"} />
      )}
    </div>
  );
}
