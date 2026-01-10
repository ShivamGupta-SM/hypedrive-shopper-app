import { Button } from "@/components/button";
import { balanceCardColors } from "@/lib/theme";
import {
  ArrowUpTrayIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/16/solid";

interface BalanceCardProps {
  /** Available balance (formatted string, e.g., "1,234.56") */
  available: string;
  /** Pending balance */
  pending?: string;
  /** Lifetime earnings (optional, shown in footer) */
  lifetime?: string;
  /** Whether user can withdraw */
  canWithdraw: boolean;
  /** KYC verification status */
  kycVerified?: boolean;
  /** Callback when withdraw is clicked */
  onWithdraw?: () => void;
  /** Optional href for withdraw button (alternative to onWithdraw) */
  withdrawHref?: string;
  /** Show compact version (no lifetime, smaller) */
  compact?: boolean;
}

/**
 * BalanceCard - Hero balance display component
 *
 * Used on Dashboard and Wallet pages.
 *
 * @example Dashboard usage
 * <BalanceCard
 *   available="1,234.56"
 *   pending="100.00"
 *   lifetime="5,000.00"
 *   canWithdraw={true}
 *   withdrawHref="/wallet"
 * />
 *
 * @example Wallet usage with callback
 * <BalanceCard
 *   available="1,234.56"
 *   pending="100.00"
 *   canWithdraw={true}
 *   kycVerified={true}
 *   onWithdraw={() => setShowWithdrawDialog(true)}
 * />
 */
export function BalanceCard({
  available,
  pending,
  lifetime,
  canWithdraw,
  kycVerified,
  onWithdraw,
  withdrawHref,
  compact,
}: BalanceCardProps) {
  const hasBalance = parseFloat(available.replace(/,/g, "")) > 0;
  const hasPending = pending && parseFloat(pending.replace(/,/g, "")) > 0;

  return (
    <div className={`${balanceCardColors.bg} rounded-2xl p-5`}>
      {/* Header: Balance + Withdraw button */}
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium ${balanceCardColors.label}`}>
            Available to withdraw
          </p>
          <p
            className={`mt-1 text-4xl font-bold tracking-tight ${balanceCardColors.amount}`}
          >
            ₹{available}
          </p>
        </div>
        {hasBalance && canWithdraw && (
          <Button
            href={withdrawHref}
            onClick={onWithdraw}
            color="white"
          >
            {compact ? <ArrowUpTrayIcon className="size-4" /> : null}
            {compact ? "Withdraw" : "Withdraw"}
          </Button>
        )}
      </div>

      {/* KYC Status (Wallet page only) */}
      {kycVerified !== undefined && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {kycVerified ? (
            <span
              className={`flex items-center gap-1.5 text-xs ${balanceCardColors.amount}`}
            >
              <ShieldCheckIcon className="size-4" />
              Verified
            </span>
          ) : (
            <span className={`flex items-center gap-1.5 text-xs ${balanceCardColors.pending}`}>
              <ExclamationTriangleIcon className="size-4" />
              KYC Pending
            </span>
          )}
          {hasPending && (
            <>
              <span className={`text-xs ${balanceCardColors.stat}`}>·</span>
              <span className={`text-xs ${balanceCardColors.label}`}>
                ₹{pending} pending
              </span>
            </>
          )}
        </div>
      )}

      {/* Footer Stats (Dashboard version) */}
      {!compact && (hasPending || lifetime) && kycVerified === undefined && (
        <div
          className={`mt-5 flex gap-6 border-t ${balanceCardColors.divider} pt-4`}
        >
          {hasPending && (
            <div>
              <p className={`text-xs ${balanceCardColors.stat}`}>Pending</p>
              <p className={`text-sm font-semibold ${balanceCardColors.pending}`}>
                ₹{pending}
              </p>
            </div>
          )}
          {lifetime && (
            <div>
              <p className={`text-xs ${balanceCardColors.stat}`}>
                Lifetime earnings
              </p>
              <p className={`text-sm font-semibold ${balanceCardColors.amount}`}>
                ₹{lifetime}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
