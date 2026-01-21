/**
 * Skeleton Loading Components
 *
 * Provides consistent loading skeleton components across the app.
 * Uses react-loading-skeleton with custom styling that matches our design system.
 */

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// =============================================================================
// SKELETON THEME WRAPPER
// Wrap components with this for dark mode support
// =============================================================================

interface SkeletonWrapperProps {
  children: React.ReactNode;
}

export function SkeletonWrapper({ children }: SkeletonWrapperProps) {
  return (
    <SkeletonTheme
      baseColor="var(--skeleton-base)"
      highlightColor="var(--skeleton-highlight)"
    >
      {children}
    </SkeletonTheme>
  );
}

// =============================================================================
// BASIC SKELETON SHAPES
// =============================================================================

interface TextSkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function TextSkeleton({
  width = "100%",
  height = 16,
  className = "",
}: TextSkeletonProps) {
  return (
    <Skeleton
      width={width}
      height={height}
      className={className}
      borderRadius={4}
    />
  );
}

interface CircleSkeletonProps {
  size?: number;
  className?: string;
}

export function CircleSkeleton({ size = 40, className = "" }: CircleSkeletonProps) {
  return <Skeleton circle width={size} height={size} className={className} />;
}

interface BoxSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  className?: string;
}

export function BoxSkeleton({
  width = "100%",
  height = 100,
  borderRadius = 12,
  className = "",
}: BoxSkeletonProps) {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius={borderRadius}
      className={className}
    />
  );
}

// =============================================================================
// CARD SKELETONS
// =============================================================================

export function StatCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-zinc-200 sm:p-3 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center gap-1">
        <Skeleton width={14} height={14} borderRadius={2} />
        <Skeleton width={50} height={10} borderRadius={4} />
      </div>
      <div className="mt-1">
        <Skeleton width={70} height={18} borderRadius={4} />
      </div>
    </div>
  );
}

export function BalanceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      {/* Available Balance - Hero */}
      <div className="flex items-start justify-between p-4">
        <div>
          <div className="flex items-center gap-1.5">
            <Skeleton circle width={16} height={16} />
            <Skeleton width={120} height={12} borderRadius={4} />
          </div>
          <div className="mt-1">
            <Skeleton width={140} height={32} borderRadius={4} />
          </div>
        </div>
        <Skeleton width={90} height={36} borderRadius={8} />
      </div>

      {/* Footer stats */}
      <div className="flex border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex-1 border-r border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <div className="flex items-center gap-1">
            <Skeleton circle width={14} height={14} />
            <Skeleton width={50} height={10} borderRadius={4} />
          </div>
          <div className="mt-0.5">
            <Skeleton width={60} height={16} borderRadius={4} />
          </div>
        </div>
        <div className="flex-1 px-4 py-3">
          <div className="flex items-center gap-1">
            <Skeleton circle width={14} height={14} />
            <Skeleton width={50} height={10} borderRadius={4} />
          </div>
          <div className="mt-0.5">
            <Skeleton width={70} height={16} borderRadius={4} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Wallet Balance Card - Green themed for wallet page
export function WalletBalanceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-emerald-600 shadow-sm dark:bg-emerald-700">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <Skeleton
              width={100}
              height={10}
              borderRadius={4}
              baseColor="rgba(255,255,255,0.2)"
              highlightColor="rgba(255,255,255,0.3)"
            />
            <div className="mt-2">
              <Skeleton
                width={160}
                height={36}
                borderRadius={4}
                baseColor="rgba(255,255,255,0.2)"
                highlightColor="rgba(255,255,255,0.3)"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Skeleton
                width={70}
                height={16}
                borderRadius={4}
                baseColor="rgba(255,255,255,0.2)"
                highlightColor="rgba(255,255,255,0.3)"
              />
              <Skeleton
                width={80}
                height={16}
                borderRadius={4}
                baseColor="rgba(255,255,255,0.2)"
                highlightColor="rgba(255,255,255,0.3)"
              />
            </div>
          </div>
          <Skeleton
            width={100}
            height={40}
            borderRadius={8}
            baseColor="rgba(255,255,255,0.3)"
            highlightColor="rgba(255,255,255,0.4)"
          />
        </div>
      </div>
    </div>
  );
}

export function CampaignCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      {/* Product image - 4:3 aspect ratio */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Skeleton width="100%" height="100%" borderRadius={0} />
      </div>

      {/* Content - Product Info */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        {/* Brand + Product Name */}
        <div className="min-w-0 flex-1">
          <Skeleton width="40%" height={10} borderRadius={4} />
          <div className="mt-0.5">
            <Skeleton width="90%" height={14} borderRadius={4} />
          </div>
        </div>
      </div>

      {/* Edge-to-edge divider */}
      <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

      {/* Footer Stats - 3-column layout with dividers */}
      <div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-700">
        <div className="flex flex-col items-center justify-center py-2">
          <Skeleton width={30} height={10} borderRadius={4} />
          <div className="mt-0.5">
            <Skeleton width={45} height={14} borderRadius={4} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-2">
          <Skeleton width={45} height={10} borderRadius={4} />
          <div className="mt-0.5">
            <Skeleton width={35} height={14} borderRadius={4} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-2">
          <Skeleton width={50} height={10} borderRadius={4} />
          <div className="mt-0.5">
            <Skeleton width={25} height={14} borderRadius={4} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function EnrollmentCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      {/* Main Content */}
      <div className="p-3 sm:p-4">
        {/* Product Section */}
        <div className="flex items-start gap-3">
          {/* Product Image */}
          <div className="relative shrink-0">
            <div className="size-20 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <Skeleton width="100%" height="100%" borderRadius={8} />
            </div>
            {/* Platform icon overlay */}
            <Skeleton
              width={20}
              height={20}
              borderRadius={6}
              className="absolute -bottom-1 -right-1"
            />
          </div>

          {/* Product Info */}
          <div className="min-w-0 flex-1">
            {/* Title + Status Row */}
            <div className="flex items-start justify-between gap-2">
              <Skeleton width="65%" height={16} borderRadius={4} />
              {/* Status Badge */}
              <Skeleton width={70} height={22} borderRadius={4} />
            </div>

            {/* Order & Date Info */}
            <div className="mt-1.5 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Skeleton width={12} height={12} borderRadius={2} />
                <Skeleton width={100} height={12} borderRadius={4} />
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton width={12} height={12} borderRadius={2} />
                <Skeleton width={80} height={12} borderRadius={4} />
              </div>
            </div>
          </div>
        </div>

        {/* Deliverables Section */}
        <div className="mt-3">
          <Skeleton width={120} height={12} borderRadius={4} />
          <div className="mt-2 flex gap-1.5">
            <Skeleton width={90} height={24} borderRadius={9999} />
            <Skeleton width={80} height={24} borderRadius={9999} />
            <Skeleton width={70} height={24} borderRadius={9999} />
          </div>
        </div>
      </div>

      {/* Pricing Section - 3 columns with dividers */}
      <div className="relative border-t border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="grid grid-cols-3 items-end px-3 py-3 sm:px-4">
          {/* Order Value */}
          <div className="text-center">
            <Skeleton width={55} height={10} borderRadius={4} className="mx-auto" />
            <div className="mt-0.5">
              <Skeleton width={65} height={18} borderRadius={4} className="mx-auto" />
            </div>
          </div>

          {/* Cashback */}
          <div className="text-center">
            <Skeleton width={50} height={10} borderRadius={4} className="mx-auto" />
            <div className="mt-0.5">
              <Skeleton width={55} height={18} borderRadius={4} className="mx-auto" />
            </div>
          </div>

          {/* Days Left */}
          <div className="text-center">
            <Skeleton width={50} height={10} borderRadius={4} className="mx-auto" />
            <div className="mt-0.5">
              <Skeleton width={40} height={18} borderRadius={4} className="mx-auto" />
            </div>
          </div>
        </div>

        {/* Vertical Dividers */}
        <div className="pointer-events-none absolute inset-y-2 left-1/3 w-px bg-zinc-300 dark:bg-zinc-600" />
        <div className="pointer-events-none absolute inset-y-2 left-2/3 w-px bg-zinc-300 dark:bg-zinc-600" />
      </div>
    </div>
  );
}

export function TrendingCardSkeleton() {
  return (
    <div className="flex w-[calc(100vw-3rem)] shrink-0 snap-center flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 sm:w-85 lg:w-auto dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex flex-1">
        {/* Image - Left side (square) */}
        <div className="relative size-28 shrink-0 overflow-hidden bg-zinc-100 sm:size-32 lg:size-28 xl:size-32 dark:bg-zinc-800">
          <Skeleton width="100%" height="100%" borderRadius={0} />
          {/* Platform icon */}
          <div className="absolute bottom-2 right-2">
            <Skeleton width={24} height={24} borderRadius={6} />
          </div>
        </div>

        {/* Content - Right side */}
        <div className="flex min-w-0 flex-1 flex-col justify-between p-2.5 sm:p-3">
          <div>
            {/* Brand */}
            <Skeleton width="40%" height={10} borderRadius={4} />
            {/* Product Name */}
            <div className="mt-0.5">
              <Skeleton width="95%" height={14} borderRadius={4} />
            </div>
            <div className="mt-0.5">
              <Skeleton width="60%" height={14} borderRadius={4} />
            </div>
          </div>

          {/* Badge */}
          <div className="mt-2">
            <Skeleton width={55} height={18} borderRadius={9999} />
          </div>
        </div>
      </div>

      {/* Edge-to-edge divider */}
      <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

      {/* Footer Stats - 3-column layout with dividers */}
      <div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-700">
        <div className="flex flex-col items-center justify-center py-2">
          <Skeleton width={30} height={10} borderRadius={4} />
          <div className="mt-0.5">
            <Skeleton width={45} height={14} borderRadius={4} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-2">
          <Skeleton width={45} height={10} borderRadius={4} />
          <div className="mt-0.5">
            <Skeleton width={35} height={14} borderRadius={4} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-2">
          <Skeleton width={50} height={10} borderRadius={4} />
          <div className="mt-0.5">
            <Skeleton width={25} height={14} borderRadius={4} />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// LIST ITEM SKELETONS
// =============================================================================

export function TransactionRowSkeleton() {
  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Icon */}
        <Skeleton width={36} height={36} borderRadius={8} className="shrink-0 sm:w-10 sm:h-10" />
        {/* Description + Date */}
        <div className="min-w-0 flex-1">
          <Skeleton width="55%" height={14} borderRadius={4} />
          <div className="mt-0.5">
            <Skeleton width="35%" height={12} borderRadius={4} />
          </div>
        </div>
        {/* Amount + Date */}
        <div className="shrink-0 text-right">
          <Skeleton width={55} height={14} borderRadius={4} />
          <div className="mt-0.5">
            <Skeleton width={45} height={10} borderRadius={4} />
          </div>
        </div>
        {/* Chevron */}
        <Skeleton width={16} height={16} borderRadius={4} className="shrink-0" />
      </div>
      <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
    </>
  );
}

export function WithdrawalRowSkeleton() {
  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <Skeleton circle width={40} height={40} />
        <div className="min-w-0 flex-1">
          <Skeleton width="50%" height={14} borderRadius={4} />
          <div className="mt-1">
            <Skeleton width="70%" height={12} borderRadius={4} />
          </div>
        </div>
        <div className="text-right">
          <Skeleton width={70} height={14} borderRadius={4} />
          <div className="mt-1">
            <Skeleton width={60} height={18} borderRadius={9999} />
          </div>
        </div>
      </div>
      <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
    </>
  );
}

export function BankAccountSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4">
      <Skeleton circle width={40} height={40} />
      <div className="min-w-0 flex-1">
        <Skeleton width="50%" height={14} borderRadius={4} />
        <div className="mt-1">
          <Skeleton width="30%" height={12} borderRadius={4} />
        </div>
      </div>
      <Skeleton width={60} height={24} borderRadius={9999} />
    </div>
  );
}

// =============================================================================
// PAGE-LEVEL SKELETONS
// =============================================================================

export function DashboardSkeleton() {
  return (
    <SkeletonWrapper>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <Skeleton width={220} height={28} borderRadius={4} />
          <div className="mt-1">
            <Skeleton width={180} height={14} borderRadius={4} />
          </div>
        </div>

        {/* Balance Card - White card design */}
        <BalanceCardSkeleton />

        {/* Journey Stats - 3 stat cards in a row */}
        <div className="-mx-0.5 flex gap-2 px-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-1">
              <StatCardSkeleton />
            </div>
          ))}
        </div>

        {/* Campaigns Section */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <Skeleton width={100} height={14} borderRadius={4} />
            <Skeleton width={50} height={12} borderRadius={4} />
          </div>
          {/* 2-col grid on mobile, 4-col on desktop */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Enrollments Section */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <Skeleton width={120} height={14} borderRadius={4} />
            <Skeleton width={50} height={12} borderRadius={4} />
          </div>
          {/* 1-col on mobile, 2-col on desktop */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <EnrollmentCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </SkeletonWrapper>
  );
}

export function WalletSkeleton() {
  return (
    <SkeletonWrapper>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <Skeleton width={70} height={28} borderRadius={4} />
          <div className="mt-1">
            <Skeleton width={220} height={14} borderRadius={4} />
          </div>
        </div>

        {/* Balance Card - Green themed */}
        <WalletBalanceCardSkeleton />

        {/* Stats - 3 columns */}
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Quick Links - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <Skeleton width={40} height={40} borderRadius={8} />
              <div className="min-w-0 flex-1">
                <Skeleton width={80} height={14} borderRadius={4} />
                <div className="mt-0.5">
                  <Skeleton width={70} height={12} borderRadius={4} />
                </div>
              </div>
              <Skeleton width={16} height={16} borderRadius={4} />
            </div>
          ))}
        </div>

        {/* Transactions Card */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Skeleton width={16} height={16} borderRadius={4} />
              <Skeleton width={130} height={14} borderRadius={4} />
            </div>
            <Skeleton width={80} height={12} borderRadius={4} />
          </div>
          <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
          {Array.from({ length: 5 }).map((_, i) => (
            <TransactionRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </SkeletonWrapper>
  );
}

export function CampaignsListSkeleton() {
  return (
    <SkeletonWrapper>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <Skeleton width={100} height={28} borderRadius={4} />
          <div className="mt-1">
            <Skeleton width={280} height={14} borderRadius={4} />
          </div>
        </div>

        {/* Trending Section - Horizontal scroll on mobile */}
        <div className="-mx-4 sm:-mx-6 lg:mx-0">
          <div className="mb-3 flex items-center justify-between px-4 sm:px-6 lg:px-0">
            <Skeleton width={100} height={14} borderRadius={4} />
            <Skeleton width={50} height={12} borderRadius={4} className="lg:hidden" />
          </div>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-1 sm:px-6 lg:hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <TrendingCardSkeleton key={i} />
            ))}
          </div>
          <div className="hidden gap-4 lg:grid lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <TrendingCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Search + Filter Row */}
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <Skeleton width="100%" height={42} borderRadius={10} />
          </div>
          <Skeleton width={42} height={42} borderRadius={10} className="lg:hidden" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} width={80} height={32} borderRadius={9999} />
          ))}
        </div>

        {/* Results count */}
        <div className="border-b border-zinc-200 pb-3 dark:border-zinc-700">
          <Skeleton width={100} height={14} borderRadius={4} />
        </div>

        {/* Campaign Grid - 2 col mobile, 4 col desktop */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CampaignCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </SkeletonWrapper>
  );
}

export function EnrollmentsListSkeleton() {
  return (
    <SkeletonWrapper>
      <div className="space-y-4 sm:space-y-5">
        {/* Header */}
        <div>
          <Skeleton width={120} height={28} borderRadius={4} />
          <div className="mt-0.5">
            <Skeleton width={260} height={14} borderRadius={4} />
          </div>
        </div>

        {/* Search Bar - full width, no filter button */}
        <Skeleton width="100%" height={42} borderRadius={10} />

        {/* Tabs - 6 tabs matching actual content */}
        <div className="-mx-1 flex items-center gap-1.5 px-1 py-0.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={`tab-${i}`} width={i === 0 ? 55 : i === 2 ? 110 : 85} height={32} borderRadius={9999} />
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 sm:pb-3 dark:border-zinc-700">
          <Skeleton width={100} height={13} borderRadius={4} />
        </div>

        {/* Enrollment Grid - 1 col mobile, 2 col desktop */}
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 lg:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <EnrollmentCardSkeleton key={`enrollment-${i}`} />
          ))}
        </div>
      </div>
    </SkeletonWrapper>
  );
}

// =============================================================================
// SETTINGS PAGE SKELETON
// =============================================================================

export function SettingsSkeleton() {
  return (
    <SkeletonWrapper>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <Skeleton width={80} height={28} borderRadius={4} />
          <div className="mt-1">
            <Skeleton width={220} height={14} borderRadius={4} />
          </div>
        </div>

        {/* Profile Card */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              {/* Avatar */}
              <Skeleton width={80} height={80} borderRadius={12} className="sm:w-16 sm:h-16" />
              {/* Info */}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <Skeleton width={120} height={18} borderRadius={4} />
                <div className="mt-1">
                  <Skeleton width={180} height={14} borderRadius={4} />
                </div>
                <div className="mt-1">
                  <Skeleton width={100} height={12} borderRadius={4} />
                </div>
              </div>
              {/* Edit button */}
              <Skeleton width={100} height={36} borderRadius={8} />
            </div>
          </div>
        </div>

        {/* KYC Card */}
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <Skeleton width={36} height={36} borderRadius={12} />
          <div className="min-w-0 flex-1">
            <Skeleton width={100} height={14} borderRadius={4} />
            <div className="mt-1">
              <Skeleton width={200} height={12} borderRadius={4} />
            </div>
          </div>
          <Skeleton width={70} height={32} borderRadius={8} />
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Account Info */}
          <div>
            <div className="mb-2 flex items-center gap-2 px-1">
              <Skeleton width={16} height={16} borderRadius={4} />
              <Skeleton width={90} height={12} borderRadius={4} />
            </div>
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Skeleton width={36} height={36} borderRadius={12} />
                    <div className="min-w-0 flex-1">
                      <Skeleton width={80} height={14} borderRadius={4} />
                    </div>
                    <Skeleton width={100} height={14} borderRadius={4} />
                  </div>
                  {i < 4 && <div className="ml-16 h-px bg-zinc-200 dark:bg-zinc-700" />}
                </div>
              ))}
            </div>
          </div>

          {/* Payout Methods */}
          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Skeleton width={16} height={16} borderRadius={4} />
                <Skeleton width={110} height={12} borderRadius={4} />
              </div>
              <Skeleton width={60} height={12} borderRadius={4} />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                  <div className="flex items-center gap-3">
                    <Skeleton width={36} height={36} borderRadius={12} />
                    <div className="min-w-0 flex-1">
                      <Skeleton width={100} height={14} borderRadius={4} />
                      <div className="mt-1">
                        <Skeleton width={150} height={12} borderRadius={4} />
                      </div>
                    </div>
                    <Skeleton width={20} height={20} borderRadius={10} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <div className="mb-2 flex items-center gap-2 px-1">
            <Skeleton width={16} height={16} borderRadius={4} />
            <Skeleton width={90} height={12} borderRadius={4} />
          </div>
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <Skeleton width={36} height={36} borderRadius={12} />
                  <div className="min-w-0 flex-1">
                    <Skeleton width={140} height={14} borderRadius={4} />
                    <div className="mt-1">
                      <Skeleton width={180} height={12} borderRadius={4} />
                    </div>
                  </div>
                  <Skeleton width={44} height={24} borderRadius={12} />
                </div>
                {i < 1 && <div className="ml-16 h-px bg-zinc-200 dark:bg-zinc-700" />}
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div>
          <div className="mb-2 flex items-center gap-2 px-1">
            <Skeleton width={16} height={16} borderRadius={4} />
            <Skeleton width={60} height={12} borderRadius={4} />
          </div>
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Skeleton width={36} height={36} borderRadius={12} />
                  <Skeleton width={110} height={14} borderRadius={4} />
                </div>
                {i < 2 && <div className="ml-16 h-px bg-zinc-200 dark:bg-zinc-700" />}
              </div>
            ))}
          </div>
        </div>

        {/* Sign Out */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center justify-center gap-2 py-3">
            <Skeleton width={16} height={16} borderRadius={4} />
            <Skeleton width={60} height={14} borderRadius={4} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center">
          <Skeleton width={140} height={12} borderRadius={4} />
        </div>
      </div>
    </SkeletonWrapper>
  );
}

// =============================================================================
// CAMPAIGN SHOW PAGE SKELETON
// =============================================================================

export function CampaignShowSkeleton() {
  return (
    <SkeletonWrapper>
      <div className="space-y-6">
        {/* Section 1: Product + Earnings (Side by Side) */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Product Gallery - Left Side */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            {/* Main Image */}
            <div className="aspect-square w-full bg-zinc-100 dark:bg-zinc-800">
              <Skeleton width="100%" height="100%" borderRadius={0} />
            </div>
            {/* Thumbnails Strip */}
            <div className="border-t border-zinc-200 bg-zinc-100 p-3 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={`thumb-${i}`} width={44} height={44} borderRadius={8} />
                ))}
              </div>
            </div>
          </div>

          {/* Product Info + Earnings - Right Side */}
          <div className="flex flex-col gap-4">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Skeleton width={70} height={22} borderRadius={4} />
              <Skeleton width={80} height={22} borderRadius={4} />
            </div>

            {/* Title & Description */}
            <div>
              <Skeleton width="85%" height={28} borderRadius={4} />
              <div className="mt-2">
                <Skeleton width="100%" height={14} borderRadius={4} />
                <Skeleton width="70%" height={14} borderRadius={4} className="mt-1" />
              </div>
            </div>

            {/* Product Price & Link */}
            <div className="flex items-center gap-4">
              <Skeleton width={100} height={28} borderRadius={4} />
              <Skeleton width={120} height={28} borderRadius={8} />
            </div>

            {/* Premium Dark Earnings Card */}
            <div className="overflow-hidden rounded-xl bg-zinc-900 dark:bg-zinc-800">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Skeleton
                    width={80}
                    height={10}
                    borderRadius={4}
                    baseColor="rgba(255,255,255,0.1)"
                    highlightColor="rgba(255,255,255,0.2)"
                  />
                  <div className="mt-1 flex items-baseline gap-2">
                    <Skeleton
                      width={80}
                      height={32}
                      borderRadius={4}
                      baseColor="rgba(255,255,255,0.1)"
                      highlightColor="rgba(255,255,255,0.2)"
                    />
                    <Skeleton
                      width={60}
                      height={24}
                      borderRadius={4}
                      baseColor="rgba(16,185,129,0.2)"
                      highlightColor="rgba(16,185,129,0.3)"
                    />
                  </div>
                </div>
                <Skeleton
                  width={100}
                  height={40}
                  borderRadius={8}
                  baseColor="rgba(255,255,255,0.9)"
                  highlightColor="rgba(255,255,255,1)"
                />
              </div>
              {/* Progress Bar */}
              <div className="border-t border-zinc-800 bg-zinc-950/50 px-4 py-3 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <Skeleton
                    width={110}
                    height={12}
                    borderRadius={4}
                    baseColor="rgba(255,255,255,0.1)"
                    highlightColor="rgba(255,255,255,0.2)"
                  />
                  <Skeleton
                    width={50}
                    height={12}
                    borderRadius={4}
                    baseColor="rgba(255,255,255,0.1)"
                    highlightColor="rgba(255,255,255,0.2)"
                  />
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <Skeleton width="40%" height="100%" borderRadius={9999} />
                </div>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <StatCardSkeleton key={`stat-${i}`} />
              ))}
            </div>

            {/* How It Works Timeline */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
                <Skeleton width={16} height={16} borderRadius={4} />
                <Skeleton width={90} height={14} borderRadius={4} />
              </div>
              <div className="flex flex-1 items-center p-3 sm:p-4">
                <div className="grid w-full grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`step-${i}`} className="flex flex-col items-center text-center">
                      <Skeleton circle width={32} height={32} />
                      <Skeleton width={50} height={12} borderRadius={4} className="mt-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Campaign Details (Full Width Grid) */}
        <div className="grid items-start gap-5 md:grid-cols-2">
          {/* Left: Calculator */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
              <Skeleton width={16} height={16} borderRadius={4} />
              <Skeleton width={120} height={14} borderRadius={4} />
            </div>
            <div className="space-y-4 p-4">
              {/* Result Display */}
              <div className="rounded-xl bg-zinc-900 p-4 dark:bg-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton
                      width={80}
                      height={10}
                      borderRadius={4}
                      baseColor="rgba(255,255,255,0.1)"
                      highlightColor="rgba(255,255,255,0.2)"
                    />
                    <Skeleton
                      width={100}
                      height={32}
                      borderRadius={4}
                      baseColor="rgba(255,255,255,0.2)"
                      highlightColor="rgba(255,255,255,0.3)"
                      className="mt-0.5"
                    />
                  </div>
                  <Skeleton
                    width={40}
                    height={20}
                    borderRadius={4}
                    baseColor="rgba(16,185,129,0.3)"
                    highlightColor="rgba(16,185,129,0.4)"
                  />
                </div>
              </div>
              {/* Input Section */}
              <div>
                <Skeleton width={130} height={12} borderRadius={4} className="mb-2" />
                <div className="flex gap-2">
                  <Skeleton width="100%" height={42} borderRadius={10} className="flex-1" />
                  <Skeleton width={90} height={42} borderRadius={8} />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Deliverables */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <Skeleton width={16} height={16} borderRadius={4} />
                <Skeleton width={80} height={14} borderRadius={4} />
              </div>
              <Skeleton width={50} height={12} borderRadius={4} />
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`deliv-${i}`} className="flex items-center gap-3 px-4 py-2.5">
                  <Skeleton width={32} height={32} borderRadius={8} />
                  <div className="min-w-0 flex-1">
                    <Skeleton width="60%" height={14} borderRadius={4} />
                    <Skeleton width="40%" height={10} borderRadius={4} className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Important Info */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <Skeleton width={16} height={16} borderRadius={4} />
            <Skeleton width={70} height={14} borderRadius={4} />
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`info-${i}`} className="flex items-start gap-3 px-4 py-2.5">
                <Skeleton width={16} height={16} borderRadius={4} className="mt-0.5 shrink-0" />
                <Skeleton width="80%" height={14} borderRadius={4} />
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
          <Skeleton width={20} height={20} borderRadius={4} />
          <Skeleton width={180} height={14} borderRadius={4} />
        </div>

        {/* FAQs */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <Skeleton width={16} height={16} borderRadius={4} />
            <Skeleton width={40} height={14} borderRadius={4} />
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`faq-${i}`} className="flex items-center justify-between gap-3 px-4 py-3">
                <Skeleton width="70%" height={14} borderRadius={4} />
                <Skeleton width={16} height={16} borderRadius={4} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonWrapper>
  );
}

// =============================================================================
// WITHDRAWALS LIST SKELETON
// =============================================================================

function WithdrawalCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center gap-3 p-4">
        <Skeleton width={40} height={40} borderRadius={8} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton width={80} height={18} borderRadius={4} />
            <Skeleton width={70} height={20} borderRadius={4} />
          </div>
          <Skeleton width={130} height={12} borderRadius={4} className="mt-0.5" />
        </div>
        <Skeleton width={20} height={20} borderRadius={4} />
      </div>
    </div>
  );
}

export function WithdrawalsListSkeleton() {
  return (
    <SkeletonWrapper>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <Skeleton width={110} height={28} borderRadius={4} />
          <div className="mt-1">
            <Skeleton width={200} height={14} borderRadius={4} />
          </div>
        </div>

        {/* In Progress Section */}
        <div className="space-y-3">
          <Skeleton width={100} height={10} borderRadius={4} />
          <WithdrawalCardSkeleton />
          <WithdrawalCardSkeleton />
        </div>

        {/* Completed Section */}
        <div className="space-y-3">
          <Skeleton width={90} height={10} borderRadius={4} />
          <WithdrawalCardSkeleton />
          <WithdrawalCardSkeleton />
        </div>
      </div>
    </SkeletonWrapper>
  );
}

// =============================================================================
// WITHDRAWAL SHOW PAGE SKELETON
// =============================================================================

export function WithdrawalShowSkeleton() {
  return (
    <SkeletonWrapper>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <Skeleton width={160} height={28} borderRadius={4} />
          <div className="mt-1">
            <Skeleton width={220} height={14} borderRadius={4} />
          </div>
        </div>

        {/* Amount Card */}
        <div className="overflow-hidden rounded-2xl bg-sky-600 dark:bg-sky-700">
          <div className="p-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-white/20">
              <Skeleton
                circle
                width={28}
                height={28}
                baseColor="rgba(255,255,255,0.2)"
                highlightColor="rgba(255,255,255,0.3)"
              />
            </div>
            <div className="mt-4">
              <Skeleton
                width={140}
                height={40}
                borderRadius={4}
                baseColor="rgba(255,255,255,0.2)"
                highlightColor="rgba(255,255,255,0.3)"
                className="mx-auto"
              />
            </div>
            <div className="mt-2">
              <Skeleton
                width={120}
                height={14}
                borderRadius={4}
                baseColor="rgba(255,255,255,0.15)"
                highlightColor="rgba(255,255,255,0.25)"
                className="mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-950/50">
          <Skeleton width={20} height={20} borderRadius={4} />
          <Skeleton width={120} height={14} borderRadius={4} />
        </div>

        {/* Bank Account */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="px-4 py-3">
            <Skeleton width={100} height={14} borderRadius={4} />
          </div>
          <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex items-center gap-3 p-4">
            <Skeleton width={40} height={40} borderRadius={8} />
            <div className="min-w-0 flex-1">
              <Skeleton width={100} height={14} borderRadius={4} />
              <Skeleton width={180} height={12} borderRadius={4} className="mt-1" />
            </div>
            <Skeleton width={20} height={20} borderRadius={10} />
          </div>
        </div>

        {/* Details */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="px-4 py-3">
            <Skeleton width={60} height={14} borderRadius={4} />
          </div>
          <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="divide-y divide-zinc-200 px-4 dark:divide-zinc-700">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`detail-${i}`} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-2">
                  <Skeleton width={16} height={16} borderRadius={4} />
                  <Skeleton width={90} height={14} borderRadius={4} />
                </div>
                <Skeleton width={100} height={14} borderRadius={4} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonWrapper>
  );
}

// =============================================================================
// TRANSACTION SHOW PAGE SKELETON
// =============================================================================

export function TransactionShowSkeleton() {
  return (
    <SkeletonWrapper>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <Skeleton width={170} height={28} borderRadius={4} />
          <div className="mt-1">
            <Skeleton width={200} height={14} borderRadius={4} />
          </div>
        </div>

        {/* Amount Card */}
        <div className="overflow-hidden rounded-2xl bg-emerald-600 dark:bg-emerald-700">
          <div className="p-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-white/20">
              <Skeleton
                circle
                width={28}
                height={28}
                baseColor="rgba(255,255,255,0.2)"
                highlightColor="rgba(255,255,255,0.3)"
              />
            </div>
            <div className="mt-4">
              <Skeleton
                width={130}
                height={40}
                borderRadius={4}
                baseColor="rgba(255,255,255,0.2)"
                highlightColor="rgba(255,255,255,0.3)"
                className="mx-auto"
              />
            </div>
            <div className="mt-2">
              <Skeleton
                width={100}
                height={14}
                borderRadius={4}
                baseColor="rgba(255,255,255,0.15)"
                highlightColor="rgba(255,255,255,0.25)"
                className="mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Type Badge */}
        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/50">
          <Skeleton width={20} height={20} borderRadius={4} />
          <Skeleton width={110} height={14} borderRadius={4} />
        </div>

        {/* Details */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="px-4 py-3">
            <Skeleton width={60} height={14} borderRadius={4} />
          </div>
          <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="divide-y divide-zinc-200 px-4 dark:divide-zinc-700">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`detail-${i}`} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-2">
                  <Skeleton width={16} height={16} borderRadius={4} />
                  <Skeleton width={90} height={14} borderRadius={4} />
                </div>
                <Skeleton width={100} height={14} borderRadius={4} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonWrapper>
  );
}

// Re-export Skeleton for custom usage
export { Skeleton, SkeletonTheme };
