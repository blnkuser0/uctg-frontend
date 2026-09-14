"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AtSign, CalendarClock, CalendarDays, CheckSquare, MessageCircle, MessageSquare, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNotification, NotificationType } from "@/types/notification";

const ICONS: Record<NotificationType, typeof AtSign> = {
  task_assigned: UserPlus,
  task_comment: MessageSquare,
  task_mention: AtSign,
  task_deadline: CalendarClock,
  project_added: UserPlus,
  checklist_completed: CheckSquare,
  leave_submitted: CalendarDays,
  leave_hr_decided: CalendarDays,
  leave_decided: CalendarDays,
  dm_message: MessageCircle,
  message_mention: AtSign,
};

function linkFor(notification: AppNotification): string {
  if (notification.channelId) return `/chat/${notification.channelId}`;
  if (notification.projectId) return `/projects/${notification.projectId}/board`;
  if (notification.type.startsWith("leave_")) return "/leaves";
  return "/notifications";
}

export function NotificationItem({
  notification,
  onNavigate,
}: {
  notification: AppNotification;
  onNavigate?: () => void;
}) {
  const Icon = ICONS[notification.type] ?? MessageSquare;
  const unread = !notification.readAt;

  return (
    <Link
      href={linkFor(notification)}
      onClick={onNavigate}
      className={cn(
        "flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted",
        unread && "bg-cyan-500/5"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
          unread ? "bg-cyan-500/15 text-cyan-600" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate", unread ? "font-medium text-foreground" : "text-muted-foreground")}>
          {notification.title}
        </p>
        {notification.message && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
        )}
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      {unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-cyan-600" />}
    </Link>
  );
}
