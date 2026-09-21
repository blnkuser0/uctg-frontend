import { toast } from "sonner";

// One place for the "did the credentials email go out?" message, so every
// account-creation form tells the admin the same thing.
export function announceAccountCreated(created: { email: string; credentialsEmailSent?: boolean }, what = "Account") {
  if (created.credentialsEmailSent) {
    toast.success(`${what} created — login details emailed to ${created.email}`);
  } else {
    toast.warning(`${what} created, but the email could not be sent. Share the password with them another way.`);
  }
}
