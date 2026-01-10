import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/dialog";
import { Field, Label } from "@/components/fieldset";
import { Heading, Subheading } from "@/components/heading";
import { Input, InputGroup } from "@/components/input";
import { Link } from "@/components/link";
import { Select } from "@/components/select";
import { Text } from "@/components/text";
import {
  useShopperProfile,
  useShopperStats,
  useWallet,
  useWalletTransactions,
  useWithdrawals,
  useWithdrawalMethods,
} from "@/hooks/use-api";
import { getAuthenticatedClient } from "@/lib/client";
import type { wallets } from "@/lib/api-client";
import {
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ArrowUpTrayIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import { useState } from "react";

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="size-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600 dark:border-emerald-800 dark:border-t-emerald-400" />
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
        Loading wallet...
      </p>
    </div>
  );
}

function formatDate(dateString?: string) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateString?: string) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BalanceCard({
  balance,
  pendingBalance,
  canWithdraw,
  onWithdraw,
  kycVerified,
}: {
  balance: string;
  pendingBalance: string;
  canWithdraw: boolean;
  onWithdraw: () => void;
  kycVerified: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-emerald-600 shadow-sm dark:bg-emerald-700">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-100">
              Available Balance
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ₹{balance}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {kycVerified ? (
                <span className="flex items-center gap-1.5 text-xs text-white">
                  <ShieldCheckIcon className="size-4" />
                  Verified
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-amber-200">
                  <ExclamationTriangleIcon className="size-4" />
                  KYC Pending
                </span>
              )}
              <span className="text-xs text-emerald-300">·</span>
              <span className="text-xs text-emerald-100">
                ₹{pendingBalance} pending
              </span>
            </div>
          </div>

          <Button
            onClick={onWithdraw}
            disabled={!canWithdraw}
            color="white"
            className="w-full shrink-0 sm:w-auto"
          >
            <ArrowUpTrayIcon className="size-4" />
            Withdraw
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  variant = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  variant?: "default" | "success" | "warning" | "info";
}) {
  const styles = {
    default: {
      icon: "text-zinc-500 dark:text-zinc-400",
    },
    success: {
      icon: "text-emerald-500 dark:text-emerald-400",
    },
    warning: {
      icon: "text-amber-500 dark:text-amber-400",
    },
    info: {
      icon: "text-sky-500 dark:text-sky-400",
    },
  }[variant];

  return (
    <div className="flex flex-1 flex-col rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center gap-1.5">
        <Icon className={`size-4 ${styles.icon}`} />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      </div>
      <p className="mt-1 text-base font-semibold text-zinc-900 sm:text-lg dark:text-white">{value}</p>
    </div>
  );
}

function TransactionRow({
  type,
  title,
  description,
  amount,
  date,
  status,
}: {
  type: "credit" | "debit" | "pending";
  title: string;
  description: string;
  amount: string;
  date?: string;
  status?: "completed" | "pending" | "failed";
}) {
  const config = {
    credit: {
      icon: ArrowDownTrayIcon,
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      amountColor: "text-emerald-600 dark:text-emerald-400",
      prefix: "+",
    },
    debit: {
      icon: ArrowUpTrayIcon,
      bg: "bg-sky-50 dark:bg-sky-950/50",
      iconColor: "text-sky-600 dark:text-sky-400",
      amountColor: "text-zinc-900 dark:text-zinc-100",
      prefix: "-",
    },
    pending: {
      icon: ClockIcon,
      bg: "bg-amber-50 dark:bg-amber-950/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      amountColor: "text-amber-600 dark:text-amber-400",
      prefix: "+",
    },
  }[type];

  const Icon = config.icon;

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
        >
          <Icon className={`size-5 ${config.iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            {title}
          </p>
          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-sm font-semibold ${config.amountColor}`}>
            {config.prefix}₹{amount}
          </p>
          {date && (
            <span className="text-[10px] text-zinc-400">
              {formatDateTime(date)}
            </span>
          )}
          {status && !date && (
            <span
              className={`text-[10px] ${
                status === "completed"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : status === "failed"
                    ? "text-red-600 dark:text-red-400"
                    : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {status === "completed" ? "Done" : status === "failed" ? "Failed" : "Pending"}
            </span>
          )}
        </div>
      </div>
      <div className="h-px bg-zinc-200 last:hidden dark:bg-zinc-700" />
    </>
  );
}

function WithdrawalRow({
  withdrawal,
}: {
  withdrawal: wallets.Withdrawal;
}) {
  const statusConfig: Record<string, { color: "emerald" | "amber" | "red" | "zinc"; label: string }> = {
    pending: { color: "amber", label: "Pending" },
    processing: { color: "amber", label: "Processing" },
    completed: { color: "emerald", label: "Completed" },
    failed: { color: "red", label: "Failed" },
    cancelled: { color: "zinc", label: "Cancelled" },
  };

  const config = statusConfig[withdrawal.status] || { color: "zinc" as const, label: withdrawal.status };

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/50">
          <ArrowUpTrayIcon className="size-5 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            Withdrawal
          </p>
          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {formatDateTime(withdrawal.requestedAt)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            -₹{withdrawal.amountDecimal}
          </p>
          <Badge color={config.color} className="mt-0.5 text-[10px]">
            {config.label}
          </Badge>
        </div>
      </div>
      <div className="h-px bg-zinc-200 last:hidden dark:bg-zinc-700" />
    </>
  );
}

function KYCAlert({ kycStatus, balance }: { kycStatus?: string; balance: number }) {
  // KYC only required for withdrawals above ₹30,000
  const KYC_THRESHOLD = 30000;
  if (kycStatus === "verified" || balance <= KYC_THRESHOLD) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <ExclamationTriangleIcon className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Complete KYC verification
            </p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
              Required for withdrawals above ₹{KYC_THRESHOLD.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <Button href="/settings" className="w-full shrink-0 sm:w-auto" color="amber">
          Verify Now
        </Button>
      </div>
    </div>
  );
}

function EmptyActivity() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <BanknotesIcon className="size-6 text-zinc-400" />
      </div>
      <p className="mt-4 text-sm font-semibold text-zinc-900 dark:text-white">
        No transactions yet
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Start earning by enrolling in campaigns
      </p>
      <Button href="/campaigns" className="mt-4">
        Browse Campaigns
      </Button>
    </div>
  );
}

function WithdrawDialog({
  open,
  onClose,
  balance,
  withdrawalMethods,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  balance: string;
  withdrawalMethods: wallets.WithdrawalMethod[];
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState(
    withdrawalMethods.find((m) => m.isDefault)?.id || withdrawalMethods[0]?.id || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (numAmount > parseFloat(balance)) {
      setError("Amount exceeds available balance");
      return;
    }
    if (!selectedMethodId) {
      setError("Please select a withdrawal method");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = getAuthenticatedClient();
      await client.wallets.createWithdrawal({
        amount: Math.round(numAmount * 100), // Convert to paise
        withdrawalMethodId: selectedMethodId,
      });
      onSuccess();
      onClose();
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create withdrawal");
    } finally {
      setLoading(false);
    }
  };

  const verifiedMethods = withdrawalMethods.filter((m) => m.isVerified !== false);

  return (
    <Dialog open={open} onClose={onClose} size="md">
      <DialogTitle>Withdraw Funds</DialogTitle>
      <DialogDescription>
        Transfer your earnings to your bank account.
      </DialogDescription>
      <DialogBody>
        <div className="space-y-4">
          {/* Balance Display */}
          <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Available Balance
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              ₹{balance}
            </p>
          </div>

          {/* Amount Input */}
          <Field>
            <Label>Amount to withdraw</Label>
            <div className="mt-2">
              <InputGroup>
                <CurrencyRupeeIcon />
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={1}
                  max={parseFloat(balance)}
                />
              </InputGroup>
            </div>
          </Field>

          {/* Bank Account Selection */}
          {verifiedMethods.length > 0 ? (
            <Field>
              <Label>Withdraw to</Label>
              <div className="mt-2">
                <Select
                  value={selectedMethodId}
                  onChange={(e) => setSelectedMethodId(e.target.value)}
                >
                  {verifiedMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.bankName || "Bank Account"} ••••{method.accountNumber?.slice(-4) || "****"}
                      {method.isDefault ? " (Default)" : ""}
                    </option>
                  ))}
                </Select>
              </div>
            </Field>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    No bank account linked
                  </p>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                    Add a bank account in Settings to withdraw your earnings.
                  </p>
                  <Button href="/settings" className="mt-3" color="amber">
                    Add Bank Account
                  </Button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <XCircleIcon className="size-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </DialogBody>
      <DialogActions>
        <Button plain onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleWithdraw}
          disabled={loading || !amount || verifiedMethods.length === 0}
        >
          {loading ? "Processing..." : "Withdraw"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function Wallet() {
  const { data: profile, loading: profileLoading } = useShopperProfile();
  const { data: stats, loading: statsLoading } = useShopperStats();
  const { data: wallet, loading: walletLoading } = useWallet();
  const { data: transactions, loading: txLoading } = useWalletTransactions({ take: 10 });
  const { data: withdrawals, loading: withdrawalsLoading, refetch: refetchWithdrawals } = useWithdrawals({ take: 5 });
  const { data: methodsData, loading: methodsLoading } = useWithdrawalMethods();

  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  if (profileLoading || statsLoading || walletLoading) {
    return <LoadingSpinner />;
  }

  const kycVerified = profile?.shopper?.kycStatus === "verified";
  const availableBalance = wallet?.balanceDecimal || profile?.walletBalanceDecimal || "0.00";
  const availableAmount = parseFloat(availableBalance);
  // KYC required only for withdrawals above ₹30,000
  const KYC_THRESHOLD = 30000;
  const needsKycForWithdrawal = availableAmount > KYC_THRESHOLD && !kycVerified;
  const hasPaymentMethod = (methodsData?.methods?.length || 0) > 0;
  const canWithdraw = availableAmount > 0 && hasPaymentMethod && !needsKycForWithdrawal;

  const handleWithdrawSuccess = () => {
    refetchWithdrawals();
  };

  const txList = transactions?.data || [];
  const withdrawalList = withdrawals?.data || [];
  const hasActivity = txList.length > 0 || withdrawalList.length > 0 || (stats && stats.approved > 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Heading>Wallet</Heading>
        <Text className="mt-1 text-sm">Track earnings and manage withdrawals</Text>
      </div>

      {/* KYC Alert - only shown when balance > ₹30,000 and KYC not done */}
      <KYCAlert kycStatus={profile?.shopper?.kycStatus} balance={availableAmount} />

      {/* Balance Card */}
      <BalanceCard
        balance={availableBalance}
        pendingBalance={wallet?.pendingBalanceDecimal || profile?.pendingPayoutsDecimal || "0.00"}
        canWithdraw={canWithdraw}
        onWithdraw={() => setShowWithdrawDialog(true)}
        kycVerified={kycVerified}
      />

      {/* Stats */}
      <div className="-mx-0.5 flex gap-2 px-0.5">
        <StatCard
          icon={ArrowTrendingUpIcon}
          label="Earned"
          value={`₹${stats?.totalEarningsDecimal || "0"}`}
          variant="success"
        />
        <StatCard
          icon={ClockIcon}
          label="Pending"
          value={`₹${wallet?.pendingBalanceDecimal || stats?.pendingEarningsDecimal || "0"}`}
          variant="warning"
        />
        <StatCard
          icon={CurrencyRupeeIcon}
          label="Withdrawn"
          value={`₹${stats?.withdrawnAmountDecimal || "0"}`}
          variant="info"
        />
      </div>

      {/* Transactions - Combined wallet transactions and withdrawals */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <BanknotesIcon className="size-4 text-zinc-400" />
            <Subheading className="text-sm">Transactions</Subheading>
          </div>
          <Link
            href="/enrollments"
            className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            See all
            <ChevronRightIcon className="size-3" />
          </Link>
        </div>

        {/* Edge-to-edge divider */}
        <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

        {txLoading || withdrawalsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="size-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600" />
          </div>
        ) : txList.length === 0 && withdrawalList.length === 0 && !hasActivity ? (
          <EmptyActivity />
        ) : (
          <div>
            {/* Show wallet transactions */}
            {txList.map((tx: wallets.WalletTransaction) => (
              <TransactionRow
                key={tx.id}
                type={tx.type === "credit" ? "credit" : "debit"}
                title={tx.description || (tx.type === "credit" ? "Cashback" : "Withdrawal")}
                description={tx.reference || formatDate(tx.createdAt)}
                amount={tx.amountDecimal}
                date={tx.createdAt}
              />
            ))}
            {/* Show withdrawals */}
            {withdrawalList.map((withdrawal: wallets.Withdrawal) => (
              <WithdrawalRow key={withdrawal.id} withdrawal={withdrawal} />
            ))}
            {/* Fallback if no transactions but has stats */}
            {txList.length === 0 && withdrawalList.length === 0 && stats && stats.approved > 0 && (
              <TransactionRow
                type="credit"
                title="Cashback Approved"
                description="Campaign earnings credited"
                amount={stats.totalEarningsDecimal || "0.00"}
                status="completed"
              />
            )}
          </div>
        )}
      </div>

      {/* Linked Bank Accounts */}
      {!methodsLoading && (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <BuildingLibraryIcon className="size-4 text-zinc-400" />
              <Subheading className="text-sm">Linked Bank Accounts</Subheading>
            </div>
            <Button href="/settings" plain className="text-xs">
              Manage
            </Button>
          </div>

          {/* Edge-to-edge divider */}
          <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

          {(methodsData?.methods?.length || 0) === 0 ? (
            <div className="p-4">
              <div className="flex items-center gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-700">
                  <BuildingLibraryIcon className="size-5 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    No bank account linked
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Add one to withdraw your earnings
                  </p>
                </div>
                <Button href="/settings" color="dark/zinc">
                  Add Account
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {methodsData?.methods?.map((method: wallets.WithdrawalMethod, index: number) => (
                <div key={method.id}>
                  <div className="flex items-center gap-3 p-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <BuildingLibraryIcon className="size-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {method.bankName || "Bank Account"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        •••• •••• {method.accountNumber?.slice(-4) || "****"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <Badge color="zinc">Default</Badge>
                      )}
                      {method.isVerified ? (
                        <CheckCircleIcon className="size-5 text-emerald-500" />
                      ) : (
                        <Badge color="amber">Pending</Badge>
                      )}
                    </div>
                  </div>
                  {index < (methodsData?.methods?.length || 0) - 1 && (
                    <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Withdraw Dialog */}
      <WithdrawDialog
        open={showWithdrawDialog}
        onClose={() => setShowWithdrawDialog(false)}
        balance={availableBalance}
        withdrawalMethods={methodsData?.methods || []}
        onSuccess={handleWithdrawSuccess}
      />
    </div>
  );
}
