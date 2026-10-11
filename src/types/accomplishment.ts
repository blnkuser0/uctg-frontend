export type AccomplishmentSection = "accomplishment" | "blockers" | "inProgress";

export interface AccomplishmentAttachment {
  url: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  section: AccomplishmentSection;
  uploadedBy: string;
  createdAt: string;
}

export interface Accomplishment {
  _id: string;
  organizationId: string;
  // A plain string on "mine" (own entries, no populate needed) — populated to the author's
  // {_id, name, email, roleId} on the team-wide view so a report can show whose entry is whose,
  // and what role they hold.
  userId: string | { _id: string; name: string; email: string; roleId: { _id: string; name: string } };
  // PH calendar day, YYYY-MM-DD.
  date: string;
  accomplishment: string;
  blockers: string;
  inProgress: string;
  attachments: AccomplishmentAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccomplishmentInput {
  date: string;
  accomplishment: string;
  blockers?: string;
  inProgress?: string;
}

export interface UpdateAccomplishmentInput {
  date?: string;
  accomplishment?: string;
  blockers?: string;
  inProgress?: string;
}

export interface AccomplishmentFilters {
  from?: string;
  to?: string;
  userId?: string;
}
