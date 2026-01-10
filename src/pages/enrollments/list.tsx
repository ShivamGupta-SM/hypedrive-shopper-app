import {
  ArrowPathIcon,
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
import { Select } from "@/components/select";
import { Text } from "@/components/text";
import { useInfiniteEnrollments } from "@/hooks/use-api";
import type { shared } from "@/hooks/use-api";
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
    default: {
      bg: "bg-zinc-100 dark:bg-zinc-800",
      text: "text-zinc-600 dark:text-zinc-400",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-950/50",
      text: "text-amber-600 dark:text-amber-400",
    },
    info: {
      bg: "bg-sky-50 dark:bg-sky-950/50",
      text: "text-sky-600 dark:text-sky-400",
    },
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      text: "text-emerald-600 dark:text-emerald-400",
    },
  }[variant];

  return (
    <div className="flex flex-col rounded-xl bg-white p-3 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className={`flex size-8 items-center justify-center rounded-lg ${styles.bg}`}>
        <Icon className={`size-4 ${styles.text}`} />
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-0.5 text-lg font-bold text-zinc-900 dark:text-white">{value}</p>
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

  const daysRemaining = useMemo(() => {
    if (!enrollment.expiresAt) return null;
    const expiresAt = new Date(enrollment.expiresAt);
    const now = new Date();
    return Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  }, [enrollment.expiresAt]);

  const isExpiringSoon =
    daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 3;
  const isActionRequired =
    enrollment.status === "awaiting_submission" ||
    enrollment.status === "changes_requested";

  const productName = enrollment.campaign?.product?.name || enrollment.campaign?.title;
  const productImage = enrollment.campaign?.product?.primaryImage;
  const platformIcon = enrollment.campaign?.platform?.icon;
  const platformName = enrollment.campaign?.platform?.name;
  const actionHint = getActionHint(enrollment.status);
  const relativeTime = formatRelativeTime(enrollment.createdAt);
  const bonusAmount = enrollment.lockedBonusAmountDecimal
    ? parseFloat(enrollment.lockedBonusAmountDecimal)
    : 0;

  return (
    <Link
      href={`/enrollments/${enrollment.id}`}
      className="flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
    >
      <div className="flex flex-1 flex-col p-4">
        {/* Header: Product + Status */}
        <div className="flex items-start gap-3">
          {/* Product Thumbnail */}
          <div className="relative shrink-0">
            {productImage ? (
              <div className="size-12 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <img src={productImage} alt="" className="size-full object-cover" />
              </div>
            ) : (
              <div className="flex size-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <ShoppingBagIcon className="size-5 text-zinc-400" />
              </div>
            )}
            {platformIcon && (
              <img
                src={platformIcon}
                alt={platformName}
                className="absolute -bottom-1 -right-1 size-5 rounded border border-white bg-white object-contain dark:border-zinc-900 dark:bg-zinc-900"
              />
            )}
          </div>

          {/* Product Info */}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-white">
              {productName || "Campaign Enrollment"}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              #{enrollment.orderId} · {relativeTime}
            </p>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 rounded-md px-2 py-1 ${statusConfig.bgClass}`}>
            <StatusIcon className={`size-3.5 ${statusConfig.iconClass}`} />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Action Alert */}
        {(isActionRequired || isExpiringSoon) && (
          <div className={`mt-3 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium ${
            isExpiringSoon
              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
              : "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
          }`}>
            {isExpiringSoon ? (
              <>
                <ClockIcon className="size-3.5" />
                Expires in {daysRemaining}d - Submit now
              </>
            ) : (
              <>
                <ExclamationTriangleIcon className="size-3.5" />
                {actionHint}
              </>
            )}
          </div>
        )}

        {/* Financials Row */}
        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <div className="flex items-baseline gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-zinc-400">Order</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                {formatCurrency(enrollment.orderValueDecimal)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-zinc-400">Rate</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {enrollment.lockedRebatePercentage}%
                </span>
                {bonusAmount > 0 && (
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    +₹{Math.round(bonusAmount)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-zinc-400">Cashback</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(estimatedPayout)}
            </p>
          </div>
        </div>
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

const statusOptions: { value: EnrollmentStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "awaiting_submission", label: "Awaiting Submission" },
  { value: "awaiting_review", label: "Under Review" },
  { value: "changes_requested", label: "Changes Requested" },
  { value: "approved", label: "Approved" },
  { value: "permanently_rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "expired", label: "Expired" },
];

export function EnrollmentsList() {
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | "">("");

  const params = useMemo(
    () => ({
      status: statusFilter || undefined,
      limit: 20,
    }),
    [statusFilter]
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

  const hasActiveFilter = statusFilter !== "";

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
        (e) =>
          e.status === "awaiting_submission" || e.status === "awaiting_review"
      ).length,
      approved: enrollments.filter((e) => e.status === "approved").length,
    };
  }, [enrollments]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Heading>Enrollments</Heading>
        <Text className="mt-1 text-sm">Track your campaign enrollments and earnings</Text>
      </div>

      {/* Quick Stats */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-4 gap-2">
          <StatCard icon={ShoppingBagIcon} label="Total" value={stats.total} variant="default" />
          <StatCard icon={ExclamationTriangleIcon} label="Action" value={stats.needsAction} variant="warning" />
          <StatCard icon={ClockIcon} label="Progress" value={stats.inProgress} variant="info" />
          <StatCard icon={CheckCircleIcon} label="Approved" value={stats.approved} variant="success" />
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <Select
          name="status"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as EnrollmentStatus | "")
          }
          className="flex-1 sm:max-w-xs"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={() => refetch()}
          className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
        >
          <ArrowPathIcon className="size-4" />
        </button>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => setStatusFilter("")}
            className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            <XMarkIcon className="size-4" />
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">
          {loading
            ? "Loading..."
            : `${enrollments.length} enrollment${enrollments.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-zinc-50 py-16 dark:bg-zinc-900/50">
          <div className="flex size-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/50">
            <XMarkIcon className="size-6 text-rose-500" />
          </div>
          <p className="mt-4 font-semibold text-zinc-900 dark:text-white">Something went wrong</p>
          <p className="mt-1 text-sm text-zinc-500">Unable to load enrollments</p>
          <Button onClick={() => refetch()} outline className="mt-5">
            Try again
          </Button>
        </div>
      ) : enrollments.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
            {enrollments.map((enrollment) => (
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
        <EmptyState hasFilters={hasActiveFilter} />
      )}
    </div>
  );
}
