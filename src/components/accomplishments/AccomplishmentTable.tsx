"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDeleteAccomplishment } from "@/hooks/useAccomplishments";
import { formatDayLabel } from "@/lib/utils";
import { Accomplishment, AccomplishmentSection } from "@/types/accomplishment";
import { Pencil, Trash2 } from "lucide-react";
import { EditAccomplishmentDialog } from "./EditAccomplishmentDialog";
import { AccomplishmentAttachmentChips } from "./AccomplishmentAttachmentChips";

function authorName(entry: Accomplishment, currentUserId: string): string {
  if (typeof entry.userId === "string") return entry.userId === currentUserId ? "You" : "—";
  return entry.userId._id === currentUserId ? "You" : entry.userId.name;
}

// Automatically whatever role is assigned to the entry's author — populated from the team-wide
// view's userId.roleId; "mine" entries don't populate the author, so the viewer's own role
// (already known client-side) is passed in as a fallback.
function authorRoleName(entry: Accomplishment, currentUserRoleName: string | null): string | null {
  if (typeof entry.userId === "string") return currentUserRoleName;
  return entry.userId.roleId?.name ?? null;
}

function ownedByViewer(entry: Accomplishment, currentUserId: string): boolean {
  return (typeof entry.userId === "string" ? entry.userId : entry.userId._id) === currentUserId;
}

const SECTIONS: { key: AccomplishmentSection; label: string; accent: string }[] = [
  { key: "accomplishment", label: "Accomplishments", accent: "border-emerald-500/30 bg-emerald-500/5" },
  { key: "blockers", label: "Blockers", accent: "border-red-500/30 bg-red-500/5" },
  { key: "inProgress", label: "In progress", accent: "border-amber-500/30 bg-amber-500/5" },
];

function AccomplishmentEntryCard({ entry, currentUserId, currentUserRoleName, showEmployeeColumn, onEdit, onDelete }: {
  entry: Accomplishment;
  currentUserId: string;
  currentUserRoleName: string | null;
  showEmployeeColumn: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const mine = ownedByViewer(entry, currentUserId);
  const roleName = authorRoleName(entry, currentUserRoleName);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{formatDayLabel(entry.date)}</span>
          {showEmployeeColumn && (
            <>
              <span className="text-muted-foreground">· {authorName(entry, currentUserId)}</span>
              {roleName && <Badge className="bg-cyan-500/15 font-normal text-cyan-700">{roleName}</Badge>}
            </>
          )}
        </div>
        {mine && (
          <div className="flex gap-1.5">
            <Button size="icon-sm" variant="outline" onClick={onEdit} aria-label="Edit entry">
              <Pencil className="size-3.5" />
            </Button>
            <Button size="icon-sm" variant="outline" onClick={onDelete} aria-label="Delete entry">
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-3">
        {SECTIONS.map(({ key, label, accent }) => {
          const text = entry[key];
          const attachments = entry.attachments.filter((a) => a.section === key);
          return (
            <div key={key} className={`rounded-xl border p-3 ${accent}`}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-1 text-sm whitespace-pre-wrap">{text || "—"}</p>
              <AccomplishmentAttachmentChips attachments={attachments} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AccomplishmentTable({
  entries,
  currentUserId,
  currentUserRoleName,
  showEmployeeColumn,
  emptyMessage,
}: {
  entries: Accomplishment[];
  currentUserId: string;
  currentUserRoleName: string | null;
  showEmployeeColumn: boolean;
  emptyMessage?: string;
}) {
  const deleteAccomplishment = useDeleteAccomplishment();
  const [editing, setEditing] = useState<Accomplishment | null>(null);
  const [deleting, setDeleting] = useState<Accomplishment | null>(null);

  function handleDelete() {
    if (!deleting) return;
    deleteAccomplishment.mutate(deleting._id, {
      onSuccess: () => {
        toast.success("Accomplishment deleted");
        setDeleting(null);
      },
      onError: () => toast.error("Could not delete this entry."),
    });
  }

  if (entries.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{emptyMessage ?? "Nothing logged yet."}</p>;
  }

  return (
    <>
      <div className="grid gap-3">
        {entries.map((entry) => (
          <AccomplishmentEntryCard
            key={entry._id}
            entry={entry}
            currentUserId={currentUserId}
            currentUserRoleName={currentUserRoleName}
            showEmployeeColumn={showEmployeeColumn}
            onEdit={() => setEditing(entry)}
            onDelete={() => setDeleting(entry)}
          />
        ))}
      </div>

      {editing && <EditAccomplishmentDialog accomplishment={editing} open onOpenChange={(open) => !open && setEditing(null)} />}

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this entry?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This can&apos;t be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={deleteAccomplishment.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteAccomplishment.isPending}>
              {deleteAccomplishment.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
