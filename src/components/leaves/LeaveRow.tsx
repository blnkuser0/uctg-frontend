"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApprovalCell } from "./ApprovalCell";
import { Leave, LeaveDecisionStatus } from "@/types/leave";
import { formatDate } from "@/lib/utils";
import { X } from "lucide-react";

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
  canCancel: boolean;
  isMutating: boolean;
  onHrDecision: (status: "approved" | "rejected") => void;
  onAdminDecision: (status: "approved" | "rejected") => void;
  onCancel: () => void;
}

export function LeaveRow({
  leave,
  showEmployeeColumn,
  canActHr,
  canActAdmin,
  canCancel,
  isMutating,
  onHrDecision,
  onAdminDecision,
  onCancel,
}: LeaveRowProps) {
  const employeeLabel = typeof leave.userId === "object" ? leave.userId.name : "You";

  return (
    <tr className="border-b border-border last:border-0">
      {showEmployeeColumn && <td className="px-4 py-3 text-sm font-medium">{employeeLabel}</td>}
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
      </td>
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
        {canCancel && leave.status === "pending" && (
          <Button size="icon-sm" variant="ghost" onClick={onCancel} aria-label="Cancel request">
            <X className="size-3.5" />
          </Button>
        )}
      </td>
    </tr>
  );
}
