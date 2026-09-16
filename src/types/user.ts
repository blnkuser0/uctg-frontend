import { Permission } from "./role";

export interface UserRoleSummary {
  id: string;
  name: string | null;
  permissions: Permission[];
}

export type SystemRole = "SUPER_ADMIN" | "CLIENT_ADMIN" | "DEVELOPER";

export interface User {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  role: UserRoleSummary;
  avatarUrl: string | null;
  isActive?: boolean;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: SystemRole;
  organizationId?: string;
}

export interface UpdateUserInput {
  name?: string;
  role?: SystemRole;
  organizationId?: string;
  isActive?: boolean;
}
