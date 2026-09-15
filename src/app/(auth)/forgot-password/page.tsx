"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { forgotPassword } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsSubmitting(true);
    try {
      await forgotPassword(values.email);
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_24rem),radial-gradient(circle_at_85%_85%,color-mix(in_oklch,var(--chart-2)_14%,transparent),transparent_28rem)]" />
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <Card className="relative w-full max-w-md border-border/90 bg-card/92 py-6 shadow-2xl shadow-primary/10 backdrop-blur">
        <CardHeader className="items-center gap-2 text-center">
          <div className="flex size-20 items-center justify-center bg-white p-2 shadow-sm"><BrandLogo variant="portrait" className="size-full" priority /></div>
          <p className="catalyst-eyebrow mt-2">Account recovery</p>
          <CardTitle className="text-2xl tracking-tight">Reset your password</CardTitle>
          <CardDescription>
            {submitted
              ? "Check your email for a reset link."
              : "Enter your email and we'll send you a reset link."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p className="text-center text-sm text-muted-foreground">
              If an account exists for that email, a reset link is on its way. It expires in 1 hour.
            </p>
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <Button type="submit" disabled={isSubmitting} className="mt-2 h-10 bg-primary text-primary-foreground hover:bg-primary/90">
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            <Link href="/login" className="font-medium text-cyan-600 hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
