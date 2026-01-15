import { Button } from "@/components/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/dialog";
import { Heading, Subheading } from "@/components/heading";
import { Link } from "@/components/link";
import { Text } from "@/components/text";
import {
  useShopperProfile,
  useShopperStats,
  useWallet,
  useWalletTransactions,
  useWithdrawalMethods,
} from "@/hooks/use-api";
import { getAuthenticatedClient } from "@/lib/client";
import type { wallets } from "@/lib/api-client";
import { WalletSkeleton } from "@/lib/skeleton";
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

function LoadingSkeleton() {
  return <WalletSkeleton />;
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
    <div className="flex flex-col rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-zinc-200 sm:p-3 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center gap-1">
        <Icon className={`size-3.5 sm:size-4 ${styles.icon}`} />
        <span className="truncate text-[10px] text-zinc-500 sm:text-xs dark:text-zinc-400">{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-zinc-900 sm:text-base lg:text-lg dark:text-white">{value}</p>
    </div>
  );
}

function TransactionRow({ tx }: { tx: wallets.WalletTransaction }) {
  const isCredit = tx.type === "credit";

  return (
    <Link
      href={`/wallet/transactions/${tx.id}`}
      className="flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
    >
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10 ${
          isCredit
            ? "bg-emerald-50 dark:bg-emerald-950/50"
            : "bg-sky-50 dark:bg-sky-950/50"
        }`}
      >
        {isCredit ? (
          <ArrowDownTrayIcon className="size-4 text-emerald-600 sm:size-5 dark:text-emerald-400" />
        ) : (
          <ArrowUpTrayIcon className="size-4 text-sky-600 sm:size-5 dark:text-sky-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
          {tx.description || (isCredit ? "Credit" : "Debit")}
        </p>
        <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
          {tx.reference || formatDateTime(tx.createdAt)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-sm font-semibold ${
          isCredit
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-zinc-900 dark:text-zinc-100"
        }`}>
          {isCredit ? "+" : "-"}₹{tx.amountDecimal}
        </p>
        <span className="text-[10px] text-zinc-400">
          {formatDateTime(tx.createdAt)}
        </span>
      </div>
      <ChevronRightIcon className="size-4 shrink-0 text-zinc-400" />
    </Link>
  );
}

function KYCAlert({ kycStatus, balance }: { kycStatus?: string; balance: number }) {
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

function EmptyTransactions() {
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
        amount: Math.round(numAmount * 100),
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
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <ArrowUpTrayIcon className="size-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle className="text-lg">Withdraw Funds</DialogTitle>
          <DialogDescription className="mt-1">
            Transfer your earnings to your bank account.
          </DialogDescription>
        </div>
      </div>

      <DialogBody>
        <div className="space-y-5">
          <div className="rounded-xl bg-zinc-900 p-4 dark:bg-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  Available Balance
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                  ₹{balance}
                </p>
              </div>
              <BanknotesIcon className="size-8 text-emerald-500/30" />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:ring-white/10">
            <div className="px-4 py-3">
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Amount to withdraw</p>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xl font-semibold text-zinc-400">₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={1}
                  max={parseFloat(balance)}
                  className="w-full bg-transparent text-2xl font-semibold text-zinc-900 placeholder:text-zinc-300 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
                />
              </div>
            </div>
          </div>

          {verifiedMethods.length > 0 ? (
            <div className="overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:ring-white/10">
              <p className="px-4 pt-3 text-[13px] text-zinc-500 dark:text-zinc-400">Withdraw to</p>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {verifiedMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethodId(method.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
                      selectedMethodId === method.id ? "bg-white dark:bg-zinc-800" : ""
                    }`}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500">
                      <BuildingLibraryIcon className="size-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base text-zinc-900 dark:text-white">
                        {method.bankName || "Bank Account"}
                      </p>
                      <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                        •••• {method.accountNumber?.slice(-4) || "****"}
                        {method.isDefault ? " · Default" : ""}
                      </p>
                    </div>
                    {selectedMethodId === method.id && (
                      <CheckCircleIcon className="size-5 text-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-xl bg-zinc-50 p-6 text-center ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:ring-white/10">
              <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                <ExclamationTriangleIcon className="size-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-white">
                No bank account linked
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Add a bank account in Settings to withdraw.
              </p>
              <Button href="/settings" className="mt-4" color="dark/zinc">
                Add Bank Account
              </Button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
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
          color="emerald"
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
  const { data: transactions, loading: txLoading, refetch: refetchTx } = useWalletTransactions({ take: 20 });
  const { data: methodsData, loading: methodsLoading } = useWithdrawalMethods();

  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  if (profileLoading || statsLoading || walletLoading) {
    return <LoadingSkeleton />;
  }

  const kycVerified = profile?.shopper?.kycStatus === "verified";
  const availableBalance = wallet?.balanceDecimal || profile?.walletBalanceDecimal || "0.00";
  const availableAmount = parseFloat(availableBalance);
  const KYC_THRESHOLD = 30000;
  const needsKycForWithdrawal = availableAmount > KYC_THRESHOLD && !kycVerified;
  const hasPaymentMethod = (methodsData?.methods?.length || 0) > 0;
  const canWithdraw = availableAmount > 0 && hasPaymentMethod && !needsKycForWithdrawal;

  const handleWithdrawSuccess = () => {
    refetchTx();
  };

  const txList = transactions?.data || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Heading>Wallet</Heading>
        <Text className="mt-1 text-sm">Track earnings and manage withdrawals</Text>
      </div>

      {/* KYC Alert */}
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
      <div className="grid grid-cols-3 gap-2">
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

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/wallet/withdrawals"
          className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:bg-zinc-800/50"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/50">
            <ArrowUpTrayIcon className="size-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">Withdrawals</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">View all requests</p>
          </div>
          <ChevronRightIcon className="size-4 text-zinc-400" />
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:bg-zinc-800/50"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <BuildingLibraryIcon className="size-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">Bank Accounts</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {methodsLoading ? "..." : `${methodsData?.methods?.length || 0} linked`}
            </p>
          </div>
          <ChevronRightIcon className="size-4 text-zinc-400" />
        </Link>
      </div>

      {/* Transactions */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <BanknotesIcon className="size-4 text-zinc-400" />
            <Subheading className="text-sm">Recent Transactions</Subheading>
          </div>
          {txList.length > 0 && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {txList.length} transactions
            </span>
          )}
        </div>

        <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

        {txLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="size-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600" />
          </div>
        ) : txList.length === 0 ? (
          <EmptyTransactions />
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {txList.map((tx: wallets.WalletTransaction) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </div>

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
