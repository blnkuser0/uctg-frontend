"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({ email: z.string().transform((value) => value.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")).pipe(z.string().trim().toLowerCase().email("Enter a valid email address")), password: z.string().min(1, "Password is required") });
type LoginFormValues = z.infer<typeof loginSchema>;

// A single "check your email and password" for every failure sent people round in circles when
// the real problem was elsewhere, so say what actually went wrong.
function loginErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) return "Something went wrong. Please try again.";
  const status = error.response?.status;
  const serverMessage = (error.response?.data as { message?: string } | undefined)?.message;

  if (!error.response) return "Can't reach the server. It may be waking up — wait a few seconds and try again.";
  if (status === 401) return "Wrong email or password. If you pasted them, check for extra spaces or missing characters.";
  if (status === 403) return serverMessage ?? "This account is deactivated. Contact your administrator.";
  if (status === 429) return serverMessage ?? "Too many attempts. Please wait a few minutes and try again.";
  if (status && status >= 500) return "The server had a problem. Please try again in a moment.";
  return serverMessage ?? "Check your email and password, then try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    // Free hosting sleeps when idle; the first request after that can take up to a minute.
    const slowNotice = setTimeout(() => toast.loading("Still connecting — the server may be waking up. This can take up to a minute.", { id: "slow-login" }), 6000);
    try { await login(values.email, values.password); router.push("/projects"); }
    catch (error) { toast.error(loginErrorMessage(error)); }
    finally { clearTimeout(slowNotice); toast.dismiss("slow-login"); setIsSubmitting(false); }
  }

  return <AuthFrame eyebrow="Workspace sign in" title="Continue to Catalyst" description="Use the account provisioned for you by your Ugnexa administrator.">
    <form className="grid gap-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-2"><Label htmlFor="email">Work email</Label><Input id="email" type="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoFocus className="h-11 bg-card" placeholder="name@company.com" {...register("email")} />{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div>
      <div className="grid gap-2"><div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><Link href="/forgot-password" className="text-xs font-medium text-primary underline-offset-4 transition-colors hover:text-foreground hover:underline">Forgot password?</Link></div><PasswordInput id="password" autoComplete="current-password" className="h-11 bg-card" {...register("password")} />{errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}</div>
      <Button type="submit" disabled={isSubmitting} className="mt-1 h-11 bg-primary font-mono text-[11px] tracking-[.12em] text-primary-foreground uppercase transition-[transform,background-color] hover:-translate-y-px hover:bg-primary/90">{isSubmitting ? "Checking access..." : "Sign in to workspace"}</Button>
    </form>
    <div className="mt-7 border-t border-border pt-4"><p className="text-xs leading-5 text-muted-foreground">Need access? Contact your Super Admin. Catalyst does not accept public sign-ups.</p></div>
  </AuthFrame>;
}
