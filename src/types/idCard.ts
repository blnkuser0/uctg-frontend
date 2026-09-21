export interface IdCardData {
  userId: string;
  employeeId: string;
  verifyToken: string;
  name: string;
  role: string | null;
  organization: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  issuedAt: string;
}

// What the public QR-verification page is allowed to show.
export interface IdVerification {
  name: string;
  employeeId: string | null;
  role: string | null;
  organization: string | null;
  avatarUrl: string | null;
  isActive: boolean;
}
