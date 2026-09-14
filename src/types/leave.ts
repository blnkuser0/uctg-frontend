export type LeaveDecisionStatus = "pending" | "approved" | "rejected";

export interface Leave {
  _id: string;
  organizationId: string;
  userId: string | { _id: string; name: string; email: string };
  startDate: string;
  endDate: string;
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
  reason: string;
}

export interface LeaveDecisionInput {
  status: "approved" | "rejected";
  note?: string;
}
