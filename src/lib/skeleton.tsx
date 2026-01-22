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
// Matches: src/pages/enrollments/list.tsx - Full page structure
// Header, Search, Tabs (6 items), Results count, Grid
// =============================================================================

export function EnrollmentsListSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div>
        <Shimmer className="h-7 w-32" />
        <Shimmer className="mt-1 h-4 w-56" />
      </div>

      {/* Search Bar */}
      <Shimmer className="h-10 w-full rounded-lg sm:h-9" />

      {/* Tabs - 6 pill buttons horizontally scrollable */}
      <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 py-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Shimmer className="h-8 w-14 shrink-0 rounded-full" />
        <Shimmer className="h-8 w-20 shrink-0 rounded-full" />
        <Shimmer className="h-8 w-28 shrink-0 rounded-full" />
        <Shimmer className="h-8 w-24 shrink-0 rounded-full" />
        <Shimmer className="h-8 w-24 shrink-0 rounded-full" />
        <Shimmer className="h-8 w-18 shrink-0 rounded-full" />
      </div>

      {/* Results count with border */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 sm:pb-3 dark:border-zinc-700">
        <Shimmer className="h-4 w-28" />
      </div>

      {/* Enrollment cards grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 lg:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <EnrollmentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// CAMPAIGNS LIST PAGE SKELETON
// Matches: src/pages/campaigns/list.tsx - Full page structure
// Header, Trending section, Search+Filter, Tabs, Results count, Grid
// =============================================================================

// Trending card skeleton for campaigns list - horizontal layout
function TrendingCardSkeleton() {
  return (
    <div className="flex w-[calc(100vw-3rem)] shrink-0 snap-center flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 sm:w-85 lg:w-auto dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex flex-1">
        {/* Image */}
        <Shimmer className="relative size-28 shrink-0 rounded-none sm:size-32 lg:size-28 xl:size-32" />
        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between p-2.5 sm:p-3">
          <div>
            <Shimmer className="h-2.5 w-16" />
            <Shimmer className="mt-1.5 h-4 w-full" />
            <Shimmer className="mt-1 h-4 w-3/4" />
          </div>
          <Shimmer className="mt-2 h-5 w-14 rounded" />
        </div>
      </div>
      <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
      {/* Footer Stats - 3 columns */}
      <div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-700">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center justify-center py-2">
            <Shimmer className="h-2 w-10" />
            <Shimmer className="mt-1 h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CampaignsListSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Shimmer className="h-7 w-32" />
        <Shimmer className="mt-2 h-4 w-64" />
      </div>

      {/* Trending Section */}
      <div className="-mx-4 sm:-mx-6 lg:mx-0">
        <div className="mb-3 flex items-center justify-between px-4 sm:px-6 lg:px-0">
          <Shimmer className="h-4 w-28" />
          <Shimmer className="h-3 w-16 lg:hidden" />
        </div>
        {/* Mobile: horizontal scroll placeholder */}
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-1 sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[1, 2, 3].map((i) => (
            <TrendingCardSkeleton key={i} />
          ))}
        </div>
        {/* Desktop: 3-column grid */}
        <div className="hidden gap-4 lg:grid lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <TrendingCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Search + Filter Row */}
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <Shimmer className="h-10 w-full rounded-lg sm:h-9" />
        </div>
        {/* Mobile filter button */}
        <Shimmer className="size-10 shrink-0 rounded-lg sm:size-9 lg:hidden" />
        {/* Desktop filters */}
        <div className="hidden items-center gap-2 lg:flex">
          <Shimmer className="h-9 w-36 rounded-lg" />
          <Shimmer className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      {/* Tabs */}
      <div className="-mx-0.5 flex items-center gap-1.5 px-0.5 py-0.5">
        <Shimmer className="h-8 w-20 rounded-full" />
        <Shimmer className="h-8 w-20 rounded-full" />
      </div>

      {/* Results count with border */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-700">
        <Shimmer className="h-4 w-24" />
      </div>

      {/* Campaign cards grid */}
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

      {/* Profile Card with Cover Image */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        {/* Cover - matches h-24 gradient */}
        <div className="relative h-24 bg-zinc-100 dark:bg-zinc-800">
          {/* Edit button placeholder */}
          <div className="absolute top-3 right-3">
            <ShimmerCircle className="size-9" />
          </div>
        </div>

        {/* Profile content */}
        <div className="px-5 pb-5">
          {/* Avatar - overlapping cover with solid white wrapper */}
          <div className="-mt-14 mb-4">
            <div className="rounded-full bg-white p-1 dark:bg-zinc-900">
              <ShimmerCircle className="size-[88px]" />
            </div>
          </div>

          {/* Name and email */}
          <Shimmer className="h-5 w-36" />
          <Shimmer className="mt-1 h-4 w-48" />
        </div>

        {/* Stats row */}
        <div className="flex divide-x divide-zinc-200 border-t border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 py-4 text-center">
              <Shimmer className="mx-auto h-6 w-8" />
              <Shimmer className="mx-auto mt-1 h-3 w-16" />
            </div>
          ))}
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
// Two-column layout with hero card, progress stepper, tasks, etc.
// =============================================================================

// =============================================================================
// CAMPAIGN SHOW PAGE SKELETON
// Matches: src/pages/campaigns/show.tsx
// Two-column layout with gallery, product info, earnings, tasks, timeline
// =============================================================================

export function CampaignShowSkeleton() {
  return (
    <div className="space-y-6">
      {/* SECTION 1: PRODUCT + EARNINGS (Side by Side) */}
      <div className="grid items-stretch gap-5 lg:grid-cols-2">
        {/* Product Gallery - Left Side */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          {/* Main Image - square aspect ratio */}
          <Shimmer className="aspect-square w-full rounded-none" />
          {/* Thumbnails Strip */}
          <div className="border-t border-zinc-200 bg-zinc-100 p-3 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Shimmer key={i} className="size-11 shrink-0 rounded-lg lg:size-12" />
              ))}
            </div>
          </div>
        </div>

        {/* Product Info + Earnings - Right Side */}
        <div className="flex h-full flex-col gap-4">
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Shimmer className="h-5 w-16 rounded" />
            <Shimmer className="h-5 w-20 rounded" />
          </div>

          {/* Title & Description */}
          <div>
            <Shimmer className="h-7 w-4/5" />
            <Shimmer className="mt-2 h-4 w-full" />
            <Shimmer className="mt-1 h-4 w-3/4" />
          </div>

          {/* Product Price & Link */}
          <div className="flex items-center gap-4">
            <Shimmer className="h-8 w-24" />
            <Shimmer className="h-7 w-28 rounded-lg" />
          </div>

          {/* Premium Dark Earnings Card */}
          <div className="overflow-hidden rounded-xl bg-zinc-900 dark:bg-zinc-800">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3 dark:border-zinc-700">
              <Shimmer className="size-4 rounded bg-zinc-700" />
              <Shimmer className="h-2.5 w-24 bg-zinc-700" />
            </div>
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                  <Shimmer className="h-8 w-16 bg-zinc-700 sm:h-10" />
                  <Shimmer className="h-4 w-16 bg-zinc-700" />
                </div>
              </div>
              <Shimmer className="h-10 w-28 rounded-lg bg-zinc-700" />
            </div>
            {/* Progress Bar */}
            <div className="border-t border-zinc-800 bg-zinc-950/50 px-4 py-3 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <Shimmer className="h-3 w-28 bg-zinc-800" />
                <Shimmer className="h-3 w-12 bg-zinc-800" />
              </div>
              <Shimmer className="mt-2 h-1.5 w-full rounded-full bg-zinc-800" />
            </div>
          </div>

          {/* Earnings Calculator */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-zinc-900 dark:bg-zinc-800">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3 dark:border-zinc-700">
              <Shimmer className="size-4 rounded bg-zinc-700" />
              <Shimmer className="h-2.5 w-32 bg-zinc-700" />
            </div>
            <div className="flex flex-1 flex-col justify-center p-4">
              {/* Result Display */}
              <div className="flex items-center justify-between rounded-lg bg-zinc-700/80 px-4 py-3 dark:bg-zinc-600/80">
                <div>
                  <Shimmer className="h-2 w-24 bg-zinc-600" />
                  <Shimmer className="mt-1 h-7 w-20 bg-zinc-600" />
                </div>
                <Shimmer className="h-6 w-12 bg-zinc-600" />
              </div>
              {/* Input */}
              <div className="mt-3 flex gap-2">
                <Shimmer className="h-10 flex-1 rounded-lg bg-zinc-700" />
                <Shimmer className="h-10 w-14 rounded-lg bg-zinc-700" />
              </div>
            </div>
          </div>

          {/* Quick Stats Cards - 3 columns */}
          <div className="mt-auto grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex min-w-0 flex-col rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-zinc-200 sm:p-3 dark:bg-zinc-900 dark:ring-zinc-800">
                <div className="flex items-center gap-1">
                  <ShimmerCircle className="size-3.5 sm:size-4" />
                  <Shimmer className="h-2.5 w-12" />
                </div>
                <Shimmer className="mt-1 h-5 w-16 sm:h-6" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: CAMPAIGN DETAILS (Full Width Grid) */}
      <div className="grid items-stretch gap-5 md:grid-cols-2">
        {/* Left: How It Works Timeline */}
        <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <ShimmerCircle className="size-4" />
            <Shimmer className="h-4 w-24" />
          </div>
          <div className="flex flex-1 items-center p-4 sm:p-6">
            <div className="relative grid w-full grid-cols-4">
              {/* Connector line */}
              <Shimmer className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-4 h-0.5 sm:top-5" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <ShimmerCircle className="relative z-10 size-8 sm:size-10" />
                  <Shimmer className="mt-2 h-3 w-14 sm:mt-3 sm:h-4" />
                  <Shimmer className="mt-0.5 h-2.5 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tasks */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <ShimmerCircle className="size-4" />
              <Shimmer className="h-4 w-28" />
            </div>
            <Shimmer className="h-3 w-20" />
          </div>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <div className="relative shrink-0">
                  <Shimmer className="size-7 rounded-lg" />
                  <ShimmerCircle className="absolute -top-1 -left-1 size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Shimmer className="h-4 w-32" />
                    <Shimmer className="h-4 w-14 rounded-full" />
                  </div>
                  <Shimmer className="mt-0.5 h-3 w-48" />
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Shimmer className="h-5 w-20 rounded-md" />
                    <Shimmer className="h-5 w-28 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coupon hint */}
      <div className="flex items-center justify-center gap-2">
        <ShimmerCircle className="size-3.5" />
        <Shimmer className="h-3 w-64" />
      </div>

      {/* SECTION 3: IMPORTANT INFO */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <ShimmerCircle className="size-4" />
          <Shimmer className="h-4 w-20" />
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-2.5">
              <ShimmerCircle className="mt-0.5 size-4" />
              <Shimmer className="h-4 w-64" />
            </div>
          ))}
        </div>
      </div>

      {/* Trust Badge */}
      <div className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <ShimmerCircle className="size-5" />
        <Shimmer className="h-4 w-48" />
      </div>

      {/* FAQs Accordion */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <ShimmerCircle className="size-4" />
          <Shimmer className="h-4 w-12" />
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-4 py-3">
              <Shimmer className="h-4 w-64" />
              <ShimmerCircle className="size-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ENROLLMENT SHOW PAGE SKELETON
// Matches: src/pages/enrollments/show.tsx
// Two-column layout with hero card, progress stepper, tasks, etc.
// =============================================================================

export function EnrollmentShowSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* TWO COLUMN LAYOUT */}
      <div className="lg:grid lg:grid-cols-3 lg:items-start lg:gap-6">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4 lg:col-span-2 lg:gap-6">
          {/* HERO CARD */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="p-4 lg:p-5">
              {/* Top Row: Badge + Days Left (mobile) */}
              <div className="flex items-center justify-between">
                <Shimmer className="h-5 w-24 rounded" />
                {/* Days Left Badge - Mobile */}
                <Shimmer className="h-6 w-16 rounded-full sm:hidden" />
              </div>

              {/* Product Info Row */}
              <div className="mt-3 flex gap-3 sm:gap-4">
                {/* Product Image */}
                <Shimmer className="size-16 shrink-0 rounded-xl sm:size-20 lg:size-24" />

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <Shimmer className="h-4 w-4/5 sm:h-5 lg:h-6" />
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <div className="flex items-center gap-1">
                      <Shimmer className="size-3" />
                      <Shimmer className="h-3 w-20 sm:h-3.5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Shimmer className="size-3" />
                      <Shimmer className="h-3 w-16 sm:h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Days Left Gauge - Desktop/Tablet */}
                <div className="hidden shrink-0 sm:block">
                  <Shimmer className="h-12 w-22 rounded lg:h-14 lg:w-25" />
                </div>
              </div>
            </div>
          </div>

          {/* PROGRESS STEPPER */}
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 sm:p-5 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex items-start justify-between">
              {[1, 2, 3, 4].map((step, index) => (
                <div key={step} className="relative z-10 flex flex-col items-center" style={{ width: "25%" }}>
                  <ShimmerCircle className="size-9 sm:size-10" />
                  <Shimmer className="mt-2 h-2.5 w-12 sm:h-3" />
                  {index < 3 && (
                    <Shimmer className="absolute top-4.5 left-[60%] h-1 w-12 sm:top-5 sm:w-16 lg:w-20" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* EARNINGS CARD - Mobile only */}
          <div className="overflow-hidden rounded-xl bg-zinc-900 shadow-sm lg:hidden dark:bg-zinc-800">
            <div className="p-4 lg:p-5">
              <Shimmer className="h-2.5 w-24 bg-zinc-700" />
              <Shimmer className="mt-1 h-8 w-32 bg-zinc-700 sm:h-10" />
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Shimmer className="h-3.5 w-20 bg-zinc-700" />
                  <Shimmer className="h-3.5 w-16 bg-zinc-700" />
                </div>
                <div className="flex items-center justify-between">
                  <Shimmer className="h-3.5 w-24 bg-zinc-700" />
                  <Shimmer className="h-3.5 w-12 bg-zinc-700" />
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-4 border-t border-zinc-800 pt-4 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <Shimmer className="h-3 w-24 bg-zinc-700" />
                  <Shimmer className="h-3 w-8 bg-zinc-700" />
                </div>
                <Shimmer className="mt-2 h-1.5 w-full rounded-full bg-zinc-700" />
              </div>
            </div>
          </div>

          {/* TASKS CARD */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 lg:px-5 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <Shimmer className="size-4 lg:size-5" />
                <Shimmer className="h-4 w-24 lg:h-5" />
              </div>
              <Shimmer className="h-3 w-10 lg:h-4" />
            </div>

            {/* Task List */}
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 lg:px-5">
                  <ShimmerCircle className="size-7" />
                  <Shimmer className="size-9 rounded-lg sm:size-10" />
                  <div className="min-w-0 flex-1">
                    <Shimmer className="h-4 w-32" />
                    <Shimmer className="mt-0.5 h-2.5 w-24" />
                  </div>
                  <Shimmer className="h-4 w-14 rounded" />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-zinc-200 p-4 lg:px-5 dark:border-zinc-700">
              <div className="grid grid-cols-2 gap-3">
                <Shimmer className="h-10 rounded-lg" />
                <Shimmer className="h-10 rounded-lg" />
              </div>
            </div>
          </div>

          {/* ORDER INFO CARD */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 lg:px-5 dark:border-zinc-700">
              <Shimmer className="size-4 lg:size-5" />
              <Shimmer className="h-4 w-32 lg:h-5" />
            </div>
            <div className="p-4 lg:p-5">
              <div className="space-y-3.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Shimmer className="h-3.5 w-20" />
                    <Shimmer className="h-3.5 w-24" />
                  </div>
                ))}
              </div>
              {/* Screenshot placeholder */}
              <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
                <Shimmer className="h-40 w-full rounded-xl sm:h-48 lg:h-56" />
              </div>
            </div>
          </div>

          {/* Activity - Mobile only */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 lg:hidden dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
              <Shimmer className="size-4" />
              <Shimmer className="h-4 w-16" />
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <ShimmerCircle className="size-6" />
                  <div className="min-w-0 flex-1">
                    <Shimmer className="h-3.5 w-24" />
                  </div>
                  <Shimmer className="h-2.5 w-12" />
                </div>
              ))}
            </div>
          </div>

          {/* Help Card - Mobile */}
          <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4 lg:hidden dark:bg-zinc-800/50">
            <Shimmer className="size-10 rounded-xl" />
            <div className="min-w-0 flex-1">
              <Shimmer className="h-4 w-20" />
              <Shimmer className="mt-0.5 h-3 w-48" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Sidebar (Desktop only) */}
        <div className="hidden flex-col gap-4 lg:flex">
          {/* Earnings Card */}
          <div className="overflow-hidden rounded-xl bg-zinc-900 shadow-sm dark:bg-zinc-800">
            <div className="p-4 lg:p-5">
              <Shimmer className="h-3 w-28 bg-zinc-700" />
              <Shimmer className="mt-1 h-10 w-36 bg-zinc-700" />
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Shimmer className="h-3.5 w-20 bg-zinc-700" />
                  <Shimmer className="h-3.5 w-16 bg-zinc-700" />
                </div>
                <div className="flex items-center justify-between">
                  <Shimmer className="h-3.5 w-24 bg-zinc-700" />
                  <Shimmer className="h-3.5 w-12 bg-zinc-700" />
                </div>
              </div>
              <div className="mt-4 border-t border-zinc-800 pt-4 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <Shimmer className="h-3 w-24 bg-zinc-700" />
                  <Shimmer className="h-3 w-8 bg-zinc-700" />
                </div>
                <Shimmer className="mt-2 h-1.5 w-full rounded-full bg-zinc-700" />
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
              <Shimmer className="size-4" />
              <Shimmer className="h-4 w-16" />
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <ShimmerCircle className="size-6" />
                  <div className="min-w-0 flex-1">
                    <Shimmer className="h-3.5 w-24" />
                  </div>
                  <Shimmer className="h-2.5 w-12" />
                </div>
              ))}
            </div>
          </div>

          {/* Help Card */}
          <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <Shimmer className="size-10 rounded-xl" />
            <div className="min-w-0 flex-1">
              <Shimmer className="h-4 w-20" />
              <Shimmer className="mt-0.5 h-3 w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
