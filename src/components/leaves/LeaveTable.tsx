"use client";

import { useState } from "react";
import { OperationsState } from "@/components/layout/OperationsUI";
import { Leave } from "@/types/leave";
import { LeaveRemoveMode, LeaveRow } from "./LeaveRow";

interface LeaveTableProps {
  leaves: Leave[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
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
  isLoading,
  isError,
  onRetry,
  showEmployeeColumn,
  currentUserId,
  canApproveHr,
  canApproveAdmin,
  isMutating,
  onHrDecision,
  onAdminDecision,
  onCancel,
}: LeaveTableProps) {
  const [status, setStatus] = useState("all");
  const filtered = leaves.filter((leave) => status === "all" || leave.status === status);
  if (isLoading) return <OperationsState loading title="Loading leave requests..." />;
  if (isError) return <OperationsState title="Requests could not be loaded" onRetry={onRetry} />;
  if (leaves.length === 0) return <OperationsState title="No requests yet" description="Leave requests and their approval progress will appear here." />;

  return (
    <div className="min-w-0 space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{filtered.length} request{filtered.length === 1 ? "" : "s"}</p><select aria-label="Filter leave status" value={status} onChange={(e) => setStatus(e.target.value)} className="min-h-11 rounded-xl border border-input bg-card px-3 text-sm"><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></div><div className="leave-records overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full border-collapse text-left">
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
          {filtered.map((leave) => {
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
      {filtered.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No requests with this status.</p>}
      </div>
    </div>
  );
}
