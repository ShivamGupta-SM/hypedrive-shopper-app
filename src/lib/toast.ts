/**
 * Toast notification utilities using Sonner
 * Provides consistent toast notifications throughout the app
 */

import { toast } from "sonner";

// ============================================================================
// BASIC TOASTS
// ============================================================================

/**
 * Show a success toast
 */
export function showSuccess(message: string, description?: string) {
	toast.success(message, { description });
}

/**
 * Show an error toast
 */
export function showError(message: string, description?: string) {
	toast.error(message, { description });
}

/**
 * Show an info toast
 */
export function showInfo(message: string, description?: string) {
	toast.info(message, { description });
}

/**
 * Show a warning toast
 */
export function showWarning(message: string, description?: string) {
	toast.warning(message, { description });
}

// ============================================================================
// PROMISE TOASTS
// ============================================================================

/**
 * Show a toast while a promise is pending
 * Automatically shows success/error based on result
 */
export function showPromise<T>(
	promise: Promise<T>,
	messages: {
		loading: string;
		success: string | ((data: T) => string);
		error: string | ((error: unknown) => string);
	}
) {
	return toast.promise(promise, messages);
}

// ============================================================================
// ACTION TOASTS
// ============================================================================

/**
 * Show a toast with an action button
 */
export function showWithAction(
	message: string,
	action: {
		label: string;
		onClick: () => void;
	},
	options?: {
		description?: string;
		duration?: number;
	}
) {
	toast(message, {
		description: options?.description,
		duration: options?.duration,
		action: {
			label: action.label,
			onClick: action.onClick,
		},
	});
}

/**
 * Show an undo toast (for destructive actions)
 */
export function showUndo(message: string, onUndo: () => void, duration = 5000) {
	toast(message, {
		duration,
		action: {
			label: "Undo",
			onClick: onUndo,
		},
	});
}

// ============================================================================
// CASHBACK APP SPECIFIC TOASTS
// ============================================================================

/**
 * Show cashback earned notification
 */
export function showCashbackEarned(amount: number, campaignName?: string) {
	toast.success(`+₹${amount.toFixed(2)} Earned!`, {
		description: campaignName ? `From ${campaignName}` : "Added to your wallet",
	});
}

/**
 * Show withdrawal success
 */
export function showWithdrawalSuccess(amount: number) {
	toast.success("Withdrawal Initiated", {
		description: `₹${amount.toFixed(2)} will be credited within 2-3 business days`,
	});
}

/**
 * Show enrollment submitted
 */
export function showEnrollmentSubmitted() {
	toast.success("Submission Successful", {
		description: "Your proof has been submitted for review",
	});
}

/**
 * Show enrollment approved
 */
export function showEnrollmentApproved(cashback: number) {
	toast.success("Enrollment Approved!", {
		description: `₹${cashback.toFixed(2)} has been added to your wallet`,
	});
}

/**
 * Show changes requested
 */
export function showChangesRequested() {
	toast.warning("Changes Requested", {
		description: "Please review the feedback and resubmit",
	});
}

/**
 * Show enrollment rejected
 */
export function showEnrollmentRejected(reason?: string) {
	toast.error("Enrollment Rejected", {
		description: reason || "Your submission did not meet the requirements",
	});
}

/**
 * Show copy to clipboard success
 */
export function showCopied(what = "Copied to clipboard") {
	toast.success(what);
}

/**
 * Show network error
 */
export function showNetworkError() {
	toast.error("Connection Error", {
		description: "Please check your internet connection and try again",
	});
}

/**
 * Show session expired
 */
export function showSessionExpired() {
	toast.error("Session Expired", {
		description: "Please log in again to continue",
	});
}

// ============================================================================
// DISMISS HELPERS
// ============================================================================

/**
 * Dismiss all toasts
 */
export function dismissAll() {
	toast.dismiss();
}

/**
 * Dismiss a specific toast by ID
 */
export function dismiss(toastId: string | number) {
	toast.dismiss(toastId);
}

// Re-export toast for custom usage
export { toast };
