"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDeleteAccomplishment } from "@/hooks/useAccomplishments";
import { formatDayLabel } from "@/lib/utils";
import { Accomplishment } from "@/types/accomplishment";
import { Pencil, Trash2 } from "lucide-react";
import { EditAccomplishmentDialog } from "./EditAccomplishmentDialog";

function authorName(entry: Accomplishment, currentUserId: string): string {
  if (typeof entry.userId === "string") return entry.userId === currentUserId ? "You" : "—";
  return entry.userId._id === currentUserId ? "You" : entry.userId.name;
}

function ownedByViewer(entry: Accomplishment, currentUserId: string): boolean {
  return (typeof entry.userId === "string" ? entry.userId : entry.userId._id) === currentUserId;
}

export function AccomplishmentTable({
  entries,
  currentUserId,
  showEmployeeColumn,
  emptyMessage,
}: {
  entries: Accomplishment[];
  currentUserId: string;
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
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-36">Date</TableHead>
              {showEmployeeColumn && <TableHead className="w-40">Employee</TableHead>}
              <TableHead>Task done</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const mine = ownedByViewer(entry, currentUserId);
              return (
                <TableRow key={entry._id}>
                  <TableCell className="align-top whitespace-nowrap text-muted-foreground">{formatDayLabel(entry.date)}</TableCell>
                  {showEmployeeColumn && <TableCell className="align-top">{authorName(entry, currentUserId)}</TableCell>}
                  <TableCell className="align-top whitespace-normal">{entry.text}</TableCell>
                  <TableCell className="text-right align-top">
                    {mine ? (
                      <div className="flex justify-end gap-1.5">
                        <Button size="icon-sm" variant="outline" onClick={() => setEditing(entry)} aria-label="Edit entry">
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button size="icon-sm" variant="outline" onClick={() => setDeleting(entry)} aria-label="Delete entry">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
