"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, CalendarClock, CheckCircle2, Clock3, FolderKanban, MessageSquare, TimerReset } from "lucide-react";
import { useMyProjects } from "@/hooks/useProjects";
import { useMyTasks } from "@/hooks/useMyTasks";
import { useNotifications } from "@/hooks/useNotifications";
import { useClock, useTodayTimeLog } from "@/hooks/useTimeLog";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { TimeLogType } from "@/types/timeLog";
import { PageHeader } from "@/components/layout/PageHeader";

export default function OverviewPage() {
  const { user } = useAuth();
  const projects = useMyProjects();
  const tasks = useMyTasks();
  const notifications = useNotifications();
  const today = useTodayTimeLog();
  const clock = useClock();
  const projectCount = projects.data?.length ?? 0;
  const taskList = tasks.data ?? [];
  const urgentCount = taskList.filter((task) => task.priority === "urgent" || task.priority === "high").length;
  const unread = (notifications.data ?? []).filter((notification) => !notification.readAt).length;
  const state = today.data?.state ?? "clocked-out";
  const nextClock: { label: string; type: TimeLogType } = state === "clocked-out" ? { label: "Start work", type: "time-in" } : state === "working" ? { label: "Clock out", type: "time-out" } : state === "on-break" ? { label: "End break", type: "break-out" } : { label: "End lunch", type: "lunch-out" };

  return <div className="catalyst-page">
    <PageHeader title={<>Good to see you, {user?.name.split(" ")[0]}.</>} section="Workspace / Overview" actions={<><span className="border border-border bg-background/80 px-3 py-2 text-[11px] font-medium capitalize text-muted-foreground">Status: {state.replace("-", " ")}</span><Button onClick={() => clock.mutate({ type: nextClock.type })} disabled={clock.isPending} className="bg-primary text-primary-foreground"><Clock3 className="size-4" />{clock.isPending ? "Updating..." : nextClock.label}</Button></>} />

    <section className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-4"><Metric label="Assigned projects" value={projectCount} icon={FolderKanban} href="/projects" tone="sky" /><Metric label="Open assignments" value={taskList.length} icon={CheckCircle2} href="/my-tasks" tone="violet" /><Metric label="High attention" value={urgentCount} icon={CalendarClock} href="/my-tasks" tone="amber" /><Metric label="Unread activity" value={unread} icon={MessageSquare} href="/notifications" tone="coral" /></section>

    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,.65fr)]">
      <section className="catalyst-panel overflow-hidden"><SectionHeader title="Priority queue" action="View all tasks" href="/my-tasks" />{tasks.isLoading ? <RowsSkeleton /> : taskList.length ? <div className="divide-y divide-border">{taskList.slice(0, 6).map((task) => <Link key={task._id} href={`/projects/${task.projectId}/board`} className="group grid gap-2 px-5 py-3.5 transition-colors hover:bg-accent/35 sm:grid-cols-[minmax(0,1fr)_7rem_6rem] sm:items-center"><div className="min-w-0"><p className="truncate text-sm font-medium group-hover:text-primary">{task.title}</p><p className="mt-1 font-mono text-[9px] tracking-[.1em] text-muted-foreground uppercase">Task {task.taskNumber} · {task.commentCount} comments</p></div><span className="w-fit border border-border px-2 py-1 text-[10px] capitalize text-muted-foreground">{task.priority ?? "normal"}</span><span className="text-right text-[11px] text-muted-foreground">{task.deadline ? formatDistanceToNow(new Date(task.deadline), { addSuffix: true }) : "No deadline"}</span></Link>)}</div> : <EmptyLine text="Nothing is assigned to you right now." />}</section>

      <section className="catalyst-panel overflow-hidden"><SectionHeader title="Recent activity" action="Open feed" href="/notifications" />{notifications.isLoading ? <RowsSkeleton count={4} /> : notifications.data?.length ? <div className="divide-y divide-border">{notifications.data.slice(0, 5).map((item) => <Link key={item._id} href={item.projectId ? `/projects/${item.projectId}/board` : item.channelId ? `/chat/${item.channelId}` : "/notifications"} className="block px-5 py-3.5 transition-colors hover:bg-accent/35"><div className="flex items-start gap-3"><span className={`mt-1.5 size-1.5 shrink-0 ${item.readAt ? "bg-muted-foreground/35" : "bg-primary"}`} /><div className="min-w-0"><p className="line-clamp-1 text-xs font-medium">{item.title}</p><p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">{item.message}</p><p className="mt-1.5 font-mono text-[9px] text-muted-foreground">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</p></div></div></Link>)}</div> : <EmptyLine text="No recent workspace activity." />}</section>
    </div>

    <section className="grid gap-3 md:grid-cols-3"><QuickLink href="/projects" index="01" title="Open delivery board" detail="Review client work and project membership." /><QuickLink href="/chat" index="02" title="Message the team" detail="Continue work conversations in Catalyst Space." /><QuickLink href="/timeproof" index="03" title="Review time record" detail={`${today.data?.logs.length ?? 0} time events recorded today.`} icon={TimerReset} /></section>
  </div>;
}

const METRIC_TONE = {
  sky: "border-t-sky-500 text-sky-600 dark:text-sky-300",
  violet: "border-t-violet-500 text-violet-600 dark:text-violet-300",
  amber: "border-t-amber-500 text-amber-700 dark:text-amber-300",
  coral: "border-t-orange-500 text-orange-600 dark:text-orange-300",
} as const;
function Metric({ label, value, icon: Icon, href, tone }: { label: string; value: number; icon: typeof FolderKanban; href: string; tone: keyof typeof METRIC_TONE }) { return <Link href={href} className={`group border-t-2 bg-card p-4 transition-colors hover:bg-muted/45 ${METRIC_TONE[tone]}`}><div className="flex items-center justify-between"><p className="text-[10px] font-medium text-muted-foreground">{label}</p><Icon className="size-4" /></div><p className="mt-5 text-3xl font-semibold tracking-[-.035em] text-foreground">{String(value).padStart(2, "0")}</p><p className="mt-2 text-[10px] text-muted-foreground transition-colors group-hover:text-foreground">Open detail →</p></Link>; }
function SectionHeader({ title, action, href }: { title: string; action: string; href: string }) { return <div className="flex items-center justify-between border-b border-border px-5 py-3"><h2 className="text-sm font-semibold">{title}</h2><Link href={href} className="text-[10px] font-medium text-primary hover:underline">{action}</Link></div>; }
function RowsSkeleton({ count = 5 }: { count?: number }) { return <div className="divide-y divide-border">{Array.from({ length: count }, (_, index) => <div key={index} className="h-[4.3rem] animate-pulse bg-muted/35" />)}</div>; }
function EmptyLine({ text }: { text: string }) { return <p className="px-5 py-10 text-center text-xs text-muted-foreground">{text}</p>; }
function QuickLink({ href, index, title, detail, icon: Icon }: { href: string; index: string; title: string; detail: string; icon?: typeof TimerReset }) { return <Link href={href} className="group border border-border bg-card p-4 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-primary/50"><div className="flex items-start justify-between"><span className="font-mono text-[9px] text-primary">{index}</span>{Icon ? <Icon className="size-4 text-muted-foreground" /> : <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />}</div><p className="mt-6 text-sm font-semibold">{title}</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{detail}</p></Link>; }
