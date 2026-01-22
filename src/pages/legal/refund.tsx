import {
	ArrowLeftIcon,
	ArrowPathIcon,
	BanknotesIcon,
	CheckCircleIcon,
	ClockIcon,
	EnvelopeIcon,
	ExclamationTriangleIcon,
	NoSymbolIcon,
	QuestionMarkCircleIcon,
	XCircleIcon,
} from "@heroicons/react/16/solid";
import { useNavigate } from "react-router";
import { useDocumentTitle } from "@/hooks";

// Section card component for visual grouping
function Section({
	icon: Icon,
	iconColor,
	title,
	children,
}: {
	icon: React.ComponentType<{ className?: string }>;
	iconColor: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
			<div className="mb-4 flex items-center gap-3">
				<div className={`flex size-10 items-center justify-center rounded-xl ${iconColor}`}>
					<Icon className="size-5 text-white" />
				</div>
				<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h2>
			</div>
			<div className="space-y-4 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
				{children}
			</div>
		</div>
	);
}

// Highlight box for important information
function HighlightBox({
	type,
	children,
}: {
	type: "info" | "warning" | "error";
	children: React.ReactNode;
}) {
	const styles = {
		info: "bg-sky-50 ring-sky-200/50 dark:bg-sky-950/30 dark:ring-sky-800/50",
		warning: "bg-amber-50 ring-amber-200/50 dark:bg-amber-950/30 dark:ring-amber-800/50",
		error: "bg-red-50 ring-red-200/50 dark:bg-red-950/30 dark:ring-red-800/50",
	};
	const textStyles = {
		info: "text-sky-800 dark:text-sky-200",
		warning: "text-amber-800 dark:text-amber-200",
		error: "text-red-800 dark:text-red-200",
	};
	const icons = {
		info: CheckCircleIcon,
		warning: ExclamationTriangleIcon,
		error: XCircleIcon,
	};
	const iconColors = {
		info: "text-sky-500",
		warning: "text-amber-500",
		error: "text-red-500",
	};
	const Icon = icons[type];

	return (
		<div className={`flex gap-3 rounded-xl p-4 ring-1 ${styles[type]}`}>
			<Icon className={`size-5 shrink-0 ${iconColors[type]}`} />
			<p className={`text-sm ${textStyles[type]}`}>{children}</p>
		</div>
	);
}

// Timeline item
function TimelineItem({ scenario, time }: { scenario: string; time: string }) {
	return (
		<div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50">
			<span className="text-sm text-zinc-700 dark:text-zinc-300">{scenario}</span>
			<span className="text-sm font-medium text-zinc-900 dark:text-white">{time}</span>
		</div>
	);
}

export function RefundPolicy() {
	useDocumentTitle("Refund Policy | HypeDrive");
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
			{/* Header */}
			<header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
				<div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="flex size-9 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
					>
						<ArrowLeftIcon className="size-5" />
					</button>
					<div>
						<h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
							Refund Policy
						</h1>
						<p className="text-xs text-zinc-500">Last updated: January 2026</p>
					</div>
				</div>
			</header>

			{/* Content */}
			<main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
				{/* Intro */}
				<div className="rounded-2xl bg-zinc-900 p-6 text-white dark:bg-white dark:text-zinc-900">
					<BanknotesIcon className="mb-3 size-8 text-emerald-400 dark:text-emerald-600" />
					<h2 className="text-xl font-bold">Refund Policy</h2>
					<p className="mt-2 text-sm text-zinc-300 dark:text-zinc-600">
						Understand how refunds and cashback work on Hypedrive. We aim to be fair and transparent in all our policies.
					</p>
				</div>

				{/* Important Notice */}
				<HighlightBox type="warning">
					<strong>Important:</strong> Hypedrive is a cashback platform, not a retailer. We do not process refunds for products purchased through e-commerce platforms. For product refunds, contact the respective seller directly.
				</HighlightBox>

				{/* Earning Cashback */}
				<Section icon={CheckCircleIcon} iconColor="bg-emerald-500" title="Earning Cashback">
					<p>Cashback is credited when all conditions are met:</p>
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
							<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
							<span className="text-sm text-emerald-900 dark:text-emerald-100">Campaign enrollment successful</span>
						</div>
						<div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
							<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
							<span className="text-sm text-emerald-900 dark:text-emerald-100">Purchase proof verified</span>
						</div>
						<div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
							<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
							<span className="text-sm text-emerald-900 dark:text-emerald-100">Deliverables approved</span>
						</div>
						<div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
							<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
							<span className="text-sm text-emerald-900 dark:text-emerald-100">No policy violations</span>
						</div>
					</div>
				</Section>

				{/* Cashback Forfeiture */}
				<Section icon={NoSymbolIcon} iconColor="bg-red-500" title="When Cashback is Forfeited">
					<p>Cashback may be forfeited in these situations:</p>
					<div className="space-y-3">
						<div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-950/30">
							<XCircleIcon className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
							<div>
								<p className="font-medium text-red-900 dark:text-red-100">Product Return</p>
								<p className="text-sm text-red-700 dark:text-red-300">If you return the product to the e-commerce platform</p>
							</div>
						</div>
						<div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-950/30">
							<XCircleIcon className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
							<div>
								<p className="font-medium text-red-900 dark:text-red-100">Fraud Detection</p>
								<p className="text-sm text-red-700 dark:text-red-300">Fake screenshots, duplicate orders, or manipulation</p>
							</div>
						</div>
						<div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-950/30">
							<XCircleIcon className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
							<div>
								<p className="font-medium text-red-900 dark:text-red-100">Missed Deadline</p>
								<p className="text-sm text-red-700 dark:text-red-300">Deliverables not submitted within timeframe</p>
							</div>
						</div>
						<div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-950/30">
							<XCircleIcon className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
							<div>
								<p className="font-medium text-red-900 dark:text-red-100">Permanent Rejection</p>
								<p className="text-sm text-red-700 dark:text-red-300">Multiple rejected submissions or quality issues</p>
							</div>
						</div>
					</div>
				</Section>

				{/* Withdrawal Refunds */}
				<Section icon={ArrowPathIcon} iconColor="bg-sky-500" title="Withdrawal Refunds">
					<div className="space-y-4">
						<div>
							<h3 className="mb-2 font-medium text-zinc-900 dark:text-white">Failed Withdrawals</h3>
							<p className="text-sm">
								If a withdrawal fails due to incorrect bank details or UPI ID:
							</p>
							<ul className="mt-2 space-y-1 text-sm">
								<li>• Amount credited back to wallet within 5-7 business days</li>
								<li>• You can retry with corrected information</li>
								<li>• No fees charged for failed attempts</li>
							</ul>
						</div>
						<div>
							<h3 className="mb-2 font-medium text-zinc-900 dark:text-white">Processing Delays</h3>
							<p className="text-sm">
								Standard processing is 2-3 business days. If delayed beyond 7 days, contact support with your withdrawal ID.
							</p>
						</div>
					</div>
					<HighlightBox type="warning">
						Processed withdrawals may be reversed if fraud is discovered post-withdrawal or if a product return is detected.
					</HighlightBox>
				</Section>

				{/* Enrollment Cancellations */}
				<Section icon={XCircleIcon} iconColor="bg-amber-500" title="Enrollment Cancellations">
					<div className="space-y-4">
						<div>
							<h3 className="mb-2 font-medium text-zinc-900 dark:text-white">Voluntary Withdrawal</h3>
							<p className="text-sm">
								You can withdraw from a campaign before submitting deliverables:
							</p>
							<ul className="mt-2 space-y-1 text-sm">
								<li>• Enrollment spot released for others</li>
								<li>• Pending cashback cancelled</li>
								<li>• Product purchases cannot be refunded through us</li>
							</ul>
						</div>
						<div>
							<h3 className="mb-2 font-medium text-zinc-900 dark:text-white">Campaign Cancelled by Brand</h3>
							<p className="text-sm">
								If a brand cancels after you've enrolled:
							</p>
							<ul className="mt-2 space-y-1 text-sm">
								<li>• You'll be notified immediately</li>
								<li>• Partial compensation may be offered if purchase was verified</li>
								<li>• We're not liable for products already purchased</li>
							</ul>
						</div>
					</div>
				</Section>

				{/* Disputes */}
				<Section icon={QuestionMarkCircleIcon} iconColor="bg-violet-500" title="Dispute Resolution">
					<p>If you believe your enrollment was incorrectly rejected:</p>
					<div className="space-y-3">
						<div className="flex items-start gap-3">
							<div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/50 dark:text-violet-300">
								1
							</div>
							<p className="text-sm">Contact support within 7 days of the decision</p>
						</div>
						<div className="flex items-start gap-3">
							<div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/50 dark:text-violet-300">
								2
							</div>
							<p className="text-sm">Provide relevant evidence (screenshots, receipts)</p>
						</div>
						<div className="flex items-start gap-3">
							<div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/50 dark:text-violet-300">
								3
							</div>
							<p className="text-sm">Our team reviews within 5 business days</p>
						</div>
					</div>
					<HighlightBox type="info">
						After review, we may reinstate your cashback, provide partial credit, or uphold the decision with explanation. All resolutions are final.
					</HighlightBox>
				</Section>

				{/* Timeline */}
				<Section icon={ClockIcon} iconColor="bg-zinc-700" title="Timeline Summary">
					<div className="space-y-2">
						<TimelineItem scenario="Failed withdrawal refund" time="5-7 business days" />
						<TimelineItem scenario="Dispute resolution" time="5 business days" />
						<TimelineItem scenario="Wallet credit after cancellation" time="Immediate" />
						<TimelineItem scenario="Bank transfer after dispute approval" time="2-3 business days" />
					</div>
				</Section>

				{/* Contact */}
				<Section icon={EnvelopeIcon} iconColor="bg-sky-500" title="Contact Us">
					<p>For refund-related queries or disputes:</p>
					<div className="flex flex-wrap gap-3">
						<a
							href="mailto:support@hypedrive.com"
							className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
						>
							<EnvelopeIcon className="size-4" />
							support@hypedrive.com
						</a>
					</div>
					<p className="text-xs text-zinc-500">
						Include your registered email, enrollment ID, and detailed description for faster resolution.
					</p>
				</Section>

				{/* Footer spacing */}
				<div className="h-8" />
			</main>
		</div>
	);
}
