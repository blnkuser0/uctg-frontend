export type OrganizationStatus = "active" | "suspended";
export type OrganizationKind = "umbrella" | "client";

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  kind: OrganizationKind;
  status: OrganizationStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationInput {
  name: string;
}
