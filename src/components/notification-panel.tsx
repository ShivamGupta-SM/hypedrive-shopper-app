import { Dialog, DialogTitle, DialogBody } from "@/components/dialog";
import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { useUnreadNotificationCount } from "@/hooks/use-api";
import { getAuthenticatedClient } from "@/lib/client";
import {
	BellIcon,
	BellSlashIcon,
	CheckCircleIcon,
	Cog6ToothIcon,
} from "@heroicons/react/16/solid";
import { useState } from "react";
import { Link } from "react-router";

interface NotificationPanelProps {
	open: boolean;
	onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
	const { data: countData, refetch } = useUnreadNotificationCount();
	const [markingRead, setMarkingRead] = useState(false);

	const unreadCount = countData?.count ?? 0;

	const handleMarkAllRead = async () => {
		setMarkingRead(true);
		try {
			const client = getAuthenticatedClient();
			await client.notifications.markAllAsRead();
			refetch();
		} catch (err) {
			console.error("Failed to mark notifications as read:", err);
		} finally {
			setMarkingRead(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} size="sm">
			<DialogTitle>Notifications</DialogTitle>

			<DialogBody>
				<div className="flex flex-col items-center py-8">
					{unreadCount > 0 ? (
						<>
							{/* Unread count display */}
							<div className="relative">
								<div className="flex size-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30">
									<BellIcon className="size-8 text-red-500" />
								</div>
								<span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
									{unreadCount > 99 ? "99+" : unreadCount}
								</span>
							</div>

							<p className="mt-4 text-center text-base font-medium text-zinc-900 dark:text-white">
								You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
							</p>

							<Text className="mt-2 text-center text-sm">
								Check your email for detailed notifications about campaigns,
								enrollments, and earnings.
							</Text>

							<Button
								onClick={handleMarkAllRead}
								disabled={markingRead}
								className="mt-6 w-full"
								color="dark/zinc"
							>
								{markingRead ? (
									"Marking as read..."
								) : (
									<>
										<CheckCircleIcon className="size-4" />
										Mark all as read
									</>
								)}
							</Button>
						</>
					) : (
						<>
							{/* Empty state */}
							<div className="flex size-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
								<BellSlashIcon className="size-8 text-zinc-400" />
							</div>

							<p className="mt-4 text-center text-base font-medium text-zinc-900 dark:text-white">
								All caught up!
							</p>

							<Text className="mt-2 text-center text-sm">
								You have no unread notifications. We'll notify you when there's
								something new.
							</Text>
						</>
					)}

					{/* Settings link */}
					<Link
						to="/settings"
						onClick={onClose}
						className="mt-6 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
					>
						<Cog6ToothIcon className="size-4" />
						Notification settings
					</Link>
				</div>
			</DialogBody>
		</Dialog>
	);
}
