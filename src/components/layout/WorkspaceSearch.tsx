"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, CircleUserRound, Clock, FileCheck2, FolderKanban, ListChecks, MessageSquare, Search, Settings, Users } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useMyProjects } from "@/hooks/useProjects";
import { useMyTasks } from "@/hooks/useMyTasks";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";
import { PERMISSIONS } from "@/types/role";

type SearchResult = {
  label: string;
  detail: string;
  href: string;
  group: "Page" | "Project" | "Task";
  icon: typeof Search;
};

const destinations: SearchResult[] = [
  { label: "Overview", detail: "Workspace control desk", href: "/overview", group: "Page", icon: Search },
  { label: "Projects", detail: "Client delivery spaces", href: "/projects", group: "Page", icon: FolderKanban },
  { label: "My Tasks", detail: "Assigned work queue", href: "/my-tasks", group: "Page", icon: ListChecks },
  { label: "Catalyst Space", detail: "Team conversations", href: "/chat", group: "Page", icon: MessageSquare },
  { label: "Timeproof", detail: "Clock and attendance record", href: "/timeproof", group: "Page", icon: Clock },
  { label: "Leaves", detail: "Leave requests and decisions", href: "/leaves", group: "Page", icon: CalendarDays },
  { label: "Profile", detail: "Identity and security", href: "/profile", group: "Page", icon: CircleUserRound },
  { label: "Settings", detail: "Workspace preferences", href: "/settings", group: "Page", icon: Settings },
];

export function WorkspaceSearch() {
  const router = useRouter();
  const { user } = useAuth();
  const projects = useMyProjects();
  const tasks = useMyTasks();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isSuperAdmin = user?.isSuperAdmin ?? false;
  const canManageAccomplishments = user?.role.permissions.includes(PERMISSIONS.ACCOMPLISHMENTS_MANAGE) ?? false;

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, []);

  const results = useMemo(() => {
    const adminDestination: SearchResult[] = isSuperAdmin
      ? [{ label: "Platform", detail: "Provision organizations, developers, and project access", href: "/platform", group: "Page", icon: Users }]
      : [];
    const accomplishmentsDestination: SearchResult[] = canManageAccomplishments
      ? [{ label: "Accomplishments", detail: "Daily task log for the team", href: "/accomplishments", group: "Page", icon: CheckCircle2 }]
      : [];
    const projectById = new Map((projects.data ?? []).map((project) => [project._id, project]));
    const projectResults: SearchResult[] = (projects.data ?? []).map((project) => ({
      label: project.name,
      detail: `${project.key} · ${project.memberIds.length} team members`,
      href: `/projects/${project._id}/board`,
      group: "Project",
      icon: FolderKanban,
    }));
    const taskResults: SearchResult[] = (tasks.data ?? []).map((task) => ({
      label: task.title,
      detail: `${projectById.get(task.projectId)?.key ?? "TASK"}-${task.taskNumber} · ${task.priority ?? "normal"} priority`,
      href: `/projects/${task.projectId}/list?task=${task._id}`,
      group: "Task",
      icon: FileCheck2,
    }));
    const all = [...destinations, ...adminDestination, ...accomplishmentsDestination, ...projectResults, ...taskResults];
    const needle = query.trim().toLowerCase();
    return (needle ? all.filter((item) => `${item.label} ${item.detail} ${item.group}`.toLowerCase().includes(needle)) : all).slice(0, 12);
  }, [projects.data, query, tasks.data, canManageAccomplishments, isSuperAdmin]);

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
    router.push(href);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[selectedIndex]) {
      event.preventDefault();
      navigate(results[selectedIndex].href);
    }
  }

  return <>
    <button type="button" onClick={() => setOpen(true)} className="group hidden h-9 min-w-64 items-center gap-2.5 border border-border bg-card px-3 text-left text-xs text-muted-foreground shadow-sm transition-[border-color,background-color,box-shadow] hover:border-primary/45 hover:bg-muted/40 hover:shadow md:flex">
      <Search className="size-3.5 text-primary" />
      <span className="flex-1">Search pages, projects, tasks...</span>
      <kbd className="border border-border bg-background px-1.5 py-0.5 text-[9px] font-medium">Ctrl K</kbd>
    </button>
    <button type="button" onClick={() => setOpen(true)} className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground md:hidden" aria-label="Search workspace"><Search className="size-4" /></button>

    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) { setQuery(""); setSelectedIndex(0); } }}>
      <DialogContent className="top-[12%] max-w-2xl translate-y-0 gap-0 overflow-hidden border-t-2 border-t-primary p-0 shadow-2xl" showCloseButton={false}>
        <DialogTitle className="sr-only">Search workspace</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5">
          <div className="flex size-9 items-center justify-center border border-primary/20 bg-primary/10 text-primary"><Search className="size-4" /></div>
          <input autoFocus value={query} onChange={(event) => { setQuery(event.target.value); setSelectedIndex(0); }} onKeyDown={handleInputKeyDown} placeholder="Type a page, project key, task, or priority..." className="h-16 min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground" />
          <kbd className="border border-border bg-background px-2 py-1 text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <div className="flex items-center justify-between border-b border-border px-5 py-2 text-[10px] text-muted-foreground">
          <span>{query ? `${results.length} matches` : "Quick access and recent work"}</span>
          <span>↑↓ Navigate · Enter Open</span>
        </div>
        <div className="max-h-[27rem] overflow-y-auto p-2">
          {results.length ? results.map(({ label, detail, href, icon: Icon, group }, index) => (
            <button key={`${href}-${label}`} type="button" onMouseEnter={() => setSelectedIndex(index)} onClick={() => navigate(href)} className={cn("group grid w-full grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 border-l-2 px-3 py-3 text-left transition-colors", index === selectedIndex ? "border-primary bg-primary/8" : "border-transparent hover:bg-muted/45")}>
              <span className={cn("flex size-9 items-center justify-center border", index === selectedIndex ? "border-primary/25 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground")}><Icon className="size-4" /></span>
              <span className="min-w-0"><span className="block truncate text-sm font-semibold">{label}</span><span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{detail}</span></span>
              <span className="border border-border px-2 py-1 text-[9px] font-medium text-muted-foreground">{group}</span>
            </button>
          )) : <div className="px-5 py-14 text-center"><p className="text-sm font-semibold">No workspace result</p><p className="mt-1 text-xs text-muted-foreground">Try a project key, task title, or page name.</p></div>}
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
