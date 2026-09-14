export const PERMISSIONS = {
  LEAVES_VIEW_ALL: "leaves.view_all",
  LEAVES_APPROVE_HR: "leaves.approve_hr",
  LEAVES_APPROVE_ADMIN: "leaves.approve_admin",
  USERS_MANAGE: "users.manage",
  ROLES_MANAGE: "roles.manage",
  PROJECTS_MANAGE: "projects.manage",
  ATTENDANCE_VIEW_ALL: "attendance.view_all",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

export const PERMISSION_LABELS: Record<Permission, string> = {
  [PERMISSIONS.LEAVES_VIEW_ALL]: "View every leave request",
  [PERMISSIONS.LEAVES_APPROVE_HR]: "Approve leaves (HR)",
  [PERMISSIONS.LEAVES_APPROVE_ADMIN]: "Final-approve leaves (Admin)",
  [PERMISSIONS.USERS_MANAGE]: "Manage users",
  [PERMISSIONS.ROLES_MANAGE]: "Manage roles",
  [PERMISSIONS.PROJECTS_MANAGE]: "Manage all projects",
  [PERMISSIONS.ATTENDANCE_VIEW_ALL]: "View everyone's attendance",
};

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  userCount?: number;
}

export interface CreateRoleInput {
  name: string;
  permissions: Permission[];
}

export interface UpdateRoleInput {
  name?: string;
  permissions?: Permission[];
}
