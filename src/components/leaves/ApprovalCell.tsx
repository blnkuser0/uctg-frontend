"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeaveDecisionStatus } from "@/types/leave";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_META: Record<LeaveDecisionStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  approved: { label: "Approved", className: "bg-emerald-500/15 text-emerald-600" },
  rejected: { label: "Rejected", className: "bg-destructive/15 text-destructive" },
};

interface ApprovalCellProps {
  status: LeaveDecisionStatus;
  canAct: boolean;
  onApprove: () => void;
  onReject: () => void;
  isPending?: boolean;
}

export function ApprovalCell({ status, canAct, onApprove, onReject, isPending }: ApprovalCellProps) {
  const meta = STATUS_META[status];

  if (status !== "pending" || !canAct) {
    return <Badge className={cn("font-normal", meta.className)}>{meta.label}</Badge>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        size="icon-sm"
        variant="outline"
        disabled={isPending}
        onClick={onApprove}
        className="text-emerald-600 hover:text-emerald-600"
        aria-label="Approve"
      >
        <Check className="size-3.5" />
      </Button>
      <Button
        size="icon-sm"
        variant="outline"
        disabled={isPending}
        onClick={onReject}
        className="text-destructive hover:text-destructive"
        aria-label="Reject"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
