import { Link } from "@/components/link";
import { getAssetUrl } from "@/hooks/use-api";
import {
  getCampaignTypeConfig,
  getDaysLeft,
  getDisplayCashback,
  isEndingSoon as checkIsEndingSoon,
} from "@/lib/campaign-utils";
import {
  ArrowsRightLeftIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  SparklesIcon,
} from "@heroicons/react/16/solid";

// =============================================================================
// CAMPAIGN CARD - Shared component for campaigns list and dashboard
// =============================================================================

export interface CampaignCardProps {
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
}

// Campaign type icon mapping
const CAMPAIGN_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  cashback: CurrencyRupeeIcon,
  barter: ArrowsRightLeftIcon,
  hybrid: SparklesIcon,
};

/**
 * CampaignCard - iOS-style product card with 3-column footer
 *
 * @example
 * <CampaignCard campaign={campaign} />
 */
export function CampaignCard({ campaign }: CampaignCardProps) {
  const daysLeft = getDaysLeft(campaign);
  const isEndingSoon = checkIsEndingSoon(campaign);
  const cashbackDisplay = getDisplayCashback(campaign);
  const badgeConfig = getCampaignTypeConfig(campaign.campaignType);
  const BadgeIcon = CAMPAIGN_TYPE_ICONS[campaign.campaignType || ""] || CurrencyRupeeIcon;

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
    >
      {/* Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {campaign.product?.primaryImage ? (
          <img
            src={getAssetUrl(campaign.product.primaryImage)}
            alt={campaign.product.name || campaign.title}
            loading="lazy"
            decoding="async"
            className="size-full object-contain"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <SparklesIcon className="size-10 text-zinc-300 dark:text-zinc-600" />
          </div>
        )}

        {/* Campaign type badge - top right with solid bg for contrast */}
        <span className={`absolute right-2 top-2 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium shadow-sm ${
          badgeConfig.color === "emerald"
            ? "bg-emerald-500 text-white"
            : badgeConfig.color === "amber"
              ? "bg-amber-500 text-white"
              : "bg-sky-500 text-white"
        }`}>
          <BadgeIcon className="size-3" />
          {badgeConfig.label}
        </span>

        {/* Platform badge */}
        {campaign.platform?.icon && (
          <div className="absolute bottom-2 right-2 flex size-6 items-center justify-center rounded-md bg-white/90 shadow-sm dark:bg-zinc-900/90">
            <img
              src={getAssetUrl(campaign.platform.icon)}
              alt={campaign.platform.name || ""}
              loading="lazy"
              decoding="async"
              className="size-4 object-contain"
            />
          </div>
        )}

        {/* Urgency badge */}
        {isEndingSoon && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-zinc-900/80 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm sm:text-xs">
            <ClockIcon className="size-3" />
            {daysLeft}d left
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
      </div>

      {/* Edge-to-edge divider */}
      <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

      {/* Footer Stats - 3-column layout with dividers */}
      <div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-700">
        {/* Price */}
        <div className="flex flex-col items-center justify-center py-2">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Price</span>
          <span className="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-white">
            {campaign.product?.priceDecimal ? `₹${campaign.product.priceDecimal}` : "—"}
          </span>
        </div>

        {/* Cashback */}
        <div className="flex flex-col items-center justify-center py-2">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Cashback</span>
          <span className="text-xs font-semibold text-emerald-600 sm:text-sm dark:text-emerald-400">
            {cashbackDisplay}
          </span>
        </div>

        {/* Days Left */}
        <div className="flex flex-col items-center justify-center py-2">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Days Left</span>
          <span className={`text-xs font-semibold sm:text-sm ${
            daysLeft !== null && daysLeft <= 7
              ? "text-amber-600 dark:text-amber-400"
              : "text-zinc-900 dark:text-white"
          }`}>
            {daysLeft !== null ? daysLeft : "—"}
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * CampaignCardGrid - Container for campaign cards
 */
export function CampaignCardGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 ${className || ""}`}>
      {children}
    </div>
  );
}
