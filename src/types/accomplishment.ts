export interface Accomplishment {
  _id: string;
  organizationId: string;
  // A plain string on "mine" (own entries, no populate needed) — populated to the author's
  // {_id, name, email} on the team-wide view so a report can show whose entry is whose.
  userId: string | { _id: string; name: string; email: string };
  // PH calendar day, YYYY-MM-DD.
  date: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccomplishmentInput {
  date: string;
  text: string;
}

export interface UpdateAccomplishmentInput {
  date?: string;
  text?: string;
}

export interface AccomplishmentFilters {
  from?: string;
  to?: string;
  userId?: string;
}
