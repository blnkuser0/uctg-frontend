import { User } from "./user";

export interface PlatformOrganization {
  _id: string;
  name: string;
  slug: string;
  type: "internal" | "client";
  status: "active" | "suspended";
  createdAt: string;
}

export interface CreateOrganizationInput {
  organizationName: string;
  name: string;
  email: string;
  password: string;
}

export interface CreatePlatformUserInput {
  name: string;
  email: string;
  password: string;
  isDeveloper: boolean;
  organizationId?: string;
  roleId?: string;
}

export type Developer = User;
