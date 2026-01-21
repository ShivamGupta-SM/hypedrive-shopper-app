import { Link } from "@/components/link";
import { useWalletTransaction } from "@/hooks/use-api";
import { formatCurrency } from "@/lib/money-utils";
import { TransactionShowSkeleton } from "@/lib/skeleton";
import { showSuccess } from "@/lib/toast";
import {
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  HashtagIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
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

const categoryConfig: Record<string, { label: string; description: string }> = {
  enrollment_hold: { label: "Enrollment Hold", description: "Campaign enrollment reserved" },
  deposit: { label: "Deposit", description: "Money added to wallet" },
  payout: { label: "Cashback Payout", description: "Earnings from campaign" },
  refund: { label: "Refund", description: "Refunded amount" },
  admin_credit: { label: "Admin Credit", description: "Credit from support" },
  withdrawal: { label: "Withdrawal", description: "Transferred to bank" },
  other: { label: "Other", description: "Wallet transaction" },
};

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text);
  showSuccess("Copied!", `${label} copied`);
}

export function TransactionShow() {
  const { id } = useParams<{ id: string }>();
  const { data: tx, loading, error, refetch } = useWalletTransaction(id);

  if (loading) {
    return <TransactionShowSkeleton />;
  }

  if (error || !tx) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <BanknotesIcon className="size-6 text-zinc-400 dark:text-zinc-500" />
        </div>
        <p className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
          Transaction not found
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {error || "This transaction may have been removed."}
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

  const isCredit = tx.type === "credit";
  const isPending = tx.status === "pending";
  const isVoided = tx.status === "voided";
  const category = categoryConfig[tx.category || "other"] || categoryConfig.other;

  // Status with duotone colors
  const statusConfig = isVoided
    ? {
        label: "Voided",
        icon: XCircleIcon,
        text: "text-zinc-500 dark:text-zinc-400",
        bg: "bg-zinc-100 dark:bg-zinc-800",
      }
    : isPending
      ? {
          label: "Pending",
          icon: ClockIcon,
          text: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-100 dark:bg-amber-900/40",
        }
      : {
          label: "Completed",
          icon: CheckCircleIcon,
          text: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-100 dark:bg-emerald-900/40",
        };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* HEADER CARD */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        <div className="p-4 lg:p-5">
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Coin-style icon with engraved effect */}
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-full lg:size-12 ${
                isCredit
                  ? "bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 shadow-[0_3px_6px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.1)] dark:from-emerald-500 dark:via-emerald-600 dark:to-emerald-700"
                  : "bg-gradient-to-b from-zinc-400 via-zinc-500 to-zinc-600 shadow-[0_3px_6px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.1)] dark:from-zinc-500 dark:via-zinc-600 dark:to-zinc-700"
              }`}
            >
              {isCredit ? (
                <ArrowDownIcon className="size-5 text-white [filter:drop-shadow(0_-1px_0_rgba(0,0,0,0.35))_drop-shadow(0_1px_0_rgba(255,255,255,0.2))]" />
              ) : (
                <ArrowUpIcon className="size-5 text-white [filter:drop-shadow(0_-1px_0_rgba(0,0,0,0.35))_drop-shadow(0_1px_0_rgba(255,255,255,0.2))]" />
              )}
            </div>

            {/* Amount & Description */}
            <div className="min-w-0 flex-1">
              <p
                className={`text-lg font-bold tracking-tight lg:text-xl ${
                  isVoided
                    ? "text-zinc-400 line-through"
                    : isCredit
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-900 dark:text-white"
                }`}
              >
                {isCredit ? "+" : "-"}{formatCurrency(tx.amountDecimal)}
              </p>
              <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
                {tx.description || category.description}
              </p>
            </div>

            {/* Status */}
            <div className={`flex shrink-0 items-center gap-1.5 ${statusConfig.text}`}>
              <StatusIcon className="size-4" />
              <span className="text-sm font-medium">{statusConfig.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS CARD */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {/* Date */}
          <div className="flex items-center justify-between px-4 py-3 lg:px-5">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Date</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-white">
              {formatDateTime(tx.createdAt)}
            </span>
          </div>

          {/* Type */}
          <div className="flex items-center justify-between px-4 py-3 lg:px-5">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Type</span>
            <span
              className={`text-sm font-medium ${
                isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-900 dark:text-white"
              }`}
            >
              {isCredit ? "Credit" : "Debit"}
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between px-4 py-3 lg:px-5">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Category</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-white">
              {category.label}
            </span>
          </div>

          {/* Transaction ID */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-5">
            <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">Transaction ID</span>
            <button
              type="button"
              onClick={() => copyToClipboard(tx.id, "Transaction ID")}
              className="group flex min-w-0 items-center gap-1.5"
            >
              <span className="truncate font-mono text-xs text-zinc-700 dark:text-zinc-300">
                {tx.id}
              </span>
              <DocumentDuplicateIcon className="size-4 shrink-0 text-zinc-300 group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
            </button>
          </div>

          {/* Reference */}
          {tx.reference && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-5">
              <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">Reference</span>
              <button
                type="button"
                onClick={() => copyToClipboard(tx.reference!, "Reference")}
                className="group flex min-w-0 items-center gap-1.5"
              >
                <span className="truncate font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  {tx.reference}
                </span>
                <DocumentDuplicateIcon className="size-4 shrink-0 text-zinc-300 group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* RELATED ENROLLMENT */}
      {tx.enrollmentId && (
        <Link
          href={`/enrollments/${tx.enrollmentId}`}
          className="flex items-center gap-3 overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-950/5 lg:p-5 dark:bg-zinc-900 dark:ring-white/10"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/40">
            <HashtagIcon className="size-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
              {tx.enrollmentDisplayId
                ? `ENR-${String(tx.enrollmentDisplayId).padStart(6, "0")}`
                : "View Enrollment"}
            </p>
            {tx.campaignDisplayId && (
              <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                Campaign #{tx.campaignDisplayId}
              </p>
            )}
          </div>
          <ArrowTopRightOnSquareIcon className="size-4 shrink-0 text-zinc-400" />
        </Link>
      )}
    </div>
  );
}
