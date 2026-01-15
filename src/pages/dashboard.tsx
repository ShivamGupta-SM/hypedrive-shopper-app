import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Link } from "@/components/link";
import { Text } from "@/components/text";
import {
  useActiveCampaigns,
  useEnrollments,
  useShopperProfile,
  useShopperStats,
} from "@/hooks/use-api";
import { DashboardSkeleton } from "@/lib/skeleton";
import { getStatusColors } from "@/lib/theme";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from "@heroicons/react/16/solid";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Helper to check if string is a valid URL (not a color hex code)
function _isValidImageUrl(url?: string): boolean {
  if (!url) return false;
  // Check if it's a hex color (6 chars without #, or starts with #)
  if (/^#?[0-9A-Fa-f]{6}$/.test(url)) return false;
  // Check if it looks like a URL
  return url.startsWith('http') || url.startsWith('/') || url.startsWith('data:');
}
void _isValidImageUrl; // suppress unused warning

// =============================================================================
// LOADING STATE
// =============================================================================

function LoadingSkeleton() {
  return <DashboardSkeleton />;
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
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      {/* Available Balance - Hero */}
      <div className="flex items-start justify-between p-4">
        <div>
          <div className="flex items-center gap-1.5">
            <CurrencyRupeeIcon className="size-4 text-emerald-500 dark:text-emerald-400" />
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Available to withdraw</p>
          </div>
          <p className="text-glaze mt-1 text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            ₹{available}
          </p>
        </div>
        {hasBalance && canWithdraw && (
          <Button href="/wallet" color="emerald">
            Withdraw
          </Button>
        )}
      </div>

      {/* Money stats only - enrollment stats moved to JourneyStats */}
      <div className="flex border-t border-zinc-200 dark:border-zinc-700">
        {hasPending && (
          <div className="flex-1 border-r border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <div className="flex items-center gap-1">
              <ClockIcon className="size-3.5 text-amber-500 dark:text-amber-400" />
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Pending</p>
            </div>
            <p className="mt-0.5 text-base font-semibold text-amber-600 dark:text-amber-400">₹{pending}</p>
          </div>
        )}
        <div className="flex-1 px-4 py-3">
          <div className="flex items-center gap-1">
            <CheckCircleIcon className="size-3.5 text-zinc-400 dark:text-zinc-500" />
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Lifetime</p>
          </div>
          <p className="mt-0.5 text-base font-semibold text-zinc-900 dark:text-white">₹{lifetime}</p>
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
          className="flex flex-1 flex-col rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
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
      ? campaign.rebatePercentage
      : null;
  const bonus = campaign.bonusAmountDecimal
    ? parseFloat(campaign.bonusAmountDecimal)
    : null;

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
    >
      {/* Product image - 4:3 aspect ratio */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {campaign.product?.primaryImage ? (
          <img
            src={campaign.product.primaryImage}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <SparklesIcon className="size-10 text-zinc-300 dark:text-zinc-600" />
          </div>
        )}
        {/* Platform icon */}
        {campaign.platform?.icon && (
          <div className="absolute bottom-2 right-2 flex size-6 items-center justify-center rounded-md bg-white/90 shadow-sm dark:bg-zinc-900/90">
            <img
              src={campaign.platform.icon}
              alt={campaign.platform.name || ""}
              loading="lazy"
              decoding="async"
              className="size-4 object-contain"
            />
          </div>
        )}
      </div>

      {/* Content - Product Info */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        {/* Brand + Product Name */}
        <div className="min-w-0 flex-1">
          {campaign.organization?.name && (
            <p className="truncate text-[10px] font-medium uppercase tracking-wide text-zinc-400 sm:text-[11px] dark:text-zinc-500">
              {campaign.organization.name}
            </p>
          )}
          <h3 className="mt-0.5 line-clamp-2 text-[13px] font-medium leading-snug text-zinc-900 sm:text-sm dark:text-white">
            {campaign.product?.name || campaign.title}
          </h3>
        </div>

        {/* Price */}
        {campaign.product?.priceDecimal && (
          <p className="mt-2 text-sm font-bold text-zinc-900 sm:text-base dark:text-white">
            ₹{campaign.product.priceDecimal}
          </p>
        )}
      </div>

      {/* Edge-to-edge divider */}
      <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

      {/* Footer Stats Bar - inspired by enrollment cards */}
      <div className="flex items-center justify-between px-2.5 py-2 sm:px-3">
        <div className="flex items-center gap-2 text-[10px] sm:gap-3 sm:text-[11px]">
          {cashback && (
            <span className="text-emerald-600 dark:text-emerald-400">
              <span className="font-semibold">{cashback}%</span> cashback
            </span>
          )}
          {bonus && bonus > 0 && (
            <span className="text-sky-600 dark:text-sky-400">
              +₹{Math.round(bonus)} bonus
            </span>
          )}
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

  // Calculate estimated payout if not provided
  const estimatedPayout = enrollment.payoutAmountDecimal
    ? parseFloat(enrollment.payoutAmountDecimal)
    : enrollment.orderValueDecimal && enrollment.lockedRebatePercentage
      ? (parseFloat(enrollment.orderValueDecimal) * enrollment.lockedRebatePercentage) / 100 +
        (enrollment.lockedBonusAmountDecimal ? parseFloat(enrollment.lockedBonusAmountDecimal) : 0)
      : 0;

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
                alt=""
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <SparklesIcon className="size-5 text-zinc-400" />
              </div>
            )}
          </div>
          {platformIcon && (
            <img
              src={platformIcon}
              alt={platformName}
              loading="lazy"
              decoding="async"
              className="absolute -bottom-0.5 -right-0.5 size-4 rounded border border-white bg-white object-contain dark:border-zinc-900 dark:bg-zinc-900"
            />
          )}
        </div>

        {/* Product Info + Status */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 text-[13px] font-medium text-zinc-900 sm:text-sm dark:text-white">
              {productName}
            </p>
            {/* Status Badge */}
            <div className={`flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 ${statusColors.bg}`}>
              <Icon className={`size-3 ${statusColors.icon}`} />
              <span className="text-[10px] font-medium text-zinc-700 sm:text-[11px] dark:text-zinc-300">
                {statusInfo.label}
              </span>
            </div>
          </div>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            {enrollment.orderId ? `Order #${enrollment.orderId} · ` : ""}{relativeTime}
          </p>
        </div>
      </div>

      {/* Edge-to-edge divider */}
      <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

      {/* Amount Row */}
      <div className="flex items-stretch">
        {/* Order Value */}
        <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-3 sm:px-4 sm:py-4">
          <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500 sm:text-[10px] dark:text-zinc-400">
            Order Value
          </p>
          <p className="mt-0.5 text-base font-semibold text-zinc-900 sm:text-lg dark:text-white">
            ₹{enrollment.orderValueDecimal || "0"}
          </p>
        </div>

        {/* Vertical Divider */}
        <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />

        {/* Cashback Amount */}
        <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-3 sm:px-4 sm:py-4">
          <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500 sm:text-[10px] dark:text-zinc-400">
            {enrollment.status === "approved" ? "Earned" : "Cashback"}
          </p>
          <p className="mt-0.5 text-base font-bold text-emerald-600 sm:text-lg dark:text-emerald-400">
            +₹{estimatedPayout.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Footer Stats Bar */}
      <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
      <div className="flex items-center justify-between px-3 py-2 sm:px-4">
        <div className="flex items-center gap-3 text-[10px] sm:gap-4 sm:text-[11px]">
          {enrollment.lockedRebatePercentage && (
            <span className="text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{enrollment.lockedRebatePercentage}%</span> cashback
            </span>
          )}
          {enrollment.lockedBonusAmountDecimal && parseFloat(enrollment.lockedBonusAmountDecimal) > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400">
              +₹{Math.round(parseFloat(enrollment.lockedBonusAmountDecimal))} bonus
            </span>
          )}
        </div>
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

  // Loading state
  if (profileLoading || statsLoading || enrollmentsLoading || campaignsLoading) {
    return <LoadingSkeleton />;
  }

  // Extract data - use displayName for greeting (user's preferred public name)
  const displayName =
    profile?.shopper?.displayName ||
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
          {greeting}, {displayName}
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

          {/* Campaigns to explore */}
          <CampaignsSection campaigns={campaigns || []} />

          {/* Recent enrollments */}
          <EnrollmentsSection enrollments={enrollments} />
        </>
      )}
    </div>
  );
}
