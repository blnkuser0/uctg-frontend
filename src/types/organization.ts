export type OrganizationStatus = "active" | "suspended";

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationInput {
  name: string;
}
