import { toast } from "sonner";
import type { AccountCredentials } from "@/components/users/CredentialsDialog";
import type { CreatedUser } from "@/types/user";

// One place for the "did the credentials email go out?" message, so every
// account-creation form tells the admin the same thing. When the email did NOT go
// out it returns the login details so the form can show them for the admin to
// hand over (the server only sends the temporary password back in that case).
export function announceAccountCreated(created: CreatedUser, what = "Account", verb = "created"): AccountCredentials | null {
  if (created.credentialsEmailSent) {
    toast.success(`${what} ${verb} — login details emailed to ${created.email}`);
    return null;
  }
  toast.warning(`${what} ${verb}, but the email could not be sent. Copy their login details to share them yourself.`);
  return created.temporaryPassword ? { email: created.email, password: created.temporaryPassword } : null;
}
