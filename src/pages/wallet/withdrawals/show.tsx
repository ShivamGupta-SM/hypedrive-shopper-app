import { Button } from "@/components/button";
import {
  Dialog,
  DialogActions,
  DialogDescription,
  DialogTitle,
} from "@/components/dialog";
import { useWithdrawal, useWithdrawalMethod, useCancelWithdrawal } from "@/hooks/use-api";
import { formatCurrency } from "@/lib/money-utils";
import { WithdrawalShowSkeleton } from "@/lib/skeleton";
import { showError, showSuccess } from "@/lib/toast";
import {
  ArrowPathIcon,
  ArrowUpIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useParams } from "react-router";

function formatDateTime(dateString?: string) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text);
  showSuccess("Copied!", `${label} copied`);
}

export function WithdrawalShow() {
  const { id } = useParams<{ id: string }>();
  const { data: withdrawal, loading, error, refetch } = useWithdrawal(id || "");
  const { data: method } = useWithdrawalMethod(withdrawal?.withdrawalMethodId || "");
  const { cancelWithdrawal, isPending: cancelling } = useCancelWithdrawal();

  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancel = async () => {
    if (!id) return;

    try {
      await cancelWithdrawal(id);
      setShowCancelDialog(false);
      showSuccess("Withdrawal cancelled", "Amount returned to your wallet");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel withdrawal";
      showError("Cancellation failed", message);
    }
  };

  if (loading) {
    return <WithdrawalShowSkeleton />;
  }

  if (error || !withdrawal) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <ArrowUpIcon className="size-6 text-zinc-400 dark:text-zinc-500" />
        </div>
        <p className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
          {error ? "Something went wrong" : "Withdrawal not found"}
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {error ? "Failed to load withdrawal details." : "This withdrawal may have been removed."}
        </p>
        {error && (
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowPathIcon className="size-4" />
            Try again
          </button>
        )}
      </div>
    );
  }

  // Status configuration with coin-style (gradient bg + white engraved icon)
  const statusConfig: Record<string, { icon: typeof ClockIcon; label: string; text: string; bgColor: string; iconColor: string }> = {
    pending: {
      icon: ClockIcon,
      label: "Pending",
      text: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-gradient-to-b from-amber-400 to-amber-600 ring-1 ring-amber-600/20 shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.2)] dark:from-amber-500 dark:to-amber-700",
      iconColor: "text-white/90 [filter:drop-shadow(0_-1px_0_rgba(0,0,0,0.1))_drop-shadow(0_1px_0_rgba(255,255,255,0.2))]",
    },
    processing: {
      icon: ArrowPathIcon,
      label: "Processing",
      text: "text-sky-600 dark:text-sky-400",
      bgColor: "bg-gradient-to-b from-sky-400 to-sky-600 ring-1 ring-sky-600/20 shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.2)] dark:from-sky-500 dark:to-sky-700",
      iconColor: "text-white/90 [filter:drop-shadow(0_-1px_0_rgba(0,0,0,0.1))_drop-shadow(0_1px_0_rgba(255,255,255,0.2))]",
    },
    completed: {
      icon: CheckCircleIcon,
      label: "Completed",
      text: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-gradient-to-b from-emerald-400 to-emerald-600 ring-1 ring-emerald-600/20 shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.2)] dark:from-emerald-500 dark:to-emerald-700",
      iconColor: "text-white/90 [filter:drop-shadow(0_-1px_0_rgba(0,0,0,0.1))_drop-shadow(0_1px_0_rgba(255,255,255,0.2))]",
    },
    failed: {
      icon: XCircleIcon,
      label: "Failed",
      text: "text-red-600 dark:text-red-400",
      bgColor: "bg-gradient-to-b from-red-400 to-red-600 ring-1 ring-red-600/20 shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.2)] dark:from-red-500 dark:to-red-700",
      iconColor: "text-white/90 [filter:drop-shadow(0_-1px_0_rgba(0,0,0,0.1))_drop-shadow(0_1px_0_rgba(255,255,255,0.2))]",
    },
    cancelled: {
      icon: XCircleIcon,
      label: "Cancelled",
      text: "text-zinc-500 dark:text-zinc-400",
      bgColor: "bg-gradient-to-b from-zinc-500 to-zinc-700 ring-1 ring-zinc-700/20 shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.2)] dark:from-zinc-600 dark:to-zinc-800",
      iconColor: "text-white/90 [filter:drop-shadow(0_-1px_0_rgba(0,0,0,0.1))_drop-shadow(0_1px_0_rgba(255,255,255,0.2))]",
    },
  };

  const status = statusConfig[withdrawal.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const canCancel = withdrawal.status === "pending";
  const isFailed = withdrawal.status === "failed" || withdrawal.status === "cancelled";

  // Progress steps
  const progressSteps = [
    { key: "requested", label: "Requested", completed: true },
    { key: "processing", label: "Processing", completed: withdrawal.status === "processing" || withdrawal.status === "completed" },
    { key: "completed", label: "Completed", completed: withdrawal.status === "completed" },
  ];

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* HEADER CARD */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="p-4 lg:p-5">
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Duotone icon */}
            <div className={`flex size-11 shrink-0 items-center justify-center rounded-full lg:size-12 ${status.bgColor}`}>
              <ArrowUpIcon className={`size-5 ${status.iconColor}`} />
            </div>

            {/* Amount & Description */}
            <div className="min-w-0 flex-1">
              <p className={`text-lg font-bold tracking-tight lg:text-xl ${isFailed ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-white"}`}>
                {formatCurrency(withdrawal.amountDecimal)}
              </p>
              <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
                Withdrawal to bank account
              </p>
            </div>

            {/* Status */}
            <div className={`flex shrink-0 items-center gap-1.5 ${status.text}`}>
              <StatusIcon className="size-4" />
              <span className="text-sm font-medium">{status.label}</span>
            </div>
          </div>
        </div>

        {/* PROGRESS STEPS - Only show if not failed/cancelled */}
        {!isFailed && (
          <div className="border-t border-zinc-200 px-4 py-3 lg:px-5 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              {progressSteps.map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex size-6 items-center justify-center rounded-full lg:size-7 ${
                        step.completed
                          ? "bg-emerald-500 text-white"
                          : "bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircleIcon className="size-3.5 lg:size-4" />
                      ) : (
                        <span className="text-[10px] font-bold lg:text-xs">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`mt-1 text-[10px] font-medium lg:text-xs ${
                        step.completed
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-zinc-400 dark:text-zinc-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < progressSteps.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 w-8 sm:mx-3 sm:w-12 lg:w-16 ${
                        progressSteps[index + 1].completed
                          ? "bg-emerald-500"
                          : "bg-zinc-200 dark:bg-zinc-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAILURE ALERT */}
      {withdrawal.status === "failed" && withdrawal.rejectionReason && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <ExclamationTriangleIcon className="size-5 shrink-0 text-red-600 dark:text-red-400" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">Withdrawal Failed</p>
            <p className="mt-1 text-xs text-red-700 dark:text-red-300">
              {withdrawal.rejectionReason}
            </p>
          </div>
        </div>
      )}

      {/* BANK ACCOUNT CARD */}
      {method && (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center gap-3 p-4 lg:p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <BuildingLibraryIcon className="size-5 text-zinc-500 dark:text-zinc-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                {method.bankName || "Bank Account"}
              </p>
              <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                •••• {method.accountNumber?.slice(-4) || "****"}
                {method.accountHolderName && ` · ${method.accountHolderName}`}
              </p>
            </div>
            {method.isVerified && (
              <CheckCircleIcon className="size-5 shrink-0 text-emerald-500" />
            )}
          </div>
        </div>
      )}

      {/* DETAILS CARD */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {/* Date */}
          <div className="flex items-center justify-between px-4 py-3 lg:px-5">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Requested</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-white">
              {formatDateTime(withdrawal.requestedAt)}
            </span>
          </div>

          {/* Processed Date */}
          {withdrawal.processedAt && (
            <div className="flex items-center justify-between px-4 py-3 lg:px-5">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Processed</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-white">
                {formatDateTime(withdrawal.processedAt)}
              </span>
            </div>
          )}

          {/* Withdrawal ID */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-5">
            <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">Withdrawal ID</span>
            <button
              type="button"
              onClick={() => copyToClipboard(withdrawal.id, "Withdrawal ID")}
              className="group flex min-w-0 items-center gap-1.5"
            >
              <span className="truncate font-mono text-xs text-zinc-700 dark:text-zinc-300">
                {withdrawal.id}
              </span>
              <DocumentDuplicateIcon className="size-4 shrink-0 text-zinc-300 group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
            </button>
          </div>

          {/* UTR Number */}
          {withdrawal.utr && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-5">
              <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">UTR Number</span>
              <button
                type="button"
                onClick={() => copyToClipboard(withdrawal.utr!, "UTR Number")}
                className="group flex min-w-0 items-center gap-1.5"
              >
                <span className="truncate font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  {withdrawal.utr}
                </span>
                <DocumentDuplicateIcon className="size-4 shrink-0 text-zinc-300 group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CANCEL ACTION - Only when pending */}
      {canCancel && (
        <Button color="red" className="w-full" onClick={() => setShowCancelDialog(true)}>
          <XCircleIcon className="size-4" />
          Cancel Withdrawal
        </Button>
      )}

      {/* CANCEL DIALOG */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)} size="sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <ExclamationTriangleIcon className="size-7 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="mt-4">Cancel Withdrawal?</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to cancel this withdrawal of {formatCurrency(withdrawal.amountDecimal)}? The
            amount will be returned to your wallet.
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
