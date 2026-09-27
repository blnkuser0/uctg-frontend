// Just a label for now — no per-type balances or rules yet.
export const LEAVE_TYPES = ["vacation", "sick", "emergency", "maternity", "paternity"] as const;
export type LeaveType = (typeof LEAVE_TYPES)[number];

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  vacation: "Vacation Leave",
  sick: "Sick Leave",
  emergency: "Emergency Leave",
  maternity: "Maternity Leave",
  paternity: "Paternity Leave",
};

export function leaveTypeLabel(type: LeaveType | undefined): string {
  return type ? LEAVE_TYPE_LABELS[type] : "—";
}

export type LeaveDecisionStatus = "pending" | "approved" | "rejected";

export interface Leave {
  _id: string;
  organizationId: string;
  userId: string | { _id: string; name: string; email: string };
  startDate: string;
  endDate: string;
  // Missing on leaves filed before leave types existed.
  leaveType?: LeaveType;
  reason: string;
  hrStatus: LeaveDecisionStatus;
  hrDecidedBy: string | null;
  hrDecidedAt: string | null;
  hrNote: string | null;
  adminStatus: LeaveDecisionStatus;
  adminDecidedBy: string | null;
  adminDecidedAt: string | null;
  adminNote: string | null;
  status: LeaveDecisionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveInput {
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  reason: string;
}

export interface LeaveDecisionInput {
  status: "approved" | "rejected";
  note?: string;
}
