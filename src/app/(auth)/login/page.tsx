"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      router.push("/projects");
    } catch {
      toast.error("Invalid email or password");
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
          <div className="flex size-24 items-center justify-center rounded-2xl bg-white p-2 shadow-sm">
            <BrandLogo variant="portrait" className="size-full" priority />
          </div>
          <p className="catalyst-eyebrow mt-2">Catalyst workspace</p>
          <CardTitle className="text-2xl tracking-tight">Welcome back</CardTitle>
          <CardDescription>Sign in to continue moving work forward.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs font-medium text-cyan-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="mt-2 h-10 bg-primary text-primary-foreground hover:bg-primary/90">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            First time setting this up?{" "}
            <Link href="/register" className="font-medium text-cyan-600 hover:underline">
              Create the admin account
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
