import { Permission } from "./role";

export interface UserRoleSummary {
  id: string;
  name: string | null;
  permissions: Permission[];
}

// Governs which timezone's midnight is used as this person's clock-in/out day boundary — PH
// time for a normal day shift, US Eastern time for a night shift aligned to US business hours.
export type ShiftType = "morning" | "night";

export interface User {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  role: UserRoleSummary;
  avatarUrl: string | null;
  isActive?: boolean;
  isSuperAdmin?: boolean;
  // True until the user replaces the temporary password an admin gave them.
  mustChangePassword?: boolean;
  shiftType: ShiftType;
}

// What the create endpoints return: the user plus whether the login-details
// email actually went out.
// `temporaryPassword` is only present when that email did NOT go out.
export type CreatedUser = User & { credentialsEmailSent?: boolean; temporaryPassword?: string };

export interface CreateUserInput {
  name?: string;
  email: string;
  // Optional: the server gives every new account the shared temporary password.
  password?: string;
  roleId: string;
  shiftType?: ShiftType;
}

export interface UpdateUserInput {
  name?: string;
  roleId?: string;
  isActive?: boolean;
  shiftType?: ShiftType;
}
