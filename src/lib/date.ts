/**
 * Date utility functions using date-fns
 * Provides consistent date formatting throughout the app
 */

import {
	format,
	formatDistanceToNow,
	formatRelative,
	isToday,
	isYesterday,
	isThisWeek,
	isThisMonth,
	isThisYear,
	parseISO,
	differenceInDays,
	differenceInHours,
	differenceInMinutes,
	addDays,
	subDays,
	startOfDay,
	endOfDay,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
} from "date-fns";

// ============================================================================
// PARSING
// ============================================================================

/**
 * Parse a date string or return the Date object
 */
export function parseDate(date: string | Date): Date {
	if (typeof date === "string") {
		return parseISO(date);
	}
	return date;
}

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format date for display: "Jan 15, 2024"
 */
export function formatDate(date: string | Date): string {
	return format(parseDate(date), "MMM d, yyyy");
}

/**
 * Format date with time: "Jan 15, 2024 at 3:45 PM"
 */
export function formatDateTime(date: string | Date): string {
	return format(parseDate(date), "MMM d, yyyy 'at' h:mm a");
}

/**
 * Format time only: "3:45 PM"
 */
export function formatTime(date: string | Date): string {
	return format(parseDate(date), "h:mm a");
}

/**
 * Format for short display: "15 Jan"
 */
export function formatShortDate(date: string | Date): string {
	return format(parseDate(date), "d MMM");
}

/**
 * Format month and year: "January 2024"
 */
export function formatMonthYear(date: string | Date): string {
	return format(parseDate(date), "MMMM yyyy");
}

/**
 * Format for file names or IDs: "2024-01-15"
 */
export function formatISODate(date: string | Date): string {
	return format(parseDate(date), "yyyy-MM-dd");
}

// ============================================================================
// RELATIVE FORMATTING
// ============================================================================

/**
 * Format as relative time: "2 hours ago", "in 3 days"
 */
export function formatRelativeTime(date: string | Date): string {
	return formatDistanceToNow(parseDate(date), { addSuffix: true });
}

/**
 * Smart relative formatting for UI
 * - Today: "Today at 3:45 PM"
 * - Yesterday: "Yesterday at 3:45 PM"
 * - This week: "Monday at 3:45 PM"
 * - This year: "Jan 15 at 3:45 PM"
 * - Other: "Jan 15, 2023"
 */
export function formatSmartDate(date: string | Date): string {
	const d = parseDate(date);

	if (isToday(d)) {
		return `Today at ${formatTime(d)}`;
	}

	if (isYesterday(d)) {
		return `Yesterday at ${formatTime(d)}`;
	}

	if (isThisWeek(d)) {
		return format(d, "EEEE 'at' h:mm a");
	}

	if (isThisYear(d)) {
		return format(d, "MMM d 'at' h:mm a");
	}

	return formatDate(d);
}

/**
 * Format relative with context: "last Friday at 3:45 PM"
 */
export function formatRelativeWithContext(date: string | Date): string {
	return formatRelative(parseDate(date), new Date());
}

// ============================================================================
// DATE CHECKS
// ============================================================================

export { isToday, isYesterday, isThisWeek, isThisMonth, isThisYear };

/**
 * Check if date is in the past
 */
export function isPast(date: string | Date): boolean {
	return parseDate(date) < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: string | Date): boolean {
	return parseDate(date) > new Date();
}

// ============================================================================
// DIFFERENCES
// ============================================================================

/**
 * Get days between two dates
 */
export function daysBetween(start: string | Date, end: string | Date): number {
	return differenceInDays(parseDate(end), parseDate(start));
}

/**
 * Get hours between two dates
 */
export function hoursBetween(start: string | Date, end: string | Date): number {
	return differenceInHours(parseDate(end), parseDate(start));
}

/**
 * Get minutes between two dates
 */
export function minutesBetween(start: string | Date, end: string | Date): number {
	return differenceInMinutes(parseDate(end), parseDate(start));
}

/**
 * Get days until a future date (0 if past)
 */
export function daysUntil(date: string | Date): number {
	const days = differenceInDays(parseDate(date), new Date());
	return Math.max(0, days);
}

// ============================================================================
// DATE MANIPULATION
// ============================================================================

export { addDays, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth };

// ============================================================================
// RANGE HELPERS
// ============================================================================

/**
 * Get date range for common periods
 */
export function getDateRange(period: "today" | "yesterday" | "thisWeek" | "thisMonth" | "last7days" | "last30days") {
	const now = new Date();

	switch (period) {
		case "today":
			return { start: startOfDay(now), end: endOfDay(now) };
		case "yesterday":
			const yesterday = subDays(now, 1);
			return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
		case "thisWeek":
			return { start: startOfWeek(now), end: endOfWeek(now) };
		case "thisMonth":
			return { start: startOfMonth(now), end: endOfMonth(now) };
		case "last7days":
			return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
		case "last30days":
			return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
	}
}

// ============================================================================
// FORMATTING FOR CASHBACK APP
// ============================================================================

/**
 * Format deadline with urgency indicator
 */
export function formatDeadline(date: string | Date): { text: string; isUrgent: boolean } {
	const days = daysUntil(date);

	if (days === 0) {
		return { text: "Expires today", isUrgent: true };
	}

	if (days === 1) {
		return { text: "Expires tomorrow", isUrgent: true };
	}

	if (days <= 3) {
		return { text: `Expires in ${days} days`, isUrgent: true };
	}

	if (days <= 7) {
		return { text: `Expires in ${days} days`, isUrgent: false };
	}

	return { text: `Expires ${formatDate(date)}`, isUrgent: false };
}

/**
 * Format transaction date for wallet history
 */
export function formatTransactionDate(date: string | Date): string {
	const d = parseDate(date);

	if (isToday(d)) {
		return formatTime(d);
	}

	if (isYesterday(d)) {
		return "Yesterday";
	}

	if (isThisYear(d)) {
		return formatShortDate(d);
	}

	return formatDate(d);
}
