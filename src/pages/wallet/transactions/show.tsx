import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { useWalletTransactions } from "@/hooks/use-api";
import type { wallets } from "@/lib/api-client";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  BanknotesIcon,
  CalendarIcon,
  HashtagIcon,
} from "@heroicons/react/16/solid";
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

export function TransactionShow() {
  const { id } = useParams<{ id: string }>();
  const { data: transactions, loading } = useWalletTransactions({ take: 100 });

  // Find the transaction from the list (since there's no single transaction endpoint)
  const tx = transactions?.data?.find((t: wallets.WalletTransaction) => t.id === id);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!tx) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <BanknotesIcon className="size-8 text-zinc-400" />
        </div>
        <p className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
          Transaction not found
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          This transaction may have been removed or doesn't exist.
        </p>
      </div>
    );
  }

  const isCredit = tx.type === "credit";
  const isPending = tx.status === "pending";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Heading>Transaction Details</Heading>
        <Text className="mt-1 text-sm">View transaction information</Text>
      </div>

      {/* Amount Card */}
      <div className={`overflow-hidden rounded-2xl ${
        isPending
          ? "bg-amber-500 dark:bg-amber-600"
          : isCredit
            ? "bg-emerald-600 dark:bg-emerald-700"
            : "bg-sky-600 dark:bg-sky-700"
      }`}>
        <div className="p-6 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-white/20">
            {isCredit ? (
              <ArrowDownTrayIcon className="size-7 text-white" />
            ) : (
              <ArrowUpTrayIcon className="size-7 text-white" />
            )}
          </div>
          <p className="mt-4 text-4xl font-bold tracking-tight text-white">
            {isCredit ? "+" : "-"}₹{tx.amountDecimal}
          </p>
          <p className="mt-2 text-sm text-white/80">
            {tx.description || (isCredit ? "Credit" : "Debit")}
          </p>
          {isPending && (
            <span className="mt-3 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Type Badge */}
      <div className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 ${
        isPending
          ? "bg-amber-50 dark:bg-amber-950/50"
          : isCredit
            ? "bg-emerald-50 dark:bg-emerald-950/50"
            : "bg-sky-50 dark:bg-sky-950/50"
      }`}>
        {isCredit ? (
          <ArrowDownTrayIcon className={`size-5 ${isPending ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`} />
        ) : (
          <ArrowUpTrayIcon className={`size-5 ${isPending ? "text-amber-600 dark:text-amber-400" : "text-sky-600 dark:text-sky-400"}`} />
        )}
        <span className={`text-sm font-medium ${
          isPending
            ? "text-amber-600 dark:text-amber-400"
            : isCredit
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-sky-600 dark:text-sky-400"
        }`}>
          {isPending ? "Pending" : isCredit ? "Money Received" : "Money Sent"}
        </span>
      </div>

      {/* Details */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-zinc-900 dark:text-white">Details</p>
        </div>
        <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
        <div className="divide-y divide-zinc-200 px-4 dark:divide-zinc-700">
          <DetailRow
            label="Transaction ID"
            value={<span className="font-mono text-xs">{tx.id}</span>}
            icon={HashtagIcon}
          />
          <DetailRow
            label="Type"
            value={
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                isCredit
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400"
              }`}>
                {tx.type}
              </span>
            }
            icon={BanknotesIcon}
          />
          <DetailRow
            label="Status"
            value={
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                isPending
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
              }`}>
                {isPending ? "Pending" : "Completed"}
              </span>
            }
          />
          <DetailRow
            label="Date"
            value={formatDateTime(tx.createdAt)}
            icon={CalendarIcon}
          />
          <DetailRow
            label="Currency"
            value={tx.currency || "INR"}
          />
        </div>
      </div>

    </div>
  );
}
