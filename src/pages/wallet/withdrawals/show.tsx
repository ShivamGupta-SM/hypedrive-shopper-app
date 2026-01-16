import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogActions,
  DialogDescription,
  DialogTitle,
} from "@/components/dialog";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { useWithdrawal, useWithdrawalMethod } from "@/hooks/use-api";
import { getAuthenticatedClient } from "@/lib/client";
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  HashtagIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import { useState } from "react";
import { useParams } from "react-router";

function formatDateTime(dateString?: string) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-40 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-64 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

function DetailRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        {Icon && <Icon className="size-4" />}
        {label}
      </div>
      <div className="text-right text-sm font-medium text-zinc-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

export function WithdrawalShow() {
  const { id } = useParams<{ id: string }>();
  const { data: withdrawal, loading, refetch } = useWithdrawal(id || "");
  const { data: method } = useWithdrawalMethod(withdrawal?.withdrawalMethodId || "");

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!id) return;

    setCancelling(true);
    try {
      const client = getAuthenticatedClient();
      await client.wallets.cancelWithdrawal(id);
      setShowCancelDialog(false);
      refetch();
    } catch (err) {
      console.error("Failed to cancel:", err);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!withdrawal) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <ArrowUpTrayIcon className="size-8 text-zinc-400" />
        </div>
        <p className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
          Withdrawal not found
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          This withdrawal may have been removed or doesn't exist.
        </p>
      </div>
    );
  }

  const statusConfig: Record<string, { icon: typeof ClockIcon; color: "emerald" | "amber" | "red" | "zinc" | "sky"; bg: string; label: string }> = {
    pending: { icon: ClockIcon, color: "amber", bg: "bg-amber-50 dark:bg-amber-950/50", label: "Pending Approval" },
    processing: { icon: ArrowPathIcon, color: "sky", bg: "bg-sky-50 dark:bg-sky-950/50", label: "Processing" },
    completed: { icon: CheckCircleIcon, color: "emerald", bg: "bg-emerald-50 dark:bg-emerald-950/50", label: "Completed" },
    failed: { icon: XCircleIcon, color: "red", bg: "bg-red-50 dark:bg-red-950/50", label: "Failed" },
    cancelled: { icon: XCircleIcon, color: "zinc", bg: "bg-zinc-100 dark:bg-zinc-800", label: "Cancelled" },
  };

  const status = statusConfig[withdrawal.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const canCancel = withdrawal.status === "pending";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Heading>Withdrawal Details</Heading>
        <Text className="mt-1 text-sm">View withdrawal request information</Text>
      </div>

      {/* Amount Card */}
      <div className="overflow-hidden rounded-2xl bg-sky-600 dark:bg-sky-700">
        <div className="p-6 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-white/20">
            <ArrowUpTrayIcon className="size-7 text-white" />
          </div>
          <p className="mt-4 text-4xl font-bold tracking-tight text-white">
            ₹{withdrawal.amountDecimal}
          </p>
          <p className="mt-2 text-sm text-white/80">
            Withdrawal Request
          </p>
        </div>
      </div>

      {/* Status */}
      <div className={`flex items-center justify-center gap-2 rounded-xl ${status.bg} px-4 py-3`}>
        <StatusIcon className={`size-5 text-${status.color}-600 dark:text-${status.color}-400`} />
        <span className={`text-sm font-medium text-${status.color}-600 dark:text-${status.color}-400`}>
          {status.label}
        </span>
      </div>

      {/* Rejection Reason */}
      {withdrawal.status === "failed" && withdrawal.rejectionReason && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <ExclamationTriangleIcon className="size-5 shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-900 dark:text-red-100">Withdrawal Failed</p>
            <p className="mt-1 text-xs text-red-700 dark:text-red-300">{withdrawal.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Bank Account */}
      {method && (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">Bank Account</p>
          </div>
          <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <BuildingLibraryIcon className="size-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                {method.bankName || "Bank Account"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                •••• •••• {method.accountNumber?.slice(-4) || "****"}
                {method.accountHolderName && ` · ${method.accountHolderName}`}
              </p>
            </div>
            {method.isVerified && (
              <CheckCircleIcon className="size-5 text-emerald-500" />
            )}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-zinc-900 dark:text-white">Details</p>
        </div>
        <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
        <div className="divide-y divide-zinc-200 px-4 dark:divide-zinc-700">
          <DetailRow
            label="Withdrawal ID"
            value={<span className="font-mono text-xs">{withdrawal.id}</span>}
            icon={HashtagIcon}
          />
          <DetailRow
            label="Status"
            value={<Badge color={status.color}>{status.label}</Badge>}
          />
          <DetailRow
            label="Requested"
            value={formatDateTime(withdrawal.requestedAt)}
            icon={CalendarIcon}
          />
          {withdrawal.processedAt && (
            <DetailRow
              label="Processed"
              value={formatDateTime(withdrawal.processedAt)}
              icon={CheckCircleIcon}
            />
          )}
          {withdrawal.utr && (
            <DetailRow
              label="UTR Number"
              value={<span className="font-mono text-xs">{withdrawal.utr}</span>}
              icon={CreditCardIcon}
            />
          )}
          <DetailRow
            label="Currency"
            value={withdrawal.currency || "INR"}
          />
        </div>
      </div>

      {/* Actions */}
      {canCancel && (
        <Button color="red" className="w-full" onClick={() => setShowCancelDialog(true)}>
          <XCircleIcon className="size-4" />
          Cancel Request
        </Button>
      )}

      {/* Cancel Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        size="sm"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <ExclamationTriangleIcon className="size-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="mt-4 text-base sm:text-lg">Cancel Withdrawal?</DialogTitle>
          <DialogDescription className="mt-2 text-xs sm:text-sm">
            Are you sure you want to cancel this withdrawal of ₹{withdrawal.amountDecimal}? The amount will be returned to your wallet balance.
          </DialogDescription>
        </div>
        <DialogActions>
          <Button plain onClick={() => setShowCancelDialog(false)}>
            Keep Request
          </Button>
          <Button color="red" onClick={handleCancel} disabled={cancelling}>
            <XCircleIcon className="size-4" />
            {cancelling ? "Cancelling..." : "Cancel Withdrawal"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
