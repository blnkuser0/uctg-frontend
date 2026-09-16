"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { forgotPassword } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email address") });
type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });
  async function onSubmit(values: Values) { setIsSubmitting(true); try { await forgotPassword(values.email); setSubmitted(true); } catch { toast.error("Could not request a reset link."); } finally { setIsSubmitting(false); } }
  return <AuthFrame eyebrow="Account recovery" title={submitted ? "Check your inbox" : "Recover your access"} description={submitted ? "If the address belongs to an active account, a secure reset link is on its way." : "Enter the work email tied to your Catalyst account."}>
    {submitted ? <div className="border-l-2 border-emerald-500 bg-card p-4 text-sm leading-6 text-muted-foreground">The link expires after one hour. Check your spam folder if it does not arrive.</div> : <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}><div className="grid gap-2"><Label htmlFor="email">Work email</Label><Input id="email" type="email" autoComplete="email" autoFocus className="h-11 bg-card" {...register("email")} />{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div><Button type="submit" disabled={isSubmitting} className="h-11 bg-primary font-mono text-[11px] tracking-[.12em] text-primary-foreground uppercase">{isSubmitting ? "Sending..." : "Send recovery link"}</Button></form>}
    <Link href="/login" className="mt-6 inline-block text-xs font-medium text-primary underline-offset-4 hover:underline">Return to sign in</Link>
  </AuthFrame>;
}
