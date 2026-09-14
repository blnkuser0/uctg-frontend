"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "./NotificationItem";
import { useMarkNotificationsRead, useNotifications, useUnreadNotificationCount } from "@/hooks/useNotifications";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications } = useNotifications();
  const { data: unreadCount } = useUnreadNotificationCount();
  const markRead = useMarkNotificationsRead();

  const recent = (notifications ?? []).slice(0, 8);
  const hasUnread = (unreadCount ?? 0) > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-4.5" />
            {hasUnread && (
              <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-amber-500" />
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-1.5 py-1 text-xs text-muted-foreground"
              onClick={() => markRead.mutate(undefined)}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {recent.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            <div className="p-1.5">
              {recent.map((n) => (
                <NotificationItem key={n._id} notification={n} onNavigate={() => setOpen(false)} />
              ))}
            </div>
          )}
        </ScrollArea>
        <Link
          href="/notifications"
          onClick={() => setOpen(false)}
          className="block border-t border-border px-3 py-2 text-center text-xs font-medium text-amber-600 hover:bg-muted"
        >
          View all
        </Link>
      </PopoverContent>
    </Popover>
  );
}
