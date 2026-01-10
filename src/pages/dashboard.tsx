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
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-4 w-32 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
      {/* Balance card skeleton */}
      <div className="h-32 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-3">
        <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
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
      bgColor: "bg-sky-50 dark:bg-sky-950/40",
      textColor: "text-sky-700 dark:text-sky-300",
      subColor: "text-sky-600/70 dark:text-sky-400/70",
    },
    {
      label: "In progress",
      value: inProgress,
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      textColor: "text-amber-700 dark:text-amber-300",
      subColor: "text-amber-600/70 dark:text-amber-400/70",
    },
    {
      label: "Completed",
      value: completed,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      textColor: "text-emerald-700 dark:text-emerald-300",
      subColor: "text-emerald-600/70 dark:text-emerald-400/70",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <div key={stat.label} className={`rounded-xl ${stat.bgColor} p-3.5`}>
          <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
          <p className={`mt-0.5 text-[11px] font-medium ${stat.subColor}`}>
            {stat.label}
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
    ? parseFloat(campaign.bonusAmountDecimal)
    : 0;

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10"
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
          <div className="absolute bottom-2 right-2 flex size-6 items-center justify-center rounded-md bg-white/95 shadow-sm backdrop-blur-sm dark:bg-zinc-900/95">
            <img
              src={campaign.platform.icon}
              alt={campaign.platform.name || ""}
              className="size-4 object-contain"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-2.5">
        {/* Brand */}
        {campaign.organization?.name && (
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-zinc-400">
            {campaign.organization.name}
          </p>
        )}

        {/* Product name */}
        <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-snug text-zinc-900 dark:text-white">
          {campaign.product?.name || campaign.title}
        </p>

        {/* Price + Rewards row */}
        <div className="mt-auto flex items-end justify-between gap-1.5 pt-2">
          {/* Price */}
          {campaign.product?.priceDecimal && (
            <p className="text-sm font-bold text-zinc-900 dark:text-white">
              ₹{campaign.product.priceDecimal}
            </p>
          )}

          {/* Cashback badges */}
          <div className="flex flex-col items-end gap-0.5">
            {cashback && (
              <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {cashback} back
              </span>
            )}
            {bonus > 0 && (
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                +₹{Math.round(bonus)} bonus
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
      {/* Responsive grid layout */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-4">
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

function ActivityItem({
  enrollment,
}: {
  enrollment: {
    id: string;
    status: string;
    campaign?: { title?: string };
    payoutAmountDecimal?: string;
  };
}) {
  // Status labels and icons mapping
  const statusLabels: Record<string, { label: string; icon: typeof ClockIcon }> = {
    awaiting_submission: { label: "Upload proof", icon: DocumentArrowUpIcon },
    awaiting_review: { label: "Under review", icon: ClockIcon },
    changes_requested: { label: "Action needed", icon: ExclamationTriangleIcon },
    approved: { label: "Approved", icon: CheckCircleIcon },
  };

  const statusInfo = statusLabels[enrollment.status] || statusLabels.awaiting_review;
  const statusColors = getStatusColors(enrollment.status);
  const Icon = statusInfo.icon;

  return (
    <Link
      href={`/enrollments/${enrollment.id}`}
      className="flex items-center gap-3 py-3"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <Icon className={`size-4 ${statusColors.icon}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
          {enrollment.campaign?.title || "Campaign"}
        </p>
        <p className={`text-xs ${statusColors.text}`}>{statusInfo.label}</p>
      </div>
      {enrollment.status === "approved" && enrollment.payoutAmountDecimal && (
        <p className={`text-sm font-semibold ${semanticColors.success.text}`}>
          +₹{enrollment.payoutAmountDecimal}
        </p>
      )}
      <ChevronRightIcon className="size-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
    </Link>
  );
}

function ActivitySection({
  enrollments,
}: {
  enrollments: Array<{
    id: string;
    status: string;
    campaign?: { title?: string };
    payoutAmountDecimal?: string;
  }>;
}) {
  if (enrollments.length === 0) return null;

  return (
    <section>
      <div className="mb-1 flex items-center justify-between">
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
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {enrollments.slice(0, 4).map((enrollment) => (
          <ActivityItem key={enrollment.id} enrollment={enrollment} />
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
      <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
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
    <div className="space-y-6">
      {/* Header */}
      <header>
        <Heading className="text-2xl">
          {greeting}, {firstName}
        </Heading>
        <Text className="mt-1">
          {isNewUser ? "Let's get you started" : "Here's your earnings summary"}
        </Text>
      </header>

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
          <ActivitySection enrollments={enrollments} />
        </>
      )}
    </div>
  );
}
