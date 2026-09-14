"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useMarkNotificationsRead, useNotifications, useUnreadNotificationCount } from "@/hooks/useNotifications";
import { useMentions } from "@/hooks/useMentions";

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const { data: unreadCount } = useUnreadNotificationCount();
  const { data: mentions, isLoading: mentionsLoading } = useMentions();
  const markRead = useMarkNotificationsRead();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Mentions, assignments, and deadlines across your projects.</p>
        </div>
        {(unreadCount ?? 0) > 0 && (
          <Button variant="outline" size="sm" onClick={() => markRead.mutate(undefined)}>
            Mark all read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mentions">Mentions{mentions && mentions.length > 0 ? ` (${mentions.length})` : ""}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="pt-3">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="grid gap-1 rounded-2xl border border-border bg-card p-1.5">
              {notifications.map((n) => (
                <NotificationItem key={n._id} notification={n} />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
          )}
        </TabsContent>

        <TabsContent value="mentions" className="pt-3">
          {mentionsLoading ? (
            <div className="flex justify-center py-10">
              <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            </div>
          ) : mentions && mentions.length > 0 ? (
            <div className="grid gap-1 rounded-2xl border border-border bg-card p-1.5">
              {mentions.map((mention) => (
                <Link
                  key={mention._id}
                  href={mention.link}
                  className="flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
                >
                  <span className="font-medium">{mention.authorName}</span>
                  <span className="line-clamp-2 text-muted-foreground">{mention.message}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(mention.createdAt), { addSuffix: true })}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">No one has mentioned you yet.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
