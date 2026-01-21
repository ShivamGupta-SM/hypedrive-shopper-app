import {
	ArrowLeftIcon,
	CheckCircleIcon,
	DevicePhoneMobileIcon,
	EnvelopeIcon,
	ExclamationTriangleIcon,
	EyeIcon,
	GlobeAltIcon,
	LockClosedIcon,
	ShieldCheckIcon,
	UserCircleIcon,
	ClockIcon,
} from "@heroicons/react/16/solid";
import { useNavigate } from "react-router";

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
	type: "info" | "warning";
	children: React.ReactNode;
}) {
	const styles = {
		info: "bg-sky-50 ring-sky-200/50 dark:bg-sky-950/30 dark:ring-sky-800/50",
		warning: "bg-amber-50 ring-amber-200/50 dark:bg-amber-950/30 dark:ring-amber-800/50",
	};
	const textStyles = {
		info: "text-sky-800 dark:text-sky-200",
		warning: "text-amber-800 dark:text-amber-200",
	};
	const Icon = type === "warning" ? ExclamationTriangleIcon : CheckCircleIcon;
	const iconColor = type === "warning" ? "text-amber-500" : "text-sky-500";

	return (
		<div className={`flex gap-3 rounded-xl p-4 ring-1 ${styles[type]}`}>
			<Icon className={`size-5 shrink-0 ${iconColor}`} />
			<p className={`text-sm ${textStyles[type]}`}>{children}</p>
		</div>
	);
}

// Data item card
function DataItem({ label, description }: { label: string; description: string }) {
	return (
		<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
			<p className="text-sm font-medium text-zinc-900 dark:text-white">{label}</p>
			<p className="mt-1 text-sm">{description}</p>
		</div>
	);
}

export function PrivacyPolicy() {
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
							Privacy Policy
						</h1>
						<p className="text-xs text-zinc-500">Last updated: January 2026</p>
					</div>
				</div>
			</header>

			{/* Content */}
			<main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
				{/* Intro */}
				<div className="rounded-2xl bg-zinc-900 p-6 text-white dark:bg-white dark:text-zinc-900">
					<ShieldCheckIcon className="mb-3 size-8 text-emerald-400 dark:text-emerald-600" />
					<h2 className="text-xl font-bold">Your Privacy Matters</h2>
					<p className="mt-2 text-sm text-zinc-300 dark:text-zinc-600">
						We're committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data.
					</p>
				</div>

				{/* Information We Collect */}
				<Section icon={UserCircleIcon} iconColor="bg-sky-500" title="Information We Collect">
					<p className="font-medium text-zinc-900 dark:text-white">Personal Information</p>
					<div className="grid gap-3 sm:grid-cols-2">
						<DataItem label="Account Info" description="Name, email, phone, profile photo" />
						<DataItem label="Identity" description="PAN card for KYC compliance" />
						<DataItem label="Payment" description="Bank account, UPI ID for withdrawals" />
						<DataItem label="Campaign Data" description="Order screenshots, receipts, submissions" />
					</div>

					<p className="mt-4 font-medium text-zinc-900 dark:text-white">Automatic Collection</p>
					<div className="grid gap-3 sm:grid-cols-2">
						<DataItem label="Device Info" description="Device type, OS, identifiers" />
						<DataItem label="Usage Data" description="Pages visited, features used" />
						<DataItem label="Location" description="General location from IP (not GPS)" />
						<DataItem label="Log Data" description="Access times, error logs" />
					</div>
				</Section>

				{/* How We Use Data */}
				<Section icon={EyeIcon} iconColor="bg-violet-500" title="How We Use Your Data">
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="flex items-start gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
							<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
							<div>
								<p className="text-sm font-medium text-zinc-900 dark:text-white">Account Management</p>
								<p className="mt-1 text-xs text-zinc-500">Create and manage your account</p>
							</div>
						</div>
						<div className="flex items-start gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
							<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
							<div>
								<p className="text-sm font-medium text-zinc-900 dark:text-white">Verification</p>
								<p className="mt-1 text-xs text-zinc-500">Verify purchases and deliverables</p>
							</div>
						</div>
						<div className="flex items-start gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
							<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
							<div>
								<p className="text-sm font-medium text-zinc-900 dark:text-white">Payments</p>
								<p className="mt-1 text-xs text-zinc-500">Process withdrawals and payouts</p>
							</div>
						</div>
						<div className="flex items-start gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
							<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
							<div>
								<p className="text-sm font-medium text-zinc-900 dark:text-white">Compliance</p>
								<p className="mt-1 text-xs text-zinc-500">Meet legal & regulatory requirements</p>
							</div>
						</div>
						<div className="flex items-start gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
							<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
							<div>
								<p className="text-sm font-medium text-zinc-900 dark:text-white">Fraud Prevention</p>
								<p className="mt-1 text-xs text-zinc-500">Detect unauthorized activity</p>
							</div>
						</div>
						<div className="flex items-start gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
							<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
							<div>
								<p className="text-sm font-medium text-zinc-900 dark:text-white">Improvements</p>
								<p className="mt-1 text-xs text-zinc-500">Enhance our service & features</p>
							</div>
						</div>
					</div>
				</Section>

				{/* Information Sharing */}
				<Section icon={GlobeAltIcon} iconColor="bg-amber-500" title="Information Sharing">
					<div className="space-y-4">
						<div>
							<h3 className="mb-2 font-medium text-zinc-900 dark:text-white">With Brands</h3>
							<p className="text-sm">
								Limited info (display name, submitted content) may be shared with campaign brands for verification.
							</p>
						</div>
						<div>
							<h3 className="mb-2 font-medium text-zinc-900 dark:text-white">Service Providers</h3>
							<p className="text-sm">
								Payment processors (Razorpay, Cashfree), cloud hosting (AWS), analytics, and support platforms.
							</p>
						</div>
						<div>
							<h3 className="mb-2 font-medium text-zinc-900 dark:text-white">Legal Requirements</h3>
							<p className="text-sm">
								When required by law, court order, or to protect our rights and safety.
							</p>
						</div>
					</div>
					<HighlightBox type="info">
						We never sell your personal data to third parties for marketing purposes.
					</HighlightBox>
				</Section>

				{/* Data Security */}
				<Section icon={LockClosedIcon} iconColor="bg-emerald-500" title="Data Security">
					<p>We implement robust security measures:</p>
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
							<LockClosedIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
							<span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">End-to-end encryption</span>
						</div>
						<div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
							<ShieldCheckIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
							<span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Secure authentication</span>
						</div>
						<div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
							<DevicePhoneMobileIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
							<span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Regular security audits</span>
						</div>
						<div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
							<UserCircleIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
							<span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Access controls</span>
						</div>
					</div>
					<HighlightBox type="warning">
						No method of transmission is 100% secure. We cannot guarantee absolute security.
					</HighlightBox>
				</Section>

				{/* Data Retention */}
				<Section icon={ClockIcon} iconColor="bg-zinc-700" title="Data Retention">
					<div className="overflow-hidden rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-700">
						<table className="w-full text-sm">
							<thead className="bg-zinc-100 dark:bg-zinc-800">
								<tr>
									<th className="px-4 py-3 text-left font-medium text-zinc-900 dark:text-white">Data Type</th>
									<th className="px-4 py-3 text-left font-medium text-zinc-900 dark:text-white">Retention</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
								<tr>
									<td className="px-4 py-3">Transaction records</td>
									<td className="px-4 py-3">7 years (tax laws)</td>
								</tr>
								<tr>
									<td className="px-4 py-3">KYC documents</td>
									<td className="px-4 py-3">Per RBI guidelines</td>
								</tr>
								<tr>
									<td className="px-4 py-3">Account information</td>
									<td className="px-4 py-3">Until deletion request</td>
								</tr>
							</tbody>
						</table>
					</div>
				</Section>

				{/* Your Rights */}
				<Section icon={UserCircleIcon} iconColor="bg-sky-500" title="Your Rights">
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
							<p className="font-medium text-zinc-900 dark:text-white">Access</p>
							<p className="mt-1 text-sm">Request a copy of your personal data</p>
						</div>
						<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
							<p className="font-medium text-zinc-900 dark:text-white">Correction</p>
							<p className="mt-1 text-sm">Update or correct inaccurate info</p>
						</div>
						<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
							<p className="font-medium text-zinc-900 dark:text-white">Deletion</p>
							<p className="mt-1 text-sm">Request deletion of your account</p>
						</div>
						<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
							<p className="font-medium text-zinc-900 dark:text-white">Portability</p>
							<p className="mt-1 text-sm">Receive data in structured format</p>
						</div>
					</div>
					<p className="text-sm">
						To exercise these rights, contact us at <span className="font-medium text-zinc-900 dark:text-white">privacy@hypedrive.com</span>
					</p>
				</Section>

				{/* Contact */}
				<Section icon={EnvelopeIcon} iconColor="bg-sky-500" title="Contact Us">
					<p>Questions about privacy?</p>
					<div className="flex flex-wrap gap-3">
						<a
							href="mailto:privacy@hypedrive.com"
							className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
						>
							<EnvelopeIcon className="size-4" />
							privacy@hypedrive.com
						</a>
						<a
							href="mailto:dpo@hypedrive.com"
							className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
						>
							<ShieldCheckIcon className="size-4" />
							Data Protection Officer
						</a>
					</div>
					<p className="text-xs text-zinc-500">
						Grievance Officer responds within 24 hours as per IT Act 2000.
					</p>
				</Section>

				{/* Footer spacing */}
				<div className="h-8" />
			</main>
		</div>
	);
}
