"use client";

import { ReactElement, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateProject } from "@/hooks/useProjects";
import { useRouter } from "next/navigation";
import { Building2, Palette, Plus, UsersRound } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useUsers } from "@/hooks/useUsers";
import { listClientOrganizations } from "@/services/organization.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export function NewProjectDialog({ trigger }: { trigger?: ReactElement } = {}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [key, setKey] = useState("");
  const [color, setColor] = useState("#38bdf8");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const createProject = useCreateProject();
  const router = useRouter();
  const { user } = useAuth();
  const isSuperAdmin = user?.role.name === "SUPER_ADMIN";
  const { data: clients = [] } = useQuery({ queryKey: ["organizations", "clients"], queryFn: listClientOrganizations, enabled: open && isSuperAdmin });
  const { data: users = [] } = useUsers();
  const developers = users.filter((candidate) => candidate.role.name === "DEVELOPER" && candidate.isActive !== false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (isSuperAdmin && !organizationId) {
      toast.error("Select the client organization for this project.");
      return;
    }

    createProject.mutate(
      { name: name.trim(), key: key.trim().toUpperCase() || undefined, description: description.trim() || undefined, color, organizationId: isSuperAdmin ? organizationId : undefined, memberIds },
      {
        onSuccess: (project) => {
          toast.success("Project created");
          setOpen(false);
          setName("");
          setDescription("");
          setOrganizationId("");
          setKey("");
          setColor("#38bdf8");
          setMemberIds([]);
          router.push(`/projects/${project._id}/board`);
        },
        onError: () => toast.error("Could not create the project."),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="size-4" />
            New Project
          </Button>
        }
      />
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto border-t-2 border-t-sky-500 p-0">
        <DialogHeader className="border-b border-border bg-sky-500/7 px-5 py-4">
          <DialogTitle className="text-xl font-bold">Create client project</DialogTitle>
          <DialogDescription>Define the client workspace and initial delivery team. Default workflow stages are added automatically.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-5 p-5" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 border-b border-border pb-2"><Building2 className="size-4 text-sky-500" /><h3 className="text-sm font-semibold">Project and client</h3></div>
          <div className="grid gap-1.5">
            <Label htmlFor="projectName">Project name</Label>
            <Input id="projectName" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Downtown Office Fitout" />
          </div>
          {isSuperAdmin && <div className="grid gap-1.5"><Label htmlFor="projectClient">Client organization</Label><Select value={organizationId || undefined} onValueChange={(value) => setOrganizationId(value ?? "")}><SelectTrigger id="projectClient"><SelectValue placeholder="Select client workspace" /></SelectTrigger><SelectContent>{clients.map((client) => <SelectItem key={client._id} value={client._id}>{client.name}</SelectItem>)}</SelectContent></Select></div>}
          <div className="grid gap-3 sm:grid-cols-[1fr_8rem]"><div className="grid gap-1.5"><Label htmlFor="projectKey">Project key</Label><Input id="projectKey" value={key} maxLength={10} onChange={(event) => setKey(event.target.value.replace(/[^a-z0-9]/gi, "").toUpperCase())} placeholder="Auto-generated" /><p className="text-[10px] text-muted-foreground">Used in task IDs, for example NOVA-24.</p></div><div className="grid gap-1.5"><Label htmlFor="projectColor">Accent</Label><div className="flex h-8 items-center gap-2 border border-input bg-background px-2"><Palette className="size-3.5 text-muted-foreground" /><input id="projectColor" type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-5 min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0" /></div></div></div>
          <div className="grid gap-1.5">
            <Label htmlFor="projectDescription">Description (optional)</Label>
            <Textarea id="projectDescription" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-2"><div className="flex items-center gap-2 border-b border-border pb-2"><UsersRound className="size-4 text-violet-500" /><div><h3 className="text-sm font-semibold">Initial delivery team</h3><p className="text-[10px] text-muted-foreground">Selected Umbrella developers immediately receive project access.</p></div><span className="ml-auto text-xs font-semibold text-violet-600 dark:text-violet-300">{memberIds.length} selected</span></div><div className="grid max-h-44 gap-px overflow-y-auto border border-border bg-border sm:grid-cols-2">{developers.map((developer) => <label key={developer.id} className="flex cursor-pointer items-center gap-3 bg-card px-3 py-2.5 transition-colors hover:bg-muted/50"><Checkbox checked={memberIds.includes(developer.id)} onCheckedChange={(checked) => setMemberIds((current) => checked === true ? [...current, developer.id] : current.filter((id) => id !== developer.id))} /><span className="min-w-0"><span className="block truncate text-sm font-medium">{developer.name}</span><span className="block truncate text-[10px] text-muted-foreground">{developer.email}</span></span></label>)}{developers.length === 0 && <p className="col-span-full bg-card px-3 py-6 text-center text-xs text-muted-foreground">Create developer accounts before assigning a team.</p>}</div></div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createProject.isPending} className="bg-sky-600 text-white hover:bg-sky-500">
              {createProject.isPending ? "Creating..." : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
