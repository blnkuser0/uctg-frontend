"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { resetPassword } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({ password: z.string().min(8, "Use at least 8 characters"), confirmPassword: z.string().min(1, "Confirm your password") }).refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
type Values = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });
  async function onSubmit(values: Values) { if (!token) return; setIsSubmitting(true); try { await resetPassword({ token, newPassword: values.password }); toast.success("Password updated. Sign in with your new password."); router.push("/login"); } catch (error) { toast.error(isAxiosError(error) && error.response?.status === 400 ? "This reset link is invalid or expired." : "Could not reset your password."); } finally { setIsSubmitting(false); } }
  return <AuthFrame eyebrow="Secure reset" title="Set a new password" description="Choose a new password for your Catalyst account. Existing refresh sessions will be revoked.">
    {!token ? <div className="border-l-2 border-destructive bg-card p-4 text-sm text-destructive">This reset link is missing or invalid. Request a new link.</div> : <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}><div className="grid gap-2"><Label htmlFor="password">New password</Label><Input id="password" type="password" autoComplete="new-password" className="h-11 bg-card" {...register("password")} />{errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}</div><div className="grid gap-2"><Label htmlFor="confirmPassword">Confirm password</Label><Input id="confirmPassword" type="password" autoComplete="new-password" className="h-11 bg-card" {...register("confirmPassword")} />{errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}</div><Button type="submit" disabled={isSubmitting} className="h-11 bg-primary font-mono text-[11px] tracking-[.12em] text-primary-foreground uppercase">{isSubmitting ? "Updating..." : "Update password"}</Button></form>}
    <Link href="/login" className="mt-6 inline-block text-xs font-medium text-primary underline-offset-4 hover:underline">Return to sign in</Link>
  </AuthFrame>;
}

export default function ResetPasswordPage() { return <Suspense fallback={<div className="min-h-dvh bg-background" />}><ResetPasswordForm /></Suspense>; }
