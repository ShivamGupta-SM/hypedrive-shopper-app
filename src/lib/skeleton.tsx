/**
 * Skeleton Loading Components
 *
 * Pure Tailwind CSS skeletons that match the exact page structures.
 * Uses animate-pulse for shimmer effect.
 */

// =============================================================================
// BASE SKELETON PRIMITIVES
// =============================================================================

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-zinc-200 dark:bg-zinc-700 ${className || ""}`}
    />
  );
}

function ShimmerCircle({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700 ${className || ""}`}
    />
  );
}

// =============================================================================
// WALLET PAGE SKELETON
// Matches: src/pages/wallet/index.tsx
// =============================================================================

export function WalletSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Shimmer className="h-7 w-20" />
        <Shimmer className="mt-1 h-4 w-56" />
      </div>

      {/* Balance Card - Green themed */}
      <div className="overflow-hidden rounded-2xl bg-emerald-600 dark:bg-emerald-700">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="h-2.5 w-24 rounded bg-white/20" />
              <div className="mt-2 h-9 w-40 rounded bg-white/20" />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="h-4 w-16 rounded bg-white/20" />
                <div className="h-4 w-20 rounded bg-white/20" />
              </div>
            </div>
            <div className="h-10 w-24 rounded-lg bg-white/30" />
          </div>
        </div>
      </div>

      {/* Stats - 3 columns */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-zinc-200 sm:p-3 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <div className="flex items-center gap-1">
              <ShimmerCircle className="size-3.5 sm:size-4" />
              <Shimmer className="h-2.5 w-12" />
            </div>
            <Shimmer className="mt-1 h-5 w-16 sm:h-6" />
          </div>
        ))}
      </div>

      {/* Quick Links - 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <ShimmerCircle className="size-10" />
            <div className="min-w-0 flex-1">
              <Shimmer className="h-4 w-20" />
              <Shimmer className="mt-1 h-3 w-16" />
            </div>
            <Shimmer className="h-4 w-4" />
          </div>
        ))}
      </div>

      {/* Transactions Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Shimmer className="h-4 w-4" />
            <Shimmer className="h-4 w-32" />
          </div>
          <Shimmer className="h-3 w-20" />
        </div>
        <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i}>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <ShimmerCircle className="size-9 sm:size-10" />
              <div className="min-w-0 flex-1">
                <Shimmer className="h-4 w-32" />
                <Shimmer className="mt-1 h-3 w-20" />
              </div>
              <div className="text-right">
                <Shimmer className="h-4 w-14" />
                <Shimmer className="mt-1 h-2.5 w-12" />
              </div>
              <Shimmer className="h-4 w-4" />
            </div>
            {i < 5 && <div className="h-px bg-zinc-200 dark:bg-zinc-700" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// DASHBOARD PAGE SKELETON
// Matches: src/pages/dashboard.tsx
// =============================================================================

export function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Shimmer className="h-7 w-48" />
        <Shimmer className="mt-1 h-4 w-40" />
      </div>

      {/* Balance Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex items-start justify-between p-4">
          <div>
            <div className="flex items-center gap-1.5">
              <ShimmerCircle className="size-4" />
              <Shimmer className="h-3 w-28" />
            </div>
            <Shimmer className="mt-1 h-8 w-32" />
          </div>
          <Shimmer className="h-9 w-20 rounded-lg" />
        </div>
        <div className="flex border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex-1 border-r border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <div className="flex items-center gap-1">
              <ShimmerCircle className="size-3.5" />
              <Shimmer className="h-2.5 w-12" />
            </div>
            <Shimmer className="mt-0.5 h-5 w-16" />
          </div>
          <div className="flex-1 px-4 py-3">
            <div className="flex items-center gap-1">
              <ShimmerCircle className="size-3.5" />
              <Shimmer className="h-2.5 w-12" />
            </div>
            <Shimmer className="mt-0.5 h-5 w-16" />
          </div>
        </div>
      </div>

      {/* Journey Stats - 3 stat cards */}
      <div className="-mx-0.5 flex gap-2 px-0.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-1 flex-col rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <div className="flex items-center gap-1.5">
              <ShimmerCircle className="size-4" />
              <Shimmer className="h-3 w-16" />
            </div>
            <Shimmer className="mt-1 h-5 w-8 sm:h-6" />
          </div>
        ))}
      </div>

      {/* Campaigns Section */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-3 w-14" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <CampaignCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Enrollments Section */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <Shimmer className="h-4 w-28" />
          <Shimmer className="h-3 w-14" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <EnrollmentCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

// =============================================================================
// CAMPAIGN CARD SKELETON
// =============================================================================

export function CampaignCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      {/* Product image - 4:3 aspect ratio */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Shimmer className="h-full w-full rounded-none" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <Shimmer className="h-2.5 w-1/3" />
        <Shimmer className="mt-1 h-3.5 w-4/5" />
      </div>

      <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

      {/* Footer Stats - 3 columns */}
      <div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-700">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center justify-center py-2">
            <Shimmer className="h-2.5 w-8" />
            <Shimmer className="mt-0.5 h-3.5 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// ENROLLMENT CARD SKELETON
// =============================================================================

export function EnrollmentCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      {/* Main Content */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Product Image */}
          <div className="relative shrink-0">
            <Shimmer className="size-20 rounded-lg" />
            <ShimmerCircle className="absolute -bottom-1 -right-1 size-5" />
          </div>

          {/* Product Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <Shimmer className="h-4 w-3/5" />
              <Shimmer className="h-5 w-16 rounded" />
            </div>
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center gap-1.5">
                <Shimmer className="h-3 w-3" />
                <Shimmer className="h-3 w-24" />
              </div>
              <div className="flex items-center gap-1.5">
                <Shimmer className="h-3 w-3" />
                <Shimmer className="h-3 w-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="mt-3">
          <Shimmer className="h-3 w-24" />
          <div className="mt-2 flex gap-1.5">
            <Shimmer className="h-6 w-20 rounded-full" />
            <Shimmer className="h-6 w-24 rounded-full" />
            <Shimmer className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="relative border-t border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="grid grid-cols-3 items-end px-3 py-3 sm:px-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <Shimmer className="mx-auto h-2.5 w-12" />
              <Shimmer className="mx-auto mt-0.5 h-5 w-14" />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-2 left-1/3 w-px bg-zinc-300 dark:bg-zinc-600" />
        <div className="pointer-events-none absolute inset-y-2 left-2/3 w-px bg-zinc-300 dark:bg-zinc-600" />
      </div>
    </div>
  );
}

// =============================================================================
// ENROLLMENTS LIST PAGE SKELETON
// Matches: src/pages/enrollments/list.tsx
// =============================================================================

export function EnrollmentsListSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div>
        <Shimmer className="h-7 w-28" />
        <Shimmer className="mt-0.5 h-4 w-64" />
      </div>

      {/* Search Bar */}
      <Shimmer className="h-10 w-full rounded-lg" />

      {/* Tabs */}
      <div className="-mx-1 flex items-center gap-1.5 px-1 py-0.5">
        <Shimmer className="h-8 w-14 rounded-full" />
        <Shimmer className="h-8 w-[70px] rounded-full" />
        <Shimmer className="h-8 w-24 rounded-full" />
        <Shimmer className="h-8 w-[90px] rounded-full" />
        <Shimmer className="h-8 w-[85px] rounded-full" />
        <Shimmer className="h-8 w-16 rounded-full" />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 sm:pb-3 dark:border-zinc-700">
        <Shimmer className="h-3.5 w-24" />
      </div>

      {/* Enrollment Grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 lg:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <EnrollmentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// CAMPAIGNS LIST PAGE SKELETON
// Matches: src/pages/campaigns/list.tsx
// =============================================================================

export function CampaignsListSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Shimmer className="h-7 w-24" />
        <Shimmer className="mt-1 h-4 w-72" />
      </div>

      {/* Search + Filter Row */}
      <div className="flex items-center gap-2">
        <Shimmer className="h-10 flex-1 rounded-lg" />
        <Shimmer className="h-10 w-10 rounded-lg lg:hidden" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5">
        <Shimmer className="h-8 w-16 rounded-full" />
        <Shimmer className="h-8 w-20 rounded-full" />
      </div>

      {/* Results count */}
      <div className="border-b border-zinc-200 pb-3 dark:border-zinc-700">
        <Shimmer className="h-4 w-24" />
      </div>

      {/* Campaign Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <CampaignCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// TRANSACTION SHOW PAGE SKELETON
// Matches: src/pages/wallet/transactions/show.tsx
// =============================================================================

export function TransactionShowSkeleton() {
  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Header Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="p-4 lg:p-5">
          <div className="flex items-center gap-3 lg:gap-4">
            <ShimmerCircle className="size-11 lg:size-12" />
            <div className="min-w-0 flex-1">
              <Shimmer className="h-6 w-24 lg:h-7" />
              <Shimmer className="mt-0.5 h-4 w-40" />
            </div>
            <div className="flex items-center gap-1.5">
              <ShimmerCircle className="size-4" />
              <Shimmer className="h-4 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 lg:px-5">
              <Shimmer className="h-4 w-20" />
              <Shimmer className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* Related Enrollment */}
      <div className="flex items-center gap-3 overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 lg:p-5 dark:bg-zinc-900 dark:ring-zinc-800">
        <Shimmer className="size-10 rounded-lg" />
        <div className="min-w-0 flex-1">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="mt-0.5 h-3 w-24" />
        </div>
        <Shimmer className="size-4" />
      </div>
    </div>
  );
}

// =============================================================================
// WITHDRAWALS LIST PAGE SKELETON
// Matches: src/pages/wallet/withdrawals/list.tsx
// =============================================================================

function WithdrawalCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center gap-3 p-4">
        <ShimmerCircle className="size-10" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Shimmer className="h-5 w-20" />
            <Shimmer className="h-5 w-16 rounded" />
          </div>
          <Shimmer className="mt-0.5 h-3 w-32" />
        </div>
        <Shimmer className="size-5" />
      </div>
    </div>
  );
}

export function WithdrawalsListSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Shimmer className="h-7 w-28" />
        <Shimmer className="mt-1 h-4 w-52" />
      </div>

      {/* In Progress Section */}
      <div className="space-y-3">
        <Shimmer className="h-2.5 w-24 uppercase" />
        <WithdrawalCardSkeleton />
        <WithdrawalCardSkeleton />
      </div>

      {/* Completed Section */}
      <div className="space-y-3">
        <Shimmer className="h-2.5 w-20 uppercase" />
        <WithdrawalCardSkeleton />
        <WithdrawalCardSkeleton />
      </div>
    </div>
  );
}

// =============================================================================
// WITHDRAWAL SHOW PAGE SKELETON
// Matches: src/pages/wallet/withdrawals/show.tsx
// =============================================================================

export function WithdrawalShowSkeleton() {
  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Header Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="p-4 lg:p-5">
          <div className="flex items-center gap-3 lg:gap-4">
            <ShimmerCircle className="size-11 lg:size-12" />
            <div className="min-w-0 flex-1">
              <Shimmer className="h-6 w-24 lg:h-7" />
              <Shimmer className="mt-0.5 h-4 w-40" />
            </div>
            <div className="flex items-center gap-1.5">
              <ShimmerCircle className="size-4" />
              <Shimmer className="h-4 w-16" />
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="border-t border-zinc-200 px-4 py-3 lg:px-5 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <ShimmerCircle className="size-6 lg:size-7" />
                  <Shimmer className="mt-1 h-2.5 w-14" />
                </div>
                {index < 2 && <Shimmer className="mx-2 h-0.5 w-8 sm:mx-3 sm:w-12 lg:w-16" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bank Account Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex items-center gap-3 p-4 lg:p-5">
          <Shimmer className="size-10 rounded-lg" />
          <div className="min-w-0 flex-1">
            <Shimmer className="h-4 w-28" />
            <Shimmer className="mt-0.5 h-3 w-40" />
          </div>
          <ShimmerCircle className="size-5" />
        </div>
      </div>

      {/* Details Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 lg:px-5">
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Button placeholder */}
      <Shimmer className="h-10 w-full rounded-lg" />
    </div>
  );
}

// =============================================================================
// SETTINGS PAGE SKELETON
// Matches: src/pages/settings/index.tsx
// =============================================================================

export function SettingsSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Shimmer className="h-7 w-20" />
        <Shimmer className="mt-1 h-4 w-52" />
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Shimmer className="size-20 rounded-xl sm:size-16" />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <Shimmer className="mx-auto h-5 w-32 sm:mx-0" />
              <Shimmer className="mx-auto mt-1 h-4 w-44 sm:mx-0" />
              <Shimmer className="mx-auto mt-1 h-3 w-24 sm:mx-0" />
            </div>
            <Shimmer className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      {/* KYC Card */}
      <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <Shimmer className="size-9 rounded-xl" />
        <div className="min-w-0 flex-1">
          <Shimmer className="h-4 w-28" />
          <Shimmer className="mt-1 h-3 w-48" />
        </div>
        <Shimmer className="h-8 w-20 rounded-lg" />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Account Info */}
        <div>
          <div className="mb-2 flex items-center gap-2 px-1">
            <Shimmer className="size-4" />
            <Shimmer className="h-3 w-24" />
          </div>
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Shimmer className="size-9 rounded-xl" />
                  <Shimmer className="h-4 w-20 flex-1" />
                  <Shimmer className="h-4 w-24" />
                </div>
                {i < 5 && <div className="ml-16 h-px bg-zinc-200 dark:bg-zinc-700" />}
              </div>
            ))}
          </div>
        </div>

        {/* Payout Methods */}
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Shimmer className="size-4" />
              <Shimmer className="h-3 w-28" />
            </div>
            <Shimmer className="h-3 w-16" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <Shimmer className="size-9 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <Shimmer className="h-4 w-24" />
                    <Shimmer className="mt-1 h-3 w-36" />
                  </div>
                  <ShimmerCircle className="size-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <div className="mb-2 flex items-center gap-2 px-1">
          <Shimmer className="size-4" />
          <Shimmer className="h-3 w-24" />
        </div>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <Shimmer className="size-9 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <Shimmer className="h-4 w-32" />
                  <Shimmer className="mt-1 h-3 w-44" />
                </div>
                <Shimmer className="h-6 w-11 rounded-full" />
              </div>
              {i < 2 && <div className="ml-16 h-px bg-zinc-200 dark:bg-zinc-700" />}
            </div>
          ))}
        </div>
      </div>

      {/* Support */}
      <div>
        <div className="mb-2 flex items-center gap-2 px-1">
          <Shimmer className="size-4" />
          <Shimmer className="h-3 w-16" />
        </div>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="flex items-center gap-3 px-4 py-3">
                <Shimmer className="size-9 rounded-xl" />
                <Shimmer className="h-4 w-28" />
              </div>
              {i < 3 && <div className="ml-16 h-px bg-zinc-200 dark:bg-zinc-700" />}
            </div>
          ))}
        </div>
      </div>

      {/* Sign Out */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex items-center justify-center gap-2 py-3">
          <Shimmer className="size-4" />
          <Shimmer className="h-4 w-16" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-center">
        <Shimmer className="h-3 w-36" />
      </div>
    </div>
  );
}

// =============================================================================
// ENROLLMENT SHOW PAGE SKELETON
// Matches: src/pages/enrollments/show.tsx
// =============================================================================

export function EnrollmentShowSkeleton() {
  return (
    <div className="space-y-4">
      {/* Back button */}
      <Shimmer className="h-4 w-16" />

      {/* Header Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="p-4 lg:p-5">
          <div className="flex items-start gap-3 lg:gap-4">
            <Shimmer className="size-20 shrink-0 rounded-lg lg:size-24" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <Shimmer className="h-5 w-3/4 lg:h-6" />
                <Shimmer className="h-6 w-20 rounded" />
              </div>
              <Shimmer className="mt-1 h-4 w-1/2" />
              <div className="mt-2 flex flex-wrap gap-2">
                <Shimmer className="h-5 w-24 rounded-full" />
                <Shimmer className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 border-t border-zinc-200 dark:border-zinc-700">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`px-4 py-3 text-center ${i < 3 ? "border-r border-zinc-200 dark:border-zinc-700" : ""}`}
            >
              <Shimmer className="mx-auto h-2.5 w-16" />
              <Shimmer className="mx-auto mt-1 h-5 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <Shimmer className="size-4" />
          <Shimmer className="h-4 w-20" />
        </div>
        <div className="p-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <ShimmerCircle className="size-8" />
                {i < 4 && <Shimmer className="h-8 w-0.5" />}
              </div>
              <div className="flex-1 pb-4">
                <Shimmer className="h-4 w-32" />
                <Shimmer className="mt-1 h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <Shimmer className="size-4" />
            <Shimmer className="h-4 w-24" />
          </div>
          <Shimmer className="h-3 w-16" />
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <ShimmerCircle className="size-8" />
              <div className="min-w-0 flex-1">
                <Shimmer className="h-4 w-40" />
                <Shimmer className="mt-1 h-3 w-24" />
              </div>
              <Shimmer className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
