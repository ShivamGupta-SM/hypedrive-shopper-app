import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogActions,
  DialogDescription,
  DialogTitle,
} from "@/components/dialog";
import { Heading } from "@/components/heading";
import { Link } from "@/components/link";
import { Text } from "@/components/text";
import { useWithdrawals } from "@/hooks/use-api";
import { getAuthenticatedClient } from "@/lib/client";
import type { wallets } from "@/lib/api-client";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import { useState } from "react";

function formatDateTime(dateString?: string) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      ))}
    </div>
  );
}

function EmptyWithdrawals() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <ArrowUpTrayIcon className="size-7 text-zinc-400" />
      </div>
      <p className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
        No withdrawals yet
      </p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        When you withdraw funds, they'll appear here.
      </p>
      <Button href="/wallet" className="mt-6">
        Go to Wallet
      </Button>
    </div>
  );
}

function WithdrawalRow({ withdrawal, onCancel }: { withdrawal: wallets.Withdrawal; onCancel: (id: string) => void }) {
  const statusConfig: Record<string, { icon: typeof ClockIcon; color: "emerald" | "amber" | "red" | "zinc" | "sky"; label: string }> = {
    pending: { icon: ClockIcon, color: "amber", label: "Pending" },
    processing: { icon: ArrowPathIcon, color: "sky", label: "Processing" },
    completed: { icon: CheckCircleIcon, color: "emerald", label: "Completed" },
    failed: { icon: XCircleIcon, color: "red", label: "Failed" },
    cancelled: { icon: XCircleIcon, color: "zinc", label: "Cancelled" },
  };

  const config = statusConfig[withdrawal.status] || { icon: ClockIcon, color: "zinc" as const, label: withdrawal.status };
  const StatusIcon = config.icon;
  const canCancel = withdrawal.status === "pending";

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <Link
        href={`/wallet/withdrawals/${withdrawal.id}`}
        className="flex items-center gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/50">
          <ArrowUpTrayIcon className="size-5 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-zinc-900 dark:text-white">
              ₹{withdrawal.amountDecimal}
            </p>
            <Badge color={config.color} className="text-[10px]">
              <StatusIcon className="size-3" />
              {config.label}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Requested {formatDateTime(withdrawal.requestedAt)}
          </p>
        </div>
        <ChevronRightIcon className="size-5 text-zinc-400" />
      </Link>

      {canCancel && (
        <>
          <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex justify-end px-4 py-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onCancel(withdrawal.id);
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <XCircleIcon className="size-3.5" />
              Cancel Request
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function WithdrawalsList() {
  const { data: withdrawals, loading, refetch } = useWithdrawals({ take: 50 });
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const handleCancelClick = (id: string) => {
    setCancellingId(id);
    setShowCancelDialog(true);
  };

  const confirmCancel = async () => {
    if (!cancellingId) return;

    setCancelling(true);
    try {
      const client = getAuthenticatedClient();
      await client.wallets.cancelWithdrawal(cancellingId);
      setShowCancelDialog(false);
      setCancellingId(null);
      refetch();
    } catch (err) {
      console.error("Failed to cancel withdrawal:", err);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  const withdrawalList = withdrawals?.data || [];

  // Group by status
  const pending = withdrawalList.filter((w: wallets.Withdrawal) => w.status === "pending" || w.status === "processing");
  const completed = withdrawalList.filter((w: wallets.Withdrawal) => w.status === "completed");
  const others = withdrawalList.filter((w: wallets.Withdrawal) => w.status === "failed" || w.status === "cancelled");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/wallet"
          className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          <ArrowLeftIcon className="size-4 text-zinc-600 dark:text-zinc-400" />
        </Link>
        <div>
          <Heading>Withdrawals</Heading>
          <Text className="mt-0.5 text-sm">View all your withdrawal requests</Text>
        </div>
      </div>

      {withdrawalList.length === 0 ? (
        <EmptyWithdrawals />
      ) : (
        <div className="space-y-6">
          {/* Pending/Processing */}
          {pending.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                In Progress ({pending.length})
              </p>
              {pending.map((w: wallets.Withdrawal) => (
                <WithdrawalRow key={w.id} withdrawal={w} onCancel={handleCancelClick} />
              ))}
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Completed ({completed.length})
              </p>
              {completed.map((w: wallets.Withdrawal) => (
                <WithdrawalRow key={w.id} withdrawal={w} onCancel={handleCancelClick} />
              ))}
            </div>
          )}

          {/* Failed/Cancelled */}
          {others.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Failed / Cancelled ({others.length})
              </p>
              {others.map((w: wallets.Withdrawal) => (
                <WithdrawalRow key={w.id} withdrawal={w} onCancel={handleCancelClick} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancel Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setCancellingId(null);
        }}
        size="sm"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <ExclamationTriangleIcon className="size-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="mt-4 text-base sm:text-lg">Cancel Withdrawal?</DialogTitle>
          <DialogDescription className="mt-2 text-xs sm:text-sm">
            Are you sure you want to cancel this withdrawal? The amount will be returned to your wallet balance.
          </DialogDescription>
        </div>
        <DialogActions>
          <Button
            plain
            onClick={() => {
              setShowCancelDialog(false);
              setCancellingId(null);
            }}
          >
            Keep Request
          </Button>
          <Button color="red" onClick={confirmCancel} disabled={cancelling}>
            <XCircleIcon className="size-4" />
            {cancelling ? "Cancelling..." : "Cancel Withdrawal"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
