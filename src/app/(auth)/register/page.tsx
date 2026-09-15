"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { registerOrganization } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const registerSchema = z.object({
  organizationName: z.string().trim().min(2, "Name is too short"),
  name: z.string().trim().min(2, "Name is too short"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "At least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true);
    try {
      await registerOrganization(values);
      toast.success("Workspace created. Please log in.");
      router.push("/login");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        toast.error("An account with this email already exists.");
      } else {
        toast.error("Could not create your workspace. Please try again.");
      }
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
          <p className="catalyst-eyebrow mt-2">Catalyst workspace</p>
          <CardTitle className="text-2xl tracking-tight">Create your workspace</CardTitle>
          <CardDescription>Set up your organization and admin account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-1.5">
              <Label htmlFor="organizationName">Organization / company name</Label>
              <Input id="organizationName" autoComplete="organization" {...register("organizationName")} />
              {errors.organizationName && (
                <p className="text-xs text-destructive">{errors.organizationName.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" autoComplete="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="mt-2 h-10 bg-primary text-primary-foreground hover:bg-primary/90">
              {isSubmitting ? "Creating..." : "Create workspace"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
