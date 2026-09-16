"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email address"), password: z.string().min(1, "Password is required") });
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    try { await login(values.email, values.password); router.push("/projects"); }
    catch { toast.error("Check your email and password, then try again."); }
    finally { setIsSubmitting(false); }
  }

  return <AuthFrame eyebrow="Workspace sign in" title="Continue to Catalyst" description="Use the account provisioned for you by your Ugnexa administrator.">
    <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-2"><Label htmlFor="email">Work email</Label><Input id="email" type="email" autoComplete="email" autoFocus className="h-11 bg-card" placeholder="name@company.com" {...register("email")} />{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div>
      <div className="grid gap-2"><div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><Link href="/forgot-password" className="text-xs font-medium text-primary underline-offset-4 transition-colors hover:text-foreground hover:underline">Forgot password?</Link></div><Input id="password" type="password" autoComplete="current-password" className="h-11 bg-card" {...register("password")} />{errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}</div>
      <Button type="submit" disabled={isSubmitting} className="mt-1 h-11 bg-primary font-mono text-[11px] tracking-[.12em] text-primary-foreground uppercase transition-[transform,background-color] hover:-translate-y-px hover:bg-primary/90">{isSubmitting ? "Checking access..." : "Sign in to workspace"}</Button>
    </form>
    <div className="mt-7 border-t border-border pt-4"><p className="text-xs leading-5 text-muted-foreground">Need access? Contact your Super Admin. Catalyst does not accept public sign-ups.</p></div>
  </AuthFrame>;
}
