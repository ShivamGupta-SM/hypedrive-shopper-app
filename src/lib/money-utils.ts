/**
 * Money formatting and calculation utilities
 * Centralizes all money-related logic for consistency
 */

// =============================================================================
// FORMATTING
// =============================================================================

/**
 * Format amount using Intl.NumberFormat (INR currency)
 * Best for displaying prices and monetary values
 */
export function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format amount to Indian Rupees display
 * @param amount - Amount in rupees (can be string or number)
 * @param options - Formatting options
 */
export function formatMoney(
  amount: string | number | null | undefined,
  options: {
    showSign?: boolean;
    showSymbol?: boolean;
    decimals?: number;
  } = {}
): string {
  const { showSign = false, showSymbol = true, decimals = 2 } = options;

  if (amount === null || amount === undefined || amount === "") {
    return showSymbol ? "₹0" : "0";
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return showSymbol ? "₹0" : "0";
  }

  const sign = showSign && num > 0 ? "+" : "";
  const symbol = showSymbol ? "₹" : "";

  // Format with Indian number system for amounts >= 1000
  const formatted = num >= 1000
    ? num.toLocaleString("en-IN", { maximumFractionDigits: decimals })
    : num.toFixed(decimals);

  return `${sign}${symbol}${formatted}`;
}

/**
 * Format compact money for large amounts (e.g., "2.5Cr", "50L", "10K")
 */
export function formatCompactMoney(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") {
    return "₹0";
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return "₹0";
  }

  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(1)}Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}K`;
  }

  return `₹${num.toFixed(2)}`;
}

// =============================================================================
// PARSING
// =============================================================================

/**
 * Parse amount from various formats to number
 */
export function parseAmount(amount: string | number | null | undefined): number {
  if (amount === null || amount === undefined || amount === "") {
    return 0;
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return isNaN(num) ? 0 : num;
}

/**
 * Convert cents (integer) to rupees (decimal)
 */
export function centsToRupees(cents: number): number {
  return cents / 100;
}

/**
 * Convert rupees (decimal) to cents (integer)
 */
export function rupeesToCents(rupees: number): number {
  return Math.round(rupees * 100);
}

// =============================================================================
// CALCULATIONS
// =============================================================================

/**
 * Check if amount is positive (greater than zero)
 */
export function isPositiveAmount(amount: string | number | null | undefined): boolean {
  return parseAmount(amount) > 0;
}

/**
 * Calculate percentage of an amount
 */
export function calculatePercentage(amount: number, percentage: number): number {
  return (amount * percentage) / 100;
}

/**
 * Calculate payout from order value and rebate percentage + bonus
 */
export function calculatePayout(
  orderValue: number,
  rebatePercentage: number,
  bonusAmount?: number
): { total: number; rebate: number; bonus: number } {
  const rebate = calculatePercentage(orderValue, rebatePercentage);
  const bonus = bonusAmount || 0;
  return {
    total: rebate + bonus,
    rebate,
    bonus,
  };
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Get balance display with proper formatting
 * Returns empty dash if balance is zero
 */
export function getBalanceDisplay(amount: string | number | null | undefined): string {
  const num = parseAmount(amount);
  return num > 0 ? formatMoney(num) : "—";
}

/**
 * Get color class for money display based on amount
 */
export function getMoneyColorClass(amount: string | number | null | undefined): string {
  const num = parseAmount(amount);
  if (num > 0) return "text-emerald-600 dark:text-emerald-400";
  if (num < 0) return "text-red-600 dark:text-red-400";
  return "text-zinc-500 dark:text-zinc-400";
}
