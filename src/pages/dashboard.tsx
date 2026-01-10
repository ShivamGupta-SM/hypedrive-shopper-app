import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Link } from "@/components/link";
import { Text } from "@/components/text";
import {
  useActiveCampaigns,
  useEarningsHistory,
  useEnrollments,
  useShopperProfile,
  useShopperStats,
} from "@/hooks/use-api";
import { getStatusColors, semanticColors } from "@/lib/theme";
import {
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from "@heroicons/react/16/solid";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatWeekLabel(period: string): string {
  // Format: "2024-W01" -> "W1"
  if (period.includes("W")) {
    const weekNum = parseInt(period.split("W")[1], 10);
    return `W${weekNum}`;
  }
  return period;
}

// =============================================================================
// LOADING STATE
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-4 w-32 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
      {/* Balance card skeleton */}
      <div className="h-32 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-2">
        <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      </div>
      {/* Campaigns skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-4 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
      </div>
    </div>
  );
}

// =============================================================================
// BALANCE CARD - The most important element (Why user is here)
// Purpose: Show money earned, create motivation to continue
// =============================================================================

function BalanceCard({
  available,
  pending,
  lifetime,
  canWithdraw,
}: {
  available: string;
  pending: string;
  lifetime: string;
  canWithdraw: boolean;
}) {
  const hasBalance = parseFloat(available) > 0;
  const hasPending = parseFloat(pending) > 0;

  return (
    <div className="rounded-2xl bg-emerald-600 p-5 dark:bg-emerald-700">
      {/* Available Balance - Hero */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-emerald-100">Available to withdraw</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-white">
            ₹{available}
          </p>
        </div>
        {hasBalance && canWithdraw && (
          <Button href="/wallet" color="white">
            Withdraw
          </Button>
        )}
      </div>

      {/* Money stats only - enrollment stats moved to JourneyStats */}
      <div className="mt-5 flex gap-6 border-t border-emerald-500/40 pt-4">
        {hasPending && (
          <div>
            <p className="text-xs text-emerald-200">Pending</p>
            <p className="text-sm font-semibold text-amber-300">₹{pending}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-emerald-200">Lifetime earnings</p>
          <p className="text-sm font-semibold text-white">₹{lifetime}</p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ACTION ALERTS - Critical tasks that block user progress
// Purpose: Remove friction, help user complete pending actions
// =============================================================================

function ActionAlerts({
  alerts,
}: {
  alerts: Array<{
    id: string;
    type: "proof" | "kyc";
    title: string;
    description: string;
    href: string;
  }>;
}) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <Link
          key={alert.id}
          href={alert.href}
          className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
            {alert.type === "proof" ? (
              <DocumentArrowUpIcon className="size-5 text-amber-600 dark:text-amber-400" />
            ) : (
              <ExclamationTriangleIcon className="size-5 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-amber-900 dark:text-amber-100">
              {alert.title}
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {alert.description}
            </p>
          </div>
          <ArrowRightIcon className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        </Link>
      ))}
    </div>
  );
}

// =============================================================================
// JOURNEY STATS - Colorful stat cards
// Purpose: Show progress with visual, colorful cards
// =============================================================================

function JourneyStats({
  enrolled,
  inProgress,
  completed,
}: {
  enrolled: number;
  inProgress: number;
  completed: number;
}) {
  const stats = [
    {
      label: "Total joined",
      value: enrolled,
      icon: SparklesIcon,
      iconColor: "text-sky-500 dark:text-sky-400",
    },
    {
      label: "In progress",
      value: inProgress,
      icon: ClockIcon,
      iconColor: "text-amber-500 dark:text-amber-400",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircleIcon,
      iconColor: "text-emerald-500 dark:text-emerald-400",
    },
  ];

  return (
    <div className="-mx-0.5 flex gap-2 px-0.5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-1 flex-col rounded-xl bg-white p-3 ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10"
        >
          <div className="flex items-center gap-1.5">
            <stat.icon className={`size-4 ${stat.iconColor}`} />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</span>
          </div>
          <p className="mt-1 text-base font-semibold text-zinc-900 sm:text-lg dark:text-white">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// EARNINGS CHART - Weekly trend with bar visualization
// Purpose: Show growth pattern visually with bars
// =============================================================================

function EarningsChart({
  data,
  thisWeek,
  trend,
}: {
  data: Array<{ label: string; value: number }>;
  thisWeek: string;
  trend: number;
}) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            This week
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            ₹{thisWeek}
          </p>
        </div>
        {trend !== 0 && (
          <div
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              trend > 0
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
            }`}
          >
            <ArrowTrendingUpIcon
              className={`size-3.5 ${trend < 0 ? "rotate-180" : ""}`}
            />
            {trend > 0 ? "+" : ""}
            {trend}%
          </div>
        )}
      </div>

      {/* Bar Chart */}
      <div className="mt-4 flex items-end gap-2">
        {data.map((item, i) => {
          const height = (item.value / maxValue) * 100;
          const isLast = i === data.length - 1;
          return (
            <div
              key={item.label}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="relative h-16 w-full">
                <div
                  className={`absolute inset-x-0 bottom-0 rounded-md transition-all ${
                    isLast
                      ? "bg-emerald-500 dark:bg-emerald-400"
                      : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                  style={{ height: `${Math.max(height, 8)}%` }}
                />
              </div>
              <span className="text-[10px] font-medium tabular-nums text-zinc-400">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// ACTIVE CAMPAIGNS SECTION - Opportunities to earn more
// Purpose: Drive discovery, show what's available
// =============================================================================

function CampaignCard({
  campaign,
}: {
  campaign: {
    id: string;
    title: string;
    type?: string;
    campaignType?: string;
    product?: { name?: string; primaryImage?: string; priceDecimal?: string };
    platform?: { name?: string; icon?: string };
    rebatePercentage?: number;
    bonusAmountDecimal?: string;
    organization?: { name?: string };
  };
}) {
  const cashback =
    campaign.rebatePercentage && campaign.rebatePercentage > 0
      ? `${campaign.rebatePercentage}%`
      : null;
  const bonus = campaign.bonusAmountDecimal
    ? `₹${campaign.bonusAmountDecimal}`
    : null;

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
    >
      {/* Product image - 4:3 aspect ratio */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {campaign.product?.primaryImage ? (
          <img
            src={campaign.product.primaryImage}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <SparklesIcon className="size-10 text-zinc-300 dark:text-zinc-600" />
          </div>
        )}
        {/* Platform icon */}
        {campaign.platform?.icon && (
          <div className="absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-md bg-white/90 shadow-sm backdrop-blur-sm dark:bg-zinc-900/90">
            <img
              src={campaign.platform.icon}
              alt={campaign.platform.name || ""}
              className="size-5 object-contain"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Brand */}
        {campaign.organization?.name && (
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {campaign.organization.name}
          </p>
        )}

        {/* Product name */}
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-white">
          {campaign.product?.name || campaign.title}
        </h3>

        {/* Price + Rewards row */}
        <div className="mt-2 flex items-baseline justify-between gap-2">
          {/* Price */}
          {campaign.product?.priceDecimal && (
            <p className="text-base font-bold text-zinc-900 dark:text-white">
              ₹{campaign.product.priceDecimal}
            </p>
          )}

          {/* Cashback badges */}
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
      </div>
    </Link>
  );
}

function CampaignsSection({
  campaigns,
}: {
  campaigns: Array<{
    id: string;
    title: string;
    type?: string;
    campaignType?: string;
    product?: { name?: string; primaryImage?: string; priceDecimal?: string };
    platform?: { name?: string; icon?: string };
    rebatePercentage?: number;
    bonusAmountDecimal?: string;
    organization?: { name?: string };
  }>;
}) {
  if (campaigns.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Earn cashback
        </h2>
        <Link
          href="/campaigns"
          className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400"
        >
          View all
          <ChevronRightIcon className="size-3.5" />
        </Link>
      </div>
      {/* Results count - consistent with other pages */}
      <div className="mb-3 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">
          {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
        </p>
      </div>
      {/* Responsive grid layout - consistent with campaigns list */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {campaigns.slice(0, 8).map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </section>
  );
}

// =============================================================================
// RECENT ACTIVITY - Track ongoing enrollments
// Purpose: Keep user engaged with their progress
// =============================================================================

function EnrollmentCard({
  enrollment,
}: {
  enrollment: {
    id: string;
    status: string;
    orderId?: string;
    orderValueDecimal?: string;
    lockedRebatePercentage?: number;
    lockedBonusAmountDecimal?: string;
    createdAt?: string;
    campaign?: {
      title?: string;
      product?: {
        name?: string;
        primaryImage?: string;
      };
      platform?: {
        name?: string;
        icon?: string;
      };
    };
    payoutAmountDecimal?: string;
  };
}) {
  // Status labels and icons mapping
  const statusLabels: Record<string, { label: string; icon: typeof ClockIcon }> = {
    awaiting_submission: { label: "Pending", icon: DocumentArrowUpIcon },
    awaiting_review: { label: "In Review", icon: ClockIcon },
    changes_requested: { label: "Changes Needed", icon: ExclamationTriangleIcon },
    approved: { label: "Approved", icon: CheckCircleIcon },
  };

  const statusInfo = statusLabels[enrollment.status] || statusLabels.awaiting_review;
  const statusColors = getStatusColors(enrollment.status);
  const Icon = statusInfo.icon;

  const productName = enrollment.campaign?.product?.name || enrollment.campaign?.title || "Campaign";
  const productImage = enrollment.campaign?.product?.primaryImage;
  const platformIcon = enrollment.campaign?.platform?.icon;
  const platformName = enrollment.campaign?.platform?.name;

  // Format relative time
  const formatRelativeTime = (dateString?: string) => {
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
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const relativeTime = formatRelativeTime(enrollment.createdAt);

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
                <SparklesIcon className="size-5 text-zinc-400" />
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
              {productName}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {enrollment.orderId ? `#${enrollment.orderId} · ` : ""}{relativeTime}
            </p>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 rounded-md px-2 py-1 ${statusColors.bg}`}>
            <Icon className={`size-3.5 ${statusColors.icon}`} />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Financials Row */}
        {(enrollment.orderValueDecimal || enrollment.payoutAmountDecimal) && (
          <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
            {enrollment.orderValueDecimal && (
              <div className="flex items-baseline gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-zinc-400">Order</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    ₹{enrollment.orderValueDecimal}
                  </p>
                </div>
                {enrollment.lockedRebatePercentage && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-zinc-400">Rate</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {enrollment.lockedRebatePercentage}%
                    </p>
                  </div>
                )}
              </div>
            )}
            {enrollment.payoutAmountDecimal && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-zinc-400">Cashback</p>
                <p className={`text-sm font-bold ${semanticColors.success.text}`}>
                  +₹{enrollment.payoutAmountDecimal}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

function EnrollmentsSection({
  enrollments,
}: {
  enrollments: Array<{
    id: string;
    status: string;
    orderId?: string;
    orderValueDecimal?: string;
    lockedRebatePercentage?: number;
    lockedBonusAmountDecimal?: string;
    createdAt?: string;
    campaign?: {
      title?: string;
      product?: {
        name?: string;
        primaryImage?: string;
      };
      platform?: {
        name?: string;
        icon?: string;
      };
    };
    payoutAmountDecimal?: string;
  }>;
}) {
  if (enrollments.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Your enrollments
        </h2>
        <Link
          href="/enrollments"
          className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400"
        >
          View all
          <ChevronRightIcon className="size-3.5" />
        </Link>
      </div>
      {/* Results count - consistent with other pages */}
      <div className="mb-3 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">
          {enrollments.length} enrollment{enrollments.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        {enrollments.slice(0, 4).map((enrollment) => (
          <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
        ))}
      </div>
    </section>
  );
}

// =============================================================================
// EMPTY STATE - New user onboarding
// Purpose: Guide new users to take first action
// =============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
        <SparklesIcon className="size-8 text-zinc-400" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">
        Start earning cashback
      </h2>
      <p className="mt-1 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
        Join campaigns, shop from partner brands, and get money back on every purchase.
      </p>
      <Button href="/campaigns" className="mt-6">
        Browse campaigns
      </Button>
    </div>
  );
}

// =============================================================================
// MAIN DASHBOARD
// =============================================================================

export function Dashboard() {
  const { data: profile, loading: profileLoading } = useShopperProfile();
  const { data: stats, loading: statsLoading } = useShopperStats();
  const { data: enrollmentsData, loading: enrollmentsLoading } = useEnrollments({
    limit: 10,
  });
  const { data: campaigns, loading: campaignsLoading } = useActiveCampaigns(10);
  const { data: earningsData } = useEarningsHistory("weekly");

  // Loading state
  if (profileLoading || statsLoading || enrollmentsLoading || campaignsLoading) {
    return <LoadingSkeleton />;
  }

  // Extract data
  const firstName =
    profile?.shopper?.firstName ||
    profile?.user?.name?.split(" ")[0] ||
    "there";
  const enrollments = enrollmentsData?.data || [];
  const isNewUser = (stats?.totalEnrollments || 0) === 0;

  // Balance data
  const available = profile?.walletBalanceDecimal || "0.00";
  const pending = profile?.pendingPayoutsDecimal || "0.00";
  const lifetime = stats?.totalEarningsDecimal || "0.00";
  const kycVerified = profile?.shopper?.kycStatus === "verified";
  const availableAmount = parseFloat(available);
  // KYC required only for withdrawals above ₹30,000
  const KYC_THRESHOLD = 30000;
  const needsKycForWithdrawal = availableAmount > KYC_THRESHOLD && !kycVerified;
  const canWithdraw = availableAmount > 0 && !needsKycForWithdrawal;

  // Stats data
  const inProgress = (stats?.awaitingSubmission || 0) + (stats?.awaitingReview || 0);
  const completed = stats?.approved || 0;

  // Build action alerts
  const alerts: Array<{
    id: string;
    type: "proof" | "kyc";
    title: string;
    description: string;
    href: string;
  }> = [];

  const needsProof = enrollments.filter(
    (e) => e.status === "changes_requested"
  ).length;
  if (needsProof > 0) {
    alerts.push({
      id: "proof",
      type: "proof",
      title: `${needsProof} enrollment${needsProof > 1 ? "s" : ""} need proof`,
      description: "Upload purchase proof to complete verification",
      href: "/enrollments?status=changes_requested",
    });
  }

  // Show KYC alert only if balance exceeds threshold and KYC not done
  if (needsKycForWithdrawal) {
    alerts.push({
      id: "kyc",
      type: "kyc",
      title: "Complete KYC to withdraw",
      description: `KYC required for withdrawals above ₹${KYC_THRESHOLD.toLocaleString("en-IN")}`,
      href: "/settings",
    });
  }

  // Earnings data with chart
  const earnings = earningsData?.earnings || [];
  const chartData = earnings.slice(-4).map((e) => ({
    label: formatWeekLabel(e.period),
    value: parseFloat(e.earningsDecimal) || 0,
  }));
  const thisWeek = earnings[earnings.length - 1]?.earningsDecimal || "0.00";
  const lastWeek = parseFloat(
    earnings[earnings.length - 2]?.earningsDecimal || "0"
  );
  const thisWeekNum = parseFloat(thisWeek);
  const trend =
    lastWeek > 0
      ? Math.round(((thisWeekNum - lastWeek) / lastWeek) * 100)
      : thisWeekNum > 0
        ? 100
        : 0;

  // Total enrolled for stats
  const enrolled = stats?.totalEnrollments || 0;

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Heading>
          {greeting}, {firstName}
        </Heading>
        <Text className="mt-1 text-sm">
          {isNewUser ? "Let's get you started" : "Here's your earnings summary"}
        </Text>
      </div>

      {isNewUser ? (
        <>
          <EmptyState />
          <CampaignsSection campaigns={campaigns || []} />
        </>
      ) : (
        <>
          {/* Balance Card - Money only */}
          <BalanceCard
            available={available}
            pending={pending}
            lifetime={lifetime}
            canWithdraw={canWithdraw}
          />

          {/* Action alerts - Urgency */}
          <ActionAlerts alerts={alerts} />

          {/* Journey Stats - Enrollment progress (colorful cards) */}
          <JourneyStats
            enrolled={enrolled}
            inProgress={inProgress}
            completed={completed}
          />

          {/* Earnings Chart - Weekly trend with bars */}
          {chartData.length > 0 && (
            <EarningsChart data={chartData} thisWeek={thisWeek} trend={trend} />
          )}

          {/* Campaigns to explore */}
          <CampaignsSection campaigns={campaigns || []} />

          {/* Recent enrollments */}
          <EnrollmentsSection enrollments={enrollments} />
        </>
      )}
    </div>
  );
}
