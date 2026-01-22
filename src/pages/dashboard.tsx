import { Button } from "@/components/button";
import { CampaignCard, type CampaignCardProps } from "@/components/campaign-card";
import { EmptyState } from "@/components/empty-state";
import { EnrollmentCard, type EnrollmentCardProps } from "@/components/enrollment-card";
import { Heading } from "@/components/heading";
import { Link } from "@/components/link";
import { Text } from "@/components/text";
import { WithdrawDialog } from "@/components/withdraw-dialog";
import {
  useActiveCampaigns,
  useEnrollments,
  useShopperProfile,
  useShopperStats,
  useWallet,
  useWithdrawalMethods,
} from "@/hooks/use-api";
import {
  ArrowPathIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from "@heroicons/react/16/solid";
import { useState } from "react";
import { DashboardSkeleton } from "@/lib/skeleton";
import { useDocumentTitle } from "@/hooks";

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
// ERROR STATE
// =============================================================================

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30">
        <ExclamationTriangleIcon className="size-8 text-red-400" />
      </div>
      <p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
        Something went wrong
      </p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Failed to load your dashboard. Please try again.
      </p>
      <Button className="mt-6" onClick={onRetry} color="dark/zinc">
        <ArrowPathIcon className="size-4" />
        Try Again
      </Button>
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
  onWithdraw,
}: {
  available: string;
  pending: string;
  lifetime: string;
  canWithdraw: boolean;
  onWithdraw: () => void;
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
          <Button onClick={onWithdraw} color="emerald">
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
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-amber-400 to-amber-600 ring-1 ring-amber-600/20 shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.2)] dark:from-amber-500 dark:to-amber-700">
            {alert.type === "proof" ? (
              <DocumentArrowUpIcon className="size-5 text-white/90 filter-[drop-shadow(0_-1px_0_rgba(0,0,0,0.1))_drop-shadow(0_1px_0_rgba(255,255,255,0.2))]" />
            ) : (
              <ExclamationTriangleIcon className="size-5 text-white/90 filter-[drop-shadow(0_-1px_0_rgba(0,0,0,0.1))_drop-shadow(0_1px_0_rgba(255,255,255,0.2))]" />
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

function CampaignsSection({
  campaigns,
}: {
  campaigns: Array<CampaignCardProps["campaign"]>;
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

function EnrollmentsSection({
  enrollments,
}: {
  enrollments: Array<EnrollmentCardProps["enrollment"]>;
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
// MAIN DASHBOARD
// =============================================================================

export function Dashboard() {
  useDocumentTitle("Dashboard | HypeDrive");

  const { data: profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useShopperProfile();
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useShopperStats();
  const { data: wallet, loading: walletLoading, error: walletError, refetch: refetchWallet } = useWallet();
  const { data: enrollmentsData, loading: enrollmentsLoading, error: enrollmentsError, refetch: refetchEnrollments } = useEnrollments({
    limit: 10,
  });
  const { data: campaigns, loading: campaignsLoading, error: campaignsError, refetch: refetchCampaigns } = useActiveCampaigns(10);
  const { data: methodsData } = useWithdrawalMethods();

  // Modal state
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  // Loading state
  if (profileLoading || statsLoading || walletLoading || enrollmentsLoading || campaignsLoading) {
    return <DashboardSkeleton />;
  }

  // Error state
  const hasError = profileError || statsError || walletError || enrollmentsError || campaignsError;
  if (hasError) {
    const handleRetry = () => {
      refetchProfile();
      refetchStats();
      refetchWallet();
      refetchEnrollments();
      refetchCampaigns();
    };
    return <ErrorState onRetry={handleRetry} />;
  }

  // Extract data - use displayName for greeting (user's preferred public name)
  const displayName =
    profile?.shopper?.displayName ||
    profile?.shopper?.firstName ||
    profile?.user?.name?.split(" ")[0] ||
    "there";
  const enrollments = enrollmentsData?.data || [];
  const isNewUser = (stats?.totalEnrollments || 0) === 0;

  // Balance data - use wallet API for accurate available balance (accounts for pending withdrawals)
  const available = wallet?.availableBalanceDecimal || wallet?.balanceDecimal || "0.00";
  const pending = wallet?.pendingBalanceDecimal || "0.00";
  const lifetime = stats?.totalEarningsDecimal || "0.00";
  const kycVerified = profile?.shopper?.kycStatus === "verified";
  const availableAmount = parseFloat(available);
  // KYC required only for withdrawals above ₹30,000
  const KYC_THRESHOLD = 30000;
  const needsKycForWithdrawal = availableAmount > KYC_THRESHOLD && !kycVerified;
  const hasPaymentMethod = (methodsData?.methods?.length || 0) > 0;
  const canWithdraw = availableAmount > 0 && hasPaymentMethod && !needsKycForWithdrawal;

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
          <EmptyState
            preset="campaigns"
            title="Start earning cashback"
            description="Join campaigns, shop from partner brands, and get money back on every purchase."
            action={{ label: "Browse Campaigns", href: "/campaigns" }}
          />
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
            onWithdraw={() => setShowWithdrawDialog(true)}
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

      {/* Withdraw Dialog */}
      <WithdrawDialog
        open={showWithdrawDialog}
        onClose={() => setShowWithdrawDialog(false)}
        balance={available}
        withdrawalMethods={methodsData?.methods || []}
        onSuccess={() => {
          refetchWallet();
          refetchProfile();
        }}
      />
    </div>
  );
}
