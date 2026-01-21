import { Button } from "@/components/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/dialog";
import { UpiIcon } from "@/components/icons/upi-icon";
import { useCreateWithdrawal } from "@/hooks/use-api";
import type { wallets } from "@/hooks/use-api";
import {
  BuildingLibraryIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import { useState, useEffect } from "react";

// =============================================================================
// PAYMENT METHOD ROW - Simple, clean list item for method selection
// =============================================================================

function PaymentMethodRow({
  method,
  isSelected,
  onClick,
}: {
  method: wallets.WithdrawalMethod;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const isUPI = method.accountType === "upi";
  const last4 = method.accountNumber?.slice(-4);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
        isSelected
          ? "bg-emerald-50 dark:bg-emerald-950/30"
          : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
      } ${!onClick ? "cursor-default" : ""}`}
    >
      {/* Icon */}
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
        isUPI ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-sky-100 dark:bg-sky-900/50"
      }`}>
        {isUPI ? (
          <UpiIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <BuildingLibraryIcon className="size-5 text-sky-600 dark:text-sky-400" />
        )}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            {isUPI ? method.upiId : method.bankName || "Bank Account"}
          </p>
          {method.isDefault && (
            <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
              Default
            </span>
          )}
        </div>
        {!isUPI && last4 && (
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            ••••{last4} · {method.accountHolderName}
          </p>
        )}
      </div>

      {/* Selection indicator */}
      <div className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        isSelected
          ? "border-emerald-500 bg-emerald-500"
          : "border-zinc-300 dark:border-zinc-600"
      }`}>
        {isSelected && <CheckIcon className="size-3 text-white" />}
      </div>
    </button>
  );
}

// =============================================================================
// WITHDRAW DIALOG - Clean, minimal withdrawal modal
// =============================================================================

export function WithdrawDialog({
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

  const { createWithdrawal, isPending, error: withdrawalError, reset: resetError } = useCreateWithdrawal();
  const [localError, setLocalError] = useState<string | null>(null);

  const balanceNum = parseFloat(balance) || 0;
  const amountNum = parseFloat(amount) || 0;

  // Reset error when dialog opens
  useEffect(() => {
    if (open) {
      resetError();
      setLocalError(null);
    }
  }, [open, resetError]);

  const handleWithdraw = async () => {
    // Client-side validation
    setLocalError(null);

    if (!amountNum || amountNum <= 0) {
      setLocalError("Please enter a valid amount");
      return;
    }
    if (amountNum < 100) {
      setLocalError("Minimum withdrawal amount is ₹100");
      return;
    }
    if (amountNum > balanceNum) {
      setLocalError("Amount exceeds available balance");
      return;
    }
    if (!selectedMethodId) {
      setLocalError("Please select a withdrawal method");
      return;
    }

    const result = await createWithdrawal({
      amount: amountNum,
      withdrawalMethodId: selectedMethodId,
    });

    if (result.success) {
      onSuccess();
      onClose();
      setAmount("");
    }
    // Error is handled by the hook and displayed via withdrawalError
  };

  // Only show verified methods (explicit check)
  const verifiedMethods = withdrawalMethods.filter((m) => m.isVerified === true);

  // Combined error message (local validation errors take precedence)
  const errorMessage = localError || withdrawalError;

  return (
    <Dialog open={open} onClose={onClose} size="md">
      <DialogTitle>Withdraw</DialogTitle>
      <DialogDescription>
        Transfer to your bank account or UPI
      </DialogDescription>

      <DialogBody>
        <div className="space-y-5">
          {/* Balance */}
          <div className="rounded-xl bg-zinc-900 p-4 dark:bg-zinc-800">
            <p className="text-xs text-zinc-400">Available</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
              ₹{balanceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Amount
            </p>
            <div className="mt-1.5 flex items-center rounded-lg border border-zinc-300 bg-white px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800">
              <span className="text-lg text-zinc-400">₹</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1}
                max={balanceNum}
                className="ml-1 w-full bg-transparent text-lg font-medium tabular-nums text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
              />
              {balanceNum > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(balanceNum))}
                  className="shrink-0 rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                >
                  Max
                </button>
              )}
            </div>
            {/* Remaining balance preview */}
            {amountNum > 0 && amountNum <= balanceNum && (
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                Remaining: ₹{(balanceNum - amountNum).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>

          {/* Payment Methods */}
          {verifiedMethods.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                To
              </p>
              <div className="mt-1.5 space-y-2">
                {verifiedMethods.map((method) => (
                  <PaymentMethodRow
                    key={method.id}
                    method={method}
                    isSelected={selectedMethodId === method.id}
                    onClick={() => setSelectedMethodId(method.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="size-5 shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    No payment method
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
                    Add a bank account or UPI in Settings.
                  </p>
                  <Button href="/settings" className="mt-3" outline>
                    Add Method
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
              <XCircleIcon className="size-4 shrink-0 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
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
          disabled={isPending || !amountNum || amountNum < 1 || amountNum > balanceNum || verifiedMethods.length === 0}
          color="emerald"
        >
          {isPending ? "Processing..." : `Withdraw ₹${amountNum > 0 ? amountNum.toLocaleString("en-IN") : "0"}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
