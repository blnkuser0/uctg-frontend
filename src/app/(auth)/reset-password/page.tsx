"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { resetPassword } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) return;
    setIsSubmitting(true);
    try {
      await resetPassword({ token, newPassword: values.password });
      toast.success("Password reset. Please log in.");
      router.push("/login");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        toast.error("This reset link is invalid or has expired.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="relative w-full max-w-md border-border/90 bg-card/92 py-6 shadow-2xl shadow-primary/10 backdrop-blur">
      <CardHeader className="items-center gap-2 text-center">
        <div className="flex size-20 items-center justify-center bg-white p-2 shadow-sm"><BrandLogo variant="portrait" className="size-full" priority /></div>
        <p className="catalyst-eyebrow mt-2">Account recovery</p>
        <CardTitle className="text-2xl tracking-tight">Set a new password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {!token ? (
          <p className="text-center text-sm text-destructive">
            This reset link is missing or invalid. Please request a new one.
          </p>
        ) : (
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-1.5">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting} className="mt-2 h-10 bg-primary text-primary-foreground hover:bg-primary/90">
              {isSubmitting ? "Resetting..." : "Reset password"}
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
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_24rem),radial-gradient(circle_at_85%_85%,color-mix(in_oklch,var(--chart-2)_14%,transparent),transparent_28rem)]" />
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
