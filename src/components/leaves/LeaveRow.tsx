"use client";

import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApprovalCell } from "./ApprovalCell";
import { Leave, LeaveDecisionStatus, leaveTypeLabel } from "@/types/leave";
import { formatDate } from "@/lib/utils";
import { Trash2, X } from "lucide-react";

export type LeaveRemoveMode = "cancel" | "delete" | null;

const OVERALL_META: Record<LeaveDecisionStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  approved: "bg-emerald-500/15 text-emerald-600",
  rejected: "bg-destructive/15 text-destructive",
};

interface LeaveRowProps {
  leave: Leave;
  showEmployeeColumn: boolean;
  canActHr: boolean;
  canActAdmin: boolean;
  removeMode: LeaveRemoveMode;
  isMutating: boolean;
  onHrDecision: (status: "approved" | "rejected") => void;
  onAdminDecision: (status: "approved" | "rejected") => void;
  onRemove: () => void;
}

export function LeaveRow({
  leave,
  showEmployeeColumn,
  canActHr,
  canActAdmin,
  removeMode,
  isMutating,
  onHrDecision,
  onAdminDecision,
  onRemove,
}: LeaveRowProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const employeeLabel = typeof leave.userId === "object" ? leave.userId.name : "You";

  return (
    <tr className="border-b border-border last:border-0">
      {showEmployeeColumn && <td className="px-4 py-3 text-sm font-medium">{employeeLabel}</td>}
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
      </td>
      <td className="px-4 py-3 text-sm whitespace-nowrap">{leaveTypeLabel(leave.leaveType)}</td>
      <td className="max-w-xs truncate px-4 py-3 text-sm">{leave.reason}</td>
      <td className="px-4 py-3">
        <ApprovalCell
          status={leave.hrStatus}
          canAct={canActHr}
          isPending={isMutating}
          onApprove={() => onHrDecision("approved")}
          onReject={() => onHrDecision("rejected")}
        />
      </td>
      <td className="px-4 py-3">
        <ApprovalCell
          status={leave.adminStatus}
          canAct={canActAdmin}
          isPending={isMutating}
          onApprove={() => onAdminDecision("approved")}
          onReject={() => onAdminDecision("rejected")}
        />
      </td>
      <td className="px-4 py-3">
        <Badge className={OVERALL_META[leave.status]}>{leave.status}</Badge>
      </td>
      <td className="px-4 py-3 text-right">
        {removeMode === "cancel" && (
          <Button size="icon-sm" variant="ghost" onClick={onRemove} disabled={isMutating} aria-label="Cancel request">
            <X className="size-3.5" />
          </Button>
        )}
        {removeMode === "delete" && (
          <>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setConfirmingDelete(true)}
              disabled={isMutating}
              aria-label="Delete leave request"
              title="Delete leave request"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
            <Dialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Delete this leave request?</DialogTitle>
                  <DialogDescription>
                    {employeeLabel === "You" ? "Your" : `${employeeLabel}'s`} leave request
                    will be Deleted.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmingDelete(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setConfirmingDelete(false);
                      onRemove();
                    }}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </td>
    </tr>
  );
}
