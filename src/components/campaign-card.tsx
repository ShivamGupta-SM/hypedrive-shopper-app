import { Link } from "@/components/link";
import { ClockIcon, SparklesIcon } from "@heroicons/react/16/solid";

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    description?: string;
    rebatePercentage?: number;
    bonusAmount?: number;
    bonusAmountDecimal?: string;
    maxEnrollments?: number;
    currentEnrollments?: number;
    startDate?: string;
    endDate?: string;
    campaignType?: string;
    product?: {
      id?: string;
      name?: string;
      price?: number;
      priceDecimal?: string;
      productLink?: string;
      primaryImage?: string;
    };
    organization?: {
      id?: string;
      name?: string;
      logo?: string;
    };
    platform?: {
      id?: string;
      name?: string;
      logo?: string;
      icon?: string;
    };
  };
  /** Variant: default (full details) or compact (minimal for dashboard) */
  variant?: "default" | "compact";
}

/**
 * CampaignCard - Unified campaign card component
 *
 * @example Full card (Campaigns list)
 * <CampaignCard campaign={campaign} />
 *
 * @example Compact card (Dashboard grid)
 * <CampaignCard campaign={campaign} variant="compact" />
 */
export function CampaignCard({
  campaign,
  variant = "default",
}: CampaignCardProps) {
  const cashback =
    campaign.rebatePercentage && campaign.rebatePercentage > 0
      ? `${campaign.rebatePercentage}%`
      : null;

  const bonus = campaign.bonusAmountDecimal
    ? `₹${campaign.bonusAmountDecimal}`
    : campaign.bonusAmount && campaign.bonusAmount > 0
      ? `₹${(campaign.bonusAmount / 100).toFixed(0)}`
      : null;

  const daysLeft = campaign.endDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(campaign.endDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const isEndingSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;

  const slotsLeft =
    campaign.maxEnrollments && campaign.currentEnrollments !== undefined
      ? Math.max(0, campaign.maxEnrollments - campaign.currentEnrollments)
      : null;

  const isCompact = variant === "compact";

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10"
    >
      {/* Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {campaign.product?.primaryImage ? (
          <img
            src={campaign.product.primaryImage}
            alt={campaign.product.name || campaign.title}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <SparklesIcon className="size-10 text-zinc-300 dark:text-zinc-600" />
          </div>
        )}

        {/* Platform badge */}
        {campaign.platform?.icon && (
          <div className="absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-md bg-white/90 shadow-sm backdrop-blur-sm dark:bg-zinc-900/90">
            <img
              src={campaign.platform.icon}
              alt={campaign.platform.name || ""}
              className="size-5 object-contain"
            />
          </div>
        )}

        {/* Urgency badge */}
        {isEndingSoon && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-zinc-900/80 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <ClockIcon className="size-3" />
            {daysLeft}d left
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={`flex flex-1 flex-col ${isCompact ? "p-2.5" : "p-3 sm:p-4"}`}
      >
        {/* Brand */}
        {campaign.organization?.name && (
          <p
            className={`truncate font-medium uppercase tracking-wide text-zinc-400 ${
              isCompact ? "text-[10px]" : "text-xs"
            }`}
          >
            {campaign.organization.name}
          </p>
        )}

        {/* Product Name */}
        <h3
          className={`line-clamp-2 font-semibold leading-snug text-zinc-900 dark:text-white ${
            isCompact ? "mt-0.5 text-xs" : "mt-1 text-sm"
          }`}
        >
          {campaign.product?.name || campaign.title}
        </h3>

        {/* Price + Rewards Row */}
        <div
          className={`flex items-baseline justify-between gap-2 ${
            isCompact ? "mt-auto pt-2" : "mt-2"
          }`}
        >
          {campaign.product?.priceDecimal && (
            <p
              className={`font-bold text-zinc-900 dark:text-white ${
                isCompact ? "text-sm" : "text-base"
              }`}
            >
              ₹{campaign.product.priceDecimal}
            </p>
          )}

          <div className={`flex ${isCompact ? "flex-col items-end gap-0.5" : "items-center gap-1.5"}`}>
            {cashback && (
              <span
                className={`rounded-md bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 ${
                  isCompact ? "text-[10px]" : "text-xs"
                }`}
              >
                {isCompact ? `${cashback} back` : cashback}
              </span>
            )}
            {bonus && (
              <span
                className={`font-semibold text-amber-600 dark:text-amber-400 ${
                  isCompact ? "text-[10px]" : "rounded-md bg-sky-50 px-1.5 py-0.5 text-xs text-sky-700 dark:bg-sky-950/50 dark:text-sky-400"
                }`}
              >
                +{bonus}{isCompact ? " bonus" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Footer (non-compact only) */}
        {!isCompact && (slotsLeft !== null || campaign.platform?.name) && (
          <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            {slotsLeft !== null && <span>{slotsLeft} slots left</span>}
            {slotsLeft !== null &&
              campaign.platform?.name &&
              !campaign.platform.icon && <span>·</span>}
            {campaign.platform?.name && !campaign.platform.icon && (
              <span>{campaign.platform.name}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

/**
 * CampaignCardSkeleton - Loading skeleton for campaign card
 */
export function CampaignCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
      <div className="aspect-4/3 w-full animate-pulse bg-zinc-100 dark:bg-zinc-800" />
      <div className="space-y-2 p-3 sm:p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-4 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-4 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

/**
 * CampaignCardGrid - Container for campaign cards
 */
export function CampaignCardGrid({
  children,
  columns = 3,
  className,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const colsClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-3 lg:grid-cols-4",
  }[columns];

  return (
    <div className={`grid ${colsClass} gap-3 sm:gap-4 ${className || ""}`}>
      {children}
    </div>
  );
}
