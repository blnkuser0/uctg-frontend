"use client";

import { Leave } from "@/types/leave";
import { LeaveRemoveMode, LeaveRow } from "./LeaveRow";

interface LeaveTableProps {
  leaves: Leave[];
  showEmployeeColumn: boolean;
  currentUserId: string;
  canApproveHr: boolean;
  canApproveAdmin: boolean;
  isMutating: boolean;
  onHrDecision: (leaveId: string, status: "approved" | "rejected") => void;
  onAdminDecision: (leaveId: string, status: "approved" | "rejected") => void;
  onCancel: (leaveId: string) => void;
}

export function LeaveTable({
  leaves,
  showEmployeeColumn,
  currentUserId,
  canApproveHr,
  canApproveAdmin,
  isMutating,
  onHrDecision,
  onAdminDecision,
  onCancel,
}: LeaveTableProps) {
  if (leaves.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No leave requests yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground">
            {showEmployeeColumn && <th className="px-4 py-2.5">Employee</th>}
            <th className="px-4 py-2.5">Dates</th>
            <th className="px-4 py-2.5">Type</th>
            <th className="px-4 py-2.5">Reason</th>
            <th className="px-4 py-2.5">HR Approval</th>
            <th className="px-4 py-2.5">Admin Approval</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => {
            const ownedByViewer =
              (typeof leave.userId === "string" ? leave.userId : leave.userId._id) === currentUserId;
            // Once HR or Admin has acted on it (either one), the requester can no longer cancel it —
            // from then on only HR/Admin can delete it.
            const actedOn = leave.hrStatus !== "pending" || leave.adminStatus !== "pending";
            const removeMode: LeaveRemoveMode =
              ownedByViewer && !actedOn ? "cancel" : canApproveHr || canApproveAdmin ? "delete" : null;
            return (
              <LeaveRow
                key={leave._id}
                leave={leave}
                showEmployeeColumn={showEmployeeColumn}
                canActHr={canApproveHr}
                canActAdmin={canApproveAdmin}
                removeMode={removeMode}
                isMutating={isMutating}
                onHrDecision={(status) => onHrDecision(leave._id, status)}
                onAdminDecision={(status) => onAdminDecision(leave._id, status)}
                onRemove={() => onCancel(leave._id)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
