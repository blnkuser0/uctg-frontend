import { Permission } from "./role";

export interface UserRoleSummary {
  id: string;
  name: string | null;
  permissions: Permission[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  role: UserRoleSummary;
  avatarUrl: string | null;
  isActive?: boolean;
  isSuperAdmin?: boolean;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UpdateUserInput {
  name?: string;
  roleId?: string;
  isActive?: boolean;
}
