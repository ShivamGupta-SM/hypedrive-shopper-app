/**
 * Campaign calculation utilities
 * Centralized business logic for campaign-related calculations
 */

// =============================================================================
// TYPES
// =============================================================================

export interface CampaignPricing {
  rebatePercentage?: number;
  bonusAmount?: number;
  bonusAmountDecimal?: string;
  product?: {
    price?: number;
  };
}

export interface CampaignTiming {
  endDate?: string;
}

export type CampaignType = "cashback" | "barter" | "hybrid";

export interface CampaignTypeConfig {
  color: "emerald" | "amber" | "sky";
  label: string;
}

// =============================================================================
// CALCULATIONS
// =============================================================================

/**
 * Calculate the cashback percentage from campaign data
 */
export function getCashbackPercentage(campaign: CampaignPricing): number | null {
  return campaign.rebatePercentage && campaign.rebatePercentage > 0
    ? campaign.rebatePercentage
    : null;
}

/**
 * Calculate the bonus amount from campaign data (handles both decimal string and integer cents)
 */
export function getBonusAmount(campaign: CampaignPricing): number | null {
  if (campaign.bonusAmountDecimal) {
    return parseFloat(campaign.bonusAmountDecimal);
  }
  if (campaign.bonusAmount && campaign.bonusAmount > 0) {
    return campaign.bonusAmount / 100;
  }
  return null;
}

/**
 * Calculate the cashback amount in rupees from price and percentage
 */
export function getCashbackAmount(campaign: CampaignPricing): number | null {
  const cashback = getCashbackPercentage(campaign);
  if (cashback && campaign.product?.price) {
    return Math.round((campaign.product.price * cashback) / 100) / 100;
  }
  return null;
}

/**
 * Get the display value for cashback (either calculated amount or bonus)
 */
export function getDisplayCashback(campaign: CampaignPricing): string {
  const cashbackAmount = getCashbackAmount(campaign);
  if (cashbackAmount) {
    return `₹${cashbackAmount}`;
  }
  const bonus = getBonusAmount(campaign);
  if (bonus) {
    return `₹${Math.round(bonus)}`;
  }
  return "—";
}

/**
 * Calculate days left until campaign ends
 */
export function getDaysLeft(campaign: CampaignTiming): number | null {
  if (!campaign.endDate) return null;
  return Math.max(
    0,
    Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
}

/**
 * Check if campaign is ending soon (within 7 days)
 */
export function isEndingSoon(campaign: CampaignTiming): boolean {
  const daysLeft = getDaysLeft(campaign);
  return daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
}

// =============================================================================
// CAMPAIGN TYPE CONFIGURATION
// =============================================================================

const CAMPAIGN_TYPE_CONFIG: Record<CampaignType, CampaignTypeConfig> = {
  cashback: { color: "emerald", label: "Cashback" },
  barter: { color: "amber", label: "Barter" },
  hybrid: { color: "sky", label: "Hybrid" },
};

/**
 * Get the badge configuration for a campaign type
 */
export function getCampaignTypeConfig(campaignType?: string): CampaignTypeConfig {
  return CAMPAIGN_TYPE_CONFIG[campaignType as CampaignType] || CAMPAIGN_TYPE_CONFIG.cashback;
}
